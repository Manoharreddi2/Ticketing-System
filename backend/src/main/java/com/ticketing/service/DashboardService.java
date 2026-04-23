package com.ticketing.service;

import com.ticketing.dto.response.DashboardStatsResponse;
import com.ticketing.entity.User;
import com.ticketing.entity.enums.Priority;
import com.ticketing.entity.enums.Role;
import com.ticketing.entity.enums.TicketStatus;
import com.ticketing.repository.TicketRepository;
import com.ticketing.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;

    public DashboardStatsResponse getAdminStats() {
        Map<String, Long> byPriority = new HashMap<>();
        for (Priority p : Priority.values()) {
            byPriority.put(p.name(), ticketRepository.countByPriority(p));
        }

        Map<String, Long> byAgent = new HashMap<>();
        List<User> agents = userRepository.findByRole(Role.SUPPORT_AGENT);
        for (User agent : agents) {
            byAgent.put(agent.getFullName(), ticketRepository.countByAssigneeId(agent.getId()));
        }

        return DashboardStatsResponse.builder()
                .totalTickets(ticketRepository.count())
                .openTickets(ticketRepository.countByStatus(TicketStatus.OPEN))
                .inProgressTickets(ticketRepository.countByStatus(TicketStatus.IN_PROGRESS))
                .resolvedTickets(ticketRepository.countByStatus(TicketStatus.RESOLVED))
                .closedTickets(ticketRepository.countByStatus(TicketStatus.CLOSED))
                .totalUsers(userRepository.countByRole(Role.USER))
                .totalAgents(userRepository.countByRole(Role.SUPPORT_AGENT))
                .ticketsByPriority(byPriority)
                .ticketsByAgent(byAgent)
                .build();
    }

    public DashboardStatsResponse getUserStats(User user) {
        return DashboardStatsResponse.builder()
                .totalTickets(ticketRepository.countByCreatorId(user.getId()))
                .openTickets(ticketRepository.countByStatusAndAssigneeId(TicketStatus.OPEN, user.getId()))
                .inProgressTickets(ticketRepository.countByStatusAndAssigneeId(TicketStatus.IN_PROGRESS, user.getId()))
                .resolvedTickets(ticketRepository.countByStatusAndAssigneeId(TicketStatus.RESOLVED, user.getId()))
                .closedTickets(ticketRepository.countByStatusAndAssigneeId(TicketStatus.CLOSED, user.getId()))
                .build();
    }
}
