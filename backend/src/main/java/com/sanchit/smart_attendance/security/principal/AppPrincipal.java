package com.sanchit.smart_attendance.security.principal;

import com.sanchit.smart_attendance.security.enums.Role;

public interface AppPrincipal {
    Long getId();
    Role getRole();
}
