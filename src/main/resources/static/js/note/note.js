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
            const notes = await fetchNotes();
            hideLoading();

            if (notes.length === 0) {
                showNoNotesMessage();
            } else {
                hideNoNotesMessage();
                notes.forEach(note => {
                    addNoteToUI(note);
                    checkExistingFeedback(note.id); // feedback.js에 정의된 함수
                });
            }
        } catch (e) {
            hideLoading();
            console.error("노트 불러오기 실패", e);
            showNoNotesMessage();
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
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({content})
        });
        return await res.json();
    }

    async function fetchNotes() {
        const res = await fetch(`/api/portfolios/${portfolioId}/notes`);
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
                method: 'DELETE'
            });
            document.querySelector(`[data-note-id="${noteId}"]`).remove();
        } catch (error) {
            console.error('Error deleting note:', error);
            alert('노트 삭제 중 오류가 발생했습니다');
        }
    }

    loadNotesAndFeedbacks();
});
