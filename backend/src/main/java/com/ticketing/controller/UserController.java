package com.ticketing.controller;

import com.ticketing.dto.response.DashboardStatsResponse;
import com.ticketing.dto.response.UserResponse;
import com.ticketing.entity.User;
import com.ticketing.service.DashboardService;
import com.ticketing.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final DashboardService dashboardService;

    @GetMapping("/agents")
    public ResponseEntity<List<UserResponse>> getAgents() {
        return ResponseEntity.ok(userService.getSupportAgents());
    }

    @GetMapping("/dashboard-stats")
    public ResponseEntity<DashboardStatsResponse> getUserDashboardStats(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(dashboardService.getUserStats(user));
    }
}
