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
            @RequestParam(value = "title", required = false) String title,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "userId", required = false) Long userId,
            @RequestParam(value = "courseId", required = false) Long courseId) {
        try {
            Course course = courseService.generateCourseFromDocument(title, file, userId, courseId);
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

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Course>> getAllCoursesByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(courseService.getCoursesByUserId(userId));
    }

    @GetMapping("/community")
    public ResponseEntity<List<Course>> getCommunityCourses() {
        return ResponseEntity.ok(courseService.getPublicCourses());
    }

    @PutMapping("/{courseId}/toggle-public")
    public ResponseEntity<Course> togglePublic(@PathVariable Long courseId) {
        try {
            return ResponseEntity.ok(courseService.togglePublic(courseId));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{courseId}/clone")
    public ResponseEntity<Course> cloneCourse(
            @PathVariable Long courseId,
            @RequestParam("userId") Long userId) {
        try {
            Course clonedCourse = courseService.cloneCourse(courseId, userId);
            return ResponseEntity.ok(clonedCourse);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{courseId}/progress")
    public ResponseEntity<Course> saveProgress(
            @PathVariable Long courseId, 
            @RequestParam("stepIndex") Integer stepIndex) {
        try {
            return ResponseEntity.ok(courseService.saveProgress(courseId, stepIndex));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{courseId}")
    public ResponseEntity<Void> deleteCourse(@PathVariable Long courseId) {
        try {
            courseService.deleteCourse(courseId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}
