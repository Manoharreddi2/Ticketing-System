package com.ticketing.repository;

import com.ticketing.entity.Ticket;
import com.ticketing.entity.enums.Priority;
import com.ticketing.entity.enums.TicketStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long>, JpaSpecificationExecutor<Ticket> {

    Optional<Ticket> findByTicketNumber(String ticketNumber);

    Page<Ticket> findByCreatorId(Long creatorId, Pageable pageable);

    Page<Ticket> findByAssigneeId(Long assigneeId, Pageable pageable);

    Page<Ticket> findByStatus(TicketStatus status, Pageable pageable);

    Page<Ticket> findByPriority(Priority priority, Pageable pageable);

    long countByStatus(TicketStatus status);

    long countByPriority(Priority priority);

    long countByAssigneeId(Long assigneeId);

    long countByCreatorId(Long creatorId);

    @Query("SELECT COALESCE(MAX(CAST(SUBSTRING(t.ticketNumber, 5) AS int)), 0) FROM Ticket t")
    int findMaxTicketNumber();

    @Query("SELECT COUNT(t) FROM Ticket t WHERE t.status = :status AND t.assignee.id = :assigneeId")
    long countByStatusAndAssigneeId(@Param("status") TicketStatus status, @Param("assigneeId") Long assigneeId);
}
