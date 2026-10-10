package com.smartcampus.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.smartcampus.model.Booking;
import com.smartcampus.model.BookingStatus;
import com.smartcampus.service.BookingService;
import com.smartcampus.service.UserProfileService;
import java.util.List;
import java.util.Map;

@RestController
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private UserProfileService userProfileService;

    // --- EMERGENCY CLEANUP (Run once to fix 500 errors after schema change) ---
    @DeleteMapping("/api/bookings/emergency-clear")
    public String clearAllData() {
        bookingService.clearAllBookings();
        return "All bookings cleared. You can now use the system normally.";
    }

    // --- USER ENDPOINTS ---

    @PostMapping("/api/bookings")
    public ResponseEntity<?> createBooking(@RequestBody Booking booking, Authentication authentication) {
        try {
            // In a real app, we get the ID from the authentication principal.
            // For now, we'll assume the frontend sends the user details or we fetch from auth.
            if (authentication != null) {
                String name = authentication.getName();
                if ("admin".equals(name) || "local-admin".equals(name)) {
                    booking.setUserId("local-admin");
                    booking.setUserName("Local Admin");
                } else if (authentication instanceof org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken oauthToken) {
                    String provider = oauthToken.getAuthorizedClientRegistrationId();
                    com.smartcampus.model.UserProfile profile = userProfileService.findByProviderAndProviderId(provider, name).orElse(null);
                    if (profile != null) {
                        booking.setUserId(profile.getId());
                        booking.setUserName(profile.getName());
                    } else {
                        booking.setUserId(name);
                        booking.setUserName(name);
                    }
                } else {
                    booking.setUserId(name);
                    booking.setUserName(name);
                }
            }
            
            Booking created = bookingService.createBooking(booking);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/api/bookings/my")
    public List<Booking> getMyBookings(Authentication authentication) {
        String userId = (authentication != null) ? resolveUserId(authentication) : "anonymous";
        return bookingService.getBookingsByUserId(userId);
    }

    @PostMapping("/api/bookings/{id}/cancel")
    public ResponseEntity<?> cancelBooking(@PathVariable String id, Authentication authentication) {
        try {
            String userId = (authentication != null) ? resolveUserId(authentication) : "anonymous";
            bookingService.cancelBooking(id, userId);
            System.out.println("DEBUG: Successfully deleted booking " + id);
            return ResponseEntity.ok("Booking successfully cancelled and deleted.");
        } catch (Exception e) {
            System.err.println("DEBUG: Error deleting booking: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // --- ADMIN ENDPOINTS ---

    @GetMapping("/admin/api/bookings/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public java.util.Map<String, Object> getBookingStats() {
        return bookingService.getBookingStats();
    }

    @GetMapping("/admin/api/bookings")
    @PreAuthorize("hasRole('ADMIN')")
    public List<Booking> getAllBookings() {
        return bookingService.getAllBookings();
    }

    @PutMapping("/admin/api/bookings/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateBookingStatus(
            @PathVariable String id, 
            @RequestBody Map<String, String> payload) {
        try {
            BookingStatus status = BookingStatus.valueOf(payload.get("status").toUpperCase());
            String reason = payload.getOrDefault("reason", "");
            
            Booking updated = bookingService.updateBookingStatus(id, status, reason);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    private String resolveUserId(Authentication authentication) {
        if (authentication == null) return null;
        String name = authentication.getName();

        if ("admin".equals(name) || "local-admin".equals(name)) {
            return "local-admin";
        }

        if (authentication instanceof org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken oauthToken) {
            String provider = oauthToken.getAuthorizedClientRegistrationId();
            return userProfileService.findByProviderAndProviderId(provider, name)
                    .map(com.smartcampus.model.UserProfile::getId)
                    .orElse(name);
        }

        return name;
    }
}
