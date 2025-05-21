/**
 * URL 관리 모듈
 */

// 상태 변수
let deleteUrlIds = [];
let newUrls = [];
const existingUrls = new Set(
    [...document.querySelectorAll('input[name="existingUrls"]')].map(input => input.value)
);

// DOM 요소
const urlInput = document.getElementById('url-input');
const urlError = document.getElementById('url-error');
const urlContainer = document.getElementById('url-container');

/**
 * URL 추가
 */
export function addUrl() {
    let url = urlInput.value.trim();

    // URL 유효성 검사
    if (!url) {
        showUrlError('URL을 입력해주세요.');
        return;
    }

    // http:// 또는 https://가 없는 경우 추가
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
    }

    // URL 형식 검증
    try {
        new URL(url);
    } catch (e) {
        showUrlError('유효한 URL 형식이 아닙니다.');
        return;
    }

    // 중복 URL 검사
    if (existingUrls.has(url) || newUrls.includes(url)) {
        showUrlError('이미 추가된 URL입니다.');
        return;
    }

    // 새 URL 추가
    newUrls.push(url);
    addUrlToDisplay(url);
    urlInput.value = '';
    urlError.classList.add('hidden');
}

/**
 * URL 표시에 추가
 * @param {string} url - 추가할 URL
 */
function addUrlToDisplay(url) {
    const urlItem = document.createElement('div');
    urlItem.className = 'flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200';
    urlItem.innerHTML = `
        <a href="${url}" target="_blank" class="text-blue-500 hover:underline truncate">${url}</a>
        <button type="button" class="text-red-500 hover:text-red-700 p-1" onclick="removeNewUrl('${url}')">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"/>
            </svg>
        </button>
    `;
    urlContainer.appendChild(urlItem);
}

/**
 * 새 URL 삭제
 * @param {string} url - 삭제할 URL
 */
export function removeNewUrl(url) {
    if (confirm('이 URL을 정말 삭제하시겠습니까?')) {
        // 새 URL 목록에서 제거
        newUrls = newUrls.filter(u => u !== url);

        // 화면에서 제거
        const urlElements = document.querySelectorAll('#url-container a');
        urlElements.forEach(element => {
            if (element.textContent === url) {
                element.closest('div').remove();
            }
        });
    }
}

/**
 * URL 삭제 확인
 * @param {string} urlId - 삭제할 URL ID
 */
export function confirmUrlDelete(urlId) {
    if (confirm('이 URL을 정말 삭제하시겠습니까?')) {
        deleteUrlIds.push(urlId);
        document.querySelector(`button[data-url-id="${urlId}"]`).closest('div').style.display = 'none';
    }
}

/**
 * URL 오류 표시
 * @param {string} message - 오류 메시지
 */
function showUrlError(message) {
    urlError.textContent = message;
    urlError.classList.remove('hidden');
    setTimeout(() => urlError.classList.add('hidden'), 3000);
}

/**
 * 새 URL 목록 반환
 * @returns {Array<string>} - 새 URL 배열
 */
export function getNewUrls() {
    return newUrls;
}

/**
 * 삭제할 URL ID 반환
 * @returns {Array<string>} - 삭제할 URL ID 배열
 */
export function getDeleteUrlIds() {
    return deleteUrlIds;
}

// 이벤트 리스너 등록
document.getElementById('add-url').addEventListener('click', addUrl);
urlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        addUrl();
    }
});