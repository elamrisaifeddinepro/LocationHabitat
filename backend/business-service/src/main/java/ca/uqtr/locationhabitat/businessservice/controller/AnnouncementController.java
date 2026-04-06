package ca.uqtr.locationhabitat.businessservice.controller;

import ca.uqtr.locationhabitat.businessservice.dto.AnnouncementResponse;
import ca.uqtr.locationhabitat.businessservice.dto.CreateAnnouncementRequest;
import ca.uqtr.locationhabitat.businessservice.entity.Announcement;
import ca.uqtr.locationhabitat.businessservice.security.JwtUserPrincipal;
import ca.uqtr.locationhabitat.businessservice.service.AnnouncementService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/announcements")
public class AnnouncementController {

    private final AnnouncementService announcementService;

    public AnnouncementController(AnnouncementService announcementService) {
        this.announcementService = announcementService;
    }

    @PostMapping
    public ResponseEntity<AnnouncementResponse> createAnnouncement(
            @Valid @RequestBody CreateAnnouncementRequest request,
            Authentication authentication
    ) {
        JwtUserPrincipal currentUser = getCurrentUser(authentication);
        Announcement savedAnnouncement = announcementService.createAnnouncement(request, currentUser);

        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(savedAnnouncement));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AnnouncementResponse> updateAnnouncement(
            @PathVariable Long id,
            @Valid @RequestBody CreateAnnouncementRequest request,
            Authentication authentication
    ) {
        JwtUserPrincipal currentUser = getCurrentUser(authentication);
        Announcement updatedAnnouncement = announcementService.updateAnnouncement(id, request, currentUser);

        return ResponseEntity.ok(toResponse(updatedAnnouncement));
    }

    @GetMapping
    public ResponseEntity<List<AnnouncementResponse>> getPublicAnnouncements(
            @RequestParam(required = false) String ownerId
    ) {
        List<AnnouncementResponse> response = announcementService.getPublicAnnouncements(ownerId)
                .stream()
                .map(this::toResponse)
                .toList();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/my")
    public ResponseEntity<List<AnnouncementResponse>> getMyAnnouncements(Authentication authentication) {
        JwtUserPrincipal currentUser = getCurrentUser(authentication);

        List<AnnouncementResponse> response = announcementService.getMyAnnouncements(currentUser)
                .stream()
                .map(this::toResponse)
                .toList();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AnnouncementResponse> getAnnouncementById(
            @PathVariable Long id,
            Authentication authentication
    ) {
        JwtUserPrincipal currentUser = authentication != null ? getCurrentUser(authentication) : null;
        Announcement announcement = announcementService.getAnnouncementByIdForDisplay(id, currentUser);

        return ResponseEntity.ok(toResponse(announcement));
    }

    @GetMapping("/{id}/owner")
    public ResponseEntity<AnnouncementResponse> getOwnedAnnouncementById(
            @PathVariable Long id,
            Authentication authentication
    ) {
        JwtUserPrincipal currentUser = getCurrentUser(authentication);
        Announcement announcement = announcementService.getAnnouncementOwnedByCurrentUser(id, currentUser);

        return ResponseEntity.ok(toResponse(announcement));
    }

    @PostMapping("/{id}/views")
    public ResponseEntity<AnnouncementResponse> incrementAnnouncementViews(
            @PathVariable Long id,
            Authentication authentication
    ) {
        JwtUserPrincipal currentUser = authentication != null ? getCurrentUser(authentication) : null;
        Announcement announcement = announcementService.incrementViewCount(id, currentUser);

        return ResponseEntity.ok(toResponse(announcement));
    }

    @PatchMapping("/{id}/toggle-active")
    public ResponseEntity<AnnouncementResponse> toggleAnnouncementStatus(
            @PathVariable Long id,
            Authentication authentication
    ) {
        JwtUserPrincipal currentUser = getCurrentUser(authentication);
        Announcement updatedAnnouncement = announcementService.toggleAnnouncementStatus(id, currentUser);

        return ResponseEntity.ok(toResponse(updatedAnnouncement));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAnnouncement(
            @PathVariable Long id,
            Authentication authentication
    ) {
        JwtUserPrincipal currentUser = getCurrentUser(authentication);
        announcementService.deleteAnnouncement(id, currentUser);

        return ResponseEntity.noContent().build();
    }

    private JwtUserPrincipal getCurrentUser(Authentication authentication) {
        return (JwtUserPrincipal) authentication.getPrincipal();
    }

    private AnnouncementResponse toResponse(Announcement announcement) {
        AnnouncementResponse response = new AnnouncementResponse();
        response.setId(announcement.getId());
        response.setTitle(announcement.getTitle());
        response.setDescription(announcement.getDescription());
        response.setShortDescription(announcement.getShortDescription());
        response.setLongDescription(announcement.getLongDescription());
        response.setAvailableDate(announcement.getAvailableDate());
        response.setPhotos(announcementService.deserializePhotos(announcement.getPhotoUrls()));
        response.setCity(announcement.getCity());
        response.setAddress(announcement.getAddress());
        response.setMonthlyRent(announcement.getMonthlyRent());
        response.setNumberOfRooms(announcement.getNumberOfRooms());
        response.setArea(announcement.getArea());
        response.setActive(announcement.getActive());
        response.setViewCount(announcement.getViewCount());
        response.setOwnerAuthUserId(announcement.getOwnerAuthUserId());
        response.setOwnerEmail(announcement.getOwnerEmail());
        response.setCreatedAt(announcement.getCreatedAt());
        response.setUpdatedAt(announcement.getUpdatedAt());
        return response;
    }
}