// 전역 변수
let isLoggedIn = false; // 초기 상태를 false로 설정
let isSidebarCollapsed = false;
let isMobile = window.innerWidth <= 768;
let currentPage = 'prompt-generator';

// 로그인 상태 토글 함수
function toggleLoginState() {
    isLoggedIn = !isLoggedIn;
    updateUIForLoginState();
}

// 로그인 상태에 따른 UI 업데이트
function updateUIForLoginState() {
    const body = document.body;
    const loginSection = document.getElementById('loginSection');
    const userProfile = document.getElementById('userProfile');
    const loginNotice = document.getElementById('loginNotice');
    
    if (isLoggedIn) {
        body.classList.add('logged-in');
        if (loginSection) loginSection.style.display = 'none';
        if (userProfile) userProfile.style.display = 'flex';
        if (loginNotice) loginNotice.style.display = 'none';
    } else {
        body.classList.remove('logged-in');
        if (loginSection) loginSection.style.display = 'block';
        if (userProfile) userProfile.style.display = 'none';
        if (loginNotice) loginNotice.style.display = 'block';
    }
}

// 로그인 모달 표시
function showLoginModal() {
    const modal = document.getElementById('loginModal');
    const loginId = document.getElementById('loginId');
    const loginPassword = document.getElementById('loginPassword');
    
    if (modal) {
        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('show'), 10);
        
        // 입력 필드 초기화 및 포커스
        if (loginId) loginId.value = '';
        if (loginPassword) loginPassword.value = '';
        if (loginId) loginId.focus();
    }
}

// 로그인 모달 숨기기
function hideLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => modal.style.display = 'none', 300);
    }
}

// 로그인 처리 함수
function handleLogin() {
    const loginIdInput = document.getElementById('loginId');
    const loginPasswordInput = document.getElementById('loginPassword');
    
    if (!loginIdInput || !loginPasswordInput) {
        showMessage('로그인 폼을 찾을 수 없습니다.', 'error');
        return;
    }
    
    const loginId = loginIdInput.value.trim();
    const loginPassword = loginPasswordInput.value.trim();
    
    // 유효성 검사
    if (!loginId || !loginPassword) {
        showMessage('아이디와 비밀번호를 입력해주세요.', 'error');
        return;
    }
    
    // 로그인 검증 (admin / 1234)
    if (loginId === 'admin' && loginPassword === '1234') {
        hideLoginModal();
        toggleLoginState();
        showMessage('로그인에 성공했습니다!', 'success');
    } else {
        showMessage('아이디 또는 비밀번호가 올바르지 않습니다.', 'error');
    }
}

// 로그아웃 처리 함수
function handleLogout() {
    if (confirm('정말 로그아웃하시겠습니까?')) {
        // 드롭다운 먼저 닫기
        const userProfile = document.getElementById('userProfile');
        const userDropdown = document.getElementById('userDropdown');
        userProfile.classList.remove('active');
        userDropdown.classList.remove('show');
        
        // 로그아웃 상태로 변경
        toggleLoginState();
        showMessage('로그아웃되었습니다.', 'success');
    }
}

// 사이드바 토글 함수
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    
    if (isMobile) {
        sidebar.classList.toggle('open');
        toggleMobileOverlay();
    } else {
        isSidebarCollapsed = !isSidebarCollapsed;
        sidebar.classList.toggle('collapsed', isSidebarCollapsed);
        
        // 사이드바 토글 시 열려있는 드롭다운 닫기
        const userProfile = document.getElementById('userProfile');
        const userDropdown = document.getElementById('userDropdown');
        userProfile.classList.remove('active');
        userDropdown.classList.remove('show');
    }
}

// 모바일 오버레이 토글
function toggleMobileOverlay() {
    let overlay = document.querySelector('.sidebar-overlay');
    
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        overlay.addEventListener('click', closeMobileSidebar);
        document.body.appendChild(overlay);
    }
}

// 모바일 사이드바 닫기
function closeMobileSidebar() {
    if (isMobile) {
        const sidebar = document.getElementById('sidebar');
        sidebar.classList.remove('open');
    }
}

