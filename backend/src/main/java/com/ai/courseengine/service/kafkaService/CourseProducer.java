package com.ai.courseengine.service.kafkaService;

import com.ai.courseengine.dto.kafka.CourseGenerationEvent;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class CourseProducer {
    private KafkaTemplate<String, CourseGenerationEvent> kafkaTemplate;
    public CourseProducer(KafkaTemplate<String,CourseGenerationEvent> kafkaTemplate) {
        this.kafkaTemplate=kafkaTemplate;
    }
    public void sendGenerationTask(CourseGenerationEvent course) {
        kafkaTemplate.send("course-engine-topic",String.valueOf(course.getCourseId()),course);
    }
}
