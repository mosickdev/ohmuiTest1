/**
 * ============================================
 * OHMUI AI 프롬프트 생성기 - 메인 JavaScript 파일
 * ============================================
 * 
 * 기능:
 * 1. 사이드바 토글 시스템 (축소/확장)
 * 2. 페이지 네비게이션 (프롬프트 생성, 프리셋 관리, 데이터 관리)
 * 3. 프리셋 관리 시스템
 * 4. Spring Boot API와 통신하여 드롭다운 옵션 로드
 * 5. 사용자 선택을 기반으로 프롬프트 생성
 * 6. UI 상호작용 및 사용자 경험 관리
 * 7. 사용자 계정 메뉴 관리
 * 
 * 프로젝트: OHMUI
 * 작성자: 프론트엔드 개발팀
 * 백엔드 연동: Spring Boot API 필요
 */

/**
 * ============================================
 * API 설정 및 엔드포인트 정의
 * ============================================
 * 백엔드 개발자 담당: 실제 서버 URL과 엔드포인트에 맞게 수정 필요
 */

// API 기본 URL (환경에 따라 수정 필요)
const API_BASE_URL = 'http://localhost:8080/api';

// API 엔드포인트 정의
const API_ENDPOINTS = {
    // 사용자 관련 API
    getUserProfile: '/user/profile',              // 사용자 프로필 조회
    logout: '/auth/logout',                       // 로그아웃
    
    // 드롭다운 옵션 조회 API들
    getNationalities: '/options/nationalities',    // 국적 목록
    getGenders: '/options/genders',               // 성별 목록
    getHairstyles: '/options/hairstyles',         // 헤어스타일 목록
    getOutfits: '/options/outfits',               // 의상 목록
    getActions: '/options/actions',               // 행동 목록
    getPoses: '/options/poses',                   // 포즈 목록
    getExpressions: '/options/expressions',       // 표정 목록
    getCameraAngles: '/options/camera-angles',    // 카메라 앵글 목록
    getDistances: '/options/distances',           // 카메라 거리 목록
    getLightings: '/options/lightings',           // 조명 목록
    
    // 프롬프트 생성 API
    generatePrompt: '/prompt/generate',           // 프롬프트 생성
    
    // 프리셋 관련 API
    getPresets: '/presets',                       // 프리셋 목록 조회
    savePreset: '/presets',                       // 프리셋 저장
    deletePreset: '/presets/{id}',                // 프리셋 삭제
    loadPreset: '/presets/{id}'                   // 프리셋 불러오기
};

/**
 * ============================================
 * 전역 변수
 * ============================================
 */
let isInitialized = false;
let loadingElement = null;
let isSidebarCollapsed = false;
let isMobile = window.innerWidth <= 768;
let currentPage = 'prompt-generator';

// 프리셋 관련 변수
let currentPresets = [];
let isPresetLoading = false;

/**
 * ============================================
 * 사이드바 토글 관련 기능
 * ============================================
 */

/**
 * 사이드바 토글 상태 관리 (축소/확장)
 */
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('sidebarToggle');
    
    if (isMobile) {
        // 모바일: 열기/닫기
        sidebar.classList.toggle('open');
        
        // 오버레이 추가/제거
        toggleMobileOverlay();
    } else {
        // 데스크톱: 축소/확장
        isSidebarCollapsed = !isSidebarCollapsed;
        sidebar.classList.toggle('collapsed', isSidebarCollapsed);
        
        // 로컬 스토리지에 상태 저장 (사용자 선호도 기억)
        localStorage.setItem('sidebarCollapsed', isSidebarCollapsed.toString());
    }
    
    // 햄버거 아이콘 애니메이션
    toggleBtn.classList.toggle('active');
}

/**
 * 모바일 오버레이 토글
 */
function toggleMobileOverlay() {
    let overlay = document.querySelector('.sidebar-overlay');
    
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        overlay.addEventListener('click', closeMobileSidebar);
        document.body.appendChild(overlay);
    }
    
    const sidebar = document.getElementById('sidebar');
    if (sidebar.classList.contains('open')) {
        overlay.style.display = 'block';
        setTimeout(() => overlay.classList.add('show'), 10);
    } else {
        overlay.classList.remove('show');
        setTimeout(() => overlay.style.display = 'none', 300);
    }
}

/**
 * 모바일에서 사이드바 닫기
 */
function closeMobileSidebar() {
    if (isMobile) {
        const sidebar = document.getElementById('sidebar');
        const toggleBtn = document.getElementById('sidebarToggle');
        
        sidebar.classList.remove('open');
        toggleBtn.classList.remove('active');
        
        // 오버레이 제거
        const overlay = document.querySelector('.sidebar-overlay');
        if (overlay) {
            overlay.classList.remove('show');
            setTimeout(() => overlay.style.display = 'none', 300);
        }
    }
}

/**
 * 화면 크기 변경 시 사이드바 상태 조정
 */
function handleResize() {
    const newIsMobile = window.innerWidth <= 768;
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('sidebarToggle');
    
    if (newIsMobile !== isMobile) {
        isMobile = newIsMobile;
        
        if (isMobile) {
            // 모바일 모드로 전환
            sidebar.classList.remove('collapsed');
            sidebar.classList.remove('open');
            toggleBtn.classList.remove('active');
            
            // 오버레이 제거
            const overlay = document.querySelector('.sidebar-overlay');
            if (overlay) {
                overlay.remove();
            }
        } else {
            // 데스크톱 모드로 전환
            sidebar.classList.remove('open');
            toggleBtn.classList.remove('active');
            
            // 저장된 축소 상태 복원
            const savedCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
            isSidebarCollapsed = savedCollapsed;
            sidebar.classList.toggle('collapsed', isSidebarCollapsed);
            
            // 오버레이 제거
            const overlay = document.querySelector('.sidebar-overlay');
            if (overlay) {
                overlay.remove();
            }
        }
    }
}

