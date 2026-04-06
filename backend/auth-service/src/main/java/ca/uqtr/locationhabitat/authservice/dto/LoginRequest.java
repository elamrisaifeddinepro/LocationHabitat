package ca.uqtr.locationhabitat.authservice.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginRequest {

    @NotBlank(message = "Le courriel est obligatoire")
    @Email(message = "Le courriel est invalide")
    private String courriel;

    @NotBlank(message = "Le mot de passe est obligatoire")
    private String password;
}