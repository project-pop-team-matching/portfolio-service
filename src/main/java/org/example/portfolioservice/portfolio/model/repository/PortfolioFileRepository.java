package org.example.portfolioservice.portfolio.model.repository;

import org.example.portfolioservice.portfolio.model.entity.Portfolio;
import org.example.portfolioservice.portfolio.model.entity.PortfolioFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PortfolioFileRepository extends JpaRepository<PortfolioFile, Long> {

    List<PortfolioFile> findAllByPortfolio(Portfolio portfolio);
    List<PortfolioFile> findAllByPortfolioFileIdIn(List<Long> ids);

}
