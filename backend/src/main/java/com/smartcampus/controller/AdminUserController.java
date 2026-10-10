package com.smartcampus.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smartcampus.model.UserProfile;
import com.smartcampus.service.UserProfileService;

@RestController
@RequestMapping("/admin/api/users")
public class AdminUserController {

    private static final List<String> SUPPORTED_ROLES = List.of(
            "USER",
            "ADMIN",
            "STUDENT",
            "TECHNICIAN",
            "MANAGER"
    );

    private final UserProfileService userProfileService;

    public AdminUserController(UserProfileService userProfileService) {
        this.userProfileService = userProfileService;
    }

    @GetMapping
    public List<UserProfile> listUsers() {
        return userProfileService.listAllProfiles();
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(
            @PathVariable String id,
            @jakarta.validation.Valid @RequestBody com.smartcampus.dto.UpdateUserRequest request
    ) {
        return userProfileService
                .updateProfileById(id, request)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Profile not found")));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable String id) {
        boolean deleted = userProfileService.deleteProfileById(id);
        if (deleted) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Profile not found"));
    }
}
