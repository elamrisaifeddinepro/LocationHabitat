package ca.uqtr.locationhabitat.authservice.repository;

import ca.uqtr.locationhabitat.authservice.entity.PasswordResetToken;
import ca.uqtr.locationhabitat.authservice.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;

import java.util.Optional;
import java.util.UUID;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, UUID> {

    Optional<PasswordResetToken> findByToken(String token);

    Optional<PasswordResetToken> findByTokenAndUsedFalse(String token);

    @Modifying
    void deleteByUser(User user);
}