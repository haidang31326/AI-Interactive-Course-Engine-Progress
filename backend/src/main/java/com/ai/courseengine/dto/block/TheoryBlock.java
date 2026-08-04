package com.ai.courseengine.dto.block;

import lombok.Data;

@Data
public class TheoryBlock implements Block {
    private String type = "theory_markdown";
    private String content;
    private String imagePrompt; // The markdown content
}
