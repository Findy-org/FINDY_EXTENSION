chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "FETCH_API") {
      console.log(`API 요청 URL: ${message.apiUrl}`);
      (async () => {
          try {
              const response = await fetch(message.apiUrl);
              console.log(`응답 상태: ${response.status}`);
              if (!response.ok) {
                  throw new Error(`API 요청 실패: ${response.status} - ${response.statusText}`);
              }
              const data = await response.json();
              console.log("응답 데이터:", data);
              sendResponse({ success: true, data });
          } catch (error) {
              console.error("API 호출 에러:", error.message);
              sendResponse({ success: false, error: error.message });
          }
      })();

      // 비동기 응답을 보장하기 위해 true 반환
      return true;
  }
});