/**
 * 사이드바 이벤트 핸들러 설정
 */
function setupSidebarHandlers() {
    // 토글 버튼 클릭
    document.getElementById('sidebarToggle').addEventListener('click', function(e) {
        e.stopPropagation();
        toggleSidebar();
    });
    
    // ESC 키로 모바일 사이드바 닫기
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && isMobile) {
            closeMobileSidebar();
        }
    });
    
    // 화면 크기 변경 감지
    window.addEventListener('resize', handleResize);
    
    // 초기 화면 크기에 따른 설정
    handleResize();
    
    // 데스크톱에서 저장된 사이드바 상태 복원
    if (!isMobile) {
        const savedCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        if (savedCollapsed) {
            isSidebarCollapsed = true;
            document.getElementById('sidebar').classList.add('collapsed');
        }
    }
}

/**
 * ============================================
 * 페이지 네비게이션 관련 기능
 * ============================================
 */

/**
 * 페이지 전환 함수
 * @param {string} pageId - 전환할 페이지 ID
 */
function switchPage(pageId) {
    // 모든 페이지 숨기기
    document.querySelectorAll('.page-content').forEach(page => {
        page.style.display = 'none';
    });
    
    // 선택된 페이지 보이기
    const targetPage = document.getElementById(pageId + '-page');
    if (targetPage) {
        targetPage.style.display = 'block';
        currentPage = pageId;
    }
    
    // 네비게이션 상태 업데이트
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    const activeLink = document.querySelector(`[data-page="${pageId}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
    
    // 모바일에서 페이지 전환 시 사이드바 닫기
    if (isMobile) {
        setTimeout(() => closeMobileSidebar(), 300);
    }
}

/**
 * 네비게이션 활성화 처리
 */
function setupNavigationHandlers() {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const pageId = this.getAttribute('data-page');
            if (pageId) {
                switchPage(pageId);
            }
        });
    });
}

/**
 * ============================================
 * API 통신 함수들
 * ============================================
 */

/**
 * 공통 API 호출 함수
 * @param {string} url - API 엔드포인트 URL
 * @param {object} options - fetch 옵션 객체
 * @returns {Promise<object>} API 응답 데이터
 */
async function apiCall(url, options = {}) {
    try {
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        };

        const response = await fetch(`${API_BASE_URL}${url}`, {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        return data;
        
    } catch (error) {
        console.error(`API 호출 실패 [${url}]:`, error);
        throw error;
    }
}

/**
 * 드롭다운 옵션 데이터를 서버에서 로드하는 함수
 * 백엔드 개발자: 각 엔드포인트에서 다음 형태의 JSON 반환 필요
 * {
 *   "success": true,
 *   "data": [
 *     {"value": "Korean", "label": "한국"},
 *     {"value": "American", "label": "미국"}
 *   ]
 * }
 */
async function loadDropdownOptions() {
    try {
        showLoading(true, '옵션 데이터를 불러오는 중...');
        
        // 모든 드롭다운 옵션을 병렬로 로드
        const [
            nationalities,
            genders,
            hairstyles,
            outfits,
            actions,
            poses,
            expressions,
            cameraAngles,
            distances,
            lightings
        ] = await Promise.all([
            apiCall(API_ENDPOINTS.getNationalities),
            apiCall(API_ENDPOINTS.getGenders),
            apiCall(API_ENDPOINTS.getHairstyles),
            apiCall(API_ENDPOINTS.getOutfits),
            apiCall(API_ENDPOINTS.getActions),
            apiCall(API_ENDPOINTS.getPoses),
            apiCall(API_ENDPOINTS.getExpressions),
            apiCall(API_ENDPOINTS.getCameraAngles),
            apiCall(API_ENDPOINTS.getDistances),
            apiCall(API_ENDPOINTS.getLightings)
        ]);
        
        // 각 드롭다운에 옵션 채우기
        populateDropdown('nationality', nationalities.data);
        populateDropdown('gender', genders.data);
        populateDropdown('hairstyle', hairstyles.data);
        populateDropdown('outfit', outfits.data);
        populateDropdown('action', actions.data);
        populateDropdown('pose', poses.data);
        populateDropdown('expression', expressions.data);
        populateDropdown('camera', cameraAngles.data);
        populateDropdown('distance', distances.data);
        populateDropdown('lighting', lightings.data);
        
        console.log('드롭다운 옵션 로드 완료');
        showMessage('옵션 데이터가 성공적으로 로드되었습니다.', 'success');
        
    } catch (error) {
        console.error('드롭다운 옵션 로드 실패:', error);
        showMessage('옵션 데이터 로드에 실패했습니다. 기본 옵션을 사용합니다.', 'error');
    } finally {
        showLoading(false);
    }
}

/**
 * 드롭다운에 옵션을 채우는 함수
 * @param {string} category - 카테고리명 (nationality, gender 등)
 * @param {Array} options - 옵션 배열 [{value, label}, ...]
 */
function populateDropdown(category, options) {
    const select = document.querySelector(`select[data-category="${category}"]`);
    if (!select) {
        console.warn(`드롭다운을 찾을 수 없습니다: ${category}`);
        return;
    }
    
    // 기존 첫 번째 옵션("선택하세요") 보존
    const defaultOption = select.querySelector('option[value=""]');
    select.innerHTML = '';
    if (defaultOption) {
        select.appendChild(defaultOption);
    }
    
    // 서버에서 받은 옵션들 추가
    options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option.value;
        optionElement.textContent = option.label;
        select.appendChild(optionElement);
    });
}

/**
 * ============================================
 * 프리셋 관리 기능
 * ============================================
 */

/**
 * 프리셋 목록을 서버에서 로드하는 함수
 */
async function loadPresets() {
    try {
        isPresetLoading = true;
        
        // 서버에서 프리셋 목록 조회
        // const response = await apiCall(API_ENDPOINTS.getPresets);
        // currentPresets = response.data;
        
        // 임시 프리셋 데이터 (서버 연동 전)
        currentPresets = [
            {
                id: 'school-girl',
                name: '교복 소녀',
                description: '한국 여학생 교복 스타일',
                settings: {
                    nationality: 'Korean',
                    gender: 'girl',
                    hairstyle: 'twin tails',
                    outfit: 'school uniform',
                    action: 'standing',
                    pose: 'peace sign with hand',
                    expression: 'smiling',
                    camera: 'eye level',
                    lighting: 'natural lighting'
                }
            },
            {
                id: 'business-woman',
                name: '비즈니스 우먼',
                description: '전문적인 비즈니스 여성',
                settings: {
                    nationality: 'Korean',
                    gender: 'woman',
                    hairstyle: 'short bob cut',
                    outfit: 'business suit',
                    action: 'standing',
                    pose: 'hands on hips',
                    expression: 'serious',
                    camera: 'eye level',
                    lighting: 'soft, diffused studio lighting'
                }
            },
            {
                id: 'casual-style',
                name: '캐주얼 스타일',
                description: '편안한 일상 스타일',
                settings: {
                    nationality: 'Korean',
                    gender: 'woman',
                    hairstyle: 'long straight hair',
                    outfit: 'casual outfit',
                    action: 'walking',
                    pose: 'one hand on hip',
                    expression: 'smiling',
                    camera: 'eye level',
                    lighting: 'natural lighting'
                }
            },
            {
                id: 'anime-character',
                name: '애니메이션 캐릭터',
                description: '에반겔리온 아스카 스타일',
                settings: {
                    nationality: 'Japanese',
                    gender: 'girl',
                    hairstyle: 'twin tails',
                    outfit: 'red pilot suit inspired by Asuka Langley from Evangelion',
                    action: 'standing',
                    pose: 'crossed arms',
                    expression: 'serious',
                    camera: 'low angle',
                    lighting: 'dramatic lighting'
                }
            }
        ];
        
        // 프리셋 드롭다운 업데이트
        updatePresetDropdown();
        
        console.log('프리셋 로드 완료');
        
    } catch (error) {
        console.error('프리셋 로드 실패:', error);
        showMessage('프리셋 로드에 실패했습니다.', 'error');
    } finally {
        isPresetLoading = false;
    }
}

/**
 * 프리셋 드롭다운 업데이트
 */
function updatePresetDropdown() {
    const presetSelect = document.getElementById('presetSelect');
    if (!presetSelect) return;
    
    // 기존 옵션 제거 (첫 번째 기본 옵션 제외)
    const defaultOption = presetSelect.querySelector('option[value=""]');
    presetSelect.innerHTML = '';
    if (defaultOption) {
        presetSelect.appendChild(defaultOption);
    }
    
    // 프리셋 옵션 추가
    currentPresets.forEach(preset => {
        const option = document.createElement('option');
        option.value = preset.id;
        option.textContent = preset.name;
        option.title = preset.description;
        presetSelect.appendChild(option);
    });
}

/**
 * 프리셋 적용 함수
 * @param {string} presetId - 적용할 프리셋 ID
 */
function applyPreset(presetId) {
    const preset = currentPresets.find(p => p.id === presetId);
    if (!preset) {
        console.warn(`프리셋을 찾을 수 없습니다: ${presetId}`);
        return;
    }
    
    try {
        // 모든 폼 컨트롤에 프리셋 값 적용
        Object.entries(preset.settings).forEach(([category, value]) => {
            const select = document.querySelector(`select[data-category="${category}"]`);
            if (select) {
                select.value = value;
                
                // 해당 카테고리의 체크박스도 활성화
                const checkbox = document.querySelector(`#use-${category}`);
                if (checkbox) {
                    checkbox.checked = true;
                }
            }
        });
        
        // 프롬프트 미리보기 업데이트
        updatePreview();
        
        showMessage(`프리셋 "${preset.name}"이 적용되었습니다.`, 'success');
        
    } catch (error) {
        console.error('프리셋 적용 실패:', error);
        showMessage('프리셋 적용에 실패했습니다.', 'error');
    }
}

