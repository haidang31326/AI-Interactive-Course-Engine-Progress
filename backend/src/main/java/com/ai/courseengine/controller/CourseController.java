package com.ai.courseengine.controller;

import com.ai.courseengine.model.Course;
import com.ai.courseengine.service.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
@CrossOrigin(origins = "*") // Allow frontend access
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;

    @PostMapping("/generate")
    public ResponseEntity<Course> generateCourse(
            @RequestParam("title") String title,
            @RequestParam("file") MultipartFile file) {
        try {
            Course course = courseService.generateCourseFromDocument(title, file);
            return ResponseEntity.ok(course);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping
    public ResponseEntity<List<Course>> getAllCourses() {
        return ResponseEntity.ok(courseService.getAllCourses());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Course> getCourse(@PathVariable Long id) {
        return courseService.getCourse(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
