package ca.uqtr.locationhabitat.businessservice.service;

import ca.uqtr.locationhabitat.businessservice.dto.CreateAnnouncementRequest;
import ca.uqtr.locationhabitat.businessservice.entity.Announcement;
import ca.uqtr.locationhabitat.businessservice.repository.AnnouncementRepository;
import ca.uqtr.locationhabitat.businessservice.security.JwtUserPrincipal;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class AnnouncementService {

    private final AnnouncementRepository announcementRepository;

    public AnnouncementService(AnnouncementRepository announcementRepository) {
        this.announcementRepository = announcementRepository;
    }

    @Transactional
    public Announcement createAnnouncement(CreateAnnouncementRequest request, JwtUserPrincipal currentUser) {
        Announcement announcement = new Announcement();
        announcement.setTitle(request.getTitle().trim());
        announcement.setShortDescription(request.getShortDescription().trim());
        announcement.setLongDescription(request.getLongDescription().trim());
        announcement.setDescription(request.getLongDescription().trim());
        announcement.setAvailableDate(request.getAvailableDate());
        announcement.setPhotoUrls(serializePhotos(request.getPhotos()));
        announcement.setCity(request.getCity() == null ? "" : request.getCity().trim());
        announcement.setAddress(request.getAddress().trim());
        announcement.setMonthlyRent(request.getMonthlyRent());
        announcement.setNumberOfRooms(request.getNumberOfRooms());
        announcement.setArea(request.getArea());
        announcement.setOwnerAuthUserId(currentUser.getAuthUserId());
        announcement.setOwnerEmail(currentUser.getEmail());

        return announcementRepository.save(announcement);
    }

    @Transactional
    public Announcement updateAnnouncement(Long id, CreateAnnouncementRequest request, JwtUserPrincipal currentUser) {
        Announcement announcement = announcementRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Annonce introuvable"));

        if (!announcement.getOwnerAuthUserId().equals(currentUser.getAuthUserId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Vous ne pouvez modifier que vos propres annonces");
        }

        announcement.setTitle(request.getTitle().trim());
        announcement.setShortDescription(request.getShortDescription().trim());
        announcement.setLongDescription(request.getLongDescription().trim());
        announcement.setDescription(request.getLongDescription().trim());
        announcement.setAvailableDate(request.getAvailableDate());
        announcement.setPhotoUrls(serializePhotos(request.getPhotos()));
        announcement.setCity(request.getCity() == null ? "" : request.getCity().trim());
        announcement.setAddress(request.getAddress().trim());
        announcement.setMonthlyRent(request.getMonthlyRent());
        announcement.setNumberOfRooms(request.getNumberOfRooms());
        announcement.setArea(request.getArea());

        return announcementRepository.save(announcement);
    }

    @Transactional(readOnly = true)
    public List<Announcement> getPublicAnnouncements(String ownerId) {
        if (ownerId != null && !ownerId.isBlank()) {
            return announcementRepository.findByOwnerAuthUserIdAndActiveTrueOrderByCreatedAtDesc(ownerId.trim());
        }

        return announcementRepository.findByActiveTrueOrderByCreatedAtDesc();
    }

    @Transactional(readOnly = true)
    public List<Announcement> getMyAnnouncements(JwtUserPrincipal currentUser) {
        return announcementRepository.findByOwnerAuthUserIdOrderByCreatedAtDesc(currentUser.getAuthUserId());
    }

    @Transactional(readOnly = true)
    public Announcement getAnnouncementByIdForDisplay(Long id, JwtUserPrincipal currentUser) {
        Announcement announcement = announcementRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Annonce introuvable"));

        boolean isActive = Boolean.TRUE.equals(announcement.getActive());

        if (!isActive) {
            if (currentUser == null) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Annonce inactive");
            }

            boolean isOwner = announcement.getOwnerAuthUserId().equals(currentUser.getAuthUserId());
            if (!isOwner) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Accès refusé à cette annonce inactive");
            }
        }

        return announcement;
    }

    @Transactional
    public Announcement incrementViewCount(Long id, JwtUserPrincipal currentUser) {
        Announcement announcement = announcementRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Annonce introuvable"));

        boolean isActive = Boolean.TRUE.equals(announcement.getActive());

        if (!isActive) {
            if (currentUser == null) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Annonce inactive");
            }

            boolean isOwner = announcement.getOwnerAuthUserId().equals(currentUser.getAuthUserId());
            if (!isOwner) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Accès refusé à cette annonce inactive");
            }
        }

        Long currentViewCount = announcement.getViewCount() == null ? 0L : announcement.getViewCount();
        announcement.setViewCount(currentViewCount + 1);

        return announcementRepository.save(announcement);
    }

    @Transactional
    public Announcement toggleAnnouncementStatus(Long id, JwtUserPrincipal currentUser) {
        Announcement announcement = announcementRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Annonce introuvable"));

        if (!announcement.getOwnerAuthUserId().equals(currentUser.getAuthUserId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Vous ne pouvez modifier que vos propres annonces");
        }

        boolean currentStatus = Boolean.TRUE.equals(announcement.getActive());
        announcement.setActive(!currentStatus);

        return announcementRepository.save(announcement);
    }

    @Transactional(readOnly = true)
    public Announcement getAnnouncementOwnedByCurrentUser(Long id, JwtUserPrincipal currentUser) {
        Announcement announcement = announcementRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Annonce introuvable"));

        if (!announcement.getOwnerAuthUserId().equals(currentUser.getAuthUserId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Accès refusé à cette annonce");
        }

        return announcement;
    }

    @Transactional
    public void deleteAnnouncement(Long id, JwtUserPrincipal currentUser) {
        Announcement announcement = announcementRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Annonce introuvable"));

        if (!announcement.getOwnerAuthUserId().equals(currentUser.getAuthUserId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Vous ne pouvez supprimer que vos propres annonces");
        }

        announcementRepository.delete(announcement);
    }

    public List<String> deserializePhotos(String photoUrls) {
        if (photoUrls == null || photoUrls.trim().isEmpty()) {
            return List.of();
        }

        return List.of(photoUrls.split(","))
                .stream()
                .map(String::trim)
                .filter(url -> !url.isBlank())
                .collect(Collectors.toList());
    }

    private String serializePhotos(List<String> photos) {
        if (photos == null || photos.isEmpty()) {
            return null;
        }

        return photos.stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(url -> !url.isBlank())
                .collect(Collectors.joining(","));
    }
}