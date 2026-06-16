// 当前待处理的会话数据
let pendingSession = null;
let currentTheme = 'system';
let selectedFormat = 'json';

// 读取 manifest 中的版本号并显示
function displayVersion() {
  const manifest = chrome.runtime.getManifest();
  const versionSpan = document.getElementById('versionNumber');
  if (versionSpan) {
    versionSpan.textContent = manifest.version;
  }
}

// 获取当前状态并更新 UI
async function updateUI() {
  const response = await chrome.runtime.sendMessage({ action: 'getStatus' });
  
  if (response.inProgress) {
    document.getElementById('idleView').classList.add('hidden');
    document.getElementById('activeView').classList.remove('hidden');
    updateSessionTime();
  } else {
    document.getElementById('idleView').classList.remove('hidden');
    document.getElementById('activeView').classList.add('hidden');
  }
}

// 更新时间显示
function updateSessionTime() {
  const timeElement = document.getElementById('sessionTime');
  if (timeElement) {
    timeElement.textContent = '留白中...';
  }
}

// ========== 选择功能 ==========

function getCheckboxes() {
  return document.querySelectorAll('.record-checkbox');
}

function getSelectedIndexes() {
  const checkboxes = getCheckboxes();
  const indexes = [];
  checkboxes.forEach((cb) => {
    if (cb.checked) {
      indexes.push(parseInt(cb.dataset.index));
    }
  });
  return indexes;
}

function getSelectedRecords() {
  const indexes = getSelectedIndexes();
  return indexes.map(i => pendingSession.visitedUrls[i]);
}

function updateSelectedCount() {
  const selected = getSelectedIndexes().length;
  const countEl = document.getElementById('selectedCount');
  if (countEl) {
    countEl.textContent = `已选 ${selected} 条`;
  }
  
  const checkboxes = getCheckboxes();
  const selectAll = document.getElementById('selectAllCheckbox');
  if (selectAll && checkboxes.length > 0) {
    const checkedCount = document.querySelectorAll('.record-checkbox:checked').length;
    if (checkedCount === checkboxes.length) {
      selectAll.checked = true;
      selectAll.indeterminate = false;
    } else if (checkedCount === 0) {
      selectAll.checked = false;
      selectAll.indeterminate = false;
    } else {
      selectAll.indeterminate = true;
    }
  }
}

function toggleSelectAll() {
  const selectAll = document.getElementById('selectAllCheckbox');
  const checkboxes = getCheckboxes();
  checkboxes.forEach(cb => {
    cb.checked = selectAll.checked;
  });
  updateSelectedCount();
}

// ========== 显示结果视图 ==========

function showResultView(session) {
  pendingSession = session;
  
  document.getElementById('mainView').classList.add('hidden');
  document.getElementById('resultView').classList.remove('hidden');
  
  const urls = session.visitedUrls;
  const count = urls.length;
  document.getElementById('recordCount').textContent = count;
  
  const listContainer = document.getElementById('recordList');
  listContainer.innerHTML = '';
  
  // 显示所有记录
  for (let i = 0; i < count; i++) {
    const item = urls[i];
    const div = document.createElement('div');
    div.className = 'record-item';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'record-checkbox';
    checkbox.dataset.index = i;
    checkbox.addEventListener('change', updateSelectedCount);
    
    const favicon = document.createElement('img');
    favicon.className = 'record-favicon';
    favicon.src = `https://www.google.com/s2/favicons?domain=${item.url}&sz=16`;
    favicon.onerror = () => { favicon.style.display = 'none'; };
    
    const titleSpan = document.createElement('span');
    titleSpan.className = 'record-title';
    titleSpan.textContent = item.title.length > 40 
      ? item.title.substring(0, 40) + '...' 
      : item.title;
    titleSpan.title = item.title;
    
    div.appendChild(checkbox);
    div.appendChild(favicon);
    div.appendChild(titleSpan);
    listContainer.appendChild(div);
  }
  
  updateSelectedCount();
}

// ========== 操作按钮 ==========

async function deleteSelected() {
  if (!pendingSession) return;
  
  const selected = getSelectedRecords();
  if (selected.length === 0) return;
  
  const urls = selected.map(item => item.url);
  await chrome.runtime.sendMessage({
    action: 'deleteHistory',
    urls: urls
  });
  
  window.close();
}

function keepSelected() {
  window.close();
}

// ========== 导出功能 ==========

function generateCSV(data) {
  const headers = ['标题', 'URL', '访问时间'];
  const rows = data.records.map(item => [
    `"${item.title.replace(/"/g, '""')}"`,
    `"${item.url}"`,
    new Date(item.visitTime).toLocaleString()
  ]);
  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
}

