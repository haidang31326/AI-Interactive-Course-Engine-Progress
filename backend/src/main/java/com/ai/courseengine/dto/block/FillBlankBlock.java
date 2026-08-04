package com.ai.courseengine.dto.block;

import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class FillBlankBlock implements Block {
    private String type = "interactive_fill_blank";
    private String questionText; // The text with blanks, e.g., "The capital of France is {1}."
    private Map<String, String> correctAnswers; // map of placeholder ID -> correct word
    private List<String> hints;
    private String imagePrompt;
}
