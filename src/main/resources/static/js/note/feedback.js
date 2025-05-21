const FEEDBACK_STATUS = {
    NOT_STARTED: 'NOT_STARTED',
    PROCESSING: 'FEEDBACK_IN_PROCESSING',
    COMPLETED: 'COMPLETED',
    FAILED: 'FAILED'
};

async function requestFeedback(noteId) {
    const portfolioId = document.getElementById('portfolio-container').dataset.portfolioId;
    const noteElement = document.querySelector(`[data-note-id="${noteId}"]`);
    const feedbackBtn = noteElement.querySelector('.feedback-request-btn');
    const feedbackStatus = noteElement.querySelector('.feedback-status');

    try {
        feedbackBtn.disabled = true;
        feedbackBtn.textContent = '요약 확인 중...';

        const isSummarized = await checkSummary(portfolioId);
        if (!isSummarized) {
            alert('요약 미완료. 잠시 후 다시 시도해주세요.');
            feedbackBtn.disabled = false;
            feedbackBtn.textContent = 'AI 피드백 요청하기';
            return;
        }

        feedbackBtn.textContent = '요청 중...';

        const feedback = await createFeedbackRequest(portfolioId, noteId);
        updateFeedbackUI(noteId, feedback);

        if (feedback.feedbackStatus === FEEDBACK_STATUS.PROCESSING) {
            startFeedbackPolling(noteId, feedback.id, portfolioId);
        }
    } catch (error) {
        console.error('Error requesting feedback:', error);
        feedbackBtn.disabled = false;
        feedbackBtn.textContent = 'AI 피드백 요청하기';
    }
}

async function checkSummary(portfolioId) {
    const response = await fetch(`/api/feedback/${portfolioId}/summary-status`);
    const data = await response.json();
    return data.isSummarized;
}

async function createFeedbackRequest(portfolioId, noteId) {
    const response = await fetch(`/api/feedback/request/${portfolioId}/${noteId}`, { method: 'POST' });
    return await response.json();
}

async function checkExistingFeedback(noteId) {
    const portfolioId = document.getElementById('portfolio-container').dataset.portfolioId;
    try {
        const feedback = await fetchLatestFeedback(portfolioId, noteId);
        if (feedback) {
            updateFeedbackUI(noteId, feedback);
            if (feedback.feedbackStatus === FEEDBACK_STATUS.PROCESSING) {
                startFeedbackPolling(noteId, feedback.id, portfolioId);
            }
        } else {
            updateFeedbackUI(noteId, {
                id: null,
                feedbackStatus: FEEDBACK_STATUS.NOT_STARTED,
                llmFeedback: null
            });
        }
    } catch (error) {
        console.error('Error checking existing feedback:', error);
    }
}

async function fetchLatestFeedback(portfolioId, noteId) {
    const response = await fetch(`/api/feedback/${portfolioId}/${noteId}/latest`);
    if (response.ok) return await response.json();
    return null;
}

function startFeedbackPolling(noteId, feedbackId, portfolioId) {
    const pollingInterval = setInterval(async () => {
        const feedback = await fetch(`/api/feedback/${portfolioId}/${noteId}/${feedbackId}`).then(r => r.json());
        updateFeedbackUI(noteId, feedback);

        if (feedback.feedbackStatus !== FEEDBACK_STATUS.PROCESSING) {
            clearInterval(pollingInterval);
        }
    }, 3000);
}

function updateFeedbackUI(noteId, feedback) {
    const noteElement = document.querySelector(`[data-note-id="${noteId}"]`);
    if (!noteElement) return;

    const feedbackBtn = noteElement.querySelector('.feedback-request-btn');
    const feedbackStatus = noteElement.querySelector('.feedback-status');
    const statusIndicator = noteElement.querySelector('[data-role="status-indicator"]');
    const statusText = noteElement.querySelector('.status-text');
    const feedbackContent = noteElement.querySelector('.feedback-content');
    const feedbackText = noteElement.querySelector('.feedback-text');

    feedbackStatus.classList.remove('hidden');

    switch (feedback.feedbackStatus) {
        case FEEDBACK_STATUS.PROCESSING:
            statusIndicator.className = 'inline-block w-3 h-3 rounded-full mr-2 bg-yellow-500 animate-pulse';
            statusText.textContent = 'AI가 피드백을 작성 중입니다...';
            feedbackBtn.classList.add('hidden');
            feedbackContent.classList.add('hidden');
            break;

        case FEEDBACK_STATUS.COMPLETED:
            statusIndicator.className = 'inline-block w-3 h-3 rounded-full mr-2 bg-green-500';
            statusText.textContent = '피드백 완료';
            feedbackText.innerHTML = marked.parse(feedback.llmFeedback);
            feedbackContent.classList.remove('hidden');
            feedbackBtn.classList.add('hidden');
            break;

        case FEEDBACK_STATUS.FAILED:
            statusIndicator.className = 'inline-block w-3 h-3 rounded-full mr-2 bg-red-500';
            statusText.textContent = '피드백 생성 실패';
            feedbackContent.classList.add('hidden');
            feedbackBtn.classList.remove('hidden');
            feedbackBtn.disabled = false;
            feedbackBtn.textContent = '다시 시도하기';
            break;

        default:
            feedbackStatus.classList.add('hidden');
            feedbackBtn.classList.remove('hidden');
            feedbackBtn.disabled = false;
            feedbackBtn.textContent = 'AI 피드백 요청하기';
            break;
    }
}
