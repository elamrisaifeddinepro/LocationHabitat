package ca.uqtr.locationhabitat.businessservice.repository;

import ca.uqtr.locationhabitat.businessservice.entity.Announcement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {

    List<Announcement> findByActiveTrue();

    List<Announcement> findByOwnerAuthUserId(String ownerAuthUserId);

    List<Announcement> findByOwnerAuthUserIdOrderByCreatedAtDesc(String ownerAuthUserId);

    List<Announcement> findByActiveTrueOrderByCreatedAtDesc();

    List<Announcement> findByOwnerAuthUserIdAndActiveTrueOrderByCreatedAtDesc(String ownerAuthUserId);

    Optional<Announcement> findByIdAndActiveTrue(Long id);
}