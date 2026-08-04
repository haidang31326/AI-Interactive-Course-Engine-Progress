package com.ai.courseengine.dto.block;

import lombok.Data;
import java.util.List;

@Data
public class ScenarioBlock implements Block {
    private String type = "interactive_scenario";
    private String scenarioDescription;
    private List<Option> options;
    private String explanation; // Explanation shown after answering
    private String referenceLink;

    @Data
    public static class Option {
        private String id;
        private String text;
        @com.fasterxml.jackson.annotation.JsonProperty("isCorrect")
        private boolean isCorrect;
    }
}
