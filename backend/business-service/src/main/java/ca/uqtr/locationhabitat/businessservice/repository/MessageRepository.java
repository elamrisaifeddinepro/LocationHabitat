package ca.uqtr.locationhabitat.businessservice.repository;

import ca.uqtr.locationhabitat.businessservice.entity.Message;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MessageRepository extends JpaRepository<Message, Long> {

    @EntityGraph(attributePaths = "announcement")
    List<Message> findByAnnouncementIdOrderByCreatedAtAsc(Long announcementId);

    @EntityGraph(attributePaths = "announcement")
    List<Message> findByRecipientAuthUserIdOrderByCreatedAtDesc(String recipientAuthUserId);

    @EntityGraph(attributePaths = "announcement")
    List<Message> findBySenderAuthUserIdOrderByCreatedAtDesc(String senderAuthUserId);

    @EntityGraph(attributePaths = "announcement")
    List<Message> findByAnnouncementIdAndRecipientAuthUserIdOrderByCreatedAtAsc(Long announcementId, String recipientAuthUserId);

    @EntityGraph(attributePaths = "announcement")
    List<Message> findByAnnouncementIdAndSenderAuthUserIdOrderByCreatedAtAsc(Long announcementId, String senderAuthUserId);

    @EntityGraph(attributePaths = "announcement")
    Optional<Message> findByIdAndRecipientAuthUserId(Long id, String recipientAuthUserId);
}