/**
 * 현재 설정을 프리셋으로 저장
 * @param {string} name - 프리셋 이름
 * @param {string} description - 프리셋 설명
 */
async function saveCurrentAsPreset(name, description = '') {
    try {
        // 현재 설정 수집
        const settings = {};
        
        document.querySelectorAll('select[data-category]').forEach(select => {
            const category = select.getAttribute('data-category');
            const checkbox = document.querySelector(`#use-${category}`);
            
            if (checkbox && checkbox.checked && select.value) {
                settings[category] = select.value;
            }
        });
        
        // 새 프리셋 객체 생성
        const newPreset = {
            id: `preset-${Date.now()}`,
            name: name,
            description: description,
            settings: settings,
            createdAt: new Date().toISOString()
        };
        
        // 서버에 저장 요청
        // await apiCall(API_ENDPOINTS.savePreset, {
        //     method: 'POST',
        //     body: JSON.stringify(newPreset)
        // });
        
        // 임시로 로컬에 저장
        currentPresets.push(newPreset);
        updatePresetDropdown();
        
        showMessage(`프리셋 "${name}"이 저장되었습니다.`, 'success');
        
    } catch (error) {
        console.error('프리셋 저장 실패:', error);
        showMessage('프리셋 저장에 실패했습니다.', 'error');
    }
}

/**
 * 프리셋 관련 이벤트 핸들러 설정
 */
function setupPresetHandlers() {
    // 프리셋 선택 이벤트
    const presetSelect = document.getElementById('presetSelect');
    if (presetSelect) {
        presetSelect.addEventListener('change', function() {
            const presetId = this.value;
            if (presetId) {
                applyPreset(presetId);
            }
        });
    }
    
    // 프리셋 저장 버튼 클릭
    const savePresetBtn = document.getElementById('savePresetBtn');
    if (savePresetBtn) {
        savePresetBtn.addEventListener('click', function() {
            showPresetModal();
        });
    }
    
    // 모달 관련 이벤트
    setupModalHandlers();
}

/**
 * 프리셋 저장 모달 표시
 */
function showPresetModal() {
    const modal = document.getElementById('presetModal');
    if (modal) {
        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('show'), 10);
        
        // 입력 필드 초기화
        document.getElementById('presetName').value = '';
        document.getElementById('presetDescription').value = '';
        
        // 첫 번째 입력 필드에 포커스
        document.getElementById('presetName').focus();
    }
}

/**
 * 프리셋 저장 모달 숨기기
 */
function hidePresetModal() {
    const modal = document.getElementById('presetModal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => modal.style.display = 'none', 300);
    }
}

/**
 * 모달 관련 이벤트 핸들러 설정
 */
function setupModalHandlers() {
    // 모달 닫기 버튼
    const modalClose = document.getElementById('modalClose');
    if (modalClose) {
        modalClose.addEventListener('click', hidePresetModal);
    }
    
    // 취소 버튼
    const modalCancel = document.getElementById('modalCancel');
    if (modalCancel) {
        modalCancel.addEventListener('click', hidePresetModal);
    }
    
    // 저장 버튼
    const modalSave = document.getElementById('modalSave');
    if (modalSave) {
        modalSave.addEventListener('click', function() {
            const name = document.getElementById('presetName').value.trim();
            const description = document.getElementById('presetDescription').value.trim();
            
            if (!name) {
                showMessage('프리셋 이름을 입력해주세요.', 'error');
                return;
            }
            
            // 중복 이름 체크
            if (currentPresets.some(p => p.name === name)) {
                showMessage('이미 존재하는 프리셋 이름입니다.', 'error');
                return;
            }
            
            saveCurrentAsPreset(name, description);
            hidePresetModal();
        });
    }
    
    // 모달 오버레이 클릭 시 닫기
    const modalOverlay = document.getElementById('presetModal');
    if (modalOverlay) {
        modalOverlay.addEventListener('click', function(e) {
            if (e.target === this) {
                hidePresetModal();
            }
        });
    }
    
    // ESC 키로 모달 닫기
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            hidePresetModal();
        }
    });
}

/**
 * ============================================
 * UI 유틸리티 함수들
 * ============================================
 */

/**
 * 로딩 상태 표시/숨김 함수
 * @param {boolean} show - 로딩 표시 여부
 * @param {string} message - 로딩 메시지
 */
function showLoading(show, message = '처리 중...') {
    if (!loadingElement) {
        loadingElement = document.createElement('div');
        loadingElement.className = 'loading-overlay';
        loadingElement.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner">
                    <i class="fas fa-spinner"></i>
                </div>
                <p class="loading-text">${message}</p>
            </div>
        `;
        document.body.appendChild(loadingElement);
    } else {
        loadingElement.querySelector('.loading-text').textContent = message;
    }
    
    loadingElement.style.display = show ? 'flex' : 'none';
}

/**
 * 메시지 표시 함수
 * @param {string} message - 표시할 메시지
 * @param {string} type - 메시지 타입 ('success' 또는 'error')
 */
function showMessage(message, type = 'info') {
    const messageElement = document.createElement('div');
    messageElement.className = `${type}-message show`;
    messageElement.textContent = message;
    
    // 메시지를 콘텐츠 카드 상단에 추가
    const contentCard = document.querySelector('.content-card');
    contentCard.insertBefore(messageElement, contentCard.firstChild);
    
    // 3초 후 자동 제거
    setTimeout(() => {
        messageElement.remove();
    }, 3000);
}

/**
 * ============================================
 * 사용자 계정 관련 기능
 * ============================================
 */

/**
 * 사용자 정보를 서버에서 불러오는 함수
 * 백엔드 개발자: GET /api/user/profile 엔드포인트 구현 필요
 * 응답 형태: { "success": true, "data": { "name": "홍길동", "email": "user@example.com", "avatar": "url" } }
 */
async function loadUserProfile() {
    try {
        // const response = await apiCall(API_ENDPOINTS.getUserProfile);
        // if (response.success) {
        //     document.getElementById('userName').textContent = response.data.name;
        //     document.getElementById('userEmail').textContent = response.data.email;
        //     
        //     // 아바타 이미지가 있다면 설정
        //     if (response.data.avatar) {
        //         const avatarIcon = document.querySelector('.user-avatar i');
        //         avatarIcon.outerHTML = `<img src="${response.data.avatar}" alt="User Avatar" style="width: 2rem; height: 2rem; border-radius: 50%; object-fit: cover;">`;
        //     }
        // }
        
        // 임시 사용자 정보 (서버 연동 전)
        console.log('사용자 프로필 로드됨');
    } catch (error) {
        console.error('사용자 프로필 로드 실패:', error);
    }
}

/**
 * 사용자 드롭다운 메뉴 토글
 */
function toggleUserDropdown() {
    const userProfile = document.getElementById('userProfile');
    const userDropdown = document.getElementById('userDropdown');
    
    const isActive = userProfile.classList.contains('active');
    
    if (isActive) {
        userProfile.classList.remove('active');
        userDropdown.classList.remove('show');
    } else {
        userProfile.classList.add('active');
        userDropdown.classList.add('show');
    }
}

/**
 * 드롭다운 외부 클릭 시 닫기
 */
function handleOutsideClick(event) {
    const userAccountSection = document.querySelector('.user-account-section');
    const userProfile = document.getElementById('userProfile');
    const userDropdown = document.getElementById('userDropdown');
    
    if (!userAccountSection.contains(event.target)) {
        userProfile.classList.remove('active');
        userDropdown.classList.remove('show');
    }
}

/**
 * 계정 관련 이벤트 핸들러들
 */
function setupAccountEventHandlers() {
    // 사용자 프로필 클릭 이벤트
    document.getElementById('userProfile').addEventListener('click', function(e) {
        e.stopPropagation();
        toggleUserDropdown();
    });
    
    // 외부 클릭 시 드롭다운 닫기
    document.addEventListener('click', handleOutsideClick);
    
    // 계정 설정 클릭
    document.getElementById('accountSettings').addEventListener('click', function(e) {
        e.preventDefault();
        showMessage('계정 설정 페이지로 이동합니다.', 'success');
        // 실제 구현 시: window.location.href = '/account/settings';
    });
    
    // 내 프로젝트 클릭
    document.getElementById('myProjects').addEventListener('click', function(e) {
        e.preventDefault();
        showMessage('내 프로젝트 페이지로 이동합니다.', 'success');
        // 실제 구현 시: window.location.href = '/projects';
    });
    
    // 사용 내역 클릭
    document.getElementById('usageHistory').addEventListener('click', function(e) {
        e.preventDefault();
        showMessage('사용 내역 페이지로 이동합니다.', 'success');
        // 실제 구현 시: window.location.href = '/usage-history';
    });
    
    // 구독 관리 클릭
    document.getElementById('subscription').addEventListener('click', function(e) {
        e.preventDefault();
        showMessage('구독 관리 페이지로 이동합니다.', 'success');
        // 실제 구현 시: window.location.href = '/subscription';
    });
    
    // 도움말 클릭
    document.getElementById('helpSupport').addEventListener('click', function(e) {
        e.preventDefault();
        showMessage('도움말 페이지로 이동합니다.', 'success');
        // 실제 구현 시: window.open('/help', '_blank');
    });
    
    // 로그아웃 클릭
    document.getElementById('logout').addEventListener('click', function(e) {
        e.preventDefault();
        handleLogout();
    });
}

/**
 * 로그아웃 처리 함수
 * 백엔드 개발자: POST /api/auth/logout 엔드포인트 구현 필요
 */
async function handleLogout() {
    if (confirm('정말 로그아웃하시겠습니까?')) {
        try {
            showLoading(true, '로그아웃 중...');
            
            // 서버에 로그아웃 요청
            // await apiCall(API_ENDPOINTS.logout, { method: 'POST' });
            
            // 로컬 저장소 정리
            localStorage.removeItem('authToken');
            localStorage.removeItem('sidebarCollapsed');
            sessionStorage.clear();
            
            showMessage('성공적으로 로그아웃되었습니다.', 'success');
            
            // 로그인 페이지로 리다이렉트
            setTimeout(() => {
                window.location.href = '/login';
            }, 1500);
            
        } catch (error) {
            console.error('로그아웃 실패:', error);
            showMessage('로그아웃 중 오류가 발생했습니다.', 'error');
        } finally {
            showLoading(false);
        }
    }
}

/**
 * ============================================
 * 프롬프트 생성 관련 함수
 * ============================================
 */

/**
 * 클라이언트 사이드에서 임시로 프롬프트를 생성하는 함수
 * (서버 API가 준비되기 전 테스트용)
 */
function generatePromptLocal() {
    let promptParts = [];
    
    // 모든 폼 그룹 순회
    document.querySelectorAll('.form-group').forEach(group => {
        const select = group.querySelector('select');
        const checkbox = group.querySelector('input[type="checkbox"]');
        
        if (select && checkbox && checkbox.checked && select.value) {
            promptParts.push(select.value);
        }
    });
    
    return promptParts.join(', ');
}

/**
 * 서버에서 프롬프트를 생성하는 함수
 * 백엔드 개발자: POST /api/prompt/generate 엔드포인트 구현 필요
 * 
 * 요청 형태:
 * {
 *   "selections": {
 *     "nationality": "Korean",
 *     "gender": "woman",
 *     "hairstyle": "long straight hair",
 *     // ... 기타 선택된 옵션들
 *   }
 * }
 * 
 * 응답 형태:
 * {
 *   "success": true,
 *   "data": {
 *     "prompt": "Korean woman, long straight hair, ..."
 *   }
 * }
 */
async function generatePromptFromServer() {
    try {
        // 현재 선택된 값들 수집
        const selections = {};
        
        document.querySelectorAll('.form-group').forEach(group => {
            const select = group.querySelector('select');
            const checkbox = group.querySelector('input[type="checkbox"]');
            
            if (select && checkbox && checkbox.checked && select.value) {
                const category = select.getAttribute('data-category');
                if (category) {
                    selections[category] = select.value;
                }
            }
        });
        
        console.log('서버로 전송할 데이터:', selections);
        
        // 서버에 프롬프트 생성 요청
        const response = await apiCall(API_ENDPOINTS.generatePrompt, {
            method: 'POST',
            body: JSON.stringify({ selections })
        });
        
        if (response.success) {
            return response.data.prompt;
        } else {
            throw new Error(response.message || '프롬프트 생성 실패');
        }
        
    } catch (error) {
        console.error('서버 프롬프트 생성 실패:', error);
        console.log('클라이언트 사이드 생성으로 전환');
        // 서버 실패 시 클라이언트 사이드 생성으로 폴백
        return generatePromptLocal();
    }
}

/**
 * 프롬프트 미리보기 업데이트 함수
 */
async function updatePreview() {
    const promptTextarea = document.getElementById('promptPreview');
    
    // 사용자가 직접 편집 중이 아닐 때만 자동 업데이트
    if (!promptTextarea.matches(':focus')) {
        try {
            const prompt = await generatePromptFromServer();
            promptTextarea.value = prompt || '';
        } catch (error) {
            console.error('프롬프트 업데이트 실패:', error);
            const localPrompt = generatePromptLocal();
            promptTextarea.value = localPrompt || '';
        }
    }
}

/**
 * ============================================
 * 이벤트 리스너 등록
 * ============================================
 */

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', async function() {
    console.log('OHMUI 프롬프트 생성기 초기화 시작');
    
    try {
        // 사이드바, 네비게이션 및 계정 이벤트 핸들러 설정
        setupSidebarHandlers();
        setupNavigationHandlers();
        setupAccountEventHandlers();
        setupPresetHandlers();
        
        // 사용자 프로필 로드
        await loadUserProfile();
        
        // 프리셋 로드
        await loadPresets();
        
        // 서버에서 드롭다운 옵션들 로드 (선택사항)
        try {
            await loadDropdownOptions();
        } catch (error) {
            console.log('서버 옵션 로드 실패, 기본 옵션 사용:', error);
        }
        
        // 모든 select와 checkbox 변경 시 미리보기 업데이트
        document.querySelectorAll('select, input[type="checkbox"]').forEach(element => {
            element.addEventListener('change', updatePreview);
        });
        
        // 초기 프롬프트 생성
        await updatePreview();
        
        isInitialized = true;
        console.log('OHMUI 초기화 완료');
        
    } catch (error) {
        console.error('초기화 중 오류 발생:', error);
        showMessage('일부 기능 초기화에 실패했습니다. 기본 기능은 사용 가능합니다.', 'error');
    }
});

// 프롬프트 생성 버튼 클릭 이벤트
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('generateBtn').addEventListener('click', async function() {
        try {
            // 버튼 비활성화 및 로딩 표시
            this.disabled = true;
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 생성 중...';
            
            // 서버에서 프롬프트 생성
            const prompt = await generatePromptFromServer();
            
            // 텍스트 영역에 결과 표시
            const promptTextarea = document.getElementById('promptPreview');
            promptTextarea.value = prompt;
            
            // 성공 피드백
            this.innerHTML = '<i class="fas fa-check"></i> 생성 완료!';
            showMessage('프롬프트가 성공적으로 생성되었습니다.', 'success');
            
            setTimeout(() => {
                this.innerHTML = '<i class="fas fa-magic"></i> 프롬프트 생성';
            }, 2000);
            
        } catch (error) {
            console.error('프롬프트 생성 실패:', error);
            showMessage('프롬프트 생성에 실패했습니다. 다시 시도해주세요.', 'error');
            
            // 버튼 복원
            this.innerHTML = '<i class="fas fa-magic"></i> 프롬프트 생성';
        } finally {
            // 버튼 활성화
            this.disabled = false;
            
            // 버튼 애니메이션
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        }
    });
});

// 프롬프트 복사 버튼
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('copyBtn').addEventListener('click', async function() {
        const promptText = document.getElementById('promptPreview').value;
        
        if (promptText && promptText.trim()) {
            try {
                await navigator.clipboard.writeText(promptText);
                
                // 성공 피드백
                const originalText = this.innerHTML;
                this.innerHTML = '<i class="fas fa-check"></i> 복사됨!';
                this.style.background = 'linear-gradient(135deg, #28a745, #20c997)';
                
                showMessage('프롬프트가 클립보드에 복사되었습니다.', 'success');
                
                setTimeout(() => {
                    this.innerHTML = originalText;
                    this.style.background = '';
                }, 2000);
            } catch (err) {
                console.error('클립보드 복사 실패:', err);
                showMessage('클립보드 복사에 실패했습니다.', 'error');
            }
        } else {
            showMessage('복사할 프롬프트가 없습니다.', 'error');
        }
    });
});

// 초기화 버튼
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('resetBtn').addEventListener('click', function() {
        if (confirm('모든 설정을 초기화하시겠습니까?')) {
            // 모든 select 초기화
            document.querySelectorAll('select').forEach(select => {
                if (select.id !== 'presetSelect') { // 프리셋 선택은 제외
                    select.value = '';
                }
            });
            
            // 프리셋 선택 초기화
            document.getElementById('presetSelect').value = '';
            
            // 모든 checkbox 초기화
            document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
                checkbox.checked = false;
            });
            
            // 기본 체크박스들 다시 체크
            const defaultCheckedIds = [
                'use-nationality', 'use-gender', 'use-hairstyle', 'use-outfit', 
                'use-action', 'use-pose', 'use-camera', 'use-lighting'
            ];
            
            defaultCheckedIds.forEach(id => {
                const checkbox = document.getElementById(id);
                if (checkbox) checkbox.checked = true;
            });
            
            // 프롬프트 미리보기 업데이트
            updatePreview();
            
            showMessage('모든 설정이 초기화되었습니다.', 'success');
        }
    });
});

/**
 * ============================================
 * 사이드바 상태 관리 유틸리티
 * ============================================
 */

/**
 * 사이드바 현재 상태 반환
 * @returns {object} 사이드바 상태 정보
 */
function getSidebarState() {
    const sidebar = document.getElementById('sidebar');
    return {
        isCollapsed: sidebar.classList.contains('collapsed'),
        isOpen: sidebar.classList.contains('open'),
        isMobile: isMobile
    };
}

/**
 * 사이드바 상태 강제 설정
 * @param {boolean} collapsed - 축소 상태 여부 (데스크톱)
 * @param {boolean} open - 열림 상태 여부 (모바일)
 */
function setSidebarState(collapsed = false, open = false) {
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('sidebarToggle');
    
    if (isMobile) {
        sidebar.classList.toggle('open', open);
        toggleBtn.classList.toggle('active', open);
        if (open) {
            toggleMobileOverlay();
        }
    } else {
        isSidebarCollapsed = collapsed;
        sidebar.classList.toggle('collapsed', collapsed);
        localStorage.setItem('sidebarCollapsed', collapsed.toString());
    }
}

/**
 * ============================================
 * 키보드 단축키 지원
 * ============================================
 */

/**
 * 키보드 단축키 이벤트 핸들러
 */
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + B: 사이드바 토글
        if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
            e.preventDefault();
            toggleSidebar();
        }
        
        // Ctrl/Cmd + Enter: 프롬프트 생성
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            if (currentPage === 'prompt-generator') {
                document.getElementById('generateBtn').click();
            }
        }
        
        // Ctrl/Cmd + Shift + C: 프롬프트 복사
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
            e.preventDefault();
            if (currentPage === 'prompt-generator') {
                document.getElementById('copyBtn').click();
            }
        }
        
        // Ctrl/Cmd + Shift + R: 초기화
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'R') {
            e.preventDefault();
            if (currentPage === 'prompt-generator') {
                document.getElementById('resetBtn').click();
            }
        }
        
        // Ctrl/Cmd + S: 프리셋 저장
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            if (currentPage === 'prompt-generator') {
                showPresetModal();
            }
        }
        
        // 숫자 키 1-3: 페이지 전환
        if (e.key >= '1' && e.key <= '3' && !e.ctrlKey && !e.metaKey && !e.altKey) {
            const pages = ['prompt-generator', 'preset-management', 'data-management'];
            const pageIndex = parseInt(e.key) - 1;
            if (pageIndex < pages.length) {
                e.preventDefault();
                switchPage(pages[pageIndex]);
            }
        }
    });
}

/**
 * ============================================
 * 접근성 개선 함수들
 * ============================================
 */

/**
 * 접근성을 위한 ARIA 속성 설정
 */
function setupAccessibility() {
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('sidebarToggle');
    const mainContent = document.getElementById('mainContent');
    
    // ARIA 속성 설정
    sidebar.setAttribute('role', 'navigation');
    sidebar.setAttribute('aria-label', '사이드바 네비게이션');
    
    toggleBtn.setAttribute('aria-label', '사이드바 토글');
    toggleBtn.setAttribute('aria-expanded', 'true');
    
    mainContent.setAttribute('role', 'main');
    mainContent.setAttribute('aria-label', '메인 콘텐츠');
    
    // 프리셋 관련 ARIA 속성
    const presetSelect = document.getElementById('presetSelect');
    if (presetSelect) {
        presetSelect.setAttribute('aria-label', '프리셋 선택');
    }
    
    const savePresetBtn = document.getElementById('savePresetBtn');
    if (savePresetBtn) {
        savePresetBtn.setAttribute('aria-label', '현재 설정을 프리셋으로 저장');
    }
    
    // 사이드바 상태 변경 시 ARIA 속성 업데이트
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const isCollapsed = sidebar.classList.contains('collapsed');
                const isOpen = sidebar.classList.contains('open');
                
                if (isMobile) {
                    toggleBtn.setAttribute('aria-expanded', isOpen.toString());
                } else {
                    toggleBtn.setAttribute('aria-expanded', (!isCollapsed).toString());
                }
            }
        });
    });
    
    observer.observe(sidebar, { attributes: true, attributeFilter: ['class'] });
}

/**
 * ============================================
 * 성능 최적화 함수들
 * ============================================
 */

/**
 * 디바운스 함수
 * @param {Function} func - 실행할 함수
 * @param {number} wait - 대기 시간 (ms)
 * @returns {Function} 디바운스된 함수
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * 스로틀 함수
 * @param {Function} func - 실행할 함수
 * @param {number} limit - 제한 시간 (ms)
 * @returns {Function} 스로틀된 함수
 */
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// 리사이즈 이벤트 최적화
const optimizedHandleResize = debounce(handleResize, 250);
window.removeEventListener('resize', handleResize);
window.addEventListener('resize', optimizedHandleResize);

// 프롬프트 미리보기 업데이트 최적화
const optimizedUpdatePreview = debounce(updatePreview, 500);

/**
 * ============================================
 * 초기화 및 설정 완료
 * ============================================
 */

// 키보드 단축키 및 접근성 설정
document.addEventListener('DOMContentLoaded', function() {
    setupKeyboardShortcuts();
    setupAccessibility();
    
    // 최적화된 이벤트 리스너로 교체
    document.querySelectorAll('select, input[type="checkbox"]').forEach(element => {
        element.addEventListener('change', optimizedUpdatePreview);
    });
});

/**
 * ============================================
 * 개발 모드 디버깅 및 유틸리티
 * ============================================
 */

// 개발 모드에서 디버깅 정보 출력
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('🚀 OHMUI 개발 모드 활성화');
    console.log('📱 모바일 모드:', isMobile);
    console.log('📐 화면 크기:', window.innerWidth + 'x' + window.innerHeight);
    console.log('🎯 사이드바 상태:', getSidebarState());
    console.log('📄 현재 페이지:', currentPage);
    
    // 전역 디버깅 함수 노출
    window.OHMUI_DEBUG = {
        getSidebarState,
        setSidebarState,
        toggleSidebar,
        showMessage,
        showLoading,
        switchPage,
        applyPreset,
        saveCurrentAsPreset,
        currentPresets,
        generatePromptLocal,
        updatePreview
    };
    
    // 개발 모드용 콘솔 명령어 안내
    console.log(`
    🛠️ 개발 모드 디버깅 명령어:
    
    OHMUI_DEBUG.switchPage('preset-management') - 페이지 전환
    OHMUI_DEBUG.applyPreset('school-girl') - 프리셋 적용
    OHMUI_DEBUG.showMessage('테스트 메시지', 'success') - 메시지 표시
    OHMUI_DEBUG.toggleSidebar() - 사이드바 토글
    OHMUI_DEBUG.currentPresets - 현재 프리셋 목록 확인
    `);
}

/**
 * ============================================
 * 백엔드 개발자를 위한 API 명세서 업데이트
 * ============================================
 * 
 * 1. 사용자 관련 API
 *    - GET /api/user/profile
 *      응답: { "success": true, "data": { "name": "홍길동", "email": "user@example.com", "avatar": "url" } }
 *    - POST /api/auth/logout
 *      응답: { "success": true, "message": "로그아웃 성공" }
 * 
 * 2. 드롭다운 옵션 조회 API들
 *    - GET /api/options/{category}
 *      응답: { "success": true, "data": [{"value": "Korean", "label": "한국"}] }
 * 
 * 3. 프롬프트 생성 API
 *    - POST /api/prompt/generate
 *      요청: { "selections": {"nationality": "Korean", "gender": "woman", ...} }
 *      응답: { "success": true, "data": {"prompt": "생성된 프롬프트"} }
 * 
 * 4. 프리셋 관련 API (신규 추가)
 *    - GET /api/presets
 *      응답: { "success": true, "data": [{"id": "preset-1", "name": "교복 소녀", "description": "...", "settings": {...}}] }
 *    - POST /api/presets
 *      요청: { "name": "프리셋명", "description": "설명", "settings": {...} }
 *      응답: { "success": true, "data": {"id": "preset-123", "message": "프리셋 저장 성공"} }
 *    - GET /api/presets/{id}
 *      응답: { "success": true, "data": {"id": "preset-1", "name": "...", "settings": {...}} }
 *    - DELETE /api/presets/{id}
 *      응답: { "success": true, "message": "프리셋 삭제 성공" }
 * 
 * 5. 에러 응답 형태
 *    - { "success": false, "message": "에러 메시지", "code": "ERROR_CODE" }
 * 
 * 6. CORS 설정 필요
 *    - Access-Control-Allow-Origin: 프론트엔드 도메인
 *    - Access-Control-Allow-Methods: GET, POST, PUT, DELETE
 *    - Access-Control-Allow-Headers: Content-Type, Authorization
 * 
 * 7. 인증 관련
 *    - JWT 토큰 사용 권장
 *    - Authorization: Bearer {token} 헤더로 전송
 *    - 토큰 만료 시 401 상태 코드 반환
 * 
 * 8. 데이터베이스 스키마 제안 (프리셋 테이블)
 *    CREATE TABLE presets (
 *        id VARCHAR(255) PRIMARY KEY,
 *        user_id VARCHAR(255) NOT NULL,
 *        name VARCHAR(100) NOT NULL,
 *        description TEXT,
 *        settings JSON NOT NULL,
 *        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 *        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 *        INDEX idx_user_id (user_id),
 *        INDEX idx_created_at (created_at)
 *    );
 * 
 * ============================================
 */