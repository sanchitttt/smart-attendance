package com.sanchit.smart_attendance.repository;

import com.sanchit.smart_attendance.entity.Semester;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SemesterRepository extends JpaRepository<Semester, Long> {
    // For now, findAll() is enough for MVP
}
