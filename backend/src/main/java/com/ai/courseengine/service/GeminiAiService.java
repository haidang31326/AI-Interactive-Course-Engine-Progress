package com.ai.courseengine.service;

import com.ai.courseengine.dto.block.Block;
import com.ai.courseengine.dto.course.ChapterOutline;
import com.ai.courseengine.dto.gemini.GeminiRequest;
import com.ai.courseengine.dto.gemini.GeminiResponse;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
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

    private RestClient restClient;
    private final ObjectMapper objectMapper;

    public GeminiAiService(ObjectMapper objectMapper) {
        this.restClient = RestClient.create();
        this.objectMapper = objectMapper.copy()
            .configure(com.fasterxml.jackson.core.JsonParser.Feature.ALLOW_BACKSLASH_ESCAPING_ANY_CHARACTER, true)
            .configure(com.fasterxml.jackson.core.JsonParser.Feature.ALLOW_UNQUOTED_CONTROL_CHARS, true)
            .configure(com.fasterxml.jackson.core.JsonParser.Feature.ALLOW_UNQUOTED_FIELD_NAMES, true)
            .configure(com.fasterxml.jackson.core.JsonParser.Feature.ALLOW_SINGLE_QUOTES, true);
    }
    @CircuitBreaker(name = "geminiAiService",fallbackMethod = "fallbackGenerateLessonBlocks")
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

        try {
           GeminiResponse response = restClient.post()
                   .uri(apiUrl + "?key=" + apiKey)
                   .contentType(MediaType.APPLICATION_JSON)
                   .header("x-goog-api-key",apiKey)
                   .body(request)
                   .retrieve()
                   .body(GeminiResponse.class);

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
                
                // Fix unescaped double quotes in C# string interpolation (e.g., $"")
                jsonOutput = jsonOutput.replace("$\"\"", "$\\\"\\\"");
                
                try {
                    return objectMapper.readValue(jsonOutput, new TypeReference<List<Block>>() {});
                } catch (Exception e) {
                    System.err.println("JSON Parse Error! Raw output from Gemini:");
                    System.err.println(jsonOutput);
                    throw new RuntimeException("Failed to parse JSON from Gemini API", e);
                }
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
                   - INTERACTIVE BLOCKS (Choose 1 or 2 per theory block, use a variety):
    		  * interactive_fill_blank:
                    Structure: {"type": "interactive_fill_blank", "questionText": "Interface [JpaRepository] cung cấp sẵn hàm [save] để lưu entity vào database.", "correctAnswers": {"JpaRepository": "JpaRepository",
                    ￹"save": "save"}, "hints": ["Xem lại phần khái niệm về Spring Data JPA"], "referenceLink": "..."}
    		  * interactive_scenario:
                    Structure: {"type": "interactive_scenario", "scenarioDescription": "...", "options": [{"id": "a", "text": "...", "isCorrect": true}], "explanation": "...", "referenceLink": "..."}
    		  * interactive_code_editor:
                    Structure: {"type": "interactive_code_editor", "problemStatement": "Viết hàm...", "startingCode": "def sum(a, b):\n", "expectedCode": "def sum(a, b):\n  return a + b", "language": "python", "hints":
                    ￹["..."], "referenceLink": "..."}
    		  * interactive_drag_drop:
                    Structure: {"type": "interactive_drag_drop", "instruction": "Phân loại các khái niệm sau vào đúng nhóm", "categories": ["Nhóm 1", "Nhóm 2"], "items": [{"id": "item1", "text": "Khái niệm A",
                    ￹"correctCategory": "Nhóm 1"}], "referenceLink": "..."}

                RULES:
                - STRICT LANGUAGE RULE: All generated content (theory markdown, questions, fill-in-the-blank text, multiple-choice options, explanations, and hints) MUST be in the EXACT SAME language as the RAW TEXT TO
                ￹PROCESS (e.g., Vietnamese if the input text is Vietnamese). NEVER output English questions for Vietnamese materials.
                - CONTENT MODERATION: Before generating the lesson, evaluate the raw text. If the text is violent, sexually explicit, harmful, or completely lacks educational value, abort and return error block.
                - You MUST generate a rich, comprehensive course.
                - For EVERY theory block, you MUST generate AT LEAST 1 to 2 interactive blocks (choose from fill_blank, scenario, code_editor, or drag_drop).
                - If the raw text is about programming, you MUST include 'interactive_code_editor' blocks.
                - The lesson MUST alternate logically, but heavily weight towards interactive practice.
                - CRITICAL: Output MUST be 100% valid, strictly parsable JSON. ALWAYS use double quotes for strings and keys. NEVER use backticks (`) or single quotes for JSON keys or values.
                - DO NOT wrap entire questions or answers in backticks.
                - For 'referenceLink', YOU MUST provide a valid Google Search URL in this EXACT format: 'https://www.google.com/search?q=search+terms+here'.
                - CRITICAL JSON RULE: NEVER use unescaped double quotes inside any string value.
                - Return a JSON array of Block objects.

                RAW TEXT TO PROCESS:
                """ + rawText;
    }

    public String explainHighlightedText(String highlightedText, String userQuestion) {
        String prompt = "You are an expert AI tutor. The user is reading a lesson and highlighted the following text:\n\n"
                      + "\"" + highlightedText + "\"\n\n"
                      + "They asked the following question about it: \"" + userQuestion + "\"\n\n"
                      + "Please provide a clear, concise, and helpful explanation directly addressing their question. "
                      + "Format your response in plain text (or light markdown) without any JSON wrapping.";

        GeminiRequest request = GeminiRequest.builder()
                .contents(List.of(
                        GeminiRequest.Content.builder()
                                .role("user")
                                .parts(List.of(GeminiRequest.Part.builder().text(prompt).build()))
                                .build()
                ))
                .build();
        try {
            GeminiResponse response = restClient.post()
                    .uri(apiUrl + "?key=" + apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .header("x-goog-api-key",apiKey)
                    .body(request)
                    .retrieve()
                    .body(GeminiResponse.class);
            
            if (response != null && response.getCandidates() != null && !response.getCandidates().isEmpty()) {
                return response.getCandidates().get(0).getContent().getParts().get(0).getText();
            }
            return "Sorry, I couldn't generate an explanation right now.";
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to get explanation from Gemini AI", e);
        }
    }
    @CircuitBreaker(name = "geminiAiService", fallbackMethod = "fallbackGenerateCourseOutline")
    public List<ChapterOutline> generateCourseOutline(String rawText) {
        String prompt = buildOutlinePrompt(rawText);

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
        try {
            GeminiResponse response = restClient.post()
                    .uri(apiUrl + "?key=" + apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .header("x-goog-api-key",apiKey)
                    .body(request)
                    .retrieve()
                    .body(GeminiResponse.class);

            if (response != null && response.getCandidates() != null && !response.getCandidates().isEmpty()) {
                String jsonOutput = response.getCandidates().get(0).getContent().getParts().get(0).getText().trim();

                // Làm sạch markdown nếu có
                if (jsonOutput.startsWith("```json")) {
                    jsonOutput = jsonOutput.substring(7);
                } else if (jsonOutput.startsWith("```")) {
                    jsonOutput = jsonOutput.substring(3);
                }
                if (jsonOutput.endsWith("```")) {
                    jsonOutput = jsonOutput.substring(0, jsonOutput.length() - 3);
                }
                jsonOutput = jsonOutput.trim();

                return objectMapper.readValue(jsonOutput, new TypeReference<List<ChapterOutline>>() {});
            }
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to generate course outline from Gemini", e);
        }
        return List.of();
    }

    private String buildOutlinePrompt(String rawText) {
        return """
                You are an expert pedagogical curriculum designer.
                Analyze the provided educational text and divide it into a cohesive, structured curriculum of chapters.

                RULES:
                1. Divide the content logically into 2 to 4 distinct chapters based on the text.
                2. Each chapter must represent a clear learning milestone.
                3. For each chapter, you MUST provide:
                   - "order": Integer starting from 1 (1, 2, 3...)
                   - "title": A clear, professional title in the SAME language as the input text (e.g. 'Chương 1: Tổng quan về Spring Boot').
                   - "summary": A comprehensive summary (150-300 words) extracting the essential concepts, definitions, and code samples for this specific chapter.
                4. OUTPUT FORMAT:
                   Return ONLY a strict JSON array of objects. Do NOT wrap in ```json codeblocks.
                   Example:
                   [
                     {
                       "order": 1,
                       "title": "Chương 1: ...",
                       "summary": "..."
                     }
                   ]
                5. CRITICAL: Output must be 100% valid JSON with properly escaped strings.

                RAW TEXT TO ANALYZE:
                """ + rawText;
    }
    public List<Block> fallbackGenerateLessonBlocks(String rawText,Throwable throwable) {
        System.err.println("⚡ [Circuit Breaker] Cầu dao AI đã kích hoạt! Lý do: " + throwable.getMessage());
        throw new RuntimeException("Dịch vụ AI đang tạm thời quá tải hoặc gián đoạn. Cầu dao bảo vệ hệ thống đã ngắt.", throwable);
    }
    public List<ChapterOutline> fallbackGenerateCourseOutline(String rawText,Throwable throwable) {
        System.err.println("⚡ [Circuit Breaker - Outline] Cầu dao AI đã kích hoạt! Lý do: " + throwable.getMessage());
        throw new RuntimeException("Dịch vụ AI đang tạm thời quá tải hoặc gián đoạn (Outline). Cầu dao bảo vệ đã kích hoạt.", throwable);
    }
}
