package ca.uqtr.locationhabitat.businessservice.dto;

import java.time.LocalDateTime;

public class MessageResponse {

    private Long id;
    private Long announcementId;
    private String announcementTitle;
    private String senderAuthUserId;
    private String senderEmail;
    private String recipientAuthUserId;
    private String recipientEmail;
    private String subject;
    private String content;
    private Boolean isRead;
    private LocalDateTime createdAt;

    public MessageResponse() {
    }

    public Long getId() {
        return id;
    }

    public Long getAnnouncementId() {
        return announcementId;
    }

    public String getAnnouncementTitle() {
        return announcementTitle;
    }

    public String getSenderAuthUserId() {
        return senderAuthUserId;
    }

    public String getSenderEmail() {
        return senderEmail;
    }

    public String getRecipientAuthUserId() {
        return recipientAuthUserId;
    }

    public String getRecipientEmail() {
        return recipientEmail;
    }

    public String getSubject() {
        return subject;
    }

    public String getContent() {
        return content;
    }

    public Boolean getIsRead() {
        return isRead;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setAnnouncementId(Long announcementId) {
        this.announcementId = announcementId;
    }

    public void setAnnouncementTitle(String announcementTitle) {
        this.announcementTitle = announcementTitle;
    }

    public void setSenderAuthUserId(String senderAuthUserId) {
        this.senderAuthUserId = senderAuthUserId;
    }

    public void setSenderEmail(String senderEmail) {
        this.senderEmail = senderEmail;
    }

    public void setRecipientAuthUserId(String recipientAuthUserId) {
        this.recipientAuthUserId = recipientAuthUserId;
    }

    public void setRecipientEmail(String recipientEmail) {
        this.recipientEmail = recipientEmail;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public void setIsRead(Boolean isRead) {
        this.isRead = isRead;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}