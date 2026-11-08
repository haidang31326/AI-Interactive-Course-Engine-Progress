package com.ai.courseengine;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class CourseEngineApplication {

    public static void main(String[] args) {
        SpringApplication.run(CourseEngineApplication.class, args);
    }

}