// 페이지 전환 함수
function switchPage(pageId) {
    document.querySelectorAll('.page-content').forEach(page => {
        page.style.display = 'none';
    });
    
    const targetPage = document.getElementById(pageId + '-page');
    if (targetPage) {
        targetPage.style.display = 'block';
        currentPage = pageId;
    }
    
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    const activeLink = document.querySelector(`[data-page="${pageId}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
    
    if (isMobile) {
        setTimeout(() => closeMobileSidebar(), 300);
    }
}

// 프롬프트 생성 함수 (나이 항목 추가 버전)
function generatePrompt() {
    // 데이터 수집
    const data = {};
    
    // 각 카테고리별로 체크된 값 수집
    const categories = {
        'nationality': 'nationality',
        'gender': 'gender',
        'age': 'age',  // 나이 추가
        'hairstyle': 'hairStyle',
        'outfit': 'outfit',
        'action': 'action',
        'pose': 'pose',
        'expression': 'expression',
        'background': 'background',
        'camera': 'cameraAngle',
        'distance': 'cameraDistance',
        'lighting': 'lighting'
    };
    
    // 체크박스가 체크되어 있고 값이 선택된 경우만 수집
    Object.entries(categories).forEach(([htmlCategory, dataKey]) => {
        const select = document.querySelector(`select[data-category="${htmlCategory}"]`);
        const checkbox = document.querySelector(`#use-${htmlCategory}`);
        
        if (select && checkbox && checkbox.checked && select.value) {
            data[dataKey] = select.value;
        }
    });
    
    // 1. 주어 구성
    let subject = '';
    
    // 나이가 있는 경우의 주어 구성
    if (data.age && data.nationality && data.gender) {
        // 나이, 국적, 성별이 모두 있는 경우
        const article = ['a', 'e', 'i', 'o', 'u'].includes(data.age.toLowerCase()[0]) ? 'An' : 'A';
        subject = `${article} ${data.age} ${data.nationality} ${data.gender}`;
    } else if (data.age && data.gender) {
        // 나이와 성별만 있는 경우
        const article = ['a', 'e', 'i', 'o', 'u'].includes(data.age.toLowerCase()[0]) ? 'An' : 'A';
        subject = `${article} ${data.age} ${data.gender}`;
    } else if (data.nationality && data.gender) {
        // 국적과 성별만 있는 경우 (기존 로직)
        const article = ['a', 'e', 'i', 'o', 'u'].includes(data.nationality.toLowerCase()[0]) ? 'An' : 'A';
        subject = `${article} ${data.nationality} ${data.gender}`;
    } else if (data.gender) {
        // 성별만 있는 경우
        const article = ['a', 'e', 'i', 'o', 'u'].includes(data.gender.toLowerCase()[0]) ? 'An' : 'A';
        subject = `${article} ${data.gender}`;
    } else if (data.age) {
        // 나이만 있는 경우
        const article = ['a', 'e', 'i', 'o', 'u'].includes(data.age.toLowerCase()[0]) ? 'An' : 'A';
        subject = `${article} ${data.age} person`;
    } else {
        subject = 'A person';
    }
    
    if (data.hairStyle) {
        subject += ` with ${data.hairStyle}`;
    }
    
    // 2. 의상 추가
    let clothing = '';
    if (data.outfit) {
        // 'wearing'이 이미 포함되어 있는지 확인
        if (data.outfit.toLowerCase().includes('wearing')) {
            clothing = `, ${data.outfit}`;
        } else {
            clothing = `, wearing ${data.outfit}`;
        }
    }
    
    // 3. 행동 및 포즈
    let behavior = '';
    const behaviorParts = [];
    
    if (data.action) {
        behaviorParts.push(data.action);
    }
    
    if (data.pose) {
        behaviorParts.push(data.pose);
    }
    
    if (data.expression) {
        if (behaviorParts.length > 0) {
            behaviorParts.push(`with ${data.expression}`);
        } else {
            behaviorParts.push(data.expression);
        }
    }
    
    if (behaviorParts.length > 0) {
        behavior = ', ' + behaviorParts.join(', ');
    }
    
    // 4. 카메라 및 조명
    let camera = '';
    const cameraParts = [];
    
    if (data.cameraDistance) {
        cameraParts.push(data.cameraDistance);
    }
    
    if (data.cameraAngle) {
        if (cameraParts.length > 0) {
            cameraParts.push(`from ${data.cameraAngle}`);
        } else {
            cameraParts.push(data.cameraAngle);
        }
    }
    
    if (data.lighting) {
        if (cameraParts.length > 0) {
            cameraParts.push(`with ${data.lighting}`);
        } else {
            cameraParts.push(data.lighting);
        }
    }
    
    if (cameraParts.length > 0) {
        camera = '. ' + cameraParts.join(', ');
    }
    
    // 5. 배경
    let bg = '';
    if (data.background) {
        // 배경 설명에 이미 전치사가 포함되어 있는지 확인
        if (data.background.toLowerCase().includes('background') || 
            data.background.toLowerCase().includes('in the') ||
            data.background.toLowerCase().includes('at')) {
            bg = `. ${data.background}`;
        } else {
            bg = `, ${data.background}`;
        }
    }
    
    // 최종 조합
    let prompt = subject + clothing + behavior + camera + bg;
    
    // 마침표 정리 (중복 마침표 제거)
    prompt = prompt.replace(/\.\s*\./g, '.').replace(/,\s*\./g, '.');
    
    // 첫 글자 대문자로
    prompt = prompt.charAt(0).toUpperCase() + prompt.slice(1);
    
    return prompt;
}

