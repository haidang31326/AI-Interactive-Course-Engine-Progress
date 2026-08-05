package com.ai.courseengine.controller;

import com.ai.courseengine.model.Highlight;
import com.ai.courseengine.repository.HighlightRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/highlights")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class HighlightController {

    private final HighlightRepository highlightRepository;

    @GetMapping
    public ResponseEntity<List<Highlight>> getHighlights(
            @RequestParam Long userId,
            @RequestParam Long courseId) {
        return ResponseEntity.ok(highlightRepository.findByUserIdAndCourseId(userId, courseId));
    }

    @PostMapping
    public ResponseEntity<Highlight> saveHighlight(@RequestBody Highlight highlight) {
        return ResponseEntity.ok(highlightRepository.save(highlight));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHighlight(@PathVariable Long id) {
        highlightRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
