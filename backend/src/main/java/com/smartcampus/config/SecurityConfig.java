package com.smartcampus.config;

import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.smartcampus.security.CustomOAuth2UserService;
import com.smartcampus.security.CustomOidcUserService;
import com.smartcampus.security.LocalAdminAuthFilter;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import jakarta.servlet.http.HttpServletResponse;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired(required = false)
    private ClientRegistrationRepository clientRegistrationRepository;

    @Autowired
    private CustomOAuth2UserService customOAuth2UserService;

    @Autowired
    private CustomOidcUserService customOidcUserService;

    @Autowired
    private LocalAdminAuthFilter localAdminAuthFilter;

    @Autowired
    private com.smartcampus.service.UserProfileService userProfileService;

    @Value("${FRONTEND_URL:http://localhost:5173}")
    private String frontendUrl;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        // If OAuth2 client registrations are present, enable oauth2Login. Otherwise allow all requests (dev-safe fallback).
        if (clientRegistrationRepository != null) {
            http
                .cors(Customizer.withDefaults())
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth
                    .requestMatchers("/admin/**").hasRole("ADMIN")
                    .requestMatchers("/student/**").hasRole("STUDENT")
                    .requestMatchers("/technician/**").hasRole("TECHNICIAN")
                    .requestMatchers("/manager/**").hasRole("MANAGER")
                    .requestMatchers("/", "/index.html", "/api/public", "/api/auth/status", "/api/auth/logout", "/api/auth/local/login", "/api/auth/signup", "/api/auth/mfa/verify", "/oauth2/**", "/login/**", "/api/user").permitAll()
                    .anyRequest().authenticated()
                )
                .exceptionHandling(e -> e
                    .defaultAuthenticationEntryPointFor(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED), new AntPathRequestMatcher("/api/**"))
                    .defaultAuthenticationEntryPointFor(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED), new AntPathRequestMatcher("/admin/api/**"))
                )
                .addFilterBefore(localAdminAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .oauth2Login(oauth2 -> oauth2
                    .userInfoEndpoint(userInfo -> userInfo
                        .userService(customOAuth2UserService)
                        .oidcUserService(customOidcUserService)
                    )
                    .successHandler((request, response, authentication) -> {
                        org.springframework.security.oauth2.core.user.OAuth2User oauthUser = (org.springframework.security.oauth2.core.user.OAuth2User) authentication.getPrincipal();
                        String sub = oauthUser.getAttribute("sub");
                        if (sub == null) sub = oauthUser.getAttribute("id");
                        
                        var profile = userProfileService.findByProviderAndProviderId("google", sub);
                        if (profile.isPresent() && profile.get().isMfaEnabled() && "USER".equalsIgnoreCase(profile.get().getRole())) {
                            request.getSession().setAttribute("MFA_PENDING", true);
                            request.getSession().setAttribute("MFA_USER_ID", profile.get().getId());
                            response.sendRedirect(frontendUrl + (frontendUrl.endsWith("/") ? "" : "/") + "mfa");
                        } else {
                            response.sendRedirect(dashboardUrl());
                        }
                    })
                )
                .logout(logout -> logout
                    .logoutUrl("/api/auth/logout")
                    .logoutSuccessHandler((request, response, authentication) ->
                        response.setStatus(HttpServletResponse.SC_NO_CONTENT)
                    )
                    .invalidateHttpSession(true)
                    .clearAuthentication(true)
                    .deleteCookies("JSESSIONID")
                );
        } else {
            http
                .cors(Customizer.withDefaults())
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth
                    .anyRequest().permitAll()
                );
        }

        return http.build();
    }

    private String dashboardUrl() {
        if (frontendUrl.endsWith("/")) {
            return frontendUrl + "dashboard";
        }
        return frontendUrl + "/dashboard";
    }

    @Bean
    @SuppressWarnings("unused")
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(frontendUrl));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowCredentials(true);
        configuration.setAllowedHeaders(List.of("*"));
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
