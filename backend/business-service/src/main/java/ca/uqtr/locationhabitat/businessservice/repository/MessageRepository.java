package ca.uqtr.locationhabitat.businessservice.repository;

import ca.uqtr.locationhabitat.businessservice.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MessageRepository extends JpaRepository<Message, Long> {

    List<Message> findByAnnouncementIdOrderByCreatedAtAsc(Long announcementId);

    List<Message> findByRecipientAuthUserIdOrderByCreatedAtDesc(String recipientAuthUserId);

    List<Message> findBySenderAuthUserIdOrderByCreatedAtDesc(String senderAuthUserId);

    List<Message> findByAnnouncementIdAndRecipientAuthUserIdOrderByCreatedAtAsc(Long announcementId, String recipientAuthUserId);

    List<Message> findByAnnouncementIdAndSenderAuthUserIdOrderByCreatedAtAsc(Long announcementId, String senderAuthUserId);

    Optional<Message> findByIdAndRecipientAuthUserId(Long id, String recipientAuthUserId);
}