package com.smartcampus.controller;

import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.smartcampus.model.UserProfile;
import com.smartcampus.service.UserProfileService;
import com.smartcampus.service.MfaService;

import org.springframework.security.crypto.password.PasswordEncoder;
import jakarta.servlet.http.HttpSession;

@RestController
public class AuthController {

    private static final List<String> SUPPORTED_ROLES = List.of(
            "USER",
            "ADMIN",
            "STUDENT",
            "TECHNICIAN",
            "MANAGER"
    );

    @org.springframework.beans.factory.annotation.Value("${LOCAL_ADMIN_USERNAME:admin}")
    private String adminUsername;

    @org.springframework.beans.factory.annotation.Value("${LOCAL_ADMIN_PASSWORD:admin123}")
    private String adminPassword;

    @Autowired(required = false)
    private ClientRegistrationRepository clientRegistrationRepository;

    @Autowired
    private UserProfileService userProfileService;

    @Autowired
    private MfaService mfaService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping("/api/user")
    public Map<String, Object> user(@AuthenticationPrincipal OAuth2User principal, HttpSession session) {
        if (principal != null) {
            Map<String, Object> attrs = new java.util.HashMap<>(principal.getAttributes());
            if (Boolean.TRUE.equals(session.getAttribute("MFA_PENDING"))) {
                attrs.put("mfaRequired", true);
            }
            return attrs;
        }
        if (isLocalAdmin(session)) {
            String username = localAdminUsername(session);
            return Map.of(
                    "name", username,
                    "email", username + "@local",
                    "sub", "local-admin",
                    "provider", "local"
            );
        }
        if (session != null && session.getAttribute("LOCAL_USER_PROFILE") != null) {
            UserProfile profile = (UserProfile) session.getAttribute("LOCAL_USER_PROFILE");
            return Map.of(
                    "id", profile.getId(),
                    "name", profile.getName(),
                    "email", profile.getEmail(),
                    "role", profile.getRole(),
                    "sub", profile.getId(),
                    "provider", "local-campus"
            );
        }
        return Map.of();
    }

    @GetMapping("/api/auth/status")
    public Map<String, Object> authStatus() {
        boolean oauthEnabled = clientRegistrationRepository != null;
        return Map.of(
                "oauthEnabled", oauthEnabled,
                "provider", "google",
                "authorizationUrl", "/oauth2/authorization/google",
                "roles", SUPPORTED_ROLES
        );
    }

    @GetMapping("/api/user/profile")
    public UserProfile profile(@AuthenticationPrincipal OAuth2User principal, HttpSession session) {
        if (principal == null) {
            if (isLocalAdmin(session)) {
                return localAdminProfile(session);
            }
            if (session != null && session.getAttribute("LOCAL_USER_PROFILE") != null) {
                return (UserProfile) session.getAttribute("LOCAL_USER_PROFILE");
            }
            return null;
        }
        String providerId = resolveProviderId(principal);
        return userProfileService.findByProviderAndProviderId("google", providerId).orElse(null);
    }

    @PutMapping("/api/user/profile")
    public ResponseEntity<?> updateProfile(
            @AuthenticationPrincipal OAuth2User principal,
            @jakarta.validation.Valid @RequestBody com.smartcampus.dto.ProfileUpdateRequest request,
            HttpSession session
    ) {
        if (principal == null) {
            if (isLocalAdmin(session)) {
                // Local admin still uses the Map-based update for now or we can adapt it
                UserProfile profile = localAdminProfile(session);
                if (request.getName() != null) profile.setName(request.getName());
                if (request.getNotificationsEnabled() != null) profile.setNotificationsEnabled(request.getNotificationsEnabled());
                profile.setUpdatedAt(Instant.now());
                return ResponseEntity.ok(profile);
            }
            
            // Handle local campus user from session
            if (session != null && session.getAttribute("LOCAL_USER_PROFILE") != null) {
                UserProfile sessionProfile = (UserProfile) session.getAttribute("LOCAL_USER_PROFILE");
                return userProfileService
                        .selfUpdateProfile("local-campus", sessionProfile.getEmail(), request)
                        .<ResponseEntity<?>>map(updated -> {
                            session.setAttribute("LOCAL_USER_PROFILE", updated);
                            return ResponseEntity.ok(updated);
                        })
                        .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Profile not found")));
            }
            
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Not authenticated"));
        }

        String providerId = resolveProviderId(principal);
        return userProfileService
                .selfUpdateProfile("google", providerId, request)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Profile not found")));
    }

