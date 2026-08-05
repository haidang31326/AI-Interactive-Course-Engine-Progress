package com.ai.courseengine.controller;

import com.ai.courseengine.model.User;
import com.ai.courseengine.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*") // Allows the frontend to connect
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/firebase-login")
    public ResponseEntity<?> firebaseLogin(@RequestBody User firebaseUser) {
        if (firebaseUser.getFirebaseUid() == null || firebaseUser.getFirebaseUid().isEmpty()) {
            return ResponseEntity.badRequest().body("firebaseUid is required");
        }
        
        Optional<User> existingUser = userRepository.findByFirebaseUid(firebaseUser.getFirebaseUid());
        if (existingUser.isPresent()) {
            return ResponseEntity.ok(existingUser.get());
        } else {
            // Register new user
            if (firebaseUser.getUsername() == null || firebaseUser.getUsername().isEmpty()) {
                // fallback to email prefix if username is empty
                if (firebaseUser.getEmail() != null && firebaseUser.getEmail().contains("@")) {
                    firebaseUser.setUsername(firebaseUser.getEmail().split("@")[0]);
                } else {
                    firebaseUser.setUsername("User_" + firebaseUser.getFirebaseUid().substring(0, 5));
                }
            }
            User savedUser = userRepository.save(firebaseUser);
            return ResponseEntity.ok(savedUser);
        }
    }
}
