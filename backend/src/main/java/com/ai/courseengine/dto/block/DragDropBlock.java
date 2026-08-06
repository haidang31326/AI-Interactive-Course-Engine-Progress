package com.ai.courseengine.dto.block;

import lombok.Data;
import java.util.List;

@Data
public class DragDropBlock implements Block {
    private String type = "interactive_drag_drop";
    private String instruction;
    private List<String> categories;
    private List<DragDropItem> items;
    private String referenceLink;

    @Data
    public static class DragDropItem {
        private String id;
        private String text;
        private String correctCategory;
    }
}
