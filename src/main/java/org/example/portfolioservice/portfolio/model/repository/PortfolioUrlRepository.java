package org.example.portfolioservice.portfolio.model.repository;

import org.example.portfolioservice.portfolio.model.entity.PortfolioUrl;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;


public interface PortfolioUrlRepository extends JpaRepository<PortfolioUrl, Long> {
    List<PortfolioUrl> findAllByPortfolioUrlIdIn(List<Long> ids);
}
