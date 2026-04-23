package com.ticketing.config;

import com.ticketing.entity.Comment;
import com.ticketing.entity.Ticket;
import com.ticketing.entity.TicketHistory;
import com.ticketing.entity.User;
import com.ticketing.entity.enums.Priority;
import com.ticketing.entity.enums.Role;
import com.ticketing.entity.enums.TicketStatus;
import com.ticketing.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final TicketRepository ticketRepository;
    private final CommentRepository commentRepository;
    private final TicketHistoryRepository historyRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("Database already seeded, skipping...");
            return;
        }

        log.info("Seeding database with sample data...");

        // Create users
        User admin = userRepository.save(User.builder()
                .email("admin@ticketing.com")
                .passwordHash(passwordEncoder.encode("admin123"))
                .firstName("Admin")
                .lastName("User")
                .role(Role.ADMIN)
                .isActive(true)
                .build());

        User agent1 = userRepository.save(User.builder()
                .email("agent@ticketing.com")
                .passwordHash(passwordEncoder.encode("agent123"))
                .firstName("Sarah")
                .lastName("Connor")
                .role(Role.SUPPORT_AGENT)
                .isActive(true)
                .build());

        User agent2 = userRepository.save(User.builder()
                .email("agent2@ticketing.com")
                .passwordHash(passwordEncoder.encode("agent123"))
                .firstName("James")
                .lastName("Wilson")
                .role(Role.SUPPORT_AGENT)
                .isActive(true)
                .build());

        User user1 = userRepository.save(User.builder()
                .email("user@ticketing.com")
                .passwordHash(passwordEncoder.encode("user123"))
                .firstName("John")
                .lastName("Doe")
                .role(Role.USER)
                .isActive(true)
                .build());

        User user2 = userRepository.save(User.builder()
                .email("user2@ticketing.com")
                .passwordHash(passwordEncoder.encode("user123"))
                .firstName("Jane")
                .lastName("Smith")
                .role(Role.USER)
                .isActive(true)
                .build());

        // Create sample tickets
        Ticket t1 = ticketRepository.save(Ticket.builder()
                .ticketNumber("TKT-00001")
                .subject("Cannot access email server")
                .description("I'm unable to connect to the company email server since this morning. Getting a timeout error when trying to login via Outlook.")
                .status(TicketStatus.OPEN)
                .priority(Priority.HIGH)
                .creator(user1)
                .build());

        Ticket t2 = ticketRepository.save(Ticket.builder()
                .ticketNumber("TKT-00002")
                .subject("VPN connection drops frequently")
                .description("My VPN disconnects every 15-20 minutes while working remotely. This is affecting my productivity significantly.")
                .status(TicketStatus.IN_PROGRESS)
                .priority(Priority.URGENT)
                .creator(user1)
                .assignee(agent1)
                .build());

        Ticket t3 = ticketRepository.save(Ticket.builder()
                .ticketNumber("TKT-00003")
                .subject("Request for new software license")
                .description("I need a license for Adobe Creative Suite for the marketing department's new design project.")
                .status(TicketStatus.OPEN)
                .priority(Priority.MEDIUM)
                .creator(user2)
                .build());

        Ticket t4 = ticketRepository.save(Ticket.builder()
                .ticketNumber("TKT-00004")
                .subject("Printer not working on 3rd floor")
                .description("The HP LaserJet printer on the 3rd floor is showing an error and won't print. Paper jam indicator is on but no paper is jammed.")
                .status(TicketStatus.RESOLVED)
                .priority(Priority.LOW)
                .creator(user2)
                .assignee(agent2)
                .resolvedAt(LocalDateTime.now().minusDays(1))
                .rating(4)
                .ratingFeedback("Quick resolution, thanks!")
                .build());

        Ticket t5 = ticketRepository.save(Ticket.builder()
                .ticketNumber("TKT-00005")
                .subject("Password reset request")
                .description("I've been locked out of my account after too many failed login attempts. Please reset my password.")
                .status(TicketStatus.CLOSED)
                .priority(Priority.HIGH)
                .creator(user1)
                .assignee(agent1)
                .resolvedAt(LocalDateTime.now().minusDays(3))
                .closedAt(LocalDateTime.now().minusDays(2))
                .rating(5)
                .ratingFeedback("Excellent support!")
                .build());

        Ticket t6 = ticketRepository.save(Ticket.builder()
                .ticketNumber("TKT-00006")
                .subject("Slow internet connection in conference room")
                .description("The WiFi in conference room B is extremely slow during video calls. Multiple participants have reported lag and disconnections.")
                .status(TicketStatus.IN_PROGRESS)
                .priority(Priority.MEDIUM)
                .creator(user2)
                .assignee(agent1)
                .build());

        Ticket t7 = ticketRepository.save(Ticket.builder()
                .ticketNumber("TKT-00007")
                .subject("New employee laptop setup")
                .description("A new developer is starting next Monday. Need a laptop configured with development tools: VS Code, IntelliJ, Docker, Git.")
                .status(TicketStatus.OPEN)
                .priority(Priority.MEDIUM)
                .creator(user1)
                .build());

        Ticket t8 = ticketRepository.save(Ticket.builder()
                .ticketNumber("TKT-00008")
                .subject("Database backup failure alert")
                .description("Received automated alert that the nightly database backup failed. Error: insufficient disk space on backup server.")
                .status(TicketStatus.IN_PROGRESS)
                .priority(Priority.URGENT)
                .creator(admin)
                .assignee(agent2)
                .build());

        // Add sample comments
        commentRepository.save(Comment.builder()
                .content("I've checked the server logs and found the issue. The mail server certificate expired yesterday. Renewing it now.")
                .ticket(t2)
                .author(agent1)
                .build());

        commentRepository.save(Comment.builder()
                .content("Thank you for looking into this. How long will the fix take?")
                .ticket(t2)
                .author(user1)
                .build());

        commentRepository.save(Comment.builder()
                .content("The VPN configuration has been updated. Please try reconnecting and let me know if the issue persists.")
                .ticket(t2)
                .author(agent1)
                .build());

        commentRepository.save(Comment.builder()
                .content("Cleared the printer queue and performed a hard reset. Printer is now working correctly.")
                .ticket(t4)
                .author(agent2)
                .build());

        commentRepository.save(Comment.builder()
                .content("Running diagnostics on the conference room access point. Will update shortly.")
                .ticket(t6)
                .author(agent1)
                .build());

        // Add ticket history
        historyRepository.save(TicketHistory.builder()
                .ticket(t2).changedBy(agent1)
                .fieldChanged("status").oldValue("OPEN").newValue("IN_PROGRESS")
                .build());

        historyRepository.save(TicketHistory.builder()
                .ticket(t2).changedBy(admin)
                .fieldChanged("assignee").oldValue("Unassigned").newValue("Sarah Connor")
                .build());

        historyRepository.save(TicketHistory.builder()
                .ticket(t4).changedBy(agent2)
                .fieldChanged("status").oldValue("IN_PROGRESS").newValue("RESOLVED")
                .build());

        historyRepository.save(TicketHistory.builder()
                .ticket(t5).changedBy(agent1)
                .fieldChanged("status").oldValue("RESOLVED").newValue("CLOSED")
                .build());

        log.info("Database seeded successfully with {} users and {} tickets",
                userRepository.count(), ticketRepository.count());
    }
}
