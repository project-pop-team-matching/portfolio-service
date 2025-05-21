/**
 * 포트폴리오 폼 유효성 검사 모듈
 */

// 상수 정의
const MAX_DESCRIPTION_LENGTH = 2000;

// DOM 요소
const form = document.getElementById('portfolio-form');
const description = document.getElementById('description');
const charCount = document.getElementById('char-count');

/**
 * 폼 제출 전 전체 유효성 검사
 * @returns {boolean} - 유효성 여부
 */
export function validateForm() {
    return validateRequiredFields() &&
        validateDescriptionLength();
}

/**
 * 필수 필드 검증
 * @returns {boolean} - 유효성 여부
 */
function validateRequiredFields() {
    const requiredFields = ['portfolioType', 'title', 'description'];
    for (const field of requiredFields) {
        const value = form.elements[field]?.value;
        if (!value) {
            alert(`${field === 'portfolioType' ? '포트폴리오 타입' :
                field === 'title' ? '제목' : '설명'}을 입력해주세요.`);
            return false;
        }
    }
    return true;
}

/**
 * 설명 글자 수 검증
 * @returns {boolean} - 유효성 여부
 */
function validateDescriptionLength() {
    if (description.value.length > MAX_DESCRIPTION_LENGTH) {
        alert('설명은 2000자 이하로 입력해주세요.');
        description.focus();
        return false;
    }
    return true;
}

/**
 * 글자 수 업데이트
 */
export function updateCharCount() {
    const count = description.value.length;
    charCount.textContent = `${count}/${MAX_DESCRIPTION_LENGTH}`;
    if (count > MAX_DESCRIPTION_LENGTH) {
        charCount.classList.add('text-red-500');
    } else {
        charCount.classList.remove('text-red-500');
    }
}

// 이벤트 리스너 등록
description.addEventListener('input', updateCharCount);