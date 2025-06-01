document.addEventListener('DOMContentLoaded', async function () {
    const portfolioId = document.getElementById('portfolio-container').dataset.portfolioId;
    const noteForm = document.getElementById('note-form');
    const noteList = document.getElementById('note-list');
    const noteTemplate = document.querySelector('.note-item-template');
    const loadingIndicator = document.getElementById('note-loading');
    const noNotesMessage = document.getElementById('no-notes-message');

    function showLoading() {
        loadingIndicator.classList.remove('hidden');
    }

    function hideLoading() {
        loadingIndicator.classList.add('hidden');
    }

    function showNoNotesMessage() {
        noNotesMessage.classList.remove('hidden');
    }

    function hideNoNotesMessage() {
        noNotesMessage.classList.add('hidden');
    }

    async function loadNotesAndFeedbacks() {
        showLoading();
        try {
            // 1. 포트폴리오 서비스에서 노트 목록 조회
            const notes = await fetch(`/api/portfolios/${portfolioId}/notes`, {
                method: 'GET',
                credentials: 'include'
            }).then(res => res.json());

            if (notes.length === 0) {
                showNoNotesMessage();
                hideLoading();
                return;
            }

            // 2. 노트 ID들로 피드백 서비스에 일괄 요청
            const noteIds = notes.map(note => note.id);
            const API_BASE_URL = 'https://feedback-service-3lhm.onrender.com';
            // const API_BASE_URL = 'http://localhost:8080';
            const response = await fetch(`${API_BASE_URL}/api/feedback/batch`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    portfolioId: portfolioId,
                    noteIds: noteIds
                })
            });
            if (!response.ok) {
                console.log('Failed to load feedbacks');
            }
            const feedbacks = await response.json();

            // 3. UI 렌더링
            hideNoNotesMessage();
            notes.forEach(note => {
                addNoteToUI(note);
                const feedback = feedbacks.find(f => f.noteId === note.id);
                // console.log(feedback);
                if (feedback) updateFeedbackUI(note.id, feedback);
            });

        } catch (e) {
            console.error("Error loading data:", e);
            showNoNotesMessage();
        } finally {
            hideLoading();
        }
    }

    noteForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const content = document.getElementById('note-content').value.trim();
        if (!content) {
            alert('회고 내용을 작성해주세요');
            return;
        }

        try {
            const newNote = await createNote(content);
            addNoteToUI(newNote);
            hideNoNotesMessage();
            document.getElementById('note-content').value = '';
        } catch (err) {
            console.error("작성 실패", err);
            alert("작성 중 오류가 발생했습니다");
        }
    });

    async function createNote(content) {
        const res = await fetch(`/api/portfolios/${portfolioId}/notes`, {
            method: 'POST',
            credentials: 'include',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({content})
        });
        return await res.json();
    }

    async function fetchNotes() {
        const res = await fetch(`/api/portfolios/${portfolioId}/notes`, {
            method: 'GET',
            credentials: 'include'
        });
        return await res.json();
    }

    function addNoteToUI(note) {
        const noteElement = noteTemplate.cloneNode(true);
        noteElement.classList.remove('hidden');
        noteElement.dataset.noteId = note.id;
        noteElement.querySelector('.note-created-at').textContent = note.createdAt;
        noteElement.querySelector('.note-content').textContent = note.content;

        // 삭제 이벤트 바인딩
        noteElement.querySelector('.note-delete-btn').addEventListener('click', () => deleteNote(note.id));

        // 피드백 요청 버튼 이벤트
        const feedbackBtn = noteElement.querySelector('.feedback-request-btn');
        feedbackBtn.addEventListener('click', () => requestFeedback(note.id)); // feedback.js에 정의

        if (noteList.firstChild) {
            noteList.insertBefore(noteElement, noteList.firstChild);
        } else {
            noteList.appendChild(noteElement);
        }
    }

    async function deleteNote(noteId) {
        if (!confirm('정말 이 회고 노트를 삭제하시겠습니까?')) return;

        try {
            await fetch(`/api/portfolios/${portfolioId}/notes/${noteId}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            document.querySelector(`[data-note-id="${noteId}"]`).remove();
        } catch (error) {
            console.error('Error deleting note:', error);
            alert('노트 삭제 중 오류가 발생했습니다');
        }
    }

    loadNotesAndFeedbacks();
});