// 사용 예시 (테스트용)
function testPromptGeneration() {
    // 테스트 데이터 설정
    const testCases = [
        {
            name: "Full details",
            setup: () => {
                document.querySelector('[data-category="nationality"]').value = 'Korean';
                document.querySelector('#use-nationality').checked = true;
                document.querySelector('[data-category="gender"]').value = 'woman';
                document.querySelector('#use-gender').checked = true;
                document.querySelector('[data-category="hairstyle"]').value = 'long straight hair';
                document.querySelector('#use-hairstyle').checked = true;
                document.querySelector('[data-category="outfit"]').value = 'casual outfit';
                document.querySelector('#use-outfit').checked = true;
                document.querySelector('[data-category="action"]').value = 'walking';
                document.querySelector('#use-action').checked = true;
                document.querySelector('[data-category="pose"]').value = 'one hand on hip';
                document.querySelector('#use-pose').checked = true;
                document.querySelector('[data-category="expression"]').value = 'smiling';
                document.querySelector('#use-expression').checked = true;
                document.querySelector('[data-category="camera"]').value = 'eye level';
                document.querySelector('#use-camera').checked = true;
                document.querySelector('[data-category="distance"]').value = 'full body';
                document.querySelector('#use-distance').checked = true;
                document.querySelector('[data-category="lighting"]').value = 'natural lighting';
                document.querySelector('#use-lighting').checked = true;
                document.querySelector('[data-category="background"]').value = 'city street';
                document.querySelector('#use-background').checked = true;
            }
        },
        {
            name: "Minimal details",
            setup: () => {
                // 모든 체크박스 해제
                document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
                // 최소한의 정보만 설정
                document.querySelector('[data-category="gender"]').value = 'woman';
                document.querySelector('#use-gender').checked = true;
                document.querySelector('[data-category="outfit"]').value = 'red pilot suit inspired by Asuka Langley from Evangelion';
                document.querySelector('#use-outfit').checked = true;
            }
        }
    ];
    
    testCases.forEach(test => {
        test.setup();
        console.log(`${test.name}: ${generatePrompt()}`);
    });
}

// 프리셋 적용 함수
function applyPreset(presetId) {
	// applyPreset 함수의 defaultPresets 부분 수정 예시
	const defaultPresets = {
		'school-girl': {
			nationality: 'Korean',
			gender: 'girl',
			age: 'teenage',  // 나이 추가
			hairstyle: 'twin tails',
			outfit: 'school uniform',
			action: 'standing',
			pose: 'peace sign with hand',
			expression: 'smiling',
			camera: 'eye level',
			lighting: 'natural lighting'
		},
		'business-woman': {
			nationality: 'Korean',
			gender: 'woman',
			age: '30-year-old',  // 나이 추가
			hairstyle: 'short bob cut',
			outfit: 'business suit',
			action: 'standing',
			pose: 'hands on hips',
			expression: 'serious',
			camera: 'eye level',
			lighting: 'soft, diffused studio lighting'
		},
		'casual-style': {
			nationality: 'Korean',
			gender: 'woman',
			age: '20s',  // 나이 추가
			hairstyle: 'long straight hair',
			outfit: 'casual outfit',
			action: 'walking',
			pose: 'one hand on hip',
			expression: 'smiling',
			camera: 'eye level',
			lighting: 'natural lighting'
		},
		'anime-character': {
			nationality: 'Japanese',
			gender: 'girl',
			age: 'young',  // 나이 추가
			hairstyle: 'twin tails',
			outfit: 'red pilot suit inspired by Asuka Langley from Evangelion',
			action: 'standing',
			pose: 'crossed arms',
			expression: 'serious',
			camera: 'low angle',
			lighting: 'dramatic lighting'
		}
	};
    
    let preset = defaultPresets[presetId];
    
    // 기본 프리셋에 없으면 저장된 임시 프리셋에서 찾기
    if (!preset) {
        const savedPresets = JSON.parse(localStorage.getItem('tempPresets') || '[]');
        const foundPreset = savedPresets.find(p => p.id === presetId);
        if (foundPreset) {
            preset = foundPreset.settings;
        }
    }
    
    if (!preset) return;
    
    Object.entries(preset).forEach(([category, value]) => {
        const select = document.querySelector(`select[data-category="${category}"]`);
        if (select) {
            select.value = value;
            
            const checkbox = document.querySelector(`#use-${category}`);
            if (checkbox) {
                checkbox.checked = true;
            }
        }
    });
    
    showMessage('프리셋이 적용되었습니다.', 'success');
}

// 메시지 표시 함수
function showMessage(message, type = 'info') {
    const messageContainer = document.getElementById('messageContainer');
    
    const messageElement = document.createElement('div');
    messageElement.className = `message ${type}-message`;
    messageElement.textContent = message;
    
    messageContainer.appendChild(messageElement);
    
    // 자동 제거
    setTimeout(() => {
        messageElement.remove();
    }, 3000);
}

// 사용자 드롭다운 토글
function handleUserProfileClick() {
    const sidebar = document.getElementById('sidebar');
    const isCollapsed = sidebar.classList.contains('collapsed');
    
    if (isCollapsed) {
        // 사이드바가 축소된 상태: 계정 페이지로 이동
        showMessage('계정 페이지로 이동합니다.', 'success');
    } else {
        // 사이드바가 확장된 상태: 드롭다운 토글
        toggleUserDropdown();
    }
}

// 드롭다운 토글 함수
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

// 프리셋 저장 모달 표시
function showPresetModal() {
    if (!isLoggedIn) {
        showMessage('프리셋 저장 기능을 이용하려면 로그인이 필요합니다.', 'error');
        return;
    }
    
    const modal = document.getElementById('presetModal');
    if (modal) {
        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('show'), 10);
        
        document.getElementById('presetName').value = '';
        document.getElementById('presetDescription').value = '';
        document.getElementById('presetName').focus();
    }
}

// 프리셋 저장 모달 숨기기
function hidePresetModal() {
    const modal = document.getElementById('presetModal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => modal.style.display = 'none', 300);
    }
}

// 임시 프리셋 저장 함수
function savePresetTemporary(name, description) {
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
    
    // 로컬 스토리지에 임시 저장
    let savedPresets = JSON.parse(localStorage.getItem('tempPresets') || '[]');
    savedPresets.push(newPreset);
    localStorage.setItem('tempPresets', JSON.stringify(savedPresets));
    
    // 프리셋 드롭다운에 추가
    addPresetToDropdown(newPreset);
    
    showMessage(`프리셋 "${name}"이 저장되었습니다.`, 'success');
}

// 프리셋을 드롭다운에 추가하는 함수
function addPresetToDropdown(preset) {
    const presetSelect = document.getElementById('presetSelect');
    const option = document.createElement('option');
    option.value = preset.id;
    option.textContent = preset.name;
    option.title = preset.description;
    presetSelect.appendChild(option);
}

// 저장된 임시 프리셋들을 로드하는 함수
function loadTemporaryPresets() {
    const savedPresets = JSON.parse(localStorage.getItem('tempPresets') || '[]');
    savedPresets.forEach(preset => {
        addPresetToDropdown(preset);
    });
}

// 화면 크기 변경 처리
function handleResize() {
    const newIsMobile = window.innerWidth <= 768;
    const sidebar = document.getElementById('sidebar');
    
    if (newIsMobile !== isMobile) {
        isMobile = newIsMobile;
        
        if (isMobile) {
            sidebar.classList.remove('collapsed');
            sidebar.classList.remove('open');
        } else {
            sidebar.classList.remove('open');
            sidebar.classList.toggle('collapsed', isSidebarCollapsed);
        }
    }
}

// 셀렉트 박스 변경 시 체크박스 자동 설정
function handleSelectChange(selectElement) {
    const formGroup = selectElement.closest('.form-group');
    const checkbox = formGroup.querySelector('input[type="checkbox"]');
    
    if (checkbox) {
        if (selectElement.value === '') {
            checkbox.checked = false;
        } else {
            checkbox.checked = true;
        }
    }
}

