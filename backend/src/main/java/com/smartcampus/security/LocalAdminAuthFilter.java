package com.smartcampus.security;

import java.io.IOException;
import java.util.List;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

@Component
public class LocalAdminAuthFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        if (SecurityContextHolder.getContext().getAuthentication() == null) {
            HttpSession session = request.getSession(false);
            if (session != null) {
                if (Boolean.TRUE.equals(session.getAttribute("LOCAL_ADMIN"))) {
                    String username = (String) session.getAttribute("LOCAL_ADMIN_USER");
                    UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                            username != null ? username : "admin",
                            "N/A",
                            List.of(new SimpleGrantedAuthority("ROLE_ADMIN"))
                    );
                    SecurityContextHolder.getContext().setAuthentication(auth);
                } else if (session.getAttribute("LOCAL_USER_PROFILE") != null) {
                    com.smartcampus.model.UserProfile profile = (com.smartcampus.model.UserProfile) session.getAttribute("LOCAL_USER_PROFILE");
                    UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                            profile.getEmail(),
                            "N/A",
                            List.of(new SimpleGrantedAuthority("ROLE_" + profile.getRole().toUpperCase()))
                    );
                    SecurityContextHolder.getContext().setAuthentication(auth);
                }
            }
        }

        filterChain.doFilter(request, response);
    }
}
