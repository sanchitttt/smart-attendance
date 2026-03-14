package com.sanchit.smart_attendance.repository;

import com.sanchit.smart_attendance.entity.Semester;
import com.sanchit.smart_attendance.entity.Session;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface SessionRepository extends JpaRepository<Session, Long> {

//    @Query("""
//        SELECT s FROM Session s
//        WHERE s.createdByAdmin.adminId = :adminId
//          AND s.sessionDate = :date
//          AND s.timeSlot.timeSlotId = :timeSlotId
//    """)
//    List<Session> findByAdminAndDateAndTimeSlot(
//            @Param("adminId") Long adminId,
//            @Param("date") LocalDate date,
//            @Param("timeSlotId") Long timeSlotId
//    );


    Optional<Session> findBySessionDateAndTimetableEntry_TimetableEntryId(
            LocalDate date,
            Long timetableEntryId
    );
}