// 초기화 및 이벤트 리스너 설정
document.addEventListener('DOMContentLoaded', function() {
    // 초기 UI 상태 설정 (비로그인 상태)
    updateUIForLoginState();
    
    // 저장된 임시 프리셋들 로드
    loadTemporaryPresets();
    
    // 사이드바 토글 버튼
    const sidebarToggle = document.getElementById('sidebarToggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleSidebar();
        });
    }
    
    // 로그인 버튼
    const loginButton = document.getElementById('loginButton');
    if (loginButton) {
        loginButton.addEventListener('click', showLoginModal);
    }
    
    // 로그인 모달 관련 이벤트
    const loginModalClose = document.getElementById('loginModalClose');
    const loginModalCancel = document.getElementById('loginModalCancel');
    const loginModalSubmit = document.getElementById('loginModalSubmit');
    const loginForm = document.getElementById('loginForm');
    const loginModal = document.getElementById('loginModal');
    
    if (loginModalClose) loginModalClose.addEventListener('click', hideLoginModal);
    if (loginModalCancel) loginModalCancel.addEventListener('click', hideLoginModal);
    if (loginModalSubmit) loginModalSubmit.addEventListener('click', handleLogin);
    
    // 로그인 폼 엔터키 처리
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleLogin();
        });
    }
    
    // 로그인 모달 외부 클릭 시 닫기
    if (loginModal) {
        loginModal.addEventListener('click', function(e) {
            if (e.target === this) {
                hideLoginModal();
            }
        });
    }
    
    // 사용자 프로필 클릭 (로그인 후)
    const userProfile = document.getElementById('userProfile');
    if (userProfile) {
        userProfile.addEventListener('click', function(e) {
            e.stopPropagation();
            if (isLoggedIn) {
                handleUserProfileClick();
            }
        });
    }
    
    // 로그아웃 버튼
    const logout = document.getElementById('logout');
    if (logout) {
        logout.addEventListener('click', function(e) {
            e.preventDefault();
            handleLogout();
        });
    }
    
    // 네비게이션 링크들
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const pageId = this.getAttribute('data-page');
            if (pageId) {
                // 로그인이 필요한 페이지 체크
                if (this.closest('.login-required') && !isLoggedIn) {
                    showMessage('이 기능을 이용하려면 로그인이 필요합니다.', 'error');
                    return;
                }
                switchPage(pageId);
            }
        });
    });
    
    // 프리셋 선택 이벤트
    const presetSelect = document.getElementById('presetSelect');
    if (presetSelect) {
        presetSelect.addEventListener('change', function() {
            const presetId = this.value;
            if (presetId && isLoggedIn) {
                applyPreset(presetId);
            }
        });
    }
    
    // 프리셋 저장 버튼
    const savePresetBtn = document.getElementById('savePresetBtn');
    if (savePresetBtn) {
        savePresetBtn.addEventListener('click', showPresetModal);
    }
    
    // 모든 셀렉트 박스에 자동 체크박스 설정 이벤트 추가
    document.querySelectorAll('select[data-category]').forEach(select => {
        select.addEventListener('change', function() {
            handleSelectChange(this);
        });
    });
    
    // 프롬프트 생성 버튼
    const generateBtn = document.getElementById('generateBtn');
    if (generateBtn) {
        generateBtn.addEventListener('click', function() {
            try {
                this.disabled = true;
                this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 생성 중...';
                
                const prompt = generatePrompt();
                const promptTextarea = document.getElementById('promptPreview');
                if (promptTextarea) {
                    promptTextarea.value = prompt;
                }
                
                this.innerHTML = '<i class="fas fa-check"></i> 생성 완료!';
                showMessage('프롬프트가 성공적으로 생성되었습니다.', 'success');
                
                setTimeout(() => {
                    this.innerHTML = '<i class="fas fa-magic"></i> 프롬프트 생성';
                }, 2000);
                
            } catch (error) {
                console.error('프롬프트 생성 실패:', error);
                showMessage('프롬프트 생성에 실패했습니다.', 'error');
                this.innerHTML = '<i class="fas fa-magic"></i> 프롬프트 생성';
            } finally {
                this.disabled = false;
            }
        });
    }
    
    // 프롬프트 복사 버튼
    const copyBtn = document.getElementById('copyBtn');
    if (copyBtn) {
        copyBtn.addEventListener('click', async function() {
            const promptTextarea = document.getElementById('promptPreview');
            const promptText = promptTextarea ? promptTextarea.value : '';
            
            if (promptText && promptText.trim()) {
                try {
                    await navigator.clipboard.writeText(promptText);
                    
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
    }
    
    // 초기화 버튼
    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            if (confirm('모든 설정을 초기화하시겠습니까?')) {
                document.querySelectorAll('select').forEach(select => {
                    if (select.id !== 'presetSelect') {
                        select.value = '';
                    }
                });
                
                const presetSelect = document.getElementById('presetSelect');
                if (presetSelect) presetSelect.value = '';
                
                document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
                    checkbox.checked = false;
                });
                
                const promptPreview = document.getElementById('promptPreview');
                if (promptPreview) promptPreview.value = '';
                
                showMessage('모든 설정이 초기화되었습니다.', 'success');
            }
        });
    }
    
    // 프리셋 저장 모달 관련 이벤트
    const modalClose = document.getElementById('modalClose');
    const modalCancel = document.getElementById('modalCancel');
    const modalSave = document.getElementById('modalSave');
    const presetModal = document.getElementById('presetModal');
    
    if (modalClose) modalClose.addEventListener('click', hidePresetModal);
    if (modalCancel) modalCancel.addEventListener('click', hidePresetModal);
    
    if (modalSave) {
        modalSave.addEventListener('click', function() {
            const presetNameInput = document.getElementById('presetName');
            const presetDescriptionInput = document.getElementById('presetDescription');
            
            const name = presetNameInput ? presetNameInput.value.trim() : '';
            const description = presetDescriptionInput ? presetDescriptionInput.value.trim() : '';
            
            if (!name) {
                showMessage('프리셋 이름을 입력해주세요.', 'error');
                return;
            }
            
            savePresetTemporary(name, description);
            hidePresetModal();
        });
    }
    
    if (presetModal) {
        presetModal.addEventListener('click', function(e) {
            if (e.target === this) {
                hidePresetModal();
            }
        });
    }
    
    // 드롭다운 메뉴 항목들
    const accountSettings = document.getElementById('accountSettings');
    const myProjects = document.getElementById('myProjects');
    const usageHistory = document.getElementById('usageHistory');
    const subscription = document.getElementById('subscription');
    const helpSupport = document.getElementById('helpSupport');
    
    if (accountSettings) {
        accountSettings.addEventListener('click', function(e) {
            e.preventDefault();
            showMessage('계정 설정 페이지로 이동합니다.', 'success');
        });
    }
    
    if (myProjects) {
        myProjects.addEventListener('click', function(e) {
            e.preventDefault();
            showMessage('내 프로젝트 페이지로 이동합니다.', 'success');
        });
    }
    
    if (usageHistory) {
        usageHistory.addEventListener('click', function(e) {
            e.preventDefault();
            showMessage('사용 내역 페이지로 이동합니다.', 'success');
        });
    }
    
    if (subscription) {
        subscription.addEventListener('click', function(e) {
            e.preventDefault();
            showMessage('구독 관리 페이지로 이동합니다.', 'success');
        });
    }
    
    if (helpSupport) {
        helpSupport.addEventListener('click', function(e) {
            e.preventDefault();
            showMessage('도움말 페이지로 이동합니다.', 'success');
        });
    }
    
    // 외부 클릭 시 드롭다운 닫기
    document.addEventListener('click', function(event) {
        const userAccountSection = document.querySelector('.user-account-section');
        const userProfile = document.getElementById('userProfile');
        const userDropdown = document.getElementById('userDropdown');
        
        if (userAccountSection && userProfile && userDropdown) {
            if (!userAccountSection.contains(event.target) && !userDropdown.contains(event.target)) {
                userProfile.classList.remove('active');
                userDropdown.classList.remove('show');
            }
        }
    });
    
    // ESC 키 이벤트
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (isMobile) {
                closeMobileSidebar();
            }
            hidePresetModal();
            hideLoginModal();
            
            // 드롭다운 닫기
            const userProfile = document.getElementById('userProfile');
            const userDropdown = document.getElementById('userDropdown');
            if (userProfile && userDropdown) {
                userProfile.classList.remove('active');
                userDropdown.classList.remove('show');
            }
        }
    });
    
    // 화면 크기 변경 감지
    window.addEventListener('resize', handleResize);
    handleResize(); // 초기 설정
});

// 키보드 단축키 지원
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
});