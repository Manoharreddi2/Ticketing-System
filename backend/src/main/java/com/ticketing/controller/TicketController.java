package com.ticketing.controller;

import com.ticketing.dto.request.*;
import com.ticketing.dto.response.TicketDetailResponse;
import com.ticketing.dto.response.TicketResponse;
import com.ticketing.entity.User;
import com.ticketing.entity.enums.TicketStatus;
import com.ticketing.service.TicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;

    @PostMapping
    public ResponseEntity<TicketResponse> createTicket(
            @Valid @RequestBody CreateTicketRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ticketService.createTicket(request, user));
    }

    @GetMapping
    public ResponseEntity<Page<TicketResponse>> getTickets(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) Long assigneeId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        return ResponseEntity.ok(ticketService.getTickets(user, search, status, priority, assigneeId, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TicketDetailResponse> getTicketDetail(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ticketService.getTicketDetail(id, user));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TicketResponse> updateTicket(
            @PathVariable Long id,
            @RequestBody UpdateTicketRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ticketService.updateTicket(id, request, user));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<TicketResponse> changeStatus(
            @PathVariable Long id,
            @RequestBody java.util.Map<String, String> request,
            @AuthenticationPrincipal User user) {
        TicketStatus newStatus = TicketStatus.valueOf(request.get("status").toUpperCase());
        return ResponseEntity.ok(ticketService.changeStatus(id, newStatus, user));
    }

    @PatchMapping("/{id}/assign")
    public ResponseEntity<TicketResponse> assignTicket(
            @PathVariable Long id,
            @Valid @RequestBody AssignTicketRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ticketService.assignTicket(id, request.getAssigneeId(), user));
    }

    @PostMapping("/{id}/rate")
    public ResponseEntity<TicketResponse> rateTicket(
            @PathVariable Long id,
            @Valid @RequestBody RateTicketRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ticketService.rateTicket(id, request, user));
    }
}
