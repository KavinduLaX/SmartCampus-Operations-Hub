package com.smartcampus.service;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.smartcampus.model.Notification;
import com.smartcampus.repository.NotificationRepository;
import com.smartcampus.repository.UserProfileRepository;
import com.smartcampus.model.UserProfile;


@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserProfileRepository userProfileRepository;

    private boolean isNotificationsEnabled(String userId) {
        if (userId == null) return false;
        if ("local-admin".equals(userId)) return true; // Default for local admin or handle via session if needed
        
        java.util.Optional<UserProfile> profile = userProfileRepository.findById(userId);
        if (profile.isEmpty()) {
            profile = userProfileRepository.findByEmail(userId);
        }
        if (profile.isEmpty()) {
            profile = userProfileRepository.findByProviderAndProviderId("google", userId);
        }
        
        return profile.map(UserProfile::isNotificationsEnabled).orElse(true);
    }

    public Notification createNotification(String userId, String title, String message, String type, String referenceId) {
        if (!isNotificationsEnabled(userId)) {
            return null;
        }
        Notification notification = new Notification(userId, title, message, type, referenceId);
        return notificationRepository.save(notification);
    }

    public List<Notification> getNotificationsForUser(String userId) {
        if (!isNotificationsEnabled(userId)) return List.of();
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public long getUnreadCount(String userId) {
        if (!isNotificationsEnabled(userId)) return 0;
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    public void markAsRead(String id) {
        notificationRepository.findById(id).ifPresent(n -> {
            n.setRead(true);
            notificationRepository.save(n);
        });
    }

    public void markAllAsRead(String userId) {
        List<Notification> unread = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }
}
