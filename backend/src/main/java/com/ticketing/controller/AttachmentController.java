package com.ticketing.controller;

import com.ticketing.dto.response.AttachmentResponse;
import com.ticketing.entity.Attachment;
import com.ticketing.entity.User;
import com.ticketing.service.AttachmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class AttachmentController {

    private final AttachmentService attachmentService;

    @PostMapping("/api/tickets/{ticketId}/attachments")
    public ResponseEntity<AttachmentResponse> uploadFile(
            @PathVariable Long ticketId,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(attachmentService.uploadFile(ticketId, file, user));
    }

    @GetMapping("/api/tickets/{ticketId}/attachments")
    public ResponseEntity<List<AttachmentResponse>> getTicketAttachments(
            @PathVariable Long ticketId) {
        return ResponseEntity.ok(attachmentService.getTicketAttachments(ticketId));
    }

    @GetMapping("/api/attachments/{id}/download")
    public ResponseEntity<Resource> downloadFile(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        Resource resource = attachmentService.downloadFile(id, user);
        Attachment attachment = attachmentService.getAttachment(id);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(attachment.getContentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + attachment.getOriginalFilename() + "\"")
                .body(resource);
    }

    @DeleteMapping("/api/attachments/{id}")
    public ResponseEntity<Void> deleteAttachment(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        attachmentService.deleteAttachment(id, user);
        return ResponseEntity.noContent().build();
    }
}
