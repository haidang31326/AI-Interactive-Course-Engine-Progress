package com.ai.courseengine.service;

import com.ai.courseengine.dto.kafka.CourseGenerationEvent;
import com.ai.courseengine.model.OutboxEvent;
import com.ai.courseengine.model.OutboxStatus;
import com.ai.courseengine.repository.OutboxEventRepository;
import com.ai.courseengine.service.kafkaService.CourseProducer;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class OutboxPublisherService {
    private final OutboxEventRepository outboxEventRepository;
    private final CourseProducer courseProducer;
    private final ObjectMapper objectMapper;


    @Scheduled(fixedDelay = 2000)
    @Transactional
    public void publishPendingEvents() {
        List<OutboxEvent> listOutbox = outboxEventRepository.findTop20ByStatusOrderByCreatedAtAsc(OutboxStatus.PENDING);
        if(listOutbox.isEmpty())
                return;

        log.info("📦 [Outbox Relay] Tìm thấy {} sự kiện đang chờ bắn sang Kafka...",
                listOutbox.size());

        for(OutboxEvent outboxEvent:listOutbox) {
            try {
                CourseGenerationEvent event = objectMapper.readValue(outboxEvent.getPayload(),CourseGenerationEvent.class);

                courseProducer.sendGenerationTask(event);

                outboxEvent.setStatus(OutboxStatus.PROCESSED);
                outboxEvent.setProcessedAt(LocalDateTime.now());
                log.info("✅ [Outbox Relay] Đã đẩy thành công sự kiện ID: {} sang Kafka",
                        outboxEvent.getId());
            }catch (Exception e) {
                log.error("❌ [Outbox Relay] Lỗi khi xử lý sự kiện ID: {}", outboxEvent.getId(), e);
                outboxEvent.setStatus(OutboxStatus.FAILED);
            }

        }
        outboxEventRepository.saveAll(listOutbox);
    }
}
