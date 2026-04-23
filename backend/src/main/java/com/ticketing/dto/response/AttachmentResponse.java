package com.ticketing.dto.response;

import com.ticketing.entity.Attachment;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttachmentResponse {
    private Long id;
    private String originalFilename;
    private String contentType;
    private Long fileSize;
    private UserResponse uploader;
    private LocalDateTime createdAt;

    public static AttachmentResponse fromEntity(Attachment attachment) {
        return AttachmentResponse.builder()
                .id(attachment.getId())
                .originalFilename(attachment.getOriginalFilename())
                .contentType(attachment.getContentType())
                .fileSize(attachment.getFileSize())
                .uploader(UserResponse.fromEntity(attachment.getUploader()))
                .createdAt(attachment.getCreatedAt())
                .build();
    }
}
