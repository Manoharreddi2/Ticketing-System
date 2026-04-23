package com.ticketing.controller;

import com.ticketing.dto.request.CreateUserRequest;
import com.ticketing.dto.response.DashboardStatsResponse;
import com.ticketing.dto.response.TicketResponse;
import com.ticketing.dto.response.UserResponse;
import com.ticketing.entity.User;
import com.ticketing.entity.enums.Role;
import com.ticketing.entity.enums.TicketStatus;
import com.ticketing.service.DashboardService;
import com.ticketing.service.TicketService;
import com.ticketing.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserService userService;
    private final TicketService ticketService;
    private final DashboardService dashboardService;

    // === User Management ===

    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/users/agents")
    public ResponseEntity<List<UserResponse>> getSupportAgents() {
        return ResponseEntity.ok(userService.getSupportAgents());
    }

    @PostMapping("/users")
    public ResponseEntity<UserResponse> createUser(@Valid @RequestBody CreateUserRequest request) {
        return ResponseEntity.ok(userService.createUser(request));
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<UserResponse> updateUserRole(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        Role role = Role.valueOf(request.get("role").toUpperCase());
        return ResponseEntity.ok(userService.updateUserRole(id, role));
    }

    @PatchMapping("/users/{id}/toggle-active")
    public ResponseEntity<Void> toggleUserActive(@PathVariable Long id) {
        userService.toggleUserActive(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    // === Ticket Management ===

    @GetMapping("/tickets")
    public ResponseEntity<Page<TicketResponse>> getAllTickets(
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

        return ResponseEntity.ok(ticketService.getAllTickets(search, status, priority, assigneeId, pageable));
    }

    @PatchMapping("/tickets/{id}/force-assign")
    public ResponseEntity<TicketResponse> forceAssign(
            @PathVariable Long id,
            @RequestBody Map<String, Long> request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ticketService.assignTicket(id, request.get("assigneeId"), user));
    }

    @PatchMapping("/tickets/{id}/force-status")
    public ResponseEntity<TicketResponse> forceStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> request,
            @AuthenticationPrincipal User user) {
        TicketStatus status = TicketStatus.valueOf(request.get("status").toUpperCase());
        return ResponseEntity.ok(ticketService.changeStatus(id, status, user));
    }

    // === Dashboard ===

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardStatsResponse> getDashboardStats() {
        return ResponseEntity.ok(dashboardService.getAdminStats());
    }
}
