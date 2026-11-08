package com.ai.courseengine.controller;

import com.ai.courseengine.dto.kafka.CourseGenerationEvent;
import com.ai.courseengine.model.Course;
import com.ai.courseengine.service.CourseService;
import com.ai.courseengine.service.DocumentParserService;
import com.ai.courseengine.service.bucket4j.RateLimitingService;
import com.ai.courseengine.service.kafkaService.CourseProducer;
import io.github.bucket4j.ConsumptionProbe;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.websocket.server.PathParam;
import lombok.RequiredArgsConstructor;
import org.apache.kafka.common.metrics.stats.Rate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/courses")
@CrossOrigin(origins = "*") // Allow frontend access
@RequiredArgsConstructor
public class CourseController {
    private final CourseProducer courseProducer;
    private final CourseService courseService;
    private final DocumentParserService service;
    private final RateLimitingService rateLimitingService;
    @PostMapping("/generate")
    public ResponseEntity<?> generateCourse(@RequestParam Long userId, @RequestParam MultipartFile file, HttpServletRequest request) throws IOException {
            String clientip = request.getRemoteAddr();
            String rateLimitKey = "Course_gen_" + (userId != null ? userId :clientip);
        ConsumptionProbe probe = rateLimitingService.tryConsume(rateLimitKey);
        if (!probe.isConsumed()) {
            long waitSeconds = probe.getNanosToWaitForRefill() / 1_000_000_000;
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .header("X-Rate-Limit-Retry-After-Seconds", String.valueOf(waitSeconds))
                    .body(Map.of(
                            "error", "QUOTA_EXCEEDED",
                            "message", "Bạn đã tạo quá nhiều yêu cầu trong thời gian ngắn. Vui lòng thử lại sau " + waitSeconds + " giây.",
                            "retryAfterSeconds", waitSeconds
                    ));
        }
            String textContext = service.parseDocument(file);
            Course savedCourse = courseService.createCourseWithOutbox(file.getOriginalFilename(),userId,textContext);
            return ResponseEntity.accepted().body(Map.of("courseId", savedCourse.getId(),
                    "status", "PENDING",
                    "message", "Khóa học đang được tạo ngầm..."
            ));

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
