package com.ai.courseengine.service;

import com.ai.courseengine.dto.block.Block;
import com.ai.courseengine.model.Course;
import com.ai.courseengine.model.Lesson;
import com.ai.courseengine.repository.CourseRepository;
import com.ai.courseengine.repository.LessonRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final DocumentParserService documentParserService;
    private final GeminiAiService geminiAiService;
    private final CourseRepository courseRepository;
    private final LessonRepository lessonRepository;

    @Transactional
    public Course generateCourseFromDocument(String title, MultipartFile file) throws IOException {
        // Step 1: Parse the document
        String rawText = documentParserService.parsePdf(file);
        
        // Optional chunking could go here. For MVP, we pass the whole text to Gemini 1.5.
        // Limit text length if needed to avoid extreme token usage.
        if (rawText.length() > 50000) {
            rawText = rawText.substring(0, 50000);
        }

        // Step 2: Call Gemini to generate polymorphic JSON blocks
        List<Block> generatedBlocks = geminiAiService.generateLessonBlocks(rawText);

        // Step 3: Save to Database
        Course course = new Course();
        course.setTitle(title);
        course.setDescription("AI Generated Course from " + file.getOriginalFilename());
        course = courseRepository.save(course);

        Lesson lesson = new Lesson();
        lesson.setTitle("Chapter 1");
        lesson.setOrder(1);
        lesson.setCourse(course);
        lesson.setBlocks(generatedBlocks);
        
        lessonRepository.save(lesson);

        // Fetch course again to ensure lazy loaded relations or just return it
        course.getLessons().add(lesson);
        return course;
    }

    @Transactional(readOnly = true)
    public Optional<Course> getCourse(Long courseId) {
        return courseRepository.findById(courseId);
    }
    
    @Transactional(readOnly = true)
    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }
}
