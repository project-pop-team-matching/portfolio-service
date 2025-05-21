package org.example.portfolioservice.note.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.portfolioservice.note.model.dto.PortfolioNoteRequest;
import org.example.portfolioservice.note.model.dto.PortfolioNoteResponse;
import org.example.portfolioservice.note.model.entity.PortfolioNote;
import org.example.portfolioservice.note.service.PortfolioNoteService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/api/portfolios/{portfolioId}/notes")
@RequiredArgsConstructor
public class PortfolioNoteController {

    private final PortfolioNoteService noteService;

    // 포트폴리오에 대한 노트 조회 목록
    @GetMapping
    public ResponseEntity<List<PortfolioNoteResponse>> getPortfolioNoteList(@PathVariable String portfolioId) {
        List<PortfolioNoteResponse> notes = noteService.getPortfolioNoteList(portfolioId);
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(notes);
    }

    @PostMapping
    public ResponseEntity<PortfolioNoteResponse> addPortfolioNote(
            @PathVariable String portfolioId,
            @Valid @RequestBody PortfolioNoteRequest request) {

//        String userId = getUserId(authentication);
        String userId = "testID";

        PortfolioNote note = noteService.createNote(userId, portfolioId, request);
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")
                .withZone(ZoneId.of("Asia/Seoul"));

        PortfolioNoteResponse response = new PortfolioNoteResponse(
                note.getId(),
                note.getContent(),
                note.getCreatedAt().format(formatter)
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // 포트폴리오에 대한 노트 상세
    @GetMapping("/{noteId}")
    public ResponseEntity<PortfolioNoteResponse> getPortfolioNote(
            @PathVariable String portfolioId, @PathVariable Long noteId) {
        PortfolioNoteResponse response = noteService.getPortfolioNote(portfolioId, noteId);
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(response);
    }

    // 포트폴리오에 대한 노트 수정
    @PutMapping(value = "/{noteId}")
    public ResponseEntity<Void> updatePortfolioNote(
            @PathVariable String portfolioId,
            @PathVariable Long noteId,
            @Valid @RequestPart("request") PortfolioNoteRequest request) {

//        String userId = getUserId(authentication);
        String userId = "testID";
        noteService.updatePortfolioNote(userId, portfolioId, noteId, request);
        return ResponseEntity
                .status(HttpStatus.NO_CONTENT)
                .build();
    }

    // 포트폴리오에 대한 노트 삭제
    @DeleteMapping("/{noteId}")
    public ResponseEntity<Void> deletePortfolioNote(
            @PathVariable String portfolioId,
            @PathVariable Long noteId) {
//        String userId = getUserId(authentication);
        String userId = "testID";
        noteService.deletePortfolioNote(userId, portfolioId, noteId);
        return ResponseEntity
                .status(HttpStatus.NO_CONTENT)
                .build();
    }

}
