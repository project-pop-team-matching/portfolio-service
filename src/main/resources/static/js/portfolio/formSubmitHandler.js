/**
 * 폼 제출 처리 모듈
 */

import { validateForm } from './formValidation.js';
import { getSelectedFiles, getDeleteFileIds } from './fileUploadManager.js';
import { getNewUrls, getDeleteUrlIds } from './urlManager.js';

// DOM 요소
const form = document.getElementById('portfolio-form');
const submitButton = document.getElementById('submit-button');
const loadingSpinner = document.getElementById('loading-spinner');

async function summary(result) {
    // return fetch(`https://feedback-service-3lhm.onrender.com/api/summary/request`, {
    fetch(`http://localhost:8080/api/summary/request`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            portfolioId: result.portfolioId,
            description: result.description,
            urls: result.urls || [],
            fileUrls: result.fileUrls || []
        })
    }).catch(error => {
        console.error('Summary request failed: ', error);
    });
}

/**
 * 폼 제출 처리
 */
export async function handleFormSubmit(e) {
    e.preventDefault();

    // 유효성 검사
    if (!validateForm()) {
        return;
    }

    // 폼 데이터 준비
    const formData = prepareFormData();

    try {
        // 로딩 상태 표시
        setLoadingState(true);

        // REST API 호출
        const response = await submitForm(formData);

        if (response.ok) {
            const result = await response.json();
            alert('저장되었습니다.');
            summary(result)
            window.location.href = `/portfolios/${result.portfolioId}`; // 성공 시 상세 페이지로 이동
        } else {
            const error = await response.json();
            showFormError(error.message || '포트폴리오 저장에 실패했습니다.');
        }
    } catch (error) {
        console.error('Error:', error);
        showFormError('서버와의 통신 중 오류가 발생했습니다.');
    } finally {
        setLoadingState(false);
    }
}

/**
 * REST API를 통해 폼 데이터 제출
 * @param {FormData} formData - 제출할 폼 데이터
 * @returns {Promise<Response>} - API 응답
 */
async function submitForm(formData) {
    const isEditMode = !!document.querySelector('input[name="portfolioId"]');
    const url = isEditMode
        ? `/api/portfolios/${document.querySelector('input[name="portfolioId"]').value}/edit`
        : '/api/portfolios/new';
    // const method = isEditMode ? 'PUT' : 'POST';

    return fetch(url, {
        method: 'POST',
        body: formData,
        // headers: {
        //     'X-CSRF-TOKEN': document.querySelector('input[name="_csrf"]').value
        // }
    });
}

/**
 * 폼 데이터 준비
 * @returns {FormData} - 준비된 폼 데이터
 */
function prepareFormData() {
    const formData = new FormData();

    // 기본 폼 데이터 추가
    formData.append('portfolioType', form.elements.portfolioType.value);
    formData.append('title', form.elements.title.value);
    formData.append('description', form.elements.description.value);
    formData.append('template', document.getElementById('templateSelect').value);

    // 파일 데이터 추가
    getSelectedFiles().forEach(file => {
        formData.append('files', file);
    });

    // 삭제할 파일 ID 추가
    getDeleteFileIds().forEach(id => {
        formData.append('deleteFileIds', id);
    });

    // 삭제할 URL ID 추가
    getDeleteUrlIds().forEach(id => {
        formData.append('deleteUrlIds', id);
    });

    // 새로운 URL 추가
    getNewUrls().forEach(url => {
        formData.append('newUrls', url);
    });

    return formData;
}

/**
 * 로딩 상태 설정
 * @param {boolean} isLoading - 로딩 상태 여부
 */
function setLoadingState(isLoading) {
    if (isLoading) {
        submitButton.disabled = true;
        submitButton.querySelector('span').textContent = '처리 중...';
        loadingSpinner.classList.remove('hidden');
    } else {
        submitButton.disabled = false;
        submitButton.querySelector('span').textContent = '저장하기';
        loadingSpinner.classList.add('hidden');
    }
}

/**
 * 폼 오류 표시
 * @param {string} message - 오류 메시지
 */
function showFormError(message) {
    alert(message);
}

// 이벤트 리스너 등록
form.addEventListener('submit', handleFormSubmit);