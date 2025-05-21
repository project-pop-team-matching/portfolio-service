package org.example.portfolioservice.portfolio.model.repository;

import org.example.portfolioservice.portfolio.model.entity.Portfolio;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;


public interface PortfolioRepository extends JpaRepository<Portfolio, String> {
    List<Portfolio> findAllByUserId(String userId);

    List<Portfolio> findAllByUserIdOrderByCreatedAtDesc(String userId);
}
