package com.ai.courseengine.dto.block;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

@JsonTypeInfo(
    use = JsonTypeInfo.Id.NAME,
    include = JsonTypeInfo.As.PROPERTY,
    property = "type"
)
@JsonSubTypes({
    @JsonSubTypes.Type(value = TheoryBlock.class, name = "theory_markdown"),
    @JsonSubTypes.Type(value = FillBlankBlock.class, name = "interactive_fill_blank"),
    @JsonSubTypes.Type(value = ScenarioBlock.class, name = "interactive_scenario")
})
public interface Block {
}
