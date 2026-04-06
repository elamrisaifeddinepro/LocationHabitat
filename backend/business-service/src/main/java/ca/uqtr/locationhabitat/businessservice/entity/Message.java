package ca.uqtr.locationhabitat.businessservice.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "messages")
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "announcement_id", nullable = false)
    private Announcement announcement;

    @Column(nullable = false, length = 255)
    private String senderAuthUserId;

    @Column(nullable = false, length = 255)
    private String senderEmail;

    @Column(nullable = false, length = 255)
    private String recipientAuthUserId;

    @Column(nullable = false, length = 255)
    private String recipientEmail;

    @Column(nullable = false, length = 255)
    private String subject;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(nullable = false)
    private Boolean isRead;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    public Message() {
    }

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();

        if (this.isRead == null) {
            this.isRead = false;
        }
    }

    public Long getId() {
        return id;
    }

    public Announcement getAnnouncement() {
        return announcement;
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

    public void setAnnouncement(Announcement announcement) {
        this.announcement = announcement;
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

    public void setIsRead(Boolean read) {
        isRead = read;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}