package com.ticketing.util;

import com.ticketing.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class TicketNumberGenerator {

    private final TicketRepository ticketRepository;

    public synchronized String generateNextTicketNumber() {
        int maxNumber = ticketRepository.findMaxTicketNumber();
        return String.format("TKT-%05d", maxNumber + 1);
    }
}
