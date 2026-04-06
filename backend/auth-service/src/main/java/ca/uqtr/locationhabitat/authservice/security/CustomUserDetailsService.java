package ca.uqtr.locationhabitat.authservice.security;

import ca.uqtr.locationhabitat.authservice.entity.User;
import ca.uqtr.locationhabitat.authservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String courriel) throws UsernameNotFoundException {
        User user = userRepository.findByCourriel(courriel)
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur introuvable"));

        return new org.springframework.security.core.userdetails.User(
                user.getCourriel(),
                user.getPassword(),
                Collections.emptyList()
        );
    }
}