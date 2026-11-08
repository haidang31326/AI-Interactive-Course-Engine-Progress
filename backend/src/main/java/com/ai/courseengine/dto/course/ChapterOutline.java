package com.ai.courseengine.dto.course;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChapterOutline {
    private int order;
    private String title;
    private String summary;
}
