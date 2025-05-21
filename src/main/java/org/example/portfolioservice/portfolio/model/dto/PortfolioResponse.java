package org.example.portfolioservice.portfolio.model.dto;

import org.example.portfolioservice.portfolio.model.entity.PortfolioType;

import java.util.List;

public record PortfolioResponse(
        String portfolioId,
        PortfolioType portfolioType,
        String title,
        String description,
        String createdAt,

        List<UrlResponse> urls,
        List<FileResponse> files

) {
}
