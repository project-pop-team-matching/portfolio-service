package org.example.portfolioservice.note.model.dto;

public record PortfolioNoteResponse(
        Long id,
        String content,
        String createdAt
) {
}
