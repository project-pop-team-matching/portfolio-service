package org.example.portfolioservice.note.model.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.example.portfolioservice.portfolio.model.entity.Portfolio;

import java.time.ZoneOffset;
import java.time.ZonedDateTime;

@Data
@Entity
public class PortfolioNote {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "portfolio_id", nullable = false)
    private Portfolio portfolio;

    @Column(nullable = false)
    private String userId;

    @Column(nullable = false, length = 2000)
    private String content;

    private ZonedDateTime createdAt = ZonedDateTime.now(ZoneOffset.UTC);

}