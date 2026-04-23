package com.ticketing.dto.request;

import com.ticketing.entity.enums.Priority;
import com.ticketing.entity.enums.TicketStatus;
import lombok.Data;

@Data
public class UpdateTicketRequest {
    private String subject;
    private String description;
    private Priority priority;
    private TicketStatus status;
    private Long assigneeId;
}
