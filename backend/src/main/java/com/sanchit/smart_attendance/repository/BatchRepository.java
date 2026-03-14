package com.sanchit.smart_attendance.repository;

import com.sanchit.smart_attendance.entity.Batch;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BatchRepository extends JpaRepository<Batch, Long> {
}

