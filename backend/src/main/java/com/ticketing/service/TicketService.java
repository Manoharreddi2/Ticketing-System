package com.ticketing.service;

import com.ticketing.dto.request.CreateTicketRequest;
import com.ticketing.dto.request.RateTicketRequest;
import com.ticketing.dto.request.UpdateTicketRequest;
import com.ticketing.dto.response.*;
import com.ticketing.entity.Ticket;
import com.ticketing.entity.User;
import com.ticketing.entity.enums.Priority;
import com.ticketing.entity.enums.Role;
import com.ticketing.entity.enums.TicketStatus;
import com.ticketing.exception.BadRequestException;
import com.ticketing.exception.ResourceNotFoundException;
import com.ticketing.exception.UnauthorizedException;
import com.ticketing.repository.AttachmentRepository;
import com.ticketing.repository.CommentRepository;
import com.ticketing.repository.TicketRepository;
import com.ticketing.repository.UserRepository;
import com.ticketing.util.TicketNumberGenerator;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final CommentRepository commentRepository;
    private final AttachmentRepository attachmentRepository;
    private final TicketNumberGenerator ticketNumberGenerator;
    private final TicketHistoryService historyService;
    private final EmailService emailService;

    @Transactional
    public TicketResponse createTicket(CreateTicketRequest request, User creator) {
        Ticket ticket = Ticket.builder()
                .ticketNumber(ticketNumberGenerator.generateNextTicketNumber())
                .subject(request.getSubject())
                .description(request.getDescription())
                .priority(request.getPriority() != null ? request.getPriority() : Priority.MEDIUM)
                .status(TicketStatus.OPEN)
                .creator(creator)
                .build();

        ticket = ticketRepository.save(ticket);

        historyService.recordChange(ticket, creator, "status", null, "OPEN");

        emailService.sendTicketCreatedEmail(creator.getEmail(), ticket.getTicketNumber(), ticket.getSubject());

        return TicketResponse.fromEntity(ticket);
    }

    public Page<TicketResponse> getTickets(User currentUser, String search, String status,
                                            String priority, Long assigneeId, Pageable pageable) {
        Specification<Ticket> spec = buildSpecification(currentUser, search, status, priority, assigneeId);
        return ticketRepository.findAll(spec, pageable).map(TicketResponse::fromEntity);
    }

    public Page<TicketResponse> getAllTickets(String search, String status,
                                              String priority, Long assigneeId, Pageable pageable) {
        Specification<Ticket> spec = buildAdminSpecification(search, status, priority, assigneeId);
        return ticketRepository.findAll(spec, pageable).map(TicketResponse::fromEntity);
    }

    public TicketDetailResponse getTicketDetail(Long ticketId, User currentUser) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", ticketId));

        validateTicketAccess(ticket, currentUser);

        List<CommentResponse> comments = ticket.getComments().stream()
                .map(CommentResponse::fromEntity)
                .collect(Collectors.toList());

        List<AttachmentResponse> attachments = ticket.getAttachments().stream()
                .map(AttachmentResponse::fromEntity)
                .collect(Collectors.toList());

        List<TicketHistoryResponse> history = historyService.getTicketHistory(ticketId).stream()
                .map(TicketHistoryResponse::fromEntity)
                .collect(Collectors.toList());

        return TicketDetailResponse.fromEntity(ticket, comments, attachments, history);
    }

    @Transactional
    public TicketResponse updateTicket(Long ticketId, UpdateTicketRequest request, User currentUser) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", ticketId));

        validateTicketAccess(ticket, currentUser);

        if (request.getSubject() != null) {
            ticket.setSubject(request.getSubject());
        }
        if (request.getDescription() != null) {
            ticket.setDescription(request.getDescription());
        }
        if (request.getPriority() != null && !request.getPriority().equals(ticket.getPriority())) {
            String oldPriority = ticket.getPriority().name();
            ticket.setPriority(request.getPriority());
            historyService.recordChange(ticket, currentUser, "priority", oldPriority, request.getPriority().name());
        }

        ticket = ticketRepository.save(ticket);
        return TicketResponse.fromEntity(ticket);
    }

    @Transactional
    public TicketResponse changeStatus(Long ticketId, TicketStatus newStatus, User currentUser) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", ticketId));

        // Only assignee, admin, or creator can change status
        if (!isAdmin(currentUser) && !isAssignee(ticket, currentUser) && !isCreator(ticket, currentUser)) {
            throw new UnauthorizedException("You don't have permission to change this ticket's status");
        }

        validateStatusTransition(ticket.getStatus(), newStatus, currentUser);

        String oldStatus = ticket.getStatus().name();
        ticket.setStatus(newStatus);

        if (newStatus == TicketStatus.RESOLVED) {
            ticket.setResolvedAt(LocalDateTime.now());
            emailService.sendTicketResolvedEmail(
                    ticket.getCreator().getEmail(), ticket.getTicketNumber(), ticket.getSubject());
        } else if (newStatus == TicketStatus.CLOSED) {
            ticket.setClosedAt(LocalDateTime.now());
        }

        ticket = ticketRepository.save(ticket);
        historyService.recordChange(ticket, currentUser, "status", oldStatus, newStatus.name());

        emailService.sendTicketStatusChangeEmail(
                ticket.getCreator().getEmail(), ticket.getTicketNumber(),
                ticket.getSubject(), oldStatus, newStatus.name());

        return TicketResponse.fromEntity(ticket);
    }

    @Transactional
    public TicketResponse assignTicket(Long ticketId, Long assigneeId, User currentUser) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", ticketId));

        User assignee = userRepository.findById(assigneeId)
                .orElseThrow(() -> new ResourceNotFoundException("User", assigneeId));

        if (assignee.getRole() != Role.SUPPORT_AGENT && assignee.getRole() != Role.ADMIN) {
            throw new BadRequestException("Tickets can only be assigned to support agents or admins");
        }

        String oldAssignee = ticket.getAssignee() != null ? ticket.getAssignee().getFullName() : "Unassigned";
        ticket.setAssignee(assignee);

        if (ticket.getStatus() == TicketStatus.OPEN) {
            ticket.setStatus(TicketStatus.IN_PROGRESS);
            historyService.recordChange(ticket, currentUser, "status", "OPEN", "IN_PROGRESS");
        }

        ticket = ticketRepository.save(ticket);
        historyService.recordChange(ticket, currentUser, "assignee", oldAssignee, assignee.getFullName());

        emailService.sendTicketAssignedEmail(assignee.getEmail(), ticket.getTicketNumber(), ticket.getSubject());

        return TicketResponse.fromEntity(ticket);
    }

    @Transactional
    public TicketResponse rateTicket(Long ticketId, RateTicketRequest request, User currentUser) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", ticketId));

        if (!isCreator(ticket, currentUser)) {
            throw new UnauthorizedException("Only the ticket creator can rate a ticket");
        }

        if (ticket.getStatus() != TicketStatus.RESOLVED && ticket.getStatus() != TicketStatus.CLOSED) {
            throw new BadRequestException("Ticket can only be rated when it is Resolved or Closed");
        }

        ticket.setRating(request.getRating());
        ticket.setRatingFeedback(request.getFeedback());
        ticket = ticketRepository.save(ticket);

        return TicketResponse.fromEntity(ticket);
    }

    // === Helper methods ===

    private void validateTicketAccess(Ticket ticket, User user) {
        if (isAdmin(user)) return;
        if (isCreator(ticket, user)) return;
        if (isAssignee(ticket, user)) return;
        throw new UnauthorizedException("You don't have access to this ticket");
    }

    private void validateStatusTransition(TicketStatus current, TicketStatus next, User user) {
        if (isAdmin(user)) return; // Admin can force any transition

        boolean valid = switch (current) {
            case OPEN -> next == TicketStatus.IN_PROGRESS || next == TicketStatus.CLOSED;
            case IN_PROGRESS -> next == TicketStatus.RESOLVED || next == TicketStatus.OPEN;
            case RESOLVED -> next == TicketStatus.CLOSED || next == TicketStatus.IN_PROGRESS;
            case CLOSED -> false; // Once closed, cannot reopen (unless admin)
        };

        if (!valid) {
            throw new BadRequestException("Invalid status transition from " + current + " to " + next);
        }
    }

    private boolean isAdmin(User user) {
        return user.getRole() == Role.ADMIN;
    }

    private boolean isCreator(Ticket ticket, User user) {
        return ticket.getCreator().getId().equals(user.getId());
    }

    private boolean isAssignee(Ticket ticket, User user) {
        return ticket.getAssignee() != null && ticket.getAssignee().getId().equals(user.getId());
    }

    private Specification<Ticket> buildSpecification(User user, String search, String status,
                                                      String priority, Long assigneeId) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Role-based filtering
            if (user.getRole() == Role.USER) {
                predicates.add(cb.equal(root.get("creator").get("id"), user.getId()));
            } else if (user.getRole() == Role.SUPPORT_AGENT) {
                predicates.add(cb.or(
                        cb.equal(root.get("assignee").get("id"), user.getId()),
                        cb.equal(root.get("creator").get("id"), user.getId())
                ));
            }
            // ADMIN sees all — no predicate needed

            addCommonFilters(predicates, root, cb, search, status, priority, assigneeId);

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private Specification<Ticket> buildAdminSpecification(String search, String status,
                                                           String priority, Long assigneeId) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            addCommonFilters(predicates, root, cb, search, status, priority, assigneeId);
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private void addCommonFilters(List<Predicate> predicates,
                                   jakarta.persistence.criteria.Root<Ticket> root,
                                   jakarta.persistence.criteria.CriteriaBuilder cb,
                                   String search, String status, String priority, Long assigneeId) {
        if (search != null && !search.isBlank()) {
            String pattern = "%" + search.toLowerCase() + "%";
            predicates.add(cb.or(
                    cb.like(cb.lower(root.get("subject")), pattern),
                    cb.like(cb.lower(root.get("ticketNumber")), pattern),
                    cb.like(cb.lower(root.get("description")), pattern)
            ));
        }

        if (status != null && !status.isBlank()) {
            try {
                predicates.add(cb.equal(root.get("status"), TicketStatus.valueOf(status.toUpperCase())));
            } catch (IllegalArgumentException ignored) {}
        }

        if (priority != null && !priority.isBlank()) {
            try {
                predicates.add(cb.equal(root.get("priority"), Priority.valueOf(priority.toUpperCase())));
            } catch (IllegalArgumentException ignored) {}
        }

        if (assigneeId != null) {
            predicates.add(cb.equal(root.get("assignee").get("id"), assigneeId));
        }
    }
}
