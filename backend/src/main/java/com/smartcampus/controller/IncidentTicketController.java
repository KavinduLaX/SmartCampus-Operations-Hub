package com.smartcampus.controller;

import com.smartcampus.dto.AddCommentRequest;
import com.smartcampus.dto.AssignTechnicianRequest;
import com.smartcampus.dto.CreateIncidentTicketRequest;
import com.smartcampus.dto.UpdateTicketStatusRequest;
import com.smartcampus.model.IncidentTicket;
import com.smartcampus.service.AttachmentStorageService;
import com.smartcampus.service.IncidentTicketService;
import com.smartcampus.service.UserProfileService;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/incidents")
public class IncidentTicketController {

    private final IncidentTicketService ticketService;
    private final AttachmentStorageService attachmentStorageService;
    private final UserProfileService userProfileService;

    public IncidentTicketController(
            IncidentTicketService ticketService,
            AttachmentStorageService attachmentStorageService,
            UserProfileService userProfileService
    ) {
        this.ticketService = ticketService;
        this.attachmentStorageService = attachmentStorageService;
        this.userProfileService = userProfileService;
    }

    // USER: Create ticket
    @PostMapping
    public ResponseEntity<IncidentTicket> createTicket(
            @Valid @RequestBody CreateIncidentTicketRequest request,
            Authentication authentication
    ) {
        IncidentTicket ticket = new IncidentTicket();
        ticket.setTitle(request.getTitle());
        ticket.setDescription(request.getDescription());
        ticket.setPhone(request.getPhone());
        ticket.setCategory(request.getCategory());
        ticket.setPriority(request.getPriority());
        ticket.setResourceId(request.getResourceId());
        ticket.setLocationText(request.getLocationText());
        ticket.setReportedByUserId(resolveUserId(authentication));

        return new ResponseEntity<>(
                ticketService.createTicket(ticket),
                HttpStatus.CREATED
        );
    }

    // USER: Get own tickets
    @GetMapping("/my")
    public ResponseEntity<List<IncidentTicket>> getMyTickets(Authentication authentication) {
        return ResponseEntity.ok(
                ticketService.getTicketsByUser(resolveUserId(authentication))
        );
    }

    // ADMIN: Get all tickets
    @GetMapping
    public ResponseEntity<List<IncidentTicket>> getAllTickets() {
        return ResponseEntity.ok(ticketService.getAllTickets());
    }

    // TECHNICIAN: Get assigned tickets
    @GetMapping("/assigned")
    public ResponseEntity<List<IncidentTicket>> getAssignedTickets(Authentication authentication) {
        return ResponseEntity.ok(ticketService.getTicketsByTechnician(resolveUserId(authentication)));
    }

    // ALL: Get ticket by ID
    @GetMapping("/{id}")
    public ResponseEntity<IncidentTicket> getById(@PathVariable String id) {
        return ResponseEntity.ok(ticketService.getTicketById(id));
    }

    // ADMIN: Assign technician
    @PatchMapping("/{id}/assign")
    public ResponseEntity<IncidentTicket> assignTechnician(
            @PathVariable String id,
            @RequestBody AssignTechnicianRequest request
    ) {
        return ResponseEntity.ok(
                ticketService.assignTechnician(id, request.getTechnicianId())
        );
    }

    // ADMIN / TECH: Update status
    @PatchMapping("/{id}/status")
    public ResponseEntity<IncidentTicket> updateStatus(
            @PathVariable String id,
            @RequestBody UpdateTicketStatusRequest request
    ) {
        return ResponseEntity.ok(
                ticketService.updateStatus(
                        id,
                        request.getStatus(),
                        request.getResolutionNotes()
                )
        );
    }

    // USER / STAFF: Add comment
    @PostMapping("/{id}/comments")
    public ResponseEntity<IncidentTicket> addComment(
            @PathVariable String id,
            @RequestBody AddCommentRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                ticketService.addComment(
                        id,
                        authentication.getName(),
                        request.getContent()
                )
        );
    }

    // USER / STAFF: Delete own comment
    @DeleteMapping("/{ticketId}/comments/{commentId}")
    public ResponseEntity<IncidentTicket> deleteComment(
            @PathVariable String ticketId,
            @PathVariable String commentId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                ticketService.deleteComment(
                        ticketId,
                        commentId,
                        authentication.getName()
                )
        );
    }

    // USER: Upload attachments (GridFS, max 3)
    @PostMapping("/{id}/attachments")
    public ResponseEntity<IncidentTicket> uploadAttachments(
            @PathVariable String id,
            @RequestParam("files") MultipartFile[] files
    ) throws IOException {

        IncidentTicket ticket = ticketService.getTicketById(id);

        if (ticket.getAttachmentFileIds().size() + files.length > 3) {
            return ResponseEntity.badRequest().build();
        }

        for (MultipartFile file : files) {
            String fileId = attachmentStorageService.saveFile(file);
            ticket.getAttachmentFileIds().add(fileId);
        }

        return ResponseEntity.ok(ticketService.createTicket(ticket));
    }

    // DELETE ticket
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTicket(@PathVariable String id) {
        ticketService.deleteTicket(id);
        return ResponseEntity.noContent().build();
    }
    // GET attachment file by ID
        @GetMapping("/attachments/{fileId}")
        public ResponseEntity<org.springframework.core.io.InputStreamResource> getAttachment(
                @PathVariable String fileId
        ) throws IOException {
        com.mongodb.client.gridfs.model.GridFSFile file = attachmentStorageService.findFile(fileId);

        if (file == null) {
                return ResponseEntity.notFound().build();
        }

        String contentType = attachmentStorageService.getContentType(file);

        return ResponseEntity.ok()
                .contentType(org.springframework.http.MediaType.parseMediaType(contentType))
                .body(new org.springframework.core.io.InputStreamResource(
                        attachmentStorageService.getFileStream(file)
                ));
        }

    private String resolveUserId(Authentication authentication) {
        if (authentication == null) return null;
        String name = authentication.getName();

        if ("admin".equals(name) || "local-admin".equals(name)) {
            return "local-admin";
        }

        if (authentication instanceof OAuth2AuthenticationToken oauthToken) {
            String provider = oauthToken.getAuthorizedClientRegistrationId();
            return userProfileService.findByProviderAndProviderId(provider, name)
                    .map(com.smartcampus.model.UserProfile::getId)
                    .orElse(name);
        }

        return name;
    }
}
