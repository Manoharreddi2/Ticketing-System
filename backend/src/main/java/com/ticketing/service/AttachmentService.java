package com.ticketing.service;

import com.ticketing.dto.response.AttachmentResponse;
import com.ticketing.entity.Attachment;
import com.ticketing.entity.Ticket;
import com.ticketing.entity.User;
import com.ticketing.entity.enums.Role;
import com.ticketing.exception.BadRequestException;
import com.ticketing.exception.ResourceNotFoundException;
import com.ticketing.exception.UnauthorizedException;
import com.ticketing.repository.AttachmentRepository;
import com.ticketing.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AttachmentService {

    private final AttachmentRepository attachmentRepository;
    private final TicketRepository ticketRepository;

    @Value("${app.upload.dir}")
    private String uploadDir;

    @Value("${app.upload.allowed-types}")
    private String allowedTypes;

    @Value("${app.upload.max-size}")
    private long maxSize;

    private Path uploadPath;

    @PostConstruct
    public void init() {
        uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(uploadPath);
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory", e);
        }
    }

    @Transactional
    public AttachmentResponse uploadFile(Long ticketId, MultipartFile file, User uploader) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", ticketId));

        validateAccess(ticket, uploader);
        validateFile(file);

        String storedFilename = UUID.randomUUID() + "_" + sanitizeFilename(file.getOriginalFilename());

        try {
            Path targetPath = uploadPath.resolve(storedFilename);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file", e);
        }

        Attachment attachment = Attachment.builder()
                .originalFilename(file.getOriginalFilename())
                .storedFilename(storedFilename)
                .contentType(file.getContentType())
                .fileSize(file.getSize())
                .ticket(ticket)
                .uploader(uploader)
                .build();

        attachment = attachmentRepository.save(attachment);
        return AttachmentResponse.fromEntity(attachment);
    }

    public Resource downloadFile(Long attachmentId, User currentUser) {
        Attachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Attachment", attachmentId));

        Ticket ticket = attachment.getTicket();
        validateAccess(ticket, currentUser);

        try {
            Path filePath = uploadPath.resolve(attachment.getStoredFilename()).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new ResourceNotFoundException("File not found on disk: " + attachment.getOriginalFilename());
            }
        } catch (MalformedURLException e) {
            throw new RuntimeException("File not found", e);
        }
    }

    public Attachment getAttachment(Long attachmentId) {
        return attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Attachment", attachmentId));
    }

    @Transactional
    public void deleteAttachment(Long attachmentId, User currentUser) {
        Attachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Attachment", attachmentId));

        if (!attachment.getUploader().getId().equals(currentUser.getId())
                && currentUser.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("Only the uploader or admin can delete this attachment");
        }

        try {
            Path filePath = uploadPath.resolve(attachment.getStoredFilename());
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            log.warn("Failed to delete file from disk: {}", attachment.getStoredFilename());
        }

        attachmentRepository.delete(attachment);
    }

    public List<AttachmentResponse> getTicketAttachments(Long ticketId) {
        return attachmentRepository.findByTicketId(ticketId).stream()
                .map(AttachmentResponse::fromEntity)
                .collect(Collectors.toList());
    }

    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new BadRequestException("File is empty");
        }

        if (file.getSize() > maxSize) {
            throw new BadRequestException("File exceeds maximum size of 10MB");
        }

        List<String> allowed = Arrays.asList(allowedTypes.split(","));
        if (!allowed.contains(file.getContentType())) {
            throw new BadRequestException("File type not allowed: " + file.getContentType());
        }
    }

    private void validateAccess(Ticket ticket, User user) {
        if (user.getRole() == Role.ADMIN) return;
        if (ticket.getCreator().getId().equals(user.getId())) return;
        if (ticket.getAssignee() != null && ticket.getAssignee().getId().equals(user.getId())) return;
        throw new UnauthorizedException("You don't have access to this ticket");
    }

    private String sanitizeFilename(String filename) {
        if (filename == null) return "unknown";
        return filename.replaceAll("[^a-zA-Z0-9.-]", "_");
    }
}
