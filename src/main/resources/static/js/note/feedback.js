// const API_BASE_URL = 'https://feedback-service-3lhm.onrender.com'
const API_BASE_URL = 'http://localhost:8080'
const FEEDBACK_STATUS = {
    NOT_STARTED: 'NOT_STARTED',
    PROCESSING: 'IN_PROCESSING',
    COMPLETED: 'COMPLETED',
    FAILED: 'FAILED'
};

/**
 * AI 피드백 요청을 생성하는 함수
 * @param {string} noteId - 피드백을 요청할 노트의 ID
 */
async function requestFeedback(noteId) {
    const portfolioId = document.getElementById('portfolio-container').dataset.portfolioId;
    const noteElement = document.querySelector(`[data-note-id="${noteId}"]`);
    const noteContent = noteElement.querySelector('.note-content').textContent;
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

        // FeedbackRequest DTO 구조에 맞게 요청 생성
        const feedback = await createFeedbackRequest({
            portfolioId: portfolioId,
            noteId: noteId,
            noteContent: noteContent
        });

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

/**
 * 포트폴리오 요약 상태 확인
 * @param {string} portfolioId - 포트폴리오 ID
 * @returns {Promise<boolean>} 요약 완료 여부
 */
async function checkSummary(portfolioId) {
    const response = await fetch(`${API_BASE_URL}/api/summary/${portfolioId}/status`, {
        method: 'GET',
        credentials: 'include'
    });
    const data = await response.json();
    return data.status === 'COMPLETED';
}

/**
 * 피드백 생성 요청 API 호출
 * @param {object} requestData - FeedbackRequest DTO 구조의 데이터
 * @returns {Promise<FeedbackResponse>} 피드백 응답
 */
async function createFeedbackRequest(requestData) {
    const response = await fetch(`${API_BASE_URL}/api/feedback/request`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
    });
    return await response.json();
}

/**
 * 기존 피드백 확인
 * @param {string} noteId - 노트 ID
 */
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

/**
 * 최신 피드백 조회 API 호출
 * @param {string} portfolioId - 포트폴리오 ID
 * @param {string} noteId - 노트 ID
 * @returns {Promise<FeedbackResponse>} 피드백 응답
 */
async function fetchLatestFeedback(portfolioId, noteId) {
    const response = await fetch(`${API_BASE_URL}/api/feedback/${portfolioId}/${noteId}/latest`, {
        method: 'GET',
        credentials: 'include'
    });
    if (response.ok) return await response.json();
    return null;
}

/**
 * 피드백 상태 폴링 시작
 * @param {string} noteId - 노트 ID
 * @param {number} feedbackId - 피드백 ID
 * @param {string} portfolioId - 포트폴리오 ID
 */
function startFeedbackPolling(noteId, feedbackId, portfolioId) {
    const pollingInterval = setInterval(async () => {
        const feedback = await fetch(`${API_BASE_URL}/api/feedback/${feedbackId}`, {
            method: 'GET',
            credentials: 'include'
        }).then(r => r.json());
        updateFeedbackUI(noteId, feedback);

        if (feedback.feedbackStatus !== FEEDBACK_STATUS.PROCESSING) {
            clearInterval(pollingInterval);
        }
    }, 3000);
}

/**
 * 피드백 UI 업데이트
 * @param {string} noteId - 노트 ID
 * @param {FeedbackResponse} feedback - 피드백 응답 데이터
 */
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