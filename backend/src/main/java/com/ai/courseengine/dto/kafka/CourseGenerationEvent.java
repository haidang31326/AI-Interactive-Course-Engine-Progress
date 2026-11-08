package com.ai.courseengine.dto.kafka;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CourseGenerationEvent {
    private Long courseId;
    private Long userId;
    private String text;

}
