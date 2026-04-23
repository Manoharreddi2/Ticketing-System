package com.ticketing.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    @Async
    public void sendTicketCreatedEmail(String toEmail, String ticketNumber, String subject) {
        sendEmail(toEmail,
                "Ticket " + ticketNumber + " Created",
                "Your ticket \"" + subject + "\" (" + ticketNumber + ") has been created successfully.\n\n" +
                "You can track its status from your dashboard.");
    }

    @Async
    public void sendTicketAssignedEmail(String toEmail, String ticketNumber, String subject) {
        sendEmail(toEmail,
                "Ticket " + ticketNumber + " Assigned to You",
                "You have been assigned to ticket \"" + subject + "\" (" + ticketNumber + ").\n\n" +
                "Please review and take action.");
    }

    @Async
    public void sendTicketStatusChangeEmail(String toEmail, String ticketNumber, String subject,
                                             String oldStatus, String newStatus) {
        sendEmail(toEmail,
                "Ticket " + ticketNumber + " Status Updated",
                "The status of ticket \"" + subject + "\" (" + ticketNumber + ") has been changed from " +
                oldStatus + " to " + newStatus + ".");
    }

    @Async
    public void sendTicketResolvedEmail(String toEmail, String ticketNumber, String subject) {
        sendEmail(toEmail,
                "Ticket " + ticketNumber + " Resolved",
                "Your ticket \"" + subject + "\" (" + ticketNumber + ") has been resolved.\n\n" +
                "Please review the resolution and rate your experience.");
    }

    private void sendEmail(String to, String subject, String text) {
        try {
            if (fromEmail == null || fromEmail.isBlank()) {
                log.info("Email not configured. Would send to {}: {}", to, subject);
                return;
            }

            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);
            mailSender.send(message);
            log.info("Email sent to {}: {}", to, subject);
        } catch (Exception e) {
            log.warn("Failed to send email to {}: {}", to, e.getMessage());
        }
    }
}
