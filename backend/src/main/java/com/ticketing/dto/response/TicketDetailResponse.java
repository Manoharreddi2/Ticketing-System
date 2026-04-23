package com.ticketing.dto.response;

import com.ticketing.entity.Ticket;
import com.ticketing.entity.enums.Priority;
import com.ticketing.entity.enums.TicketStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketDetailResponse {
    private Long id;
    private String ticketNumber;
    private String subject;
    private String description;
    private TicketStatus status;
    private Priority priority;
    private UserResponse creator;
    private UserResponse assignee;
    private Integer rating;
    private String ratingFeedback;
    private List<CommentResponse> comments;
    private List<AttachmentResponse> attachments;
    private List<TicketHistoryResponse> history;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime resolvedAt;
    private LocalDateTime closedAt;

    public static TicketDetailResponse fromEntity(Ticket ticket,
                                                   List<CommentResponse> comments,
                                                   List<AttachmentResponse> attachments,
                                                   List<TicketHistoryResponse> history) {
        return TicketDetailResponse.builder()
                .id(ticket.getId())
                .ticketNumber(ticket.getTicketNumber())
                .subject(ticket.getSubject())
                .description(ticket.getDescription())
                .status(ticket.getStatus())
                .priority(ticket.getPriority())
                .creator(UserResponse.fromEntity(ticket.getCreator()))
                .assignee(ticket.getAssignee() != null ? UserResponse.fromEntity(ticket.getAssignee()) : null)
                .rating(ticket.getRating())
                .ratingFeedback(ticket.getRatingFeedback())
                .comments(comments)
                .attachments(attachments)
                .history(history)
                .createdAt(ticket.getCreatedAt())
                .updatedAt(ticket.getUpdatedAt())
                .resolvedAt(ticket.getResolvedAt())
                .closedAt(ticket.getClosedAt())
                .build();
    }
}
