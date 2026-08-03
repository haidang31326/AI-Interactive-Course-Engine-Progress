package com.ai.courseengine.service;

import com.ai.courseengine.dto.block.Block;
import com.ai.courseengine.dto.gemini.GeminiRequest;
import com.ai.courseengine.dto.gemini.GeminiResponse;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import java.util.List;

@Service
public class GeminiAiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public GeminiAiService(ObjectMapper objectMapper) {
        this.restTemplate = new RestTemplate();
        this.objectMapper = objectMapper;
    }

    public List<Block> generateLessonBlocks(String rawText) {
        String prompt = buildPrompt(rawText);

        GeminiRequest request = GeminiRequest.builder()
                .contents(List.of(
                        GeminiRequest.Content.builder()
                                .role("user")
                                .parts(List.of(GeminiRequest.Part.builder().text(prompt).build()))
                                .build()
                ))
                .generationConfig(GeminiRequest.GenerationConfig.builder()
                        .responseMimeType("application/json")
                        .build())
                .build();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-goog-api-key", apiKey);

        HttpEntity<GeminiRequest> entity = new HttpEntity<>(request, headers);

        try {
            GeminiResponse response = restTemplate.postForObject(apiUrl + "?key=" + apiKey, entity, GeminiResponse.class);

            if (response != null && response.getCandidates() != null && !response.getCandidates().isEmpty()) {
                String jsonOutput = response.getCandidates().get(0).getContent().getParts().get(0).getText();
                return objectMapper.readValue(jsonOutput, new TypeReference<List<Block>>() {});
            }
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to generate lesson from Gemini API", e);
        }
        return List.of();
    }

    private String buildPrompt(String rawText) {
        return """
            You are an expert pedagogical AI. Your task is to transform the provided raw educational text into a highly engaging, interactive lesson.
            
            OUTPUT FORMAT:
            You MUST return a strict JSON array of objects representing "Blocks" of the lesson. 
            Do NOT wrap the output in markdown code blocks like ```json. Return ONLY raw JSON array.
            
            There are EXACTLY 3 types of blocks allowed:
            
            1. "theory_markdown": For teaching concepts. Keep it concise and formatted in markdown.
               Structure: {"type": "theory_markdown", "content": "markdown text"}
               
            2. "interactive_fill_blank": For testing recall. 
               Structure: {"type": "interactive_fill_blank", "questionText": "The capital of France is {1}.", "correctAnswers": {"1": "Paris"}, "hints": ["It's a city of light"]}
               
            3. "interactive_scenario": For situational testing or multiple choice.
               Structure: {"type": "interactive_scenario", "scenarioDescription": "A situational question", "options": [{"id": "a", "text": "Option 1", "isCorrect": true}], "explanation": "Why this is correct"}
            
            RULES:
            - The lesson MUST alternate logically between theory blocks and interactive blocks to keep the user engaged.
            - Extract key information from the raw text provided below.
            
            RAW TEXT TO PROCESS:
            """ + rawText;
    }
}
