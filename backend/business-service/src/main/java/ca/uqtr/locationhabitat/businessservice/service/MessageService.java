package ca.uqtr.locationhabitat.businessservice.service;

import ca.uqtr.locationhabitat.businessservice.dto.CreateMessageRequest;
import ca.uqtr.locationhabitat.businessservice.entity.Announcement;
import ca.uqtr.locationhabitat.businessservice.entity.Message;
import ca.uqtr.locationhabitat.businessservice.repository.AnnouncementRepository;
import ca.uqtr.locationhabitat.businessservice.repository.MessageRepository;
import ca.uqtr.locationhabitat.businessservice.security.JwtUserPrincipal;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class MessageService {

    private final MessageRepository messageRepository;
    private final AnnouncementRepository announcementRepository;

    public MessageService(MessageRepository messageRepository,
                          AnnouncementRepository announcementRepository) {
        this.messageRepository = messageRepository;
        this.announcementRepository = announcementRepository;
    }

    @Transactional
    public Message sendMessage(CreateMessageRequest request, JwtUserPrincipal currentUser) {
        Announcement announcement = announcementRepository.findById(request.getAnnouncementId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Annonce introuvable"));

        if (!Boolean.TRUE.equals(announcement.getActive())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Impossible d'envoyer un message pour une annonce inactive"
            );
        }

        String ownerAuthUserId = announcement.getOwnerAuthUserId();
        if (ownerAuthUserId == null || ownerAuthUserId.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Le propriétaire de cette annonce est introuvable"
            );
        }

        if (ownerAuthUserId.equals(currentUser.getAuthUserId())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Vous ne pouvez pas vous envoyer un message à vous-même"
            );
        }

        Message message = new Message();
        message.setAnnouncement(announcement);
        message.setSenderAuthUserId(currentUser.getAuthUserId());
        message.setSenderEmail(currentUser.getEmail());
        message.setRecipientAuthUserId(ownerAuthUserId);
        message.setRecipientEmail(announcement.getOwnerEmail());
        message.setSubject(normalizeRequiredText(request.getSubject(), "Le sujet est requis"));
        message.setContent(normalizeRequiredText(request.getContent(), "Le contenu du message est requis"));

        return messageRepository.save(message);
    }

    @Transactional(readOnly = true)
    public List<Message> getInbox(JwtUserPrincipal currentUser) {
        return messageRepository.findByRecipientAuthUserIdOrderByCreatedAtDesc(currentUser.getAuthUserId())
                .stream()
                .filter(this::hasValidAnnouncement)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<Message> getSentMessages(JwtUserPrincipal currentUser) {
        return messageRepository.findBySenderAuthUserIdOrderByCreatedAtDesc(currentUser.getAuthUserId())
                .stream()
                .filter(this::hasValidAnnouncement)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<Message> getMessagesForAnnouncement(Long announcementId, JwtUserPrincipal currentUser) {
        Announcement announcement = announcementRepository.findById(announcementId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Annonce introuvable"));

        boolean isOwner = announcement.getOwnerAuthUserId() != null
                && announcement.getOwnerAuthUserId().equals(currentUser.getAuthUserId());

        if (isOwner) {
            return messageRepository.findByAnnouncementIdOrderByCreatedAtAsc(announcementId)
                    .stream()
                    .filter(this::hasValidAnnouncement)
                    .toList();
        }

        return messageRepository.findByAnnouncementIdAndSenderAuthUserIdOrderByCreatedAtAsc(
                        announcementId,
                        currentUser.getAuthUserId()
                ).stream()
                .filter(this::hasValidAnnouncement)
                .toList();
    }

    @Transactional
    public Message markAsRead(Long messageId, JwtUserPrincipal currentUser) {
        Message message = messageRepository.findByIdAndRecipientAuthUserId(messageId, currentUser.getAuthUserId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Message introuvable"
                ));

        if (!Boolean.TRUE.equals(message.getIsRead())) {
            message.setIsRead(true);
            message = messageRepository.save(message);
        }

        return message;
    }

    @Transactional
    public void deleteMessage(Long messageId, JwtUserPrincipal currentUser) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Message introuvable"
                ));

        boolean isRecipient = message.getRecipientAuthUserId() != null
                && message.getRecipientAuthUserId().equals(currentUser.getAuthUserId());
        boolean isSender = message.getSenderAuthUserId() != null
                && message.getSenderAuthUserId().equals(currentUser.getAuthUserId());

        if (!isRecipient && !isSender) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Vous n'avez pas le droit de supprimer ce message"
            );
        }

        messageRepository.delete(message);
    }

    private boolean hasValidAnnouncement(Message message) {
        return message != null && message.getAnnouncement() != null;
    }

    private String normalizeRequiredText(String value, String errorMessage) {
        if (value == null || value.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, errorMessage);
        }
        return value.trim();
    }
}