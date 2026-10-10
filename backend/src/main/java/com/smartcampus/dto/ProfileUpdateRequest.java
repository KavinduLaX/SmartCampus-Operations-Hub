package com.smartcampus.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class ProfileUpdateRequest {

    @NotBlank(message = "Name cannot be blank")
    private String name;

    @Pattern(regexp = "^$|^\\d{10}$", message = "Contact number must be exactly 10 digits")
    private String contactNumber;

    private Boolean notificationsEnabled;

    @Pattern(regexp = "^$|^(?=.*[a-zA-Z])(?=.*\\d)(?=.*[@$!%*?&./#()]).{8,}$", message = "New password must contain letters, numbers, and special characters, and be at least 8 characters long")
    private String newPassword;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getContactNumber() {
        return contactNumber;
    }

    public void setContactNumber(String contactNumber) {
        this.contactNumber = contactNumber;
    }

    public Boolean getNotificationsEnabled() {
        return notificationsEnabled;
    }

    public void setNotificationsEnabled(Boolean notificationsEnabled) {
        this.notificationsEnabled = notificationsEnabled;
    }

    public String getNewPassword() {
        return newPassword;
    }

    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }
}
