package org.example.portfolioservice.note.service;

import org.example.portfolioservice.note.model.dto.PortfolioNoteRequest;
import org.example.portfolioservice.note.model.dto.PortfolioNoteResponse;
import org.example.portfolioservice.note.model.entity.PortfolioNote;

import java.util.List;

public interface PortfolioNoteService {

    PortfolioNote createNote(String userId,
                             String portfolioId,
                             PortfolioNoteRequest request);

    List<PortfolioNoteResponse> getPortfolioNoteList(String portfolioId);

    PortfolioNoteResponse getPortfolioNote(String portfolioId, Long noteId);

    void updatePortfolioNote(String userId,
                             String portfolioId,
                             Long noteId,
                             PortfolioNoteRequest request);

    void deletePortfolioNote(String userId, String portfolioId, Long noteId);
}
