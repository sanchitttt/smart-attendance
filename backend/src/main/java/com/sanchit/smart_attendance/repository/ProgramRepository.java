package com.sanchit.smart_attendance.repository;

import com.sanchit.smart_attendance.entity.Batch;
import com.sanchit.smart_attendance.entity.Program;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProgramRepository extends JpaRepository<Program, Long> {
    Optional<Program> findByProgramName(String name);
}
