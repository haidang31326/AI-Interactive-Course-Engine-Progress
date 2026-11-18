package com.ai.courseengine.config;

import com.ai.courseengine.model.User;
import com.ai.courseengine.repository.UserRepository;
import org.checkerframework.checker.nullness.qual.Nullable;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;


@Component
public class CustomJwtConverter implements Converter<Jwt, AbstractAuthenticationToken> {
    private final UserRepository userRepository;

    public CustomJwtConverter(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public @Nullable AbstractAuthenticationToken convert(Jwt jwt) {


         try {
             String Uid = jwt.getSubject();
             String email = jwt.getClaimAsString("email");
             String name = jwt.getClaimAsString("name");
             List<GrantedAuthority> authorities = new ArrayList<>();
             User user1 = userRepository.findByFirebaseUid(Uid).orElseGet(() -> {
                 User newUser = new User();
                 newUser.setFirebaseUid(Uid);
                 newUser.setEmail(email);
                 newUser.setUsername(name != null ? name : "User " + Uid.substring(0,5));
                 return userRepository.save(newUser);
             });
             List<String> roles = jwt.getClaimAsStringList("roles");
             if(roles !=null && !roles.isEmpty()) {
                 roles.forEach(role -> authorities.add(new SimpleGrantedAuthority(role)));
             }
             else {
                 authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
             }
             List<String> permissions = jwt.getClaimAsStringList("permissions");
             if(permissions != null && !permissions.isEmpty()) {
                 permissions.forEach(per -> authorities.add(new SimpleGrantedAuthority(per)));
             }
             else {
                 authorities.add(new SimpleGrantedAuthority("course:read"));
             }

             return new UsernamePasswordAuthenticationToken(user1,jwt, authorities);
         } catch (Exception e) {
             throw new RuntimeException(e);
         }
    }
}