function generateMarkdown(data) {
  const lines = [
    `# 余白浏览记录`,
    ``,
    `> 导出时间：${data.exportTime}`,
    `> 开始时间：${data.startTime}`,
    `> 结束时间：${data.endTime}`,
    `> 记录总数：${data.totalCount} 条`,
    ``,
    `## 记录详情`,
    ``
  ];
  
  data.records.forEach((item, index) => {
    lines.push(`### ${index + 1}. ${item.title}`);
    lines.push(`- URL：${item.url}`);
    lines.push(`- 访问时间：${new Date(item.visitTime).toLocaleString()}`);
    lines.push(``);
  });
  
  return lines.join('\n');
}

function toggleDropdown() {
  const dropdown = document.getElementById('exportDropdown');
  if (dropdown) {
    dropdown.classList.toggle('show');
  }
}

function exportSelected() {
  if (!pendingSession) return;
  
  const selected = getSelectedRecords();
  if (selected.length === 0) return;
  
  const data = {
    exportTime: new Date().toISOString(),
    startTime: new Date(pendingSession.startTime).toLocaleString(),
    endTime: new Date(pendingSession.endTime).toLocaleString(),
    totalCount: selected.length,
    records: selected
  };
  
  let content, extension, mimeType;
  
  switch (selectedFormat) {
    case 'csv':
      content = generateCSV(data);
      extension = 'csv';
      mimeType = 'text/csv';
      break;
    case 'md':
      content = generateMarkdown(data);
      extension = 'md';
      mimeType = 'text/markdown';
      break;
    default:
      content = JSON.stringify(data, null, 2);
      extension = 'json';
      mimeType = 'application/json';
      break;
  }
  
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `yohaku_${Date.now()}.${extension}`;
  a.click();
  
  URL.revokeObjectURL(url);
  
  document.getElementById('exportDropdown')?.classList.remove('show');
  
  setTimeout(() => window.close(), 500);
}

async function startSession() {
  await chrome.runtime.sendMessage({ action: 'startSession' });
  window.close();
}

async function endSession() {
  const response = await chrome.runtime.sendMessage({ action: 'endSession' });
  if (response.success && response.session && response.session.visitedUrls.length > 0) {
    showResultView(response.session);
  } else if (response.success && (!response.session || response.session.visitedUrls.length === 0)) {
    window.close();
  }
}

// ========== 深色模式相关 ==========

async function loadTheme() {
  const result = await chrome.storage.local.get(['theme']);
  currentTheme = result.theme || 'system';
  applyTheme();
  updateThemeButtons();
}

function applyTheme() {
  let theme = currentTheme;
  if (theme === 'system') {
    theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  
  if (theme === 'dark') {
    document.body.classList.add('dark');
  } else {
    document.body.classList.remove('dark');
  }
}

function updateThemeButtons() {
  const btns = document.querySelectorAll('.theme-btn');
  btns.forEach(btn => {
    const themeValue = btn.getAttribute('data-theme');
    if (themeValue === currentTheme) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

async function saveTheme(theme) {
  currentTheme = theme;
  await chrome.storage.local.set({ theme: currentTheme });
  applyTheme();
  updateThemeButtons();
}

function watchSystemTheme() {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (currentTheme === 'system') {
      applyTheme();
    }
  });
}

// ========== 初始化 ==========

document.addEventListener('DOMContentLoaded', () => {
  displayVersion();
  updateUI();
  loadTheme();
  watchSystemTheme();
  
  document.getElementById('startBtn')?.addEventListener('click', startSession);
  document.getElementById('endBtn')?.addEventListener('click', endSession);
  
  document.getElementById('selectAllCheckbox')?.addEventListener('change', toggleSelectAll);
  
  document.getElementById('deleteSelectedBtn')?.addEventListener('click', deleteSelected);
  document.getElementById('keepSelectedBtn')?.addEventListener('click', keepSelected);
  
  document.getElementById('exportBtn')?.addEventListener('click', toggleDropdown);
  
  document.querySelectorAll('.dropdown-item').forEach(item => {
    item.addEventListener('click', () => {
      selectedFormat = item.getAttribute('data-format');
      exportSelected();
    });
  });
  
  document.addEventListener('click', (e) => {
    const wrapper = document.querySelector('.export-wrapper');
    if (wrapper && !wrapper.contains(e.target)) {
      document.getElementById('exportDropdown')?.classList.remove('show');
    }
  });
  
  document.getElementById('settingsBtn')?.addEventListener('click', () => {
    document.getElementById('mainView').classList.add('hidden');
    document.getElementById('settingsView').classList.remove('hidden');
  });
  
  document.getElementById('backBtn')?.addEventListener('click', () => {
    document.getElementById('settingsView').classList.add('hidden');
    document.getElementById('mainView').classList.remove('hidden');
    updateUI();
  });
  
  const themeBtns = document.querySelectorAll('.theme-btn');
  themeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const theme = btn.getAttribute('data-theme');
      saveTheme(theme);
    });
  });
});

setInterval(() => {
  chrome.runtime.sendMessage({ action: 'getStatus' }, (response) => {
    if (response && response.inProgress && document.getElementById('activeView') && 
        !document.getElementById('activeView').classList.contains('hidden')) {
      updateSessionTime();
    }
  });
}, 60000);