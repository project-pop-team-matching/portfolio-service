/**
 * 파일 업로드 관리 모듈
 */

// 상수 정의
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_FILE_TYPES = [
    'application/pdf', // .pdf
    'text/markdown', // .md
    'text/csv', // .csv
    'text/plain', // .txt
    'application/msword', // .doc
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/vnd.ms-excel', // .xls
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-powerpoint', // .ppt
    'application/vnd.openxmlformats-officedocument.presentationml.presentation' // .pptx
];
const FILE_EXTENSIONS = [
    '.pdf', '.md', '.csv', '.txt',
    '.doc', '.docx', '.xls', '.xlsx',
    '.ppt', '.pptx'
];

// 상태 변수
let selectedFiles = [];
let deleteFileIds = [];

// DOM 요소
const fileInput = document.getElementById('file-upload');
const fileList = document.getElementById('file-list');
const dropZone = document.getElementById('drop-zone');
const fileSizeError = document.getElementById('file-size-error');

/**
 * 파일 입력 변경 처리
 */
export function handleFileInputChange() {
    if (fileInput.files.length > 0) {
        processFiles(Array.from(fileInput.files));
        fileInput.value = ''; // 동일한 파일 다시 선택 가능하도록 초기화
    }
}

/**
 * 파일 처리
 * @param {Array<File>} files - 처리할 파일 배열
 */
function processFiles(files) {
    const validFiles = [];
    const invalidFiles = [];

    files.forEach(file => {
        // 파일 타입 검증
        const typeValidation = validateFileType(file);
        if (!typeValidation.valid) {
            invalidFiles.push({
                file: file,
                message: typeValidation.message
            });
            return;
        }

        // 파일 크기 검증
        if (file.size > MAX_FILE_SIZE) {
            invalidFiles.push({
                file: file,
                message: '파일 크기가 50MB를 초과했습니다.'
            });
            return;
        }

        validFiles.push(file);
    });

    // 유효하지 않은 파일 처리
    if (invalidFiles.length > 0) {
        let errorMessage = '다음 파일들에 문제가 있습니다:\n';
        invalidFiles.forEach(invalid => {
            errorMessage += `- ${invalid.file.name}: ${invalid.message}\n`;
        });

        showFileError(errorMessage);
    }

    // 선택된 파일 업데이트
    selectedFiles = [...selectedFiles, ...validFiles];
    updateFileDisplay();
}

/**
 * 파일 타입 검증
 * @param {File} file - 검증할 파일
 * @returns {Object} - 검증 결과
 */
function validateFileType(file) {
    // MIME 타입 검증
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        return {
            valid: false,
            message: `지원되지 않는 파일 형식입니다. 허용된 형식: ${FILE_EXTENSIONS.join(', ')}`
        };
    }

    // 확장자 검증
    const fileName = file.name.toLowerCase();
    const hasValidExtension = FILE_EXTENSIONS.some(ext =>
        fileName.endsWith(ext)
    );

    if (!hasValidExtension) {
        return {
            valid: false,
            message: `유효하지 않은 파일 확장자입니다. 허용된 확장자: ${FILE_EXTENSIONS.join(', ')}`
        };
    }

    return { valid: true };
}

/**
 * 파일 목록 업데이트
 */
function updateFileDisplay() {
    if (selectedFiles.length === 0) {
        fileList.innerHTML = '<p class="text-gray-400">선택된 파일 없음</p>';
        return;
    }

    let html = `<p class="font-medium mb-1">선택된 파일 (${selectedFiles.length}개):</p><ul class="space-y-1">`;
    selectedFiles.forEach((file, index) => {
        html += `
        <li class="flex justify-between items-center bg-gray-50 p-2 rounded">
            <div class="flex items-center min-w-0">
                <span class="truncate">${file.name}</span>
                <span class="text-xs text-gray-500 ml-2">(${formatFileSize(file.size)})</span>
            </div>
            <button type="button" onclick="removeFile(${index})" class="text-red-500 hover:text-red-700 p-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
                </svg>
            </button>
        </li>`;
    });
    html += '</ul>';
    fileList.innerHTML = html;
}

/**
 * 파일 삭제
 * @param {number} index - 삭제할 파일 인덱스
 */
export function removeFile(index) {
    selectedFiles.splice(index, 1);
    updateFileDisplay();
}

/**
 * 파일 삭제 확인
 * @param {string} fileId - 삭제할 파일 ID
 */
export function confirmFileDelete(fileId) {
    if (confirm('이 파일을 정말 삭제하시겠습니까?')) {
        deleteFileIds.push(fileId);
        document.querySelector(`button[data-file-id="${fileId}"]`).closest('div').style.display = 'none';
    }
}

/**
 * 파일 크기 포맷팅
 * @param {number} bytes - 파일 크기 (바이트)
 * @returns {string} - 포맷된 파일 크기 문자열
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 드래그 오버 처리
 */
export function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.add('border-primary', 'bg-blue-50');
}

/**
 * 드래그 리브 처리
 */
export function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.remove('border-primary', 'bg-blue-50');
}

/**
 * 드롭 처리
 */
export function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    handleDragLeave(e);

    if (e.dataTransfer.files.length > 0) {
        processFiles(Array.from(e.dataTransfer.files));
    }
}

/**
 * 파일 오류 표시
 * @param {string} message - 오류 메시지
 */
function showFileError(message) {
    fileSizeError.textContent = message;
    fileSizeError.classList.remove('hidden');
    setTimeout(() => fileSizeError.classList.add('hidden'), 5000);
}

/**
 * 선택된 파일 반환
 * @returns {Array<File>} - 선택된 파일 배열
 */
export function getSelectedFiles() {
    return selectedFiles;
}

/**
 * 삭제할 파일 ID 반환
 * @returns {Array<string>} - 삭제할 파일 ID 배열
 */
export function getDeleteFileIds() {
    return deleteFileIds;
}

// 이벤트 리스너 등록
fileInput.addEventListener('change', handleFileInputChange);
dropZone.addEventListener('click', () => fileInput.click());
fileInput.setAttribute('accept', FILE_EXTENSIONS.join(','));