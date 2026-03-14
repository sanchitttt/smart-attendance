package com.sanchit.smart_attendance.security.principal;

import com.sanchit.smart_attendance.security.enums.Role;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

public class UserPrincipal implements AppPrincipal, UserDetails {

    private final Long userId;
    private final String email;

    public UserPrincipal(Long userId, String email) {
        this.userId = userId;
        this.email = email;
    }

    // =========================
    // AppPrincipal
    // =========================
    @Override
    public Long getId() {
        return userId;
    }

    @Override
    public Role getRole() {
        return Role.USER;
    }

    // =========================
    // UserDetails
    // =========================
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_USER"));
    }

    @Override
    public String getPassword() {
        return null; // JWT-based auth, password not needed
    }

    @Override
    public String getUsername() {
        return email;
    }
}
