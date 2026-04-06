package ca.uqtr.locationhabitat.authservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {

    private UUID id;
    private String nom;
    private String prenom;
    private String numero;
    private String telephone;
    private String courriel;
    private String adresse;
}