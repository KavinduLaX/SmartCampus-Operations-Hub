package com.smartcampus.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

@Document(collection = "bookings")
public class Booking {

    @Id
    private String id;
    private String userId;
    private String userName;
    private String resourceId;
    private String resourceName;
    
    // Using Strings to prevent Timezone/UTC shifting in MongoDB
    private String date; // yyyy-MM-dd
    private String startTime; // HH:mm
    private String endTime; // HH:mm
    
    private String purpose;
    private Integer attendeeCount;
    private BookingStatus status;
    private String rejectionReason;
    private Instant createdAt;
    private Instant updatedAt;

    public Booking() {
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
        this.status = BookingStatus.PENDING;
    }

    // Standard Getters and Setters (using Strings)
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public String getResourceId() { return resourceId; }
    public void setResourceId(String resourceId) { this.resourceId = resourceId; }

    public String getResourceName() { return resourceName; }
    public void setResourceName(String resourceName) { this.resourceName = resourceName; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getStartTime() { return startTime; }
    public void setStartTime(String startTime) { this.startTime = startTime; }

    public String getEndTime() { return endTime; }
    public void setEndTime(String endTime) { this.endTime = endTime; }

    public String getPurpose() { return purpose; }
    public void setPurpose(String purpose) { this.purpose = purpose; }

    public Integer getAttendeeCount() { return attendeeCount; }
    public void setAttendeeCount(Integer attendeeCount) { this.attendeeCount = attendeeCount; }

    public BookingStatus getStatus() { return status; }
    public void setStatus(BookingStatus status) { this.status = status; }

    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    // Logic helper methods to convert Strings to Java Time objects
    public LocalDate getLocalDate() { 
        return date != null ? LocalDate.parse(date) : null; 
    }
    public LocalTime getLocalStartTime() { 
        return startTime != null ? LocalTime.parse(startTime) : null; 
    }
    public LocalTime getLocalEndTime() { 
        return endTime != null ? LocalTime.parse(endTime) : null; 
    }
}
