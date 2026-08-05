package com.ai.courseengine.repository;

import com.ai.courseengine.model.Highlight;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HighlightRepository extends JpaRepository<Highlight, Long> {
    List<Highlight> findByUserIdAndCourseId(Long userId, Long courseId);
    void deleteByCourseId(Long courseId);
}
