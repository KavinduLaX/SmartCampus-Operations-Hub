package com.smartcampus.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "resource_usage")
public class ResourceUsage {
    @Id
    private String id;
    private String resourceId;
    private String resourceName;
    private String resourceType; // e.g., LAB, LECTURE_HALL, EQUIPMENT
    private String location;
    private String timeSlot; // e.g., 08:00-10:00
    private int usageCount;
    private Instant createdAt;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getResourceId() { return resourceId; }
    public void setResourceId(String resourceId) { this.resourceId = resourceId; }

    public String getResourceName() { return resourceName; }
    public void setResourceName(String resourceName) { this.resourceName = resourceName; }

    public String getResourceType() { return resourceType; }
    public void setResourceType(String resourceType) { this.resourceType = resourceType; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getTimeSlot() { return timeSlot; }
    public void setTimeSlot(String timeSlot) { this.timeSlot = timeSlot; }

    public int getUsageCount() { return usageCount; }
    public void setUsageCount(int usageCount) { this.usageCount = usageCount; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
