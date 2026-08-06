package com.ai.courseengine.dto.block;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

@JsonTypeInfo(
    use = JsonTypeInfo.Id.NAME,
    include = JsonTypeInfo.As.PROPERTY,
    property = "type"
)
@com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown = true)
@JsonSubTypes({
    @JsonSubTypes.Type(value = TheoryBlock.class, name = "theory_markdown"),
    @JsonSubTypes.Type(value = TheoryBlock.class, name = "theory"),
    @JsonSubTypes.Type(value = FillBlankBlock.class, name = "interactive_fill_blank"),
    @JsonSubTypes.Type(value = FillBlankBlock.class, name = "fill_blank"),
    @JsonSubTypes.Type(value = FillBlankBlock.class, name = "fill_in_the_blank"),
    @JsonSubTypes.Type(value = FillBlankBlock.class, name = "fill_in_the_blank"),
    @JsonSubTypes.Type(value = ScenarioBlock.class, name = "interactive_scenario"),
    @JsonSubTypes.Type(value = ScenarioBlock.class, name = "scenario"),
    @JsonSubTypes.Type(value = CodeBlock.class, name = "interactive_code_editor"),
    @JsonSubTypes.Type(value = CodeBlock.class, name = "code_editor"),
    @JsonSubTypes.Type(value = DragDropBlock.class, name = "interactive_drag_drop"),
    @JsonSubTypes.Type(value = DragDropBlock.class, name = "drag_drop")
})
public interface Block {
}
