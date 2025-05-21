package org.example.portfolioservice.portfolio.model.repository;

import org.example.portfolioservice.portfolio.model.entity.Portfolio;
import org.example.portfolioservice.portfolio.model.entity.PortfolioFile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PortfolioFileRepository extends JpaRepository<PortfolioFile, Long> {

    List<PortfolioFile> findAllByPortfolio(Portfolio portfolio);

    List<PortfolioFile> findAllByPortfolioFileIdIn(List<Long> ids);

}
