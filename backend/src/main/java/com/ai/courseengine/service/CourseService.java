package com.ai.courseengine.service;

import com.ai.courseengine.dto.block.Block;
import com.ai.courseengine.dto.course.ChapterOutline;
import com.ai.courseengine.dto.kafka.CourseGenerationEvent;
import com.ai.courseengine.model.Course;
import com.ai.courseengine.model.Lesson;
import com.ai.courseengine.model.OutboxEvent;
import com.ai.courseengine.model.OutboxStatus;
import com.ai.courseengine.repository.CourseRepository;
import com.ai.courseengine.repository.LessonRepository;
import com.ai.courseengine.repository.HighlightRepository;
import com.ai.courseengine.repository.OutboxEventRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class CourseService {

    private final DocumentParserService documentParserService;
    private final GeminiAiService geminiAiService;
    private final CourseRepository courseRepository;
    private final LessonRepository lessonRepository;
    private final HighlightRepository highlightRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final OutboxEventRepository outboxEventRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public Course generateCourseFromDocument(String title, MultipartFile file, Long userId, Long courseId) throws IOException {
        // Step 1: Parse the document
        String rawText = documentParserService.parseDocument(file);

        // Optional chunking could go here. For MVP, we pass the whole text to Gemini 1.5.
        // Limit text length if needed to avoid extreme token usage.
        if (rawText.length() > 50000) {
            rawText = rawText.substring(0, 50000);
        }

        // Step 2: Call Gemini to generate polymorphic JSON blocks
        List<Block> generatedBlocks = geminiAiService.generateLessonBlocks(rawText);

        // Step 3: Save to Database
        Course course;
        int nextOrder = 1;
        if (courseId != null) {
            course = courseRepository.findById(courseId)
                    .orElseThrow(() -> new RuntimeException("Course not found"));
            nextOrder = course.getLessons().size() + 1;
        } else {
            course = new Course();
            course.setTitle(title);
            course.setDescription("AI Generated Course from " + file.getOriginalFilename());
            course.setUserId(userId);
            course = courseRepository.save(course);
        }

        Lesson lesson = new Lesson();
        lesson.setTitle(title != null && courseId != null ? title : "Chapter " + nextOrder);
        lesson.setOrder(nextOrder);
        lesson.setCourse(course);
        lesson.setBlocks(generatedBlocks);

        lessonRepository.save(lesson);

        // Fetch course again to ensure lazy loaded relations or just return it
        course.getLessons().add(lesson);
        return course;
    }

    @Transactional
    public void deleteCourse(Long courseId) {
        if (!courseRepository.existsById(courseId)) {
            throw new RuntimeException("Course not found");
        }
        highlightRepository.deleteByCourseId(courseId);
        courseRepository.deleteById(courseId);
    }

    @Transactional(readOnly = true)
    public Optional<Course> getCourse(Long courseId) {
        return courseRepository.findById(courseId);
    }

    @Transactional(readOnly = true)
    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Course> getCoursesByUserId(Long userId) {
        return courseRepository.findAllByUserId(userId);
    }

    @Transactional
    public Course saveProgress(Long courseId, Integer stepIndex) {
        Course course = courseRepository.findById(courseId).orElseThrow();
        course.setCurrentStepIndex(stepIndex);
        return courseRepository.save(course);
    }

    @Transactional(readOnly = true)
    public List<Course> getPublicCourses() {
        return courseRepository.findByIsPublicTrue();
    }

    @Transactional
    public Course togglePublic(Long courseId) {
        Course course = courseRepository.findById(courseId).orElseThrow(() -> new RuntimeException("Course not found"));
        course.setIsPublic(course.getIsPublic() == null || !course.getIsPublic());
        return courseRepository.save(course);
    }

    @Transactional
    public Course cloneCourse(Long courseId, Long newUserId) {
        Course original = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        Course clonedCourse = new Course();
        clonedCourse.setTitle(original.getTitle());
        clonedCourse.setDescription(original.getDescription());
        clonedCourse.setUserId(newUserId);
        clonedCourse.setCurrentStepIndex(0);
        clonedCourse.setIsPublic(false); // Cloned courses are private by default

        // Save to get ID
        Course savedCourse = courseRepository.save(clonedCourse);

        for (Lesson originalLesson : original.getLessons()) {
            Lesson clonedLesson = new Lesson();
            clonedLesson.setTitle(originalLesson.getTitle());
            clonedLesson.setOrder(originalLesson.getOrder());
            clonedLesson.setCourse(savedCourse);

            // Assuming blocks are serialized to JSON, copying the list reference might be risky if they are mutable,
            // but since Block objects are generated from JSON and we are saving back to JSON, it should be fine.
            // For true safety, one would deep copy, but for hackathon this works.
            clonedLesson.setBlocks(new java.util.ArrayList<>(originalLesson.getBlocks()));

            lessonRepository.save(clonedLesson);
            savedCourse.getLessons().add(clonedLesson);
        }

        return savedCourse;
    }

    @Transactional
    public Course saveTempCourse(Course course) {
        return courseRepository.save(course);
    }

    public void processCourseGeneration(Long courseId, String text) {
        Course course = courseRepository.findById(courseId).orElseThrow(() -> new RuntimeException("course khong ton tai"));
        if("COMPLETED".equalsIgnoreCase(course.getStatus())) {
            log.warn("[Idempotent Consumer] Khóa học ID: {} đã hoàn thành từ trước. Bỏ qua event để tránh gọi AI trùng lặp!\" ", courseId);
            return;
        }
        course.setStatus("PROCESSING");
        courseRepository.save(course);
       /* if(course.getLessons() != null && !course.getLessons().isEmpty()) {
            lessonRepository.deleteAll(course.getLessons());
            course.getLessons().clear();
        }*/
        List<Lesson> existingLesson = lessonRepository.findByCourseIdOrderByOrderAsc(courseId);
        if(existingLesson.isEmpty()) {
            lessonRepository.deleteAll(existingLesson);
        }

        List<ChapterOutline> outlines = geminiAiService.generateCourseOutline(text);
        if (outlines == null || outlines.isEmpty()) {
            outlines = List.of(new ChapterOutline(1, course.getTitle() != null ? course.getTitle() : "Chương 1: Tổng quan", text));
        }
        int totalChapters = outlines.size();
        for(ChapterOutline chapter:outlines) {
            String chapterContext = "Chủ đề: " + chapter.getTitle() + "\nNội dung kiến thức:\n" + chapter.getSummary();
            List<Block> blocks = geminiAiService.generateLessonBlocks(chapterContext);
            Lesson lesson = new Lesson();
            lesson.setBlocks(blocks);
            lesson.setCourse(course);
            lesson.setTitle(chapter.getTitle());
            lesson.setOrder(chapter.getOrder());
            lessonRepository.save(lesson);

            messagingTemplate.convertAndSend("/topic/course/" + courseId, Map.of(
                    "courseId", courseId,
                    "status", "IN_PROGRESS",
                    "completedChapter", chapter.getOrder(),
                    "totalChapters", totalChapters,
                    "chapterTitle", chapter.getTitle(),
                    "message", "Đã soạn xong " + chapter.getTitle()
            ));
        }

        course.setStatus("COMPLETED");
        courseRepository.save(course);
        messagingTemplate.convertAndSend("/topic/course/" + courseId, Map.of(
                "courseId", courseId,
                "status", "COMPLETED",
                "message", "The Course generated"
        ));
    }
    @Transactional
    public void handleGenerationFailure(Long courseId,String text) {
        Course course = courseRepository.findById(courseId).orElseThrow(() -> new RuntimeException("course khong ton tai"));
        course.setStatus("FAILED");
        courseRepository.save(course);


        messagingTemplate.convertAndSend("/topic/course/" + courseId, Map.of(
                "courseId",courseId,
                "status","FAILED",
                "message","The Course FAILED in process run"
        ));
    }
    @Transactional
    public Course createCourseWithOutbox(String title,Long userId,String context) {
        Course newCourse = new Course();
        newCourse.setTitle(title);
        newCourse.setUserId(userId);
        Course savedCourse = courseRepository.save(newCourse);

        CourseGenerationEvent event = new CourseGenerationEvent(savedCourse.getId(),userId,context);
        String payloadJson;

        try {
            payloadJson = objectMapper.writeValueAsString(event);
        }catch (Exception e) {
            throw new RuntimeException("Không thể serialize CourseGenerationEvent sang JSON", e);
        }
        OutboxEvent outboxEvent = OutboxEvent.builder()
                .aggregateType("COURSE")
                .aggregateId(savedCourse.getId())
                .payload(payloadJson)
                .eventType("COURSE_CREATED")
                .status(OutboxStatus.PENDING)
                .build();

        outboxEventRepository.save(outboxEvent);

        return savedCourse;
    }
}
