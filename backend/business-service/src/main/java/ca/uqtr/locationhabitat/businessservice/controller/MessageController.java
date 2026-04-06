package ca.uqtr.locationhabitat.businessservice.controller;

import ca.uqtr.locationhabitat.businessservice.dto.CreateMessageRequest;
import ca.uqtr.locationhabitat.businessservice.dto.MessageResponse;
import ca.uqtr.locationhabitat.businessservice.entity.Message;
import ca.uqtr.locationhabitat.businessservice.security.JwtUserPrincipal;
import ca.uqtr.locationhabitat.businessservice.service.MessageService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    private final MessageService messageService;

    public MessageController(MessageService messageService) {
        this.messageService = messageService;
    }

    @PostMapping
    public ResponseEntity<MessageResponse> sendMessage(
            @Valid @RequestBody CreateMessageRequest request,
            Authentication authentication
    ) {
        JwtUserPrincipal currentUser = getCurrentUser(authentication);
        Message savedMessage = messageService.sendMessage(request, currentUser);

        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(savedMessage));
    }

    @GetMapping("/inbox")
    public ResponseEntity<List<MessageResponse>> getInbox(Authentication authentication) {
        JwtUserPrincipal currentUser = getCurrentUser(authentication);

        List<MessageResponse> response = messageService.getInbox(currentUser)
                .stream()
                .map(this::toResponse)
                .toList();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/sent")
    public ResponseEntity<List<MessageResponse>> getSentMessages(Authentication authentication) {
        JwtUserPrincipal currentUser = getCurrentUser(authentication);

        List<MessageResponse> response = messageService.getSentMessages(currentUser)
                .stream()
                .map(this::toResponse)
                .toList();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/announcement/{announcementId}")
    public ResponseEntity<List<MessageResponse>> getMessagesForAnnouncement(
            @PathVariable Long announcementId,
            Authentication authentication
    ) {
        JwtUserPrincipal currentUser = getCurrentUser(authentication);

        List<MessageResponse> response = messageService.getMessagesForAnnouncement(announcementId, currentUser)
                .stream()
                .map(this::toResponse)
                .toList();

        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{messageId}/read")
    public ResponseEntity<MessageResponse> markAsRead(
            @PathVariable Long messageId,
            Authentication authentication
    ) {
        JwtUserPrincipal currentUser = getCurrentUser(authentication);
        Message updatedMessage = messageService.markAsRead(messageId, currentUser);

        return ResponseEntity.ok(toResponse(updatedMessage));
    }

    @DeleteMapping("/{messageId}")
    public ResponseEntity<Void> deleteMessage(
            @PathVariable Long messageId,
            Authentication authentication
    ) {
        JwtUserPrincipal currentUser = getCurrentUser(authentication);
        messageService.deleteMessage(messageId, currentUser);

        return ResponseEntity.noContent().build();
    }

    private JwtUserPrincipal getCurrentUser(Authentication authentication) {
        return (JwtUserPrincipal) authentication.getPrincipal();
    }

    private MessageResponse toResponse(Message message) {
        MessageResponse response = new MessageResponse();
        response.setId(message.getId());
        response.setAnnouncementId(message.getAnnouncement().getId());
        response.setAnnouncementTitle(message.getAnnouncement().getTitle());
        response.setSenderAuthUserId(message.getSenderAuthUserId());
        response.setSenderEmail(message.getSenderEmail());
        response.setRecipientAuthUserId(message.getRecipientAuthUserId());
        response.setRecipientEmail(message.getRecipientEmail());
        response.setSubject(message.getSubject());
        response.setContent(message.getContent());
        response.setIsRead(message.getIsRead());
        response.setCreatedAt(message.getCreatedAt());
        return response;
    }
}