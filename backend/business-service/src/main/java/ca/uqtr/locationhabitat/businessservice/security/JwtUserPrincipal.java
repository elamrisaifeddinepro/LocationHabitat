package ca.uqtr.locationhabitat.businessservice.security;

public class JwtUserPrincipal {

    private final String authUserId;
    private final String email;
    private final String role;

    public JwtUserPrincipal(String authUserId, String email, String role) {
        this.authUserId = authUserId;
        this.email = email;
        this.role = role;
    }

    public String getAuthUserId() {
        return authUserId;
    }

    public String getEmail() {
        return email;
    }

    public String getRole() {
        return role;
    }
}