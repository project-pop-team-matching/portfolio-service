package org.example.portfolioservice.portfolio.model.dto;

import org.example.portfolioservice.portfolio.model.entity.PortfolioType;

public record PortfolioSimple(
        String portfolioId,
        PortfolioType portfolioType,
        String title,
        String createdAt
) {
}
