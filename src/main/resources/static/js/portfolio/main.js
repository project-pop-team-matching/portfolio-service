/**
 * 메인 진입점 - 모든 모듈을 초기화
 */

import { updateCharCount } from './formValidation.js';
import { handleFileInputChange, confirmFileDelete, removeFile, handleDragOver, handleDragLeave, handleDrop } from './fileUploadManager.js';
import { addUrl, removeNewUrl, confirmUrlDelete } from './urlManager.js';
import { applyTemplate } from './templateManager.js';
import { handleFormSubmit } from './formSubmitHandler.js';

// 전역 함수 정의 (HTML에서 직접 호출되는 함수들)
window.removeFile = removeFile;
window.removeNewUrl = removeNewUrl;
window.confirmFileDelete = confirmFileDelete;
window.confirmUrlDelete = confirmUrlDelete;

// 초기화 함수
function init() {
    // 글자 수 카운트 초기화
    updateCharCount();

    // 드래그 앤 드롭 이벤트 리스너
    document.getElementById('drop-zone').addEventListener('dragover', handleDragOver);
    document.getElementById('drop-zone').addEventListener('dragleave', handleDragLeave);
    document.getElementById('drop-zone').addEventListener('drop', handleDrop);

    // 파일 삭제 버튼 이벤트 바인딩
    document.querySelectorAll('.file-delete-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const fileId = btn.getAttribute('data-file-id');
            confirmFileDelete(fileId);
        });
    });

    // URL 삭제 버튼 이벤트 바인딩
    document.querySelectorAll('.url-delete-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const urlId = btn.getAttribute('data-url-id');
            confirmUrlDelete(urlId);
        });
    });

}

// DOM 로드 완료 후 초기화
document.addEventListener('DOMContentLoaded', init);