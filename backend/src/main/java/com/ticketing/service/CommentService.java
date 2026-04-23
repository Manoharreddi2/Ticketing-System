package com.ticketing.service;

import com.ticketing.dto.request.CreateCommentRequest;
import com.ticketing.dto.response.CommentResponse;
import com.ticketing.entity.Comment;
import com.ticketing.entity.Ticket;
import com.ticketing.entity.User;
import com.ticketing.entity.enums.Role;
import com.ticketing.exception.ResourceNotFoundException;
import com.ticketing.exception.UnauthorizedException;
import com.ticketing.repository.CommentRepository;
import com.ticketing.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final TicketRepository ticketRepository;

    @Transactional
    public CommentResponse addComment(Long ticketId, CreateCommentRequest request, User author) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", ticketId));

        validateAccess(ticket, author);

        Comment comment = Comment.builder()
                .content(request.getContent())
                .ticket(ticket)
                .author(author)
                .build();

        comment = commentRepository.save(comment);
        return CommentResponse.fromEntity(comment);
    }

    public List<CommentResponse> getComments(Long ticketId, User currentUser) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", ticketId));

        validateAccess(ticket, currentUser);

        return commentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId).stream()
                .map(CommentResponse::fromEntity)
                .collect(Collectors.toList());
    }

    private void validateAccess(Ticket ticket, User user) {
        if (user.getRole() == Role.ADMIN) return;
        if (ticket.getCreator().getId().equals(user.getId())) return;
        if (ticket.getAssignee() != null && ticket.getAssignee().getId().equals(user.getId())) return;
        throw new UnauthorizedException("You don't have permission to comment on this ticket");
    }
}
