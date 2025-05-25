package org.example.portfolioservice.note.model.repository;

import org.example.portfolioservice.note.model.entity.PortfolioNote;
import org.example.portfolioservice.portfolio.model.entity.Portfolio;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PortfolioNoteRepository extends JpaRepository<PortfolioNote, Long> {
    List<PortfolioNote> findAllByPortfolio(Portfolio portfolio);

    void deleteByPortfolio_PortfolioId(String portfolioId);
}
