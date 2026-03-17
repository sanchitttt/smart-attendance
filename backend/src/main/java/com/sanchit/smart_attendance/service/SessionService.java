package com.sanchit.smart_attendance.service;

import com.sanchit.smart_attendance.entity.Session;
import com.sanchit.smart_attendance.entity.TimetableEntry;
import com.sanchit.smart_attendance.enums.DayOfWeekEnum;
import com.sanchit.smart_attendance.enums.SessionStatus;
import com.sanchit.smart_attendance.exception.BadRequestException;
import com.sanchit.smart_attendance.exception.NotFoundException;
import com.sanchit.smart_attendance.repository.*;
import com.sanchit.smart_attendance.repository.projection.TeacherClassTile;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SessionService {

    private final SessionRepository sessionRepository;
    private final TimeSlotRepository timeSlotRepository;
    private final AdminRepository adminRepository;
    private final SemesterRepository semesterRepository;
    private final TimetableEntryRepository timetableEntryRepository;

    private DayOfWeekEnum toDbDay(java.time.DayOfWeek javaDay) {
        return switch (javaDay) {
            case MONDAY -> DayOfWeekEnum.MON;
            case TUESDAY -> DayOfWeekEnum.TUE;
            case WEDNESDAY -> DayOfWeekEnum.WED;
            case THURSDAY -> DayOfWeekEnum.THU;
            case FRIDAY -> DayOfWeekEnum.FRI;
            case SATURDAY -> DayOfWeekEnum.SAT;
            default -> throw new IllegalStateException(
                    "No timetable on Sunday"
            );
        };
    }

    public Map<String, Object> getMySessions(Long adminId) {

        // Hardcoded for testing
        LocalDate today = LocalDate.of(2026, 2, 5); // Thursday
        String day = "THU"; // or convert from LocalDate

        List<TeacherClassTile> rows =
                timetableEntryRepository
                        .findTeacherClassesForDay(adminId, day);

        List<Map<String, Object>> tiles = rows.stream().map(r -> {
            Map<String, Object> m = new HashMap<>();
            m.put("teacherName", r.getAdminName());
            m.put("timetableID", r.getTimetableID());
            m.put("program", r.getProgramName());
            m.put("batch", r.getStartYear() + "-" + r.getEndYear());
            m.put("semester", r.getSemester());
            m.put("subject", r.getSubjectName());
            m.put("timeSlot",
                    r.getStartTime() + " - " + r.getEndTime());
            m.put("status", r.getStatus()); // old / current / upcoming
            return m;
        }).toList();

        return Map.of(
                "classes", tiles
        );
    }

    @Transactional
    public Session startSession(
            Long sessionId,
            Long adminId
    ) {

        Session session =
                sessionRepository
                        .findById(sessionId)
                        .orElseThrow(() ->
                                new NotFoundException("Session not found"));

        // 🔐 Ownership check, todo: add back in production
//        if (!session.getTimetableEntry()
//                .getAdmin()
//                .getAdminId()
//                .equals(adminId)) {
//
//            throw new BadRequestException("Unauthorized");
//        }

        // ⏱ Auto-close logic
        if (session.getStartedAt() != null) {

            long secondsElapsed =
                    Duration.between(session.getStartedAt(), LocalDateTime.now())
                            .getSeconds();

            if (secondsElapsed > 32) {
                session.setStatus(SessionStatus.CLOSED);
                return sessionRepository.save(session);
            }
        }
        else{
            session.setStartedAt(LocalDateTime.now());
        }

        // Already active
        if (session.getStatus() == SessionStatus.ACTIVE) {
            return session;
        }

        // Prevent restarting closed sessions
        if (session.getStatus() == SessionStatus.CLOSED) {
            throw new BadRequestException("Session already closed");
        }

        // Activate session
        session.setStatus(SessionStatus.ACTIVE);

        if (session.getStartedAt() == null) {
            session.setStartedAt(LocalDateTime.now());
        }

        return sessionRepository.save(session);
    }

    @Transactional
    public Session createSession(
            Long timetableEntryId,
            Long adminId
    ) {

        TimetableEntry entry =
                timetableEntryRepository
                        .findById(timetableEntryId)
                        .orElseThrow(() ->
                                new BadRequestException("Timetable entry not found"));

        // 🔐 Ownership check
//        if (!entry.getAdmin().getAdminId().equals(adminId)) { // todo: uncomment in prod
//            throw new BadRequestException("Unauthorized");
//        }

        LocalDate today = LocalDate.now();

        Session session = Session.builder()
                .sessionDate(today)
                .timetableEntry(entry)
                .status(SessionStatus.CREATED)
                .createdAt(LocalDateTime.now())
                .qrWindowSeconds(4)
                .build();

        return sessionRepository.save(session);
    }

    @Transactional
    public Session findOrCreateSession(
            Long timetableEntryId,
            Long adminId
    ) {

        TimetableEntry entry =
                timetableEntryRepository
                        .findById(timetableEntryId)
                        .orElseThrow(() ->
                                new BadRequestException("Timetable entry not found"));

        // 🔐 Ownership check
        if (!entry.getAdmin().getAdminId().equals(4l)) {  // todo: change back to adminID
            throw new BadRequestException("Unauthorized");
        }

        LocalDate today = LocalDate.now();

        Optional<Session> existing =
                sessionRepository
                        .findBySessionDateAndTimetableEntry_TimetableEntryId(
                                today,
                                timetableEntryId
                        );

        if (existing.isPresent()) {
            return existing.get();
        }

        Session session = Session.builder()
                .sessionDate(today)
                .timetableEntry(entry)
                .status(SessionStatus.CREATED)   // session exists but not started
                .qrWindowSeconds(4)
                .build();

        return sessionRepository.save(session);
    }

}