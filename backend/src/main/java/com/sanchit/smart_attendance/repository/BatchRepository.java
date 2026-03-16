package com.sanchit.smart_attendance.repository;

import com.sanchit.smart_attendance.entity.Batch;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BatchRepository extends JpaRepository<Batch, Long> {

    Optional<Batch> findByStartYear(Integer startYear);
}

