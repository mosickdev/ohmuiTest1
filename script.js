// 전역 변수
let isLoggedIn = false;
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
        loginSection.style.display = 'none';
        userProfile.style.display = 'flex';
        if (loginNotice) loginNotice.style.display = 'none';
    } else {
        body.classList.remove('logged-in');
        loginSection.style.display = 'block';
        userProfile.style.display = 'none';
        if (loginNotice) loginNotice.style.display = 'block';
    }
}

// 로그인 처리 함수
function handleLogin() {
    showMessage('로그인을 시뮬레이션합니다...', 'success');
    setTimeout(() => {
        toggleLoginState();
        showMessage('로그인되었습니다!', 'success');
    }, 1000);
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

// 프롬프트 생성 함수
function generatePrompt() {
    let promptParts = [];
    
    document.querySelectorAll('.form-group').forEach(group => {
        const select = group.querySelector('select');
        const checkbox = group.querySelector('input[type="checkbox"]');
        
        if (select && checkbox && checkbox.checked && select.value) {
            promptParts.push(select.value);
        }
    });
    
    return promptParts.join(', ');
}

// 프리셋 적용 함수
function applyPreset(presetId) {
    // 기본 프리셋들
    const defaultPresets = {
        'school-girl': {
            nationality: 'Korean',
            gender: 'girl',
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

// 메시지 표시 함수 (보라색 배경 위에 표시)
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

// 사용자 드롭다운 토글 (사이드바 확장 시) 또는 계정 페이지 이동 (축소 시)
function handleUserProfileClick() {
    const sidebar = document.getElementById('sidebar');
    const isCollapsed = sidebar.classList.contains('collapsed');
    
    if (isCollapsed) {
        // 사이드바가 축소된 상태: 계정 페이지로 이동
        showMessage('계정 페이지로 이동합니다.', 'success');
        // 실제 구현 시: window.location.href = '/account';
        // 또는 switchPage('account');
    } else {
        // 사이드바가 확장된 상태: 드롭다운 토글
        toggleUserDropdown();
    }
}

// 기존 드롭다운 토글 함수 (확장 시에만 사용)
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

// 임시 프리셋 저장 함수 (백엔드 연결 전까지 사용)
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
            // "선택하세요"를 선택한 경우 체크 해제
            checkbox.checked = false;
        } else {
            // 값을 선택한 경우 체크
            checkbox.checked = true;
        }
    }
}

// 초기화 및 이벤트 리스너 설정
document.addEventListener('DOMContentLoaded', function() {
    // 초기 UI 상태 설정
    updateUIForLoginState();
    
    // 저장된 임시 프리셋들 로드
    loadTemporaryPresets();
    
    // 사이드바 토글 버튼
    document.getElementById('sidebarToggle').addEventListener('click', function(e) {
        e.stopPropagation();
        toggleSidebar();
    });
    
    // 로그인 버튼
    document.getElementById('loginButton').addEventListener('click', handleLogin);
    
    // 사용자 프로필 클릭 (로그인 후)
    document.getElementById('userProfile').addEventListener('click', function(e) {
        e.stopPropagation();
        // 로그인 상태일 때만 처리
        if (isLoggedIn) {
            handleUserProfileClick();
        }
    });
    
    // 로그아웃 버튼
    document.getElementById('logout').addEventListener('click', function(e) {
        e.preventDefault();
        handleLogout();
    });
    
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
    document.getElementById('presetSelect').addEventListener('change', function() {
        const presetId = this.value;
        if (presetId && isLoggedIn) {
            applyPreset(presetId);
        }
    });
    
    // 프리셋 저장 버튼
    document.getElementById('savePresetBtn').addEventListener('click', showPresetModal);
    
    // 모든 셀렉트 박스에 자동 체크박스 설정 이벤트 추가
    document.querySelectorAll('select[data-category]').forEach(select => {
        select.addEventListener('change', function() {
            handleSelectChange(this);
        });
    });
    
    // 프롬프트 생성 버튼
    document.getElementById('generateBtn').addEventListener('click', function() {
        try {
            this.disabled = true;
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 생성 중...';
            
            const prompt = generatePrompt();
            const promptTextarea = document.getElementById('promptPreview');
            promptTextarea.value = prompt;
            
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
    
    // 프롬프트 복사 버튼
    document.getElementById('copyBtn').addEventListener('click', async function() {
        const promptText = document.getElementById('promptPreview').value;
        
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
    
    // 초기화 버튼
    document.getElementById('resetBtn').addEventListener('click', function() {
        if (confirm('모든 설정을 초기화하시겠습니까?')) {
            document.querySelectorAll('select').forEach(select => {
                if (select.id !== 'presetSelect') {
                    select.value = '';
                }
            });
            
            document.getElementById('presetSelect').value = '';
            
            document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
                checkbox.checked = false;
            });
            
            document.getElementById('promptPreview').value = '';
            showMessage('모든 설정이 초기화되었습니다.', 'success');
        }
    });
    
    // 모달 관련 이벤트
    document.getElementById('modalClose').addEventListener('click', hidePresetModal);
    document.getElementById('modalCancel').addEventListener('click', hidePresetModal);
    
    // 프리셋 저장 모달의 저장 버튼
    document.getElementById('modalSave').addEventListener('click', function() {
        const name = document.getElementById('presetName').value.trim();
        const description = document.getElementById('presetDescription').value.trim();
        
        if (!name) {
            showMessage('프리셋 이름을 입력해주세요.', 'error');
            return;
        }
        
        // 임시 프리셋 저장 함수 호출
        savePresetTemporary(name, description);
        hidePresetModal();
    });
    
    document.getElementById('presetModal').addEventListener('click', function(e) {
        if (e.target === this) {
            hidePresetModal();
        }
    });
    
    // 드롭다운 메뉴 항목들
    document.getElementById('accountSettings').addEventListener('click', function(e) {
        e.preventDefault();
        showMessage('계정 설정 페이지로 이동합니다.', 'success');
    });
    
    document.getElementById('myProjects').addEventListener('click', function(e) {
        e.preventDefault();
        showMessage('내 프로젝트 페이지로 이동합니다.', 'success');
    });
    
    document.getElementById('usageHistory').addEventListener('click', function(e) {
        e.preventDefault();
        showMessage('사용 내역 페이지로 이동합니다.', 'success');
    });
    
    document.getElementById('subscription').addEventListener('click', function(e) {
        e.preventDefault();
        showMessage('구독 관리 페이지로 이동합니다.', 'success');
    });
    
    document.getElementById('helpSupport').addEventListener('click', function(e) {
        e.preventDefault();
        showMessage('도움말 페이지로 이동합니다.', 'success');
    });
    
    // 외부 클릭 시 드롭다운 닫기
    document.addEventListener('click', function(event) {
        const userAccountSection = document.querySelector('.user-account-section');
        const userProfile = document.getElementById('userProfile');
        const userDropdown = document.getElementById('userDropdown');
        
        // 사용자 계정 섹션 외부를 클릭했거나, 드롭다운 메뉴 외부를 클릭한 경우
        if (!userAccountSection.contains(event.target) && !userDropdown.contains(event.target)) {
            userProfile.classList.remove('active');
            userDropdown.classList.remove('show');
        }
    });
    
    // ESC 키 이벤트
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (isMobile) {
                closeMobileSidebar();
            }
            hidePresetModal();
            
            // 드롭다운 닫기
            const userProfile = document.getElementById('userProfile');
            const userDropdown = document.getElementById('userDropdown');
            userProfile.classList.remove('active');
            userDropdown.classList.remove('show');
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