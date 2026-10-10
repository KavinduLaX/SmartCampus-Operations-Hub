package com.smartcampus.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.smartcampus.model.IncidentTicket;

public interface IncidentTicketRepository extends MongoRepository<IncidentTicket, String> {
    List<IncidentTicket> findByReportedByUserId(String reportedByUserId);
    List<IncidentTicket> findByAssignedTechnicianId(String assignedTechnicianId);
}
