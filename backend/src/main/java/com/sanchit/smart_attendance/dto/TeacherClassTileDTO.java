package com.sanchit.smart_attendance.dto;

import com.sanchit.smart_attendance.repository.projection.TeacherClassTile;
import lombok.Getter;

import java.time.LocalTime;

@Getter
public class TeacherClassTileDTO {

    private Integer timetableID;
    private String adminName;
    private String sessionStatus;
    private LocalTime startTime;
    private LocalTime endTime;
    private String startYear;
    private String endYear;
    private String subjectName;
    private String programName;
    private Integer semester;
    private String status;

    public TeacherClassTileDTO(TeacherClassTile tile) {
        this.timetableID = tile.getTimetableID();
        this.adminName = tile.getAdminName();
        this.startTime = tile.getStartTime();
        this.endTime = tile.getEndTime();
        this.startYear = tile.getStartYear();
        this.endYear = tile.getEndYear();
        this.subjectName = tile.getSubjectName();
        this.programName = tile.getProgramName();
        this.semester = tile.getSemester();
        this.status = tile.getStatus();
    }

    public void setSessionStatus(String sessionStatus) {
        this.sessionStatus = sessionStatus;
    }

    // getters
}