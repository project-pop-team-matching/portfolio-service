package org.example.portfolioservice.portfolio.model.repository;

import org.example.portfolioservice.portfolio.model.entity.PortfolioUrl;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PortfolioUrlRepository extends JpaRepository<PortfolioUrl, Long> {
    List<PortfolioUrl> findAllByPortfolioUrlIdIn(List<Long> ids);
}
