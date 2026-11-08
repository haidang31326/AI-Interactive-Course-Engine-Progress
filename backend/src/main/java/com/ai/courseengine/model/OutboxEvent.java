package com.ai.courseengine.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "outbox_events")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OutboxEvent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String aggregateType; // Ví dụ: "COURSE"

    private Long aggregateId;     // ID của Course

    private String eventType;       // Ví dụ: "COURSE_CREATED"

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String payload;         // Dữ liệu JSON của CourseGenerationEvent

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private OutboxStatus status;

    private LocalDateTime createdAt;
    private LocalDateTime processedAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = OutboxStatus.PENDING;
        }
    }
}
