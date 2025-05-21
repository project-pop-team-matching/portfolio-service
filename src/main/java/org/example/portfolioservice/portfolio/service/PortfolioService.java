package org.example.portfolioservice.portfolio.service;

import org.example.portfolioservice.global.exception.PortfolioNotFoundException;
import org.example.portfolioservice.portfolio.model.dto.PortfolioRequest;
import org.example.portfolioservice.portfolio.model.dto.PortfolioResponse;
import org.example.portfolioservice.portfolio.model.dto.PortfolioSimple;

import java.util.List;

public interface PortfolioService {
    String createPortfolio(String userId, PortfolioRequest request);

    List<PortfolioSimple> getMyPortfolios(String userId) throws PortfolioNotFoundException;

    PortfolioResponse getPortfolio(String portfolioId);

    void updatePortfolio(String userId, String portfolioId, PortfolioRequest request);

    void deletePortfolio(String userId, String portfolioId);

}
