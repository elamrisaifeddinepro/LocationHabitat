package ca.uqtr.locationhabitat.authservice.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String fromEmail;

    @Value("${app.frontend.reset-password-url}")
    private String resetPasswordUrl;

    public void sendPasswordResetEmail(String toEmail, String fullName, String token) {
        String resetLink = resetPasswordUrl + "?token=" + token;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("Réinitialisation de votre mot de passe - LocationHabitat");
        message.setText(buildResetPasswordBody(fullName, token, resetLink));

        mailSender.send(message);
    }

    private String buildResetPasswordBody(String fullName, String token, String resetLink) {
        return """
                Bonjour %s,

                Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte LocationHabitat.

                Votre token de réinitialisation :
                %s

                Vous pouvez aussi utiliser ce lien :
                %s

                Ce token expire dans 1 heure.

                Si vous n’êtes pas à l’origine de cette demande, ignorez simplement cet email.

                Cordialement,
                L’équipe LocationHabitat
                """.formatted(fullName, token, resetLink);
    }
}