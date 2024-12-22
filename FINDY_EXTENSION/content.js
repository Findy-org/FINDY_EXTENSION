// 동영상 목록이 있는 컨테이너를 찾는 함수
function findVideoListContainer() {
    return document.querySelector('ytd-watch-next-secondary-results-renderer');
}

// 내 프로그램을 동영상 목록 위에 추가하는 함수
function insertProgramAboveVideoList() {
    const videoListContainer = findVideoListContainer();

    if (videoListContainer) {
        if (!document.getElementById('custom-program-panel')) {
            const customPanel = document.createElement('div');
            customPanel.id = 'custom-program-panel'; // 패널 ID로 중복 생성 방지

            // 패널 스타일 설정
            customPanel.style.position = 'relative';
            customPanel.style.backgroundColor = '#ffffff';
            customPanel.style.padding = '20px';
            customPanel.style.borderRadius = '12px';
            customPanel.style.boxShadow = '0px 4px 6px rgba(0, 0, 0, 0.1)';
            customPanel.style.marginBottom = '20px';
            customPanel.style.fontFamily = 'Arial, sans-serif';
            customPanel.style.border = '1px solid #ddd';
            customPanel.style.height = '500px'; // 고정 높이 설정
            customPanel.style.overflow = 'hidden'; // 스크롤 처리 영역 제한

            // 패널 기본 구조
            customPanel.innerHTML = `
                <h2 style="margin: 0 0 15px; font-size: 18px; font-weight: bold; color: #E74C3C;">
                    Findy - 핀디, 순간을 찾아 연결하다
                </h2>
                <div id="content-container" style="
                    height: calc(100% - 80px); 
                    border-radius: 8px; 
                    padding: 0px; 
                    position: relative;
                ">
                    <div id="loading" style="
                        display: flex; 
                        flex-direction: column; 
                        align-items: center; 
                        justify-content: center;
                        height: 100%; 
                        position: absolute; 
                        top: 0; 
                        left: 0; 
                        width: 100%; 
                        background: white; 
                        z-index: 10;
                    ">
                        <!-- 로딩 애니메이션 -->
                        <div style="
                            width: 40px; 
                            height: 40px; 
                            border: 4px solid #f3f3f3; 
                            border-top: 4px solid #E74C3C; 
                            border-radius: 50%; 
                            animation: spin 1s linear infinite;
                        "></div>
                        <p style="
                            margin-top: 10px; 
                            color: #666; 
                            font-size: 14px; 
                            font-weight: bold;
                        ">
                            장소 추출 중입니다...
                        </p>
                    </div>
                </div>
                <div style="position: absolute; bottom: 20px; left: 20px; right: 20px; text-align: center;">
                    <p style="font-size: 12px; color: #999; margin: 0 0 10px;">해당 장소를 저장해보세요.</p>
                    <button id="findy-button" style="
                        width: 100%; 
                        padding: 10px 15px; 
                        font-size: 16px; 
                        font-weight: bold; 
                        color: white; 
                        background-color: #E74C3C; 
                        border: none; 
                        border-radius: 8px; 
                        cursor: pointer;
                        box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.2);
                    ">
                        Findy로 이동하기
                    </button>
                </div>

                <style>
                    /* 로딩 애니메이션 */
                    @keyframes spin {
                        0% {
                            transform: rotate(0deg);
                        }
                        100% {
                            transform: rotate(360deg);
                        }
                    }
                </style>
            `;

            // 데이터를 불러오면 로딩 CSS를 제거하고 새로운 데이터를 렌더링하는 함수
            function renderData(places) {
                const contentContainer = document.getElementById('content-container');
                const loadingOverlay = document.getElementById('loading');

                // 로딩 상태 제거
                if (loadingOverlay) {
                    loadingOverlay.style.display = 'none';
                }

                // 데이터를 기반으로 컨텐츠 렌더링
                const contentHTML = places.map(place => `
                    <div style="margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 8px;">
                        <strong>${place.title}</strong><br />
                        <span>${place.roadAddress || place.address}</span>
                    </div>
                `).join('');

                contentContainer.innerHTML = `
                    <div style="padding: 10px;">
                        <p style="color: #666;">아래는 영상에서 추출된 장소 목록입니다:</p>
                        ${contentHTML}
                    </div>
                `;
            }
            

            // 패널 추가
            videoListContainer.parentNode.insertBefore(customPanel, videoListContainer);

            // 버튼 클릭 이벤트 추가
            const findyButton = customPanel.querySelector('#findy-button');
            findyButton.addEventListener('click', () => {
                window.open('https://www.findynow.com', '_blank'); // 네이버 새 탭 열기
            });

            // API 호출
            requestApiData(customPanel.querySelector('#content-container')); // 데이터 영역만 업데이트
        }
    }
}

// API 요청 및 데이터 렌더링
function requestApiData(contentContainer) {
    const videoUrl = window.location.href;
    const encodedUrl = encodeURIComponent(videoUrl);
    const apiEndpoint = `https://data.findynow.com/api/video/place/${encodedUrl}`;

    console.log(`API 요청 URL: ${apiEndpoint}`);

    chrome.runtime.sendMessage({ type: "FETCH_API", apiUrl: apiEndpoint }, (response) => {
        if (chrome.runtime.lastError) {
            console.error("Runtime 메시지 에러:", chrome.runtime.lastError);
            contentContainer.innerHTML = `
                <p style="color: red;">메시지 전송 오류가 발생했습니다.</p>
            `;
            return;
        }

        if (response?.success) {
            console.log("API 성공 응답:", response.data);
            const places = response.data.places || [];
            if (places.length === 0) {
                contentContainer.innerHTML = `
                    <p style="color: #666;">장소 데이터를 찾을 수 없습니다.</p>
                `;
                return;
            }

            // 장소 데이터 생성
            const content = places.map(
                place => `
                    <div style="
                        padding: 10px; 
                        background-color: #ffffff; 
                        border: 1px solid #ddd; 
                        border-radius: 8px; 
                        margin-bottom: 10px;
                    ">
                        <strong style="font-size: 16px; color: #E74C3C;">${place.title}</strong><br />
                        <span style="font-size: 14px; color: #666;">${place.roadAddress || place.address}</span>
                    </div>
                `
            ).join('');

            contentContainer.innerHTML = content;
        } else {
            console.error("API 실패 응답:", response?.error);
            contentContainer.innerHTML = `
                <p style="color: red;">데이터를 불러오는 데 실패했습니다.</p>
                <p style="color: #666;">오류 메시지: ${response?.error || "알 수 없는 오류"}</p>
            `;
        }
    });
}

// MutationObserver 설정
const observer = new MutationObserver(() => {
    console.log("DOM 변경 감지");
    if (!document.getElementById('custom-program-panel')) {
        insertProgramAboveVideoList();
    }
});

// 유튜브의 동영상 목록이 있는 부모 노드를 감시합니다.
const targetNode = document.body;
const config = { childList: true, subtree: true };
observer.observe(targetNode, config);

// 페이지 로드 시 실행
window.addEventListener('load', () => {
    console.log("페이지 로드 완료");
    insertProgramAboveVideoList();
});
