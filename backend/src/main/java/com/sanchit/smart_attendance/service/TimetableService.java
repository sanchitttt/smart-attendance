package com.sanchit.smart_attendance.service;

import com.sanchit.smart_attendance.enums.DayOfWeekEnum;
import com.sanchit.smart_attendance.exception.BadRequestException;
import com.sanchit.smart_attendance.repository.*;
import com.sanchit.smart_attendance.repository.projection.TeacherClassTile;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class TimetableService {

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

    public Map<String, Object> getMyClasses(Long adminId) {

        // Hardcoded for testing
        LocalDate today = LocalDate.of(2026, 2, 5); // Thursday
        String day = "THU"; // or convert from LocalDate

        List<TeacherClassTile> rows =
                timetableEntryRepository
                        .findTeacherClassesForDay(adminId, day);

        List<Map<String, Object>> tiles = rows.stream().map(r -> {
            Map<String, Object> m = new HashMap<>();
            m.put("timetableID", r.getTimetableID());
            m.put("teacherName", r.getAdminName());
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

    public TeacherClassTile getClassById(
            Long timetableEntryId,
            Long adminId
    ) {
        return timetableEntryRepository
                .findTeacherClassByTimetableEntryId(
                        timetableEntryId,
                        adminId
                )
                .orElseThrow(() ->
                        new BadRequestException("Class not found"));
    }
}