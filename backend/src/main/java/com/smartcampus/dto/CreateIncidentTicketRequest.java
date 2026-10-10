package com.smartcampus.dto;

import com.smartcampus.model.TicketPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public class CreateIncidentTicketRequest {

    //backend validations
    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Phone is required")
    @Pattern(regexp = "^0\\d{9}$", message = "Phone must be 10 digits starting with 0")
    private String phone;

    @NotBlank(message = "Category is required")
    private String category;

    @NotNull(message = "Priority is required")
    private TicketPriority priority;

    private String resourceId;
    private String locationText;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public TicketPriority getPriority() { return priority; }
    public void setPriority(TicketPriority priority) { this.priority = priority; }

    public String getResourceId() { return resourceId; }
    public void setResourceId(String resourceId) { this.resourceId = resourceId; }

    public String getLocationText() { return locationText; }
    public void setLocationText(String locationText) { this.locationText = locationText; }
}
