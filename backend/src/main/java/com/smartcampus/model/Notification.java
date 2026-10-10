package com.smartcampus.model;

import java.time.Instant;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "notifications")
public class Notification {

    @Id
    private String id;
    private String userId; // The user who receives the notification (or "admin" for admin notifications)
    private String title;
    private String message;
    private String type; // e.g., "BOOKING", "TICKET"
    private String referenceId; // ID of the booking or ticket
    private boolean isRead;
    private Instant createdAt;

    public Notification() {}

    public Notification(String userId, String title, String message, String type, String referenceId) {
        this.userId = userId;
        this.title = title;
        this.message = message;
        this.type = type;
        this.referenceId = referenceId;
        this.isRead = false;
        this.createdAt = Instant.now();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getReferenceId() {
        return referenceId;
    }

    public void setReferenceId(String referenceId) {
        this.referenceId = referenceId;
    }

    public boolean isRead() {
        return isRead;
    }

    public void setRead(boolean read) {
        isRead = read;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