    @DeleteMapping("/api/user/profile")
    public ResponseEntity<?> deleteProfile(@AuthenticationPrincipal OAuth2User principal, HttpSession session) {
        if (principal == null) {
            if (isLocalAdmin(session)) {
                session.removeAttribute("LOCAL_ADMIN");
                session.removeAttribute("LOCAL_ADMIN_USER");
                session.removeAttribute("LOCAL_ADMIN_PROFILE");
                return ResponseEntity.noContent().build();
            }
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Not authenticated"));
        }

        String providerId = resolveProviderId(principal);
        boolean deleted = userProfileService.deleteProfile("google", providerId);
        if (deleted) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Profile not found"));
    }

    @PostMapping("/api/user/role")
    public ResponseEntity<?> updateRole(
            @AuthenticationPrincipal OAuth2User principal,
            @RequestBody Map<String, String> payload,
            Authentication authentication
    ) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Not authenticated"));
        }

        String roleRaw = payload.get("role");
        String role = roleRaw != null ? roleRaw.trim().toUpperCase() : null;
        if (role == null || role.isBlank() || !SUPPORTED_ROLES.contains(role)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Invalid role"));
        }

        String providerId = resolveProviderId(principal);
        return userProfileService
                .updateRole("google", providerId, role)
                .<ResponseEntity<?>>map(updated -> {
                    refreshAuthenticationRole(authentication, role);
                    return ResponseEntity.ok(updated);
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Profile not found")));
    }

    private void refreshAuthenticationRole(Authentication authentication, String role) {
        if (!(authentication instanceof OAuth2AuthenticationToken oauthToken)) {
            return;
        }

        Collection<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_" + role));
        OAuth2AuthenticationToken newToken = new OAuth2AuthenticationToken(
                oauthToken.getPrincipal(),
                authorities,
                oauthToken.getAuthorizedClientRegistrationId()
        );
        SecurityContextHolder.getContext().setAuthentication(newToken);
    }

    private String resolveProviderId(OAuth2User principal) {
        String providerId = principal.getAttribute("sub");
        if (providerId == null) {
            providerId = principal.getAttribute("id");
        }
        return providerId;
    }

    private boolean isLocalAdmin(HttpSession session) {
        return session != null && Boolean.TRUE.equals(session.getAttribute("LOCAL_ADMIN"));
    }

    private String localAdminUsername(HttpSession session) {
        Object value = session != null ? session.getAttribute("LOCAL_ADMIN_USER") : null;
        return value != null ? value.toString() : "admin";
    }

    private UserProfile localAdminProfile(HttpSession session) {
        Object existing = session != null ? session.getAttribute("LOCAL_ADMIN_PROFILE") : null;
        if (existing instanceof UserProfile profile) {
            return profile;
        }

        UserProfile profile = new UserProfile();
        String username = localAdminUsername(session);
        profile.setId("local-admin");
        profile.setProvider("local");
        profile.setProviderId("local-admin");
        profile.setName(username);
        profile.setEmail(username + "@local");
        profile.setRole("ADMIN");
        profile.setCreatedAt(Instant.now());
        profile.setUpdatedAt(Instant.now());
        if (session != null) {
            session.setAttribute("LOCAL_ADMIN_PROFILE", profile);
        }
        return profile;
    }

    private UserProfile updateLocalAdminProfile(HttpSession session, Map<String, Object> payload) {
        UserProfile profile = localAdminProfile(session);
        Map<String, Object> updates = payload != null ? payload : Map.of();
        if (updates.containsKey("name")) {
            profile.setName((String) updates.get("name"));
        }
        if (updates.containsKey("email")) {
            profile.setEmail((String) updates.get("email"));
        }
        if (updates.containsKey("picture")) {
            profile.setPicture((String) updates.get("picture"));
        }
        if (updates.containsKey("notificationsEnabled")) {
            profile.setNotificationsEnabled((Boolean) updates.get("notificationsEnabled"));
        }
        profile.setUpdatedAt(Instant.now());
        if (session != null) {
            session.setAttribute("LOCAL_ADMIN_PROFILE", profile);
        }
        return profile;
    }

    @GetMapping("/api/user/mfa/setup")
    public ResponseEntity<?> setupMfa(@AuthenticationPrincipal OAuth2User principal, HttpSession session) {
        if (principal == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        String providerId = resolveProviderId(principal);
        UserProfile profile = userProfileService.findByProviderAndProviderId("google", providerId).orElse(null);
        if (profile == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).build();

        String secret = mfaService.generateSecret();
        try {
            String qrCode = mfaService.generateQrCodeBase64(secret, profile.getEmail());
            return ResponseEntity.ok(Map.of("secret", secret, "qrCode", qrCode));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "Error generating QR code"));
        }
    }

    @PostMapping("/api/user/mfa/enable")
    public ResponseEntity<?> enableMfa(
            @AuthenticationPrincipal OAuth2User principal,
            @RequestBody Map<String, String> payload
    ) {
        if (principal == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        String code = payload.get("code");
        String secret = payload.get("secret");
        if (code == null || secret == null) return ResponseEntity.badRequest().body(Map.of("message", "Code and secret required"));

        if (mfaService.verifyCode(secret, code)) {
            String providerId = resolveProviderId(principal);
            userProfileService.updateProfile("google", providerId, Map.of("mfaEnabled", true, "mfaSecret", secret));
            return ResponseEntity.ok(Map.of("message", "MFA enabled successfully"));
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Invalid verification code"));
    }

    @PostMapping("/api/user/mfa/disable")
    public ResponseEntity<?> disableMfa(@AuthenticationPrincipal OAuth2User principal) {
        if (principal == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        String providerId = resolveProviderId(principal);
        userProfileService.updateProfile("google", providerId, Map.of("mfaEnabled", false, "mfaSecret", ""));
        return ResponseEntity.ok(Map.of("message", "MFA disabled successfully"));
    }

    @PostMapping("/api/auth/mfa/verify")
    public ResponseEntity<?> verifyMfa(HttpSession session, @RequestBody Map<String, String> payload) {
        if (!Boolean.TRUE.equals(session.getAttribute("MFA_PENDING"))) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "MFA not pending"));
        }
        String userId = (String) session.getAttribute("MFA_USER_ID");
        String code = payload.get("code");
        
        UserProfile profile = userProfileService.listAllProfiles().stream()
                .filter(p -> p.getId().equals(userId))
                .findFirst().orElse(null);
                
        if (profile != null && mfaService.verifyCode(profile.getMfaSecret(), code)) {
            session.removeAttribute("MFA_PENDING");
            session.removeAttribute("MFA_USER_ID");
            return ResponseEntity.ok(Map.of("message", "MFA verified"));
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid MFA code"));
    }

    @PostMapping("/api/auth/signup")
    public ResponseEntity<?> signup(@jakarta.validation.Valid @RequestBody com.smartcampus.dto.SignupRequest request) {
        String email = request.getEmail();
        String password = request.getPassword();
        String faculty = request.getFaculty();
        String contactNumber = request.getContactNumber();

        if ("Computing Faculty".equals(faculty) && !email.startsWith("IT")) {
            return ResponseEntity.badRequest().body(Map.of("message", "Computing Faculty email must start with IT"));
        }
        if ("Engineering Faculty".equals(faculty) && !email.startsWith("EN")) {
            return ResponseEntity.badRequest().body(Map.of("message", "Engineering Faculty email must start with EN"));
        }
        if ("Medical Faculty".equals(faculty) && !email.startsWith("ME")) {
            return ResponseEntity.badRequest().body(Map.of("message", "Medical Faculty email must start with ME"));
        }

        if (userProfileService.listAllProfiles().stream().anyMatch(p -> email.equalsIgnoreCase(p.getEmail()))) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email already registered"));
        }

        UserProfile profile = new UserProfile();
        profile.setEmail(email);
        profile.setName(email.split("@")[0]);
        profile.setRole("USER");
        profile.setProvider("local-campus");
        profile.setProviderId(email);
        profile.setPassword(passwordEncoder.encode(password));
        profile.setContactNumber(contactNumber);
        profile.setCreatedAt(Instant.now());
        profile.setUpdatedAt(Instant.now());
        
        userProfileService.createProfile(profile);
        return ResponseEntity.ok(Map.of("message", "Account created successfully. You can now sign in."));
    }

    @PostMapping("/api/auth/local/login")
    public ResponseEntity<?> localLogin(@jakarta.validation.Valid @RequestBody com.smartcampus.dto.LoginRequest request, HttpSession session) {
        String username = request.getUsername();
        String password = request.getPassword();

        // Check for static admin
        if (adminUsername.equals(username) && adminPassword.equals(password)) {
            session.setAttribute("LOCAL_ADMIN", true);
            session.setAttribute("LOCAL_ADMIN_USER", username);
            return ResponseEntity.ok(Map.of("username", username, "role", "ADMIN"));
        }

        // Check for campus mail users
        Optional<UserProfile> profileOpt = userProfileService.listAllProfiles().stream()
                .filter(p -> (username.equalsIgnoreCase(p.getEmail()) || username.equalsIgnoreCase(p.getProviderId())) && "local-campus".equals(p.getProvider()))
                .findFirst();

        if (profileOpt.isPresent()) {
            UserProfile profile = profileOpt.get();
            if (passwordEncoder.matches(password, profile.getPassword())) {
                session.setAttribute("LOCAL_USER_PROFILE", profile);
                return ResponseEntity.ok(Map.of(
                    "id", profile.getId(),
                    "email", profile.getEmail(),
                    "name", profile.getName(),
                    "role", profile.getRole()
                ));
            }
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid credentials"));
    }
}
