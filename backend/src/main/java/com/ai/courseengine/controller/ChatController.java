package com.ai.courseengine.controller;

import com.ai.courseengine.service.GeminiAiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ChatController {

    private final GeminiAiService geminiAiService;

    @PostMapping("/explain")
    public ResponseEntity<Map<String, String>> explainText(@RequestBody Map<String, String> request) {
        String highlightedText = request.get("highlightedText");
        String userQuestion = request.get("question");
        
        try {
            String explanation = geminiAiService.explainHighlightedText(highlightedText, userQuestion);
            return ResponseEntity.ok(Map.of("response", explanation));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to communicate with AI"));
        }
    }
}
