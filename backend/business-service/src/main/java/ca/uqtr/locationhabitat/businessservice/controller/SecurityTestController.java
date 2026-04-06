package ca.uqtr.locationhabitat.businessservice.controller;

import ca.uqtr.locationhabitat.businessservice.security.JwtUserPrincipal;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
public class SecurityTestController {

    @GetMapping("/public")
    public Map<String, Object> publicEndpoint() {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("message", "business-service public endpoint OK");
        return response;
    }

    @GetMapping("/me")
    public Map<String, Object> me(Authentication authentication) {
        JwtUserPrincipal user = (JwtUserPrincipal) authentication.getPrincipal();

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("message", "JWT valide dans business-service");
        response.put("authUserId", user.getAuthUserId());
        response.put("email", user.getEmail());
        response.put("role", user.getRole());

        return response;
    }
}