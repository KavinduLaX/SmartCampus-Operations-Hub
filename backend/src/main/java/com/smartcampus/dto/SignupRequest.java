package com.smartcampus.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class SignupRequest {

    @NotBlank(message = "Email cannot be blank")
    @Email(message = "Invalid email format")
    @Pattern(regexp = "^[A-Z]{2}\\d{8}@smart\\.iitus$", message = "Email must have exactly 8 digits after the prefix and end with @smart.iitus")
    private String email;

    @NotBlank(message = "Password cannot be blank")
    @Pattern(regexp = "^(?=.*[a-zA-Z])(?=.*\\d)(?=.*[@$!%*?&./#()]).{8,}$", message = "Password must contain letters, numbers, and special characters, and be at least 8 characters long")
    private String password;

    @NotBlank(message = "Faculty cannot be blank")
    private String faculty;

    @NotBlank(message = "Contact number cannot be blank")
    @Pattern(regexp = "^\\d{10}$", message = "Contact number must be exactly 10 digits")
    private String contactNumber;

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getFaculty() {
        return faculty;
    }

    public void setFaculty(String faculty) {
        this.faculty = faculty;
    }

    public String getContactNumber() {
        return contactNumber;
    }

    public void setContactNumber(String contactNumber) {
        this.contactNumber = contactNumber;
    }
}
