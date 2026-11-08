package com.ai.courseengine.repository;

import com.ai.courseengine.model.OutboxEvent;
import com.ai.courseengine.model.OutboxStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OutboxEventRepository extends JpaRepository<OutboxEvent,Long> {
    List<OutboxEvent> findTop20ByStatusOrderByCreatedAtAsc(OutboxStatus status);
}
