package com.ai.courseengine.service.bucket4j;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.ConsumptionProbe;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RateLimitingService {
    private final Map<String, Bucket> bucketMap = new ConcurrentHashMap<>();

    private Bucket createNewBucket() {
        Bandwidth limit  = Bandwidth.builder()
                .capacity(3)
                .refillGreedy(3, Duration.ofMinutes(1))
                .build();

        return Bucket.builder().addLimit(limit).build();
    }

    public Bucket resolveBucket(String key) {
        return bucketMap.computeIfAbsent(key, k -> createNewBucket());
    }
    public ConsumptionProbe tryConsume(String key) {
        Bucket bucket = resolveBucket(key);
        return bucket.tryConsumeAndReturnRemaining(1);
    }
}
