package com.ai.courseengine.repository;

import com.ai.courseengine.model.Course;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    @EntityGraph(attributePaths = {"lessons"})
    List<Course> findAllByUserId(Long userId);
    @EntityGraph(attributePaths = {"lessons"})
    List<Course> findByIsPublicTrue();
}
