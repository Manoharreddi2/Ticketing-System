package com.ticketing.repository;

import com.ticketing.entity.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByTicketIdOrderByCreatedAtAsc(Long ticketId);
    Page<Comment> findByTicketId(Long ticketId, Pageable pageable);
    long countByTicketId(Long ticketId);
}
