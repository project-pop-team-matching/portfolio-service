package org.example.portfolioservice.portfolio.controller;

import lombok.RequiredArgsConstructor;
import org.example.portfolioservice.common.utils.AuthUtils;
import org.example.portfolioservice.portfolio.model.dto.PortfolioRequest;
import org.example.portfolioservice.portfolio.model.dto.PortfolioResponse;
import org.example.portfolioservice.portfolio.model.dto.PortfolioSimple;
import org.example.portfolioservice.portfolio.model.entity.PortfolioType;
import org.example.portfolioservice.portfolio.service.PortfolioService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;

@Controller
@RequestMapping("/portfolios")
@RequiredArgsConstructor
public class PortfolioViewController {

    private final PortfolioService portfolioService;
    private final AuthUtils authUtils;

    // 포트폴리오 목록 조회
    @GetMapping
    public String getMyPortfolios(Model model) {
//        String userId = "testID";
        String userId = authUtils.getCurrentUserId();

        List<PortfolioSimple> portfolios = portfolioService.getMyPortfolios(userId);
        model.addAttribute("portfolios", portfolios);
        model.addAttribute("userId", userId);
        model.addAttribute("title", "포트폴리오 목록");
        model.addAttribute("viewName", "portfolio/list");

        return "portfolio/layout";
    }

    // 포트폴리오 등록 폼
    @GetMapping("/new")
    public String portfolioForm(Model model) {
        model.addAttribute("portfolio", PortfolioRequest.emptyCreateRequest());
        model.addAttribute("allTypes", PortfolioType.values());
        model.addAttribute("title", "포트폴리오 등록");
        model.addAttribute("viewName", "portfolio/form");
        return "portfolio/layout";
    }

    // 포트폴리오 상세 조회
    @GetMapping("/{portfolioId}")
    public String getPortfolio(@PathVariable String portfolioId, Model model) {
        PortfolioResponse portfolio = portfolioService.getPortfolio(portfolioId);
        model.addAttribute("portfolio", portfolio);
        model.addAttribute("title", "포트폴리오 상세");
        model.addAttribute("viewName", "portfolio/details");
        return "portfolio/layout";
    }

    // 포트폴리오 수정 폼
    @GetMapping("/{portfolioId}/edit")
    public String updatePortfolioForm(@PathVariable String portfolioId, Model model) {

        model.addAttribute("portfolio", portfolioService.getPortfolio(portfolioId));
        model.addAttribute("allTypes", PortfolioType.values());
        model.addAttribute("title", "포트폴리오 수정");
        model.addAttribute("viewName", "portfolio/form");
        return "portfolio/layout";
    }

}
