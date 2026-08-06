package com.ai.courseengine.exception;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.context.request.WebRequest;

import java.nio.charset.Charset;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

public class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler exceptionHandler = new GlobalExceptionHandler();
    private final WebRequest webRequest = mock(WebRequest.class);

    @Test
    public void testHandleIllegalArgumentException() {
        when(webRequest.getDescription(false)).thenReturn("uri=/api/test");
        
        IllegalArgumentException ex = new IllegalArgumentException("Invalid input");
        ResponseEntity<ErrorResponse> response = exceptionHandler.handleIllegalArgumentException(ex, webRequest);
        
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(400, response.getBody().getStatus());
        assertEquals("Invalid input", response.getBody().getMessage());
        assertEquals("uri=/api/test", response.getBody().getPath());
    }

    @Test
    public void testHandleRateLimitException() {
        when(webRequest.getDescription(false)).thenReturn("uri=/api/chat/explain");
        
        HttpClientErrorException.TooManyRequests ex = (HttpClientErrorException.TooManyRequests) HttpClientErrorException.create(
                HttpStatus.TOO_MANY_REQUESTS, "Too Many Requests", org.springframework.http.HttpHeaders.EMPTY, new byte[0], Charset.defaultCharset());
                
        ResponseEntity<ErrorResponse> response = exceptionHandler.handleRateLimitException(ex, webRequest);
        
        assertEquals(HttpStatus.TOO_MANY_REQUESTS, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(429, response.getBody().getStatus());
        assertEquals("Hệ thống AI đang quá tải do có quá nhiều người dùng (Giới hạn Gemini API). Vui lòng chờ vài phút rồi thử lại.", response.getBody().getMessage());
    }

    @Test
    public void testHandleGlobalException() {
        when(webRequest.getDescription(false)).thenReturn("uri=/api/unknown");
        
        Exception ex = new Exception("Unexpected error");
        ResponseEntity<ErrorResponse> response = exceptionHandler.handleGlobalException(ex, webRequest);
        
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(500, response.getBody().getStatus());
        assertEquals("Internal Server Error", response.getBody().getError());
    }
}
