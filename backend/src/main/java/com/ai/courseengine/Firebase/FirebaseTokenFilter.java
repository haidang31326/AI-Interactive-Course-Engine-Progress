package com.ai.courseengine.Firebase;

import com.ai.courseengine.model.User;
import com.ai.courseengine.repository.UserRepository;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Optional;
public class FirebaseTokenFilter  extends OncePerRequestFilter {
    private final UserRepository userRepository;

    public FirebaseTokenFilter(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String header = request.getHeader("Authorization");
        String token = "";
        if(header == null || !header.startsWith("Bearer ")) {
            filterChain.doFilter(request,response);
            return;
        }
        try {
            token = header.substring(7);
            FirebaseToken decoded = FirebaseAuth.getInstance().verifyIdToken(token);
            String Uid = decoded.getUid();
            String email = decoded.getEmail();

            Optional<User> user = userRepository.findByFirebaseUid(Uid);
            if(user.isPresent()) {
                SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(user.get(),null, List.of()));
            }

        } catch (FirebaseAuthException e) {
            throw new RuntimeException(e);
        }
        filterChain.doFilter(request,response);
    }
}
