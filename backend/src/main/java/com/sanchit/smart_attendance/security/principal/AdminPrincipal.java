package com.sanchit.smart_attendance.security.principal;

import com.sanchit.smart_attendance.security.enums.Role;
import lombok.Getter;
import lombok.Setter;
import org.jspecify.annotations.Nullable;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Getter
@Setter
public class AdminPrincipal implements AppPrincipal, UserDetails {
    private final Long adminId;
    private final String email;

    public AdminPrincipal(Long adminId, String email) {
        this.adminId = adminId;
        this.email = email;
    }

    @Override
    public Long getId() {
        return adminId;
    }

    @Override
    public Role getRole() {
        return Role.ADMIN;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_ADMIN"));
    }

    @Override
    public @Nullable String getPassword() {
        return "";
    }

    @Override
    public String getUsername() {
        return email;
    }

    // other UserDetails methods → return defaults
}
