package org.example.portfolioservice.portfolio.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.portfolioservice.portfolio.model.dto.PortfolioRequest;
import org.example.portfolioservice.portfolio.model.dto.PortfolioSummaryDTO;
import org.example.portfolioservice.portfolio.service.PortfolioService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/portfolios")
@RequiredArgsConstructor
public class PortfolioApiController {

    private final PortfolioService portfolioService;

    // 포트폴리오 등록
    @PostMapping(value = "/new", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> addPortfolio(
            @Valid @ModelAttribute("portfolio") PortfolioRequest request,
            BindingResult bindingResult) {

//        String userId = getUserId(authentication);
        String userId = "testID";

        if (bindingResult.hasErrors()) {
            Map<String, String> errors = new HashMap<>();
            bindingResult.getFieldErrors().forEach(error ->
                    errors.put(error.getField(), error.getDefaultMessage())
            );
            return ResponseEntity.badRequest().body(errors);
        }
        PortfolioSummaryDTO summaryDTO = portfolioService.createPortfolio(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(summaryDTO);
    }

    // 포트폴리오 수정
    @PostMapping("/{portfolioId}/edit")
    public ResponseEntity<?> updatePortfolio(
            @PathVariable String portfolioId,
            @Valid @ModelAttribute("portfolio") PortfolioRequest request,
            BindingResult bindingResult
    ) {
        String userId = "testID";
//        String userId = getUserId(authentication);

        if (bindingResult.hasErrors()) {
            Map<String, String> errors = new HashMap<>();
            bindingResult.getFieldErrors().forEach(error ->
                    errors.put(error.getField(), error.getDefaultMessage())
            );
            return ResponseEntity.badRequest().body(errors);
        }
        portfolioService.updatePortfolio(userId, portfolioId, request);
        return ResponseEntity.status(HttpStatus.OK)
                .body(Map.of("portfolioId", portfolioId));
    }

    // 포트폴리오 삭제
    @DeleteMapping("/{portfolioId}")
    public ResponseEntity<Void> deletePortfolio(@PathVariable String portfolioId) {
//        String userId = getUserId(authentication);
        String userId = "testID";
        portfolioService.deletePortfolio(userId, portfolioId);

        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

//    // 사용자 아이디 받기 NOTE: JWT토큰 사용해서 받기
//    private String getUserId(Authentication authentication) {
//        return authentication.getName();
//    }
}
