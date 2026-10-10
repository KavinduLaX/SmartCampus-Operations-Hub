package com.smartcampus.dto;

import com.smartcampus.model.TicketStatus;

public class UpdateTicketStatusRequest {

    private TicketStatus status;
    private String resolutionNotes;

    public TicketStatus getStatus() {
        return status;
    }

    public void setStatus(TicketStatus status) {
        this.status = status;
    }

    public String getResolutionNotes() {
        return resolutionNotes;
    }

    public void setResolutionNotes(String resolutionNotes) {
        this.resolutionNotes = resolutionNotes;
    }
}
