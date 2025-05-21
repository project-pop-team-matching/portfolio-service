package org.example.portfolioservice.portfolio.model.dto;

public record FileResponse(
        Long id,
        String filename,
        String fileUrl,
        String fileType
) {
}
