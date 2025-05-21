package org.example.portfolioservice.portfolio.service.file;

import org.example.portfolioservice.portfolio.model.entity.Portfolio;
import org.example.portfolioservice.portfolio.model.entity.PortfolioFile;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.Map;

public interface FileStorageService {

    Map<String, String> uploadAndGenerateSignedUrl(MultipartFile file, int expirationSeconds) throws Exception;

    void deleteFile(String filename) throws Exception;

    PortfolioFile uploadPortfolioFile(MultipartFile file, Portfolio portfolio);

    String generateSignedUrl(String filename, int expirationSeconds) throws IOException, InterruptedException;
}
