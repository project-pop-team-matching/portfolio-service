package org.example.portfolioservice.portfolio.model.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.example.portfolioservice.portfolio.model.entity.PortfolioType;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public record PortfolioRequest(
        String portfolioId, // 수정용 필요

        @NotNull(message = "유형을 선택해주세요.")
        PortfolioType portfolioType,

        @NotEmpty(message = "제목을 입력해주세요.")
        String title,

        @NotEmpty(message = "설명을 입력해주세요.")
        @Size(max = 2000, message = "설명은 2000자 이하로 입력해주세요.")
        String description,

        List<String> urls,

//        @FileValidation(message = "첨부된 파일에 문제가 있습니다.")
        List<MultipartFile> files,

        // 수정용 필요
        List<String> newUrls,
        List<Long> deleteFileIds,
        List<Long> deleteUrlIds

) {
    public static PortfolioRequest emptyCreateRequest() {
        return new PortfolioRequest(null, null, null, null, null, null, null, null, null);
    }
}
