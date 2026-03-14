package com.sanchit.smart_attendance.repository;

import com.sanchit.smart_attendance.entity.TimeSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalTime;
import java.util.Optional;

public interface TimeSlotRepository extends JpaRepository<TimeSlot, Long> {

    @Query("""
        SELECT t FROM TimeSlot t
        WHERE :now BETWEEN t.startTime AND t.endTime
    """)
    Optional<TimeSlot> findSlotForTime(@Param("now") LocalTime now);
}
