package com.ticketing.dto.response;

import com.ticketing.entity.TicketHistory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketHistoryResponse {
    private Long id;
    private String fieldChanged;
    private String oldValue;
    private String newValue;
    private UserResponse changedBy;
    private LocalDateTime createdAt;

    public static TicketHistoryResponse fromEntity(TicketHistory history) {
        return TicketHistoryResponse.builder()
                .id(history.getId())
                .fieldChanged(history.getFieldChanged())
                .oldValue(history.getOldValue())
                .newValue(history.getNewValue())
                .changedBy(UserResponse.fromEntity(history.getChangedBy()))
                .createdAt(history.getCreatedAt())
                .build();
    }
}
