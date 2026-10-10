package com.smartcampus.service;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.data.domain.Sort;

import com.smartcampus.model.UserProfile;
import com.smartcampus.repository.UserProfileRepository;

@Service
public class UserProfileService {

    private final UserProfileRepository repository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    public UserProfileService(UserProfileRepository repository, org.springframework.security.crypto.password.PasswordEncoder passwordEncoder) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
    }

    public UserProfile upsertFromOAuth(String provider, Map<String, Object> attributes) {
        String email = (String) attributes.get("email");
        String providerId = attributes.get("sub") != null ? String.valueOf(attributes.get("sub")) : email;

        Optional<UserProfile> existing = repository.findByProviderAndProviderId(provider, providerId);
        if (existing.isEmpty() && email != null && !email.isBlank()) {
            existing = repository.findByEmail(email);
        }

        UserProfile profile = existing.orElseGet(UserProfile::new);
        if (profile.getCreatedAt() == null) {
            profile.setCreatedAt(Instant.now());
        }

        profile.setProvider(provider);
        profile.setProviderId(providerId);
        profile.setName((String) attributes.getOrDefault("name", ""));
        profile.setEmail(email);
        profile.setPicture((String) attributes.getOrDefault("picture", ""));
        if (profile.getRole() == null || profile.getRole().isBlank()) {
            profile.setRole("USER");
        }
        if (attributes.containsKey("notificationsEnabled")) {
            profile.setNotificationsEnabled((Boolean) attributes.get("notificationsEnabled"));
        }
        profile.setUpdatedAt(Instant.now());

        return repository.save(profile);
    }

    public Optional<UserProfile> updateRole(String provider, String providerId, String role) {
        Optional<UserProfile> existing = repository.findByProviderAndProviderId(provider, providerId);
        if (existing.isEmpty()) {
            return Optional.empty();
        }

        UserProfile profile = existing.get();
        profile.setRole(role);
        profile.setUpdatedAt(Instant.now());
        return Optional.of(repository.save(profile));
    }

    public Optional<UserProfile> findByProviderAndProviderId(String provider, String providerId) {
        return repository.findByProviderAndProviderId(provider, providerId);
    }

    public Optional<UserProfile> updateProfile(String provider, String providerId, Map<String, Object> updates) {
        Optional<UserProfile> existing = repository.findByProviderAndProviderId(provider, providerId);
        if (existing.isEmpty()) {
            return Optional.empty();
        }

        UserProfile profile = existing.get();
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
        if (updates.containsKey("mfaEnabled")) {
            profile.setMfaEnabled((Boolean) updates.get("mfaEnabled"));
        }
        if (updates.containsKey("mfaSecret")) {
            profile.setMfaSecret((String) updates.get("mfaSecret"));
        }
        profile.setUpdatedAt(Instant.now());
        return Optional.of(repository.save(profile));
    }

    public List<UserProfile> listAllProfiles() {
        return repository.findAll(Sort.by(Sort.Direction.DESC, "updatedAt"));
    }

    public Optional<UserProfile> updateProfileById(String id, com.smartcampus.dto.UpdateUserRequest request) {
        Optional<UserProfile> existing = repository.findById(id);
        if (existing.isEmpty()) {
            return Optional.empty();
        }

        UserProfile profile = existing.get();
        if (request.getName() != null) {
            profile.setName(request.getName());
        }
        if (request.getEmail() != null) {
            profile.setEmail(request.getEmail());
        }
        if (request.getPicture() != null) {
            profile.setPicture(request.getPicture());
        }
        if (request.getRole() != null) {
            profile.setRole(request.getRole());
        }
        if (request.getContactNumber() != null) {
            profile.setContactNumber(request.getContactNumber());
        }
        
        profile.setUpdatedAt(Instant.now());
        return Optional.of(repository.save(profile));
    }

    public boolean deleteProfileById(String id) {
        Optional<UserProfile> existing = repository.findById(id);
        if (existing.isEmpty()) return false;
        repository.delete(existing.get());
        return true;
    }

    public boolean deleteProfile(String provider, String providerId) {
        Optional<UserProfile> existing = repository.findByProviderAndProviderId(provider, providerId);
        if (existing.isEmpty()) return false;
        repository.delete(existing.get());
        return true;
    }

    public Optional<UserProfile> selfUpdateProfile(String provider, String providerId, com.smartcampus.dto.ProfileUpdateRequest request) {
        Optional<UserProfile> existing = repository.findByProviderAndProviderId(provider, providerId);
        if (existing.isEmpty()) {
            return Optional.empty();
        }

        UserProfile profile = existing.get();
        if (request.getName() != null) profile.setName(request.getName());
        if (request.getContactNumber() != null) profile.setContactNumber(request.getContactNumber());
        if (request.getNotificationsEnabled() != null) profile.setNotificationsEnabled(request.getNotificationsEnabled());
        
        // Only allow password update for local campus users
        if ("local-campus".equals(profile.getProvider()) && request.getNewPassword() != null && !request.getNewPassword().isBlank()) {
            profile.setPassword(passwordEncoder.encode(request.getNewPassword()));
        }

        profile.setUpdatedAt(Instant.now());
        return Optional.of(repository.save(profile));
    }

    public UserProfile createProfile(UserProfile profile) {
        return repository.save(profile);
    }
}
