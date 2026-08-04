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
        this.objectMapper = objectMapper.copy()
            .configure(com.fasterxml.jackson.core.JsonParser.Feature.ALLOW_BACKSLASH_ESCAPING_ANY_CHARACTER, true)
            .configure(com.fasterxml.jackson.core.JsonParser.Feature.ALLOW_UNQUOTED_CONTROL_CHARS, true)
            .configure(com.fasterxml.jackson.core.JsonParser.Feature.ALLOW_UNQUOTED_FIELD_NAMES, true)
            .configure(com.fasterxml.jackson.core.JsonParser.Feature.ALLOW_SINGLE_QUOTES, true);
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
                .safetySettings(List.of(
                        GeminiRequest.SafetySetting.builder()
                                .category("HARM_CATEGORY_HATE_SPEECH")
                                .threshold("BLOCK_LOW_AND_ABOVE").build(),
                        GeminiRequest.SafetySetting.builder()
                                .category("HARM_CATEGORY_DANGEROUS_CONTENT")
                                .threshold("BLOCK_LOW_AND_ABOVE").build(),
                        GeminiRequest.SafetySetting.builder()
                                .category("HARM_CATEGORY_SEXUALLY_EXPLICIT")
                                .threshold("BLOCK_LOW_AND_ABOVE").build(),
                        GeminiRequest.SafetySetting.builder()
                                .category("HARM_CATEGORY_HARASSMENT")
                                .threshold("BLOCK_LOW_AND_ABOVE").build()
                ))
                .build();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-goog-api-key", apiKey);

        HttpEntity<GeminiRequest> entity = new HttpEntity<>(request, headers);

        try {
            GeminiResponse response = restTemplate.postForObject(apiUrl + "?key=" + apiKey, entity, GeminiResponse.class);

            if (response != null && response.getCandidates() != null && !response.getCandidates().isEmpty()) {
                String jsonOutput = response.getCandidates().get(0).getContent().getParts().get(0).getText().trim();
                if (jsonOutput.startsWith("```json")) {
                    jsonOutput = jsonOutput.substring(7);
                } else if (jsonOutput.startsWith("```")) {
                    jsonOutput = jsonOutput.substring(3);
                }
                if (jsonOutput.endsWith("```")) {
                    jsonOutput = jsonOutput.substring(0, jsonOutput.length() - 3);
                }
                jsonOutput = jsonOutput.trim();
                
                // Extremely robust fixes for AI hallucinated missing commas
                jsonOutput = jsonOutput.replaceAll("\"\\s+\"", "\", \""); // Fix missing comma between strings
                jsonOutput = jsonOutput.replaceAll("\\}\\s+\\{", "}, {"); // Fix missing comma between objects
                jsonOutput = jsonOutput.replaceAll("]\\s+\\[", "], ["); // Fix missing comma between arrays
                jsonOutput = jsonOutput.replaceAll("\"\\s+\\{", "\", {"); // Fix missing comma before object
                jsonOutput = jsonOutput.replaceAll("\\}\\s+\"", "}, \""); // Fix missing comma before string
                
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
            
            There are EXACTLY 4 types of blocks allowed:
            
            1. "theory_markdown": For teaching concepts. Keep it concise and formatted in markdown.
               Structure: {"type": "theory_markdown", "content": "markdown text", "referenceLink": "https://www.google.com/search?q=..."}
               
            2. "interactive_fill_blank": For testing recall. 
               Structure: {"type": "interactive_fill_blank", "questionText": "The capital of France is {1}.", "correctAnswers": {"1": "Paris"}, "hints": ["It's a city of light"], "referenceLink": "https://www.google.com/search?q=..."}
               
            3. "interactive_scenario": For situational testing or multiple choice.
               Structure: {"type": "interactive_scenario", "scenarioDescription": "A situational question", "options": [{"id": "a", "text": "Option 1", "isCorrect": true}], "explanation": "Why this is correct", "referenceLink": "https://www.google.com/search?q=..."}
               
            4. "interactive_code_editor": For coding exercises (CRITICAL if the topic is programming/coding related).
               Structure: {"type": "interactive_code_editor", "problemStatement": "Write a function...", "startingCode": "def sum(a, b):\n", "expectedCode": "def sum(a, b):\n  return a + b", "language": "python", "hints": ["..."], "referenceLink": "https://www.google.com/search?q=..."}
            
            RULES:
            - You MUST generate a rich, comprehensive course. 
            - For EVERY theory block, you MUST generate AT LEAST 1 to 2 interactive blocks (choose from fill_blank, scenario, or code_editor).
            - If the raw text is about programming, you MUST include 'interactive_code_editor' blocks.
            - The lesson MUST alternate logically, but heavily weight towards interactive practice.
            - CRITICAL: Output MUST be 100% valid, strictly parsable JSON. ALWAYS use double quotes for strings and keys. NEVER use backticks (`) or single quotes for JSON keys or values.
            - CRITICAL: NEVER hallucinate dead URLs. The 'referenceLink' MUST ALWAYS be a valid Google Search URL formatted like: 'https://www.google.com/search?q=Your+Search+Query'. This ensures the user always gets the latest and valid knowledge.
            
            RAW TEXT TO PROCESS:
            """ + rawText;
    }
}
