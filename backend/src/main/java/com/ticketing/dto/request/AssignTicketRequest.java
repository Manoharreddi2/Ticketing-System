package com.ticketing.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AssignTicketRequest {
    @NotNull(message = "Assignee ID is required")
    private Long assigneeId;
}
