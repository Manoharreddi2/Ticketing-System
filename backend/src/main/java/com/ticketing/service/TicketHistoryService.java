package com.ticketing.service;

import com.ticketing.entity.Ticket;
import com.ticketing.entity.TicketHistory;
import com.ticketing.entity.User;
import com.ticketing.repository.TicketHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TicketHistoryService {

    private final TicketHistoryRepository historyRepository;

    @Transactional
    public void recordChange(Ticket ticket, User changedBy, String field, String oldValue, String newValue) {
        TicketHistory history = TicketHistory.builder()
                .ticket(ticket)
                .changedBy(changedBy)
                .fieldChanged(field)
                .oldValue(oldValue)
                .newValue(newValue)
                .build();
        historyRepository.save(history);
    }

    public List<TicketHistory> getTicketHistory(Long ticketId) {
        return historyRepository.findByTicketIdOrderByCreatedAtDesc(ticketId);
    }
}
