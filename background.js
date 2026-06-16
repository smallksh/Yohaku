// 当前活跃的留白会话
let activeSession = {
  inProgress: false,
  startTime: null,
  visitedUrls: []
};

// 保存会话到 storage
function saveSessionToStorage() {
  chrome.storage.local.set({ activeSession: activeSession });
}

// 从 storage 恢复会话
function restoreSession() {
  chrome.storage.local.get(['activeSession'], (result) => {
    if (result.activeSession && result.activeSession.inProgress) {
      activeSession = result.activeSession;
      
      chrome.action.setIcon({
        path: {
          "16": "icons/icon16-active.png",
          "48": "icons/icon48-active.png",
          "128": "icons/icon128-active.png"
        }
      });
    } else {
      chrome.action.setIcon({
        path: {
          "16": "icons/icon16.png",
          "48": "icons/icon48.png",
          "128": "icons/icon128.png"
        }
      });
    }
  });
}

// 开始留白
function startSession() {
  activeSession = {
    inProgress: true,
    startTime: Date.now(),
    visitedUrls: []
  };
  saveSessionToStorage();
  
  chrome.action.setIcon({
    path: {
      "16": "icons/icon16-active.png",
      "48": "icons/icon48-active.png",
      "128": "icons/icon128-active.png"
    }
  });
}

// 结束留白
function endSession() {
  if (!activeSession.inProgress) return null;
  
  const sessionData = {
    startTime: activeSession.startTime,
    endTime: Date.now(),
    visitedUrls: [...activeSession.visitedUrls]
  };
  
  activeSession = {
    inProgress: false,
    startTime: null,
    visitedUrls: []
  };
  
  chrome.storage.local.remove('activeSession');
  
  chrome.action.setIcon({
    path: {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  });
  
  return sessionData;
}

// 删除历史记录
function deleteHistoryItems(urls) {
  const uniqueUrls = [...new Set(urls)];
  uniqueUrls.forEach(url => {
    chrome.history.deleteUrl({ url: url });
  });
}

// 初始化
function init() {
  chrome.history.onVisited.addListener((historyItem) => {
    if (!activeSession.inProgress) return;
    if (historyItem.url.startsWith('chrome-extension://')) return;
    
    const exists = activeSession.visitedUrls.some(item =>
      item.url === historyItem.url && item.visitTime === historyItem.lastVisitTime
    );
    
    if (!exists) {
      activeSession.visitedUrls.push({
        url: historyItem.url,
        title: historyItem.title || '无标题',
        visitTime: historyItem.lastVisitTime
      });
      saveSessionToStorage();
    }
  });
  
  chrome.runtime.onStartup.addListener(() => {
    restoreSession();
  });
  
  restoreSession();
}

// 消息监听
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'getStatus':
      sendResponse({ inProgress: activeSession.inProgress });
      break;
    case 'startSession':
      startSession();
      sendResponse({ success: true });
      break;
    case 'endSession':
      const session = endSession();
      sendResponse({ success: true, session: session });
      break;
    case 'deleteHistory':
      deleteHistoryItems(request.urls);
      sendResponse({ success: true });
      break;
  }
  return true;
});

// 启动
init();