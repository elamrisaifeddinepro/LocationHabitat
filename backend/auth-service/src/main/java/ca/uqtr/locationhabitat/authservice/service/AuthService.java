package ca.uqtr.locationhabitat.authservice.service;

import ca.uqtr.locationhabitat.authservice.dto.AuthResponse;
import ca.uqtr.locationhabitat.authservice.dto.ForgotPasswordRequest;
import ca.uqtr.locationhabitat.authservice.dto.LoginRequest;
import ca.uqtr.locationhabitat.authservice.dto.RegisterRequest;
import ca.uqtr.locationhabitat.authservice.dto.ResetPasswordRequest;
import ca.uqtr.locationhabitat.authservice.dto.UpdateProfileRequest;
import ca.uqtr.locationhabitat.authservice.dto.UserResponse;
import ca.uqtr.locationhabitat.authservice.entity.PasswordResetToken;
import ca.uqtr.locationhabitat.authservice.entity.User;
import ca.uqtr.locationhabitat.authservice.repository.PasswordResetTokenRepository;
import ca.uqtr.locationhabitat.authservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;


import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailService emailService;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByCourriel(request.getCourriel())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Un compte avec ce courriel existe déjà"
            );
        }

        User user = User.builder()
                .nom(request.getNom())
                .prenom(request.getPrenom())
                .numero(request.getNumero())
                .telephone(request.getTelephone())
                .courriel(request.getCourriel())
                .adresse(request.getAdresse())
                .password(passwordEncoder.encode(request.getPassword()))
                .build();

        User savedUser = userRepository.save(user);
        String token = jwtService.generateToken(savedUser);

        return AuthResponse.builder()
                .token(token)
                .user(mapToUserResponse(savedUser))
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByCourriel(request.getCourriel())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Courriel ou mot de passe invalide"
                ));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Courriel ou mot de passe invalide"
            );
        }

        String token = jwtService.generateToken(user);

        return AuthResponse.builder()
                .token(token)
                .user(mapToUserResponse(user))
                .build();
    }

    @Transactional
     public Map<String, String> forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByCourriel(request.getCourriel())
            .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Aucun utilisateur trouvé avec ce courriel"
            ));

        passwordResetTokenRepository.deleteByUser(user);

        String generatedToken = UUID.randomUUID().toString();

        PasswordResetToken resetToken = PasswordResetToken.builder()
            .token(generatedToken)
            .user(user)
            .expiresAt(LocalDateTime.now().plusHours(1))
            .used(false)
            .build();

        passwordResetTokenRepository.save(resetToken);

        String fullName = (user.getPrenom() + " " + user.getNom()).trim();
        emailService.sendPasswordResetEmail(user.getCourriel(), fullName, generatedToken);

        Map<String, String> response = new LinkedHashMap<>();
        response.put("message", "Un email de réinitialisation a été envoyé avec succès");
        return response;
    }

    @Transactional
    public Map<String, String> resetPassword(ResetPasswordRequest request) {
        PasswordResetToken resetToken = passwordResetTokenRepository
                .findByTokenAndUsedFalse(request.getToken())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Token invalide ou déjà utilisé"
                ));

        if (resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Le token a expiré"
            );
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);

        Map<String, String> response = new LinkedHashMap<>();
        response.put("message", "Mot de passe réinitialisé avec succès");
        return response;
    }

    public UserResponse getCurrentUser(String courriel) {
        User user = userRepository.findByCourriel(courriel)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Utilisateur introuvable"
                ));

        return mapToUserResponse(user);
    }

    public UserResponse updateProfile(String currentCourriel, UpdateProfileRequest request) {
        User user = userRepository.findByCourriel(currentCourriel)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Utilisateur introuvable"
                ));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Mot de passe actuel incorrect"
            );
        }

        String newCourriel = request.getCourriel().trim();

        if (!user.getCourriel().equalsIgnoreCase(newCourriel)
                && userRepository.existsByCourriel(newCourriel)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Un compte avec ce courriel existe déjà"
            );
        }

        user.setNom(request.getNom().trim());
        user.setPrenom(request.getPrenom().trim());
        user.setNumero(request.getNumero().trim());
        user.setTelephone(request.getTelephone().trim());
        user.setCourriel(newCourriel);
        user.setAdresse(request.getAdresse().trim());

        User updatedUser = userRepository.save(user);
        return mapToUserResponse(updatedUser);
    }

    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .nom(user.getNom())
                .prenom(user.getPrenom())
                .numero(user.getNumero())
                .telephone(user.getTelephone())
                .courriel(user.getCourriel())
                .adresse(user.getAdresse())
                .build();
    }
}