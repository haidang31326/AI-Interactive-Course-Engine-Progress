package com.ai.courseengine.dto.block;

import lombok.Data;
import java.util.List;

@Data
public class CodeBlock implements Block {
    private String type = "interactive_code_editor";
    private String problemStatement; // The coding problem
    private String startingCode; // The initial code template
    private String expectedCode; // The correct code to compare against
    private String language; // e.g., java, python, javascript
    private List<String> hints;
    private String referenceLink;
}
