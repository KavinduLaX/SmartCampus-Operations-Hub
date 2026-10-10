package com.smartcampus.service;

import java.time.Instant;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.smartcampus.model.Booking;
import com.smartcampus.model.BookingStatus;
import com.smartcampus.model.Resource;
import com.smartcampus.model.ResourceStatus;
import com.smartcampus.model.ResourceType;
import com.smartcampus.repository.BookingRepository;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private ResourceService resourceService;

    @Autowired
    private NotificationService notificationService;

    public Booking createBooking(Booking booking) {
        // 1. Fetch the resource and validate it
        Resource resource = resourceService.getResourceById(booking.getResourceId())
                .orElseThrow(() -> new RuntimeException("Resource not found"));

        // Validation: Resource must be ACTIVE
        if (resource.getStatus() != ResourceStatus.ACTIVE) {
            throw new RuntimeException("This resource is currently not available for booking (" + resource.getStatus() + ")");
        }

        // Validation: Attendee count rule for equipment
        if (resource.getType() == ResourceType.EQUIPMENT) {
            booking.setAttendeeCount(null); // Equipment doesn't need attendee count
        } else {
            if (booking.getAttendeeCount() == null || booking.getAttendeeCount() <= 0) {
                throw new RuntimeException("Expected number of attendees is required for this facility");
            }
            // Strict Capacity Check
            if (booking.getAttendeeCount() > resource.getCapacity()) {
                throw new RuntimeException("Capacity exceeded! This resource only has " + resource.getCapacity() + " seats.");
            }
        }

        // Validation: End time must be after Start time
        LocalTime start = booking.getLocalStartTime();
        LocalTime end = booking.getLocalEndTime();
        if (end.isBefore(start) || end.equals(start)) {
            throw new RuntimeException("End time must be after the start time.");
        }

        // 2. Prevent overlapping bookings based on capacity
        String conflictMsg = checkCapacityConflicts(booking, resource);
        if (conflictMsg != null) {
            throw new RuntimeException(conflictMsg);
        }

        // 3. Set metadata
        booking.setResourceName(resource.getName());
        booking.setStatus(BookingStatus.PENDING);
        booking.setCreatedAt(Instant.now());
        booking.setUpdatedAt(Instant.now());

        Booking saved = bookingRepository.save(booking);

        // Notify Admin
        notificationService.createNotification(
            "local-admin", 
            "New Booking Request", 
            "A new booking for " + resource.getName() + " has been requested.", 
            "BOOKING", 
            saved.getId()
        );

        return saved;
    }

    /**
     * Checks if the new booking conflicts with existing ones.
     * By default, resources are exclusive (one booking at a time).
     */
    private String checkCapacityConflicts(Booking newBooking, Resource resource) {
        int capacity = resource.getCapacity();
        int newAttendees = (newBooking.getAttendeeCount() != null) ? newBooking.getAttendeeCount() : 1;
        
        // 1. First, check if the booking itself exceeds the absolute capacity
        if (newAttendees > capacity) {
             return "Capacity exceeded! This resource only has " + capacity + " seats.";
        }

        // 2. Get all relevant bookings (Approved or Pending) for the same resource and date
        List<Booking> existing = bookingRepository.findByResourceIdAndDateAndStatusNot(
                newBooking.getResourceId(), newBooking.getDate(), BookingStatus.REJECTED);

        // 3. Check for any time overlap
        LocalTime newStart = newBooking.getLocalStartTime();
        LocalTime newEnd = newBooking.getLocalEndTime();

        boolean hasOverlap = existing.stream()
                .filter(b -> b.getStatus() != BookingStatus.CANCELLED)
                .anyMatch(b -> {
                    LocalTime bStart = b.getLocalStartTime();
                    LocalTime bEnd = b.getLocalEndTime();
                    return bStart.isBefore(newEnd) && bEnd.isAfter(newStart);
                });

        if (hasOverlap) {
            return "The selected time slot is already booked for this resource.";
        }

        return null;
    }

    public Booking cancelBooking(String id, String userId) {
        System.out.println("DEBUG: Attempting to cancel booking ID: " + id + " for user: " + userId);
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!booking.getUserId().equals(userId)) {
            System.out.println("DEBUG: Unauthorized! Booking user: " + booking.getUserId() + " vs provided: " + userId);
            throw new RuntimeException("Unauthorized to cancel this booking");
        }

        // Check if the booking has already started
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        java.time.LocalDateTime bookingStart = java.time.LocalDateTime.of(booking.getLocalDate(), booking.getLocalStartTime());

        if (now.isAfter(bookingStart)) {
            throw new RuntimeException("Cannot cancel a booking that has already started");
        }

        bookingRepository.deleteById(id);
        return null; 
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<Booking> getBookingsByUserId(String userId) {
        return bookingRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public Booking updateBookingStatus(String id, BookingStatus status, String reason) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        booking.setStatus(status);
        booking.setRejectionReason(reason);
        booking.setUpdatedAt(Instant.now());
        
        Booking saved = bookingRepository.save(booking);

        // Notify User
        notificationService.createNotification(
            saved.getUserId(),
            "Booking Status Updated",
            "Your booking for " + saved.getResourceName() + " is now " + status + (reason != null && !reason.isEmpty() ? ": " + reason : "."),
            "BOOKING",
            saved.getId()
        );

        return saved;
    }

    public Optional<Booking> getBookingById(String id) {
        return bookingRepository.findById(id);
    }

    public void clearAllBookings() {
        bookingRepository.deleteAll();
    }

    public java.util.Map<String, Object> getBookingStats() {
        List<Booking> all = bookingRepository.findAll();
        
        java.util.Map<String, Long> byResource = all.stream()
                .collect(java.util.stream.Collectors.groupingBy(b -> b.getResourceName() != null ? b.getResourceName() : "Unknown", java.util.stream.Collectors.counting()));
        
        java.util.Map<String, Long> byStatus = all.stream()
                .collect(java.util.stream.Collectors.groupingBy(b -> b.getStatus().toString(), java.util.stream.Collectors.counting()));

        java.util.Map<String, Long> byDate = all.stream()
                .collect(java.util.stream.Collectors.groupingBy(Booking::getDate, java.util.stream.Collectors.counting()));

        java.util.Map<String, Object> stats = new java.util.HashMap<>();
        stats.put("total", all.size());
        stats.put("byResource", byResource);
        stats.put("byStatus", byStatus);
        stats.put("byDate", byDate);
        
        return stats;
    }
}
