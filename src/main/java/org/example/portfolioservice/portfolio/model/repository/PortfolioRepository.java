package org.example.portfolioservice.portfolio.model.repository;

import org.example.portfolioservice.portfolio.model.entity.Portfolio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PortfolioRepository extends JpaRepository<Portfolio, String> {
    List<Portfolio> findAllByUserId(String userId);
    List<Portfolio> findAllByUserIdOrderByCreatedAtDesc(String userId);
}
