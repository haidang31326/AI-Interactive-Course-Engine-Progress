package com.ai.courseengine.config;


import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;

import org.springframework.security.web.SecurityFilterChain;


@Configuration
@EnableMethodSecurity
public class SecurityConfig {
    private final CustomJwtConverter customJwtConverter;

    public SecurityConfig(CustomJwtConverter customJwtConverter) {
        this.customJwtConverter = customJwtConverter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(seesion -> seesion.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> jwt.jwtAuthenticationConverter(customJwtConverter)))
                .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**","/ws/**","/error").permitAll()
                .anyRequest().authenticated());

        return http.build();
    }
}
