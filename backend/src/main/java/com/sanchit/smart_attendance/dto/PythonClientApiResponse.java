package com.sanchit.smart_attendance.dto;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PythonClientApiResponse {

    private boolean success;

    private String stage;

    private String message;

    private Double similarity;

    @JsonProperty("liveness_score")
    private Double livenessScore;

    private Boolean verified;

    // 🔥 optional but VERY useful
    @Override
    public String toString() {
        return "PythonClientApiResponse{" +
                "success=" + success +
                ", stage='" + stage + '\'' +
                ", message='" + message + '\'' +
                ", similarity=" + similarity +
                ", livenessScore=" + livenessScore +
                ", verified=" + verified +
                '}';
    }
}