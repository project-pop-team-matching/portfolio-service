package org.example.portfolioservice.portfolio.model.dto;

import java.util.List;

public record PortfolioSummaryDTO(
        String portfolioId,
        String description,
        List<String> urls,
        List<String> fileUrls
) {
}
