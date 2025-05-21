/**
 * 템플릿 관리 모듈
 */

// DOM 요소
const templateSelect = document.getElementById('templateSelect');
const description = document.getElementById('description');

/**
 * 템플릿 적용
 */
export function applyTemplate() {
    if (templateSelect.value === "basic") {
        description.value =
            `🕒 기간:

💻 사용 기술:
👤 맡은 역할:
🤝 팀 구성:
📌 프로젝트 개요:`;

        // 글자 수 업데이트 호출
        if (typeof updateCharCount === 'function') {
            updateCharCount();
        }
    }
}

// 이벤트 리스너 등록
templateSelect.addEventListener('change', applyTemplate);