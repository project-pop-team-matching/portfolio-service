package org.example.portfolioservice.portfolio.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.example.portfolioservice.common.exception.FileManagementException;
import org.example.portfolioservice.common.exception.PortfolioNotFoundException;
import org.example.portfolioservice.common.exception.UnauthorizedException;
import org.example.portfolioservice.note.model.repository.PortfolioNoteRepository;
import org.example.portfolioservice.portfolio.model.dto.*;
import org.example.portfolioservice.portfolio.model.entity.Portfolio;
import org.example.portfolioservice.portfolio.model.entity.PortfolioFile;
import org.example.portfolioservice.portfolio.model.entity.PortfolioUrl;
import org.example.portfolioservice.portfolio.model.repository.PortfolioFileRepository;
import org.example.portfolioservice.portfolio.model.repository.PortfolioRepository;
import org.example.portfolioservice.portfolio.model.repository.PortfolioUrlRepository;
import org.example.portfolioservice.portfolio.service.file.FileStorageService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Log
public class PortfolioServiceImpl implements PortfolioService {

    private final PortfolioRepository portfolioRepository;
    private final FileStorageService fileStorageService;
    private final PortfolioFileRepository portfolioFileRepository;
    private final PortfolioUrlRepository portfolioUrlRepository;
    private final PortfolioNoteRepository portfolioNoteRepository;

    @Override
    @Transactional
    public PortfolioSummaryDTO createPortfolio(String userId, PortfolioRequest request) {
//        Users userAccount = usersRepository.findById(UUID.fromString(userId)).orElseThrow(
//                () -> new RuntimeException("유저를 찾을 수 없습니다."));


        Portfolio portfolio = new Portfolio();
//        portfolio.setUserId(String.valueOf(userAccount.getId()));
        portfolio.setUserId(userId);
        portfolio.setPortfolioType(request.portfolioType());
        portfolio.setTitle(request.title());
        portfolio.setDescription(request.description());

        // URL 저장
        List<PortfolioUrl> urls = Optional.ofNullable(request.newUrls())
                .orElse(Collections.emptyList())
                .stream()
                .map(url -> new PortfolioUrl(url, portfolio))
                .toList();
        portfolio.setUrls(urls);

        // 파일 업로드 및 저장
        List<PortfolioFile> fileList = Optional.ofNullable(request.files())
                .orElse(Collections.emptyList())
                .stream()
                .filter(file -> !file.isEmpty()) // 추가: 파일이 비어있지 않은 경우만 처리
                .map(file ->
                        fileStorageService.uploadPortfolioFile(file, portfolio))
                .toList();
        log.info(fileList.toString());
        portfolio.setFiles(fileList);

        Portfolio saved = portfolioRepository.save(portfolio);
        return new PortfolioSummaryDTO(
                saved.getPortfolioId(),
                saved.getDescription(),
                saved.getUrls().stream().map(PortfolioUrl::getUrl).toList(),
                saved.getFiles().stream().map(PortfolioFile::getStoredUrl).toList()
        );

    }

    @Override
    @Transactional(readOnly = true)
    public List<PortfolioSimple> getMyPortfolios(String userId) {

//        Users userAccount = usersRepository.findById(UUID.fromString(userId)).orElseThrow(
//                () -> new RuntimeException("유저를 찾을 수 없습니다."));

//        portfolioRepository.findAllByUserId(String.valueOf(userAccount.getId()));
        portfolioRepository.findAllByUserId(userId);
        List<Portfolio> portfolios = portfolioRepository.findAllByUserIdOrderByCreatedAtDesc(userId);
        if (portfolios.isEmpty()) {
//            throw new PortfolioNotFoundException("등록된 포트폴리오가 없습니다.");
            return Collections.emptyList();
        }

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")
                .withZone(ZoneId.of("Asia/Seoul"));
        return portfolios.stream()
                .map(portfolio -> new PortfolioSimple(
                        portfolio.getPortfolioId(),
                        portfolio.getPortfolioType(),
                        portfolio.getTitle(),
                        portfolio.getCreatedAt().format(formatter)
                ))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public PortfolioResponse getPortfolio(String portfolioId) {
        Portfolio portfolio = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new PortfolioNotFoundException("해당 포트폴리오를 찾을 수 없습니다."));

        List<UrlResponse> urls = portfolio.getUrls()
                .stream()
                .map(url -> new UrlResponse(
                        url.getPortfolioUrlId(),
                        url.getUrl()
                ))
                .toList();

        List<FileResponse> files = portfolio.getFiles()
                .stream()
                .map(file -> {
                    String newUrl = null;
                    try {
                        newUrl = fileStorageService.generateSignedUrl(file.getStoredFilename(), 3600);
                    } catch (Exception e) {
                        throw new FileManagementException("파일 URL 생성에 실패했습니다.");
                    }
                    return new FileResponse(
                            file.getPortfolioFileId(),
                            file.getOriginalFilename(),
                            newUrl,
                            file.getFileType());
                })
                .toList();

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")
                .withZone(ZoneId.of("Asia/Seoul"));

        return new PortfolioResponse(
                portfolio.getPortfolioId(),
                portfolio.getPortfolioType(),
                portfolio.getTitle(),
                portfolio.getDescription(),
                portfolio.getCreatedAt().format(formatter),
                urls,
                files
        );
    }

    @Override
    @Transactional
    public void updatePortfolio(String userId, String portfolioId, PortfolioRequest request) {
        Portfolio portfolio = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new PortfolioNotFoundException("해당 포트폴리오를 찾을 수 없습니다."));

        if (!portfolio.getUserId().equals(userId)) {
            throw new UnauthorizedException("해당 포트폴리오를 수정할 권한이 없습니다.");
        }

        portfolio.setPortfolioType(request.portfolioType());
        portfolio.setTitle(request.title());
        portfolio.setDescription(request.description());

        // 삭제할 파일 처리
        try {
            deletePortfolioFiles(request.deleteFileIds());
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        deletePortfolioUrls(request.deleteUrlIds(), portfolio);

        // 파일 업로드
        if (request.files() != null) {
            for (MultipartFile file : request.files()) {
                if (!file.isEmpty()) {
                    PortfolioFile uploaded = fileStorageService.uploadPortfolioFile(file, portfolio);
                    portfolio.getFiles().add(uploaded);
                }
            }
        }
        // 중복 URL 검증 후 등록
        Set<String> existingUrls = portfolio.getUrls()
                .stream()
                .map(PortfolioUrl::getUrl)
                .collect(Collectors.toSet());

        if (request.newUrls() != null) {
            for (String url : request.newUrls()) {
                if (!existingUrls.contains(url)) {
                    PortfolioUrl portfolioUrl = new PortfolioUrl(url, portfolio);
                    portfolio.getUrls().add(portfolioUrl);
                }
            }
        }

    }

    private void deletePortfolioUrls(List<Long> urlIds, Portfolio portfolio) {
        if (urlIds == null || urlIds.isEmpty()) return;

        // 1. 삭제 대상 URL 조회
        List<PortfolioUrl> urlsToDelete = portfolioUrlRepository.findAllByPortfolioUrlIdIn(urlIds);

        // 2. 포트폴리오의 연관된 URL 컬렉션에서 제거
        portfolio.getUrls().removeIf(urlsToDelete::contains);

        // 3. DB에서 삭제
        portfolioUrlRepository.deleteAll(urlsToDelete);
    }

    private void deletePortfolioFiles(List<Long> fileIds) throws Exception {
        if (fileIds == null || fileIds.isEmpty()) return;

        List<PortfolioFile> files = portfolioFileRepository.findAllByPortfolioFileIdIn(fileIds);
        for (PortfolioFile file : files) {
            fileStorageService.deleteFile(file.getStoredFilename());
            portfolioFileRepository.delete(file);
        }
    }

    @Override
    @Transactional
    public void deletePortfolio(String userId, String portfolioId) {
        Portfolio portfolio = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new PortfolioNotFoundException("해당 포트폴리오를 찾을 수 없습니다."));

        if (!portfolio.getUserId().equals(userId)) {
            throw new UnauthorizedException("해당 포트폴리오를 삭제할 권한이 없습니다.");
        }

        // 스토리지에서 파일 삭제
        if (portfolio.getFiles() != null) {
            for (PortfolioFile file : portfolio.getFiles()) {
                try {
                    fileStorageService.deleteFile(file.getStoredFilename());
                } catch (Exception e) {
                    throw new FileManagementException("파일 삭제에 실패했습니다. " + e.getMessage());
                }
            }
        }

        // 연결된 노트 삭제
        portfolioNoteRepository.deleteByPortfolio_PortfolioId(portfolioId);

        portfolioRepository.delete(portfolio);
    }
}

