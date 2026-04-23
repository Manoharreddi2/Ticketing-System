package com.ticketing.dto.response;

import com.ticketing.entity.Ticket;
import com.ticketing.entity.enums.Priority;
import com.ticketing.entity.enums.TicketStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketResponse {
    private Long id;
    private String ticketNumber;
    private String subject;
    private String description;
    private TicketStatus status;
    private Priority priority;
    private UserResponse creator;
    private UserResponse assignee;
    private Integer rating;
    private int commentCount;
    private int attachmentCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime resolvedAt;
    private LocalDateTime closedAt;

    public static TicketResponse fromEntity(Ticket ticket) {
        return TicketResponse.builder()
                .id(ticket.getId())
                .ticketNumber(ticket.getTicketNumber())
                .subject(ticket.getSubject())
                .description(ticket.getDescription())
                .status(ticket.getStatus())
                .priority(ticket.getPriority())
                .creator(UserResponse.fromEntity(ticket.getCreator()))
                .assignee(ticket.getAssignee() != null ? UserResponse.fromEntity(ticket.getAssignee()) : null)
                .rating(ticket.getRating())
                .commentCount(ticket.getComments() != null ? ticket.getComments().size() : 0)
                .attachmentCount(ticket.getAttachments() != null ? ticket.getAttachments().size() : 0)
                .createdAt(ticket.getCreatedAt())
                .updatedAt(ticket.getUpdatedAt())
                .resolvedAt(ticket.getResolvedAt())
                .closedAt(ticket.getClosedAt())
                .build();
    }
}
