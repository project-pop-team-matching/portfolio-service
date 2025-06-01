package org.example.portfolioservice.note.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.example.portfolioservice.common.exception.PortfolioNotFoundException;
import org.example.portfolioservice.common.exception.PortfolioNoteNotFound;
import org.example.portfolioservice.common.exception.UnauthorizedException;
import org.example.portfolioservice.note.model.dto.PortfolioNoteRequest;
import org.example.portfolioservice.note.model.dto.PortfolioNoteResponse;
import org.example.portfolioservice.note.model.entity.PortfolioNote;
import org.example.portfolioservice.note.model.repository.PortfolioNoteRepository;
import org.example.portfolioservice.portfolio.model.entity.Portfolio;
import org.example.portfolioservice.portfolio.model.repository.PortfolioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Log
public class PortfolioNoteServiceImpl implements PortfolioNoteService {

    private final PortfolioNoteRepository noteRepository;
    private final PortfolioRepository portfolioRepository;

    @Override
    @Transactional
    public PortfolioNote createNote(String userId, String portfolioId, PortfolioNoteRequest request) {
        // 해당 포트폴리오 있는지 확인
        Portfolio portfolio = findPortfolio(portfolioId);

        // 해당 포트폴리오에 대한 권한 확인
        if (!portfolio.getUserId().equals(userId)) {
            throw new UnauthorizedException("해당 포트폴리오에 대한 권한이 없습니다.");
        }

        PortfolioNote portfolioNote = new PortfolioNote();
        portfolioNote.setPortfolio(portfolio);
        portfolioNote.setContent(request.content());
        portfolioNote.setUserId(portfolio.getUserId());

        return noteRepository.save(portfolioNote);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PortfolioNoteResponse> getPortfolioNoteList(String portfolioId) {
        // 해당 포트폴리오 확인
        Portfolio portfolio = findPortfolio(portfolioId);

        List<PortfolioNote> noteList = findAll(portfolio);

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")
                .withZone(ZoneId.of("Asia/Seoul"));

        List<PortfolioNoteResponse> responseList = new ArrayList<>();
        for (PortfolioNote note : noteList) {
            PortfolioNoteResponse portfolioNoteResponse = new PortfolioNoteResponse(
                    note.getId(),
                    note.getContent(),
                    note.getCreatedAt().format(formatter)
            );
            responseList.add(portfolioNoteResponse);
        }
        return responseList;
    }

    private Portfolio findPortfolio(String portfolioId) {
        return portfolioRepository.findById(portfolioId).orElseThrow(() -> new PortfolioNotFoundException("해당 포트폴리오를 찾을 수 없습니다."));
    }

    private List<PortfolioNote> findAll(Portfolio portfolio) {
        List<PortfolioNote> noteList = noteRepository.findAllByPortfolio(portfolio);
        if (noteList.isEmpty()) {
            throw new PortfolioNoteNotFound("등록된 노트가 없습니다.");
        }
        return noteList;
    }

    private PortfolioNote findPortfolioNote(Long noteId) {
        return noteRepository.findById(noteId)
                .orElseThrow(() -> new PortfolioNoteNotFound("해당 노트를 찾을 수 없습니다."));
    }

    private void checkByUserId(Portfolio portfolio, String userId) {
        log.info("checkByUserId: %s %s".formatted(portfolio.getUserId(), userId));
        if (!portfolio.getUserId().equals(userId)) {
            throw new UnauthorizedException("해당 노트에 대한 권한이 없습니다.");
        }
    }

    private void checkByNote(Portfolio portfolio, PortfolioNote note) {
        log.info("checkByNote: %s %s".formatted(portfolio, note.getPortfolio()));
        if (!note.getPortfolio().equals(portfolio))
            throw new UnauthorizedException("해당 노트에 대한 권한이 없습니다.");
    }

    @Override
    @Transactional(readOnly = true)
    public PortfolioNoteResponse getPortfolioNote(String portfolioId, Long noteId) {
        Portfolio portfolio = findPortfolio(portfolioId);
        PortfolioNote note = findPortfolioNote(noteId);

        if (!note.getPortfolio().equals(portfolio)) {
            throw new UnauthorizedException("해당 노트에 대한 권한이 없습니다.");
        }

        return new PortfolioNoteResponse(
                note.getId(),
                note.getContent(),
                note.getCreatedAt().toString()
        );
    }

    @Override
    @Transactional
    public void updatePortfolioNote(String userId, String portfolioId, Long noteId, PortfolioNoteRequest request) {
        // 해당 포트폴리오 유무 및 자격 확인
        Portfolio portfolio = findPortfolio(portfolioId);
        checkByUserId(portfolio, userId);

        // 해당 노트 유무 및 자격 확인
        PortfolioNote note = findPortfolioNote(noteId);
        checkByNote(portfolio, note);

        // 내용 업데이트
        note.setContent(request.content());
        noteRepository.save(note);
    }

    @Override
    @Transactional
    public void deletePortfolioNote(String userId, String portfolioId, Long noteId) {
        Portfolio portfolio = findPortfolio(portfolioId);
        checkByUserId(portfolio, userId);

        PortfolioNote note = findPortfolioNote(noteId);
        checkByNote(portfolio, note);

        noteRepository.delete(note);
    }
}
