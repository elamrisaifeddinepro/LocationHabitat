package ca.uqtr.locationhabitat.businessservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class CreateMessageRequest {

    @NotNull(message = "L'identifiant de l'annonce est obligatoire")
    private Long announcementId;

    @NotBlank(message = "Le sujet est obligatoire")
    @Size(max = 255, message = "Le sujet ne doit pas dépasser 255 caractères")
    private String subject;

    @NotBlank(message = "Le contenu du message est obligatoire")
    private String content;

    public CreateMessageRequest() {
    }

    public Long getAnnouncementId() {
        return announcementId;
    }

    public String getSubject() {
        return subject;
    }

    public String getContent() {
        return content;
    }

    public void setAnnouncementId(Long announcementId) {
        this.announcementId = announcementId;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public void setContent(String content) {
        this.content = content;
    }
}