package com.ai.courseengine.service.kafkaService;

import com.ai.courseengine.dto.kafka.CourseGenerationEvent;
import com.ai.courseengine.service.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.DltHandler;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.annotation.RetryableTopic;
import org.springframework.retry.annotation.Backoff;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CourseConsumer {
    private final CourseService courseService;
    @RetryableTopic(
            attempts = "3",
            backoff = @Backoff(delay = 2000,multiplier = 2.0)
            ,dltTopicSuffix = "-dlt"
    )
    @KafkaListener(topics = "course-engine-topic",groupId = "course-generation-group")
    public void listenGenertationTask(CourseGenerationEvent event) {
        courseService.processCourseGeneration(event.getCourseId(),event.getText());
    }
    @DltHandler
    public void handleDlt(CourseGenerationEvent event) {
        courseService.handleGenerationFailure(event.getCourseId(),"AI qua tai thu lai sau");
    }
}
