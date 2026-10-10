package com.smartcampus.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.smartcampus.model.Notification;
import com.smartcampus.service.NotificationService;
import com.smartcampus.service.UserProfileService;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private UserProfileService userProfileService;

    @GetMapping
    public List<Notification> getMyNotifications(Authentication authentication) {
        return notificationService.getNotificationsForUser(resolveUserId(authentication));
    }

    @GetMapping("/unread-count")
    public long getUnreadCount(Authentication authentication) {
        return notificationService.getUnreadCount(resolveUserId(authentication));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable String id) {
        notificationService.markAsRead(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(Authentication authentication) {
        notificationService.markAllAsRead(resolveUserId(authentication));
        return ResponseEntity.noContent().build();
    }

    private String resolveUserId(Authentication authentication) {
        if (authentication == null) return null;
        String name = authentication.getName();

        if ("admin".equals(name) || "local-admin".equals(name)) {
            return "local-admin";
        }

        if (authentication instanceof OAuth2AuthenticationToken oauthToken) {
            String provider = oauthToken.getAuthorizedClientRegistrationId();
            return userProfileService.findByProviderAndProviderId(provider, name)
                    .map(com.smartcampus.model.UserProfile::getId)
                    .orElse(name);
        }

        return name;
    }
}
