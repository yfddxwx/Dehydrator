import { soundFx } from './audio';
import { SAMPLE_THOUGHTS } from './samples';
import { ApiConfig, DehydratedResult, ProviderType } from './types';
import {
  loadApiConfig,
  saveApiConfig,
  loadHistoryCards,
  saveHistoryCards,
  loadSoundMuted,
  saveSoundMuted,
} from './storage';
import { processDehydration } from './dehydrator';

// ============================================================================
// State Management
// ============================================================================
let apiConfig: ApiConfig = loadApiConfig();
let historyCards: DehydratedResult[] = loadHistoryCards();
let currentResult: DehydratedResult | null = null;
let isProcessing = false;
let isMuted = loadSoundMuted();

// Sound init
soundFx.setMuted(isMuted);

// ============================================================================
// DOM Elements Selection
// ============================================================================
const rawTextInput = document.getElementById('rawTextInput') as HTMLTextAreaElement;
const charCount = document.getElementById('charCount') as HTMLElement;
const btnDehydrate = document.getElementById('btnDehydrate') as HTMLButtonElement;
const btnResetAll = document.getElementById('btnResetAll') as HTMLButtonElement;
const btnClearInput = document.getElementById('btnClearInput') as HTMLButtonElement;

// Progress & Status Elements
const statusLed = document.getElementById('statusLed') as HTMLElement;
const currentEngineLabel = document.getElementById('currentEngineLabel') as HTMLElement;
const progressStatusLabel = document.getElementById('progressStatusLabel') as HTMLElement;
const dotMatrixDisplay = document.getElementById('dotMatrixDisplay') as HTMLElement;

// Specimen Card Elements
const specimenCard = document.getElementById('specimenCard') as HTMLElement;
const badgeSource = document.getElementById('badgeSource') as HTMLElement;
const badgeRate = document.getElementById('badgeRate') as HTMLElement;
const badgeAcoustic = document.getElementById('badgeAcoustic') as HTMLElement;
const valEntity = document.getElementById('valEntity') as HTMLElement;
const valConflict = document.getElementById('valConflict') as HTMLElement;
const valAction = document.getElementById('valAction') as HTMLElement;
const limitEntity = document.getElementById('limitEntity') as HTMLElement;
const limitConflict = document.getElementById('limitConflict') as HTMLElement;
const limitAction = document.getElementById('limitAction') as HTMLElement;
const specimenMeta = document.getElementById('specimenMeta') as HTMLElement;
const btnCopyMarkdown = document.getElementById('btnCopyMarkdown') as HTMLButtonElement;
const btnSaveToShelf = document.getElementById('btnSaveToShelf') as HTMLButtonElement;

// Window Controls
const btnWinClose = document.getElementById('btnWinClose') as HTMLButtonElement;
const btnWinMinimize = document.getElementById('btnWinMinimize') as HTMLButtonElement;
const windowBody = document.getElementById('windowBody') as HTMLElement;
const btnToggleSound = document.getElementById('btnToggleSound') as HTMLButtonElement;

// Drawer Elements
const btnOpenDrawer = document.getElementById('btnOpenDrawer') as HTMLButtonElement;
const btnCloseDrawer = document.getElementById('btnCloseDrawer') as HTMLButtonElement;
const drawerOverlay = document.getElementById('drawerOverlay') as HTMLElement;
const drawerWindow = document.getElementById('drawerWindow') as HTMLElement;
const drawerList = document.getElementById('drawerList') as HTMLElement;
const drawerCount = document.getElementById('drawerCount') as HTMLElement;
const btnClearAllHistory = document.getElementById('btnClearAllHistory') as HTMLButtonElement;

// Settings Modal Elements
const btnOpenSettings = document.getElementById('btnOpenSettings') as HTMLButtonElement;
const btnCloseSettings = document.getElementById('btnCloseSettings') as HTMLButtonElement;
const btnCancelSettings = document.getElementById('btnCancelSettings') as HTMLButtonElement;
const btnSaveSettings = document.getElementById('btnSaveSettings') as HTMLButtonElement;
const settingsModal = document.getElementById('settingsModal') as HTMLElement;
const selectProvider = document.getElementById('selectProvider') as HTMLSelectElement;
const inputApiKey = document.getElementById('inputApiKey') as HTMLInputElement;
const inputBaseUrl = document.getElementById('inputBaseUrl') as HTMLInputElement;
const inputModelName = document.getElementById('inputModelName') as HTMLInputElement;
const groupApiKey = document.getElementById('groupApiKey') as HTMLElement;
const groupBaseUrl = document.getElementById('groupBaseUrl') as HTMLElement;
const groupModelName = document.getElementById('groupModelName') as HTMLElement;

// Toast
const toastMsg = document.getElementById('toastMsg') as HTMLElement;

// ============================================================================
// Helper Utilities
// ============================================================================

function showToast(message: string): void {
  toastMsg.textContent = message;
  toastMsg.classList.add('show');
  setTimeout(() => {
    toastMsg.classList.remove('show');
  }, 2200);
}

function updateEngineLabel(): void {
  const map: Record<ProviderType, string> = {
    local: '本地启发式规则引擎',
    gemini: 'Google Gemini',
    openai: 'OpenAI',
    deepseek: 'DeepSeek',
    kimi: 'Moonshot Kimi',
  };
  const name = map[apiConfig.provider] || '本地规则';
  currentEngineLabel.textContent = `引擎: ${name}${apiConfig.provider !== 'local' && !apiConfig.apiKey ? ' (未配Key, 降级本地)' : ''}`;
}

function updateSoundButton(): void {
  btnToggleSound.textContent = isMuted ? '🔇 音效: 关' : '🔊 音效: 开';
}

function updateCharCount(): void {
  const len = rawTextInput.value.trim().length;
  charCount.textContent = String(len);
}

function updateDotMatrix(percent: number): void {
  const totalSlots = 10;
  const filledCount = Math.round((percent / 100) * totalSlots);
  const filled = '■'.repeat(filledCount);
  const empty = '□'.repeat(totalSlots - filledCount);
  dotMatrixDisplay.textContent = `[${filled}${empty}]`;
}

// ============================================================================
// Drawer Management
// ============================================================================

function renderDrawerList(): void {
  drawerCount.textContent = String(historyCards.length);
  if (historyCards.length === 0) {
    drawerList.innerHTML = `
      <div class="drawer-empty-msg">暂无保存的脱水卡片。在主界面完成脱水后点击“存入历史抽屉”即可归档。</div>
    `;
    return;
  }

  drawerList.innerHTML = historyCards
    .map(
      (card, idx) => `
    <div class="history-card-item" data-id="${card.id}">
      <div class="history-card-header">
        <span>#${historyCards.length - idx} • ${new Date(card.timestamp).toLocaleTimeString()}</span>
        <span class="chip-badge highlight">脱水率: ${card.compressionRate}%</span>
      </div>
      <div class="history-card-row">
        <span class="history-card-label">【实体与动作】:</span>
        <div class="history-card-val">${escapeHtml(card.coreEntitiesAndAction)}</div>
      </div>
      <div class="history-card-row">
        <span class="history-card-label">【矛盾与卡点】:</span>
        <div class="history-card-val">${escapeHtml(card.keyConflict)}</div>
      </div>
      <div class="history-card-row">
        <span class="history-card-label">【下一步动作】:</span>
        <div class="history-card-val">${escapeHtml(card.nextAction)}</div>
      </div>
      <div class="history-card-footer">
        <button class="next-mini-btn btn-copy-card" data-index="${idx}">复制 MD</button>
        <button class="next-mini-btn btn-load-card" data-index="${idx}">载入面板</button>
        <button class="next-mini-btn btn-delete-card" data-index="${idx}">删除</button>
      </div>
    </div>
  `
    )
    .join('');

  // Bind item events
  drawerList.querySelectorAll('.btn-copy-card').forEach(btn => {
    btn.addEventListener('click', e => {
      const idx = Number((e.currentTarget as HTMLElement).dataset.index);
      const card = historyCards[idx];
      if (card) {
        copyCardAsMarkdown(card);
      }
    });
  });

  drawerList.querySelectorAll('.btn-load-card').forEach(btn => {
    btn.addEventListener('click', e => {
      const idx = Number((e.currentTarget as HTMLElement).dataset.index);
      const card = historyCards[idx];
      if (card) {
        loadCardToMain(card);
        closeDrawer();
      }
    });
  });

  drawerList.querySelectorAll('.btn-delete-card').forEach(btn => {
    btn.addEventListener('click', e => {
      const idx = Number((e.currentTarget as HTMLElement).dataset.index);
      historyCards.splice(idx, 1);
      saveHistoryCards(historyCards);
      renderDrawerList();
      showToast('已从抽屉移除该卡片');
    });
  });
}

function openDrawer(): void {
  renderDrawerList();
  drawerOverlay.classList.add('open');
  drawerWindow.classList.add('open');
}

function closeDrawer(): void {
  drawerOverlay.classList.remove('open');
  drawerWindow.classList.remove('open');
}

function escapeHtml(str: string): string {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ============================================================================
// Markdown Copying & Card Presentation
// ============================================================================

function generateMarkdown(card: DehydratedResult): string {
  return `### ◈ 思绪脱水标本 (Thought Dehydrator)
- **【核心实体与动作】**：${card.coreEntitiesAndAction}
- **【潜在矛盾/关键卡点】**：${card.keyConflict}
- **【下一步动作】**：${card.nextAction}

> 压缩概览: 原文 ${card.originalLength} 字 → 脱水后 ${card.dehydratedLength} 字 (脱水率: ${card.compressionRate}%)
> 来源引擎: ${card.source.toUpperCase()} | 生成时间: ${new Date(card.timestamp).toLocaleString()}
`;
}

function copyCardAsMarkdown(card: DehydratedResult): void {
  const md = generateMarkdown(card);
  navigator.clipboard
    .writeText(md)
    .then(() => {
      showToast('✓ Markdown 卡片已复制到剪贴板');
    })
    .catch(() => {
      showToast('复制失败，请手动选取内容');
    });
}

function renderResultToCard(result: DehydratedResult): void {
  currentResult = result;

  valEntity.textContent = result.coreEntitiesAndAction;
  limitEntity.textContent = `${result.coreEntitiesAndAction.length} / 20 字`;

  valConflict.textContent = result.keyConflict;
  limitConflict.textContent = `${result.keyConflict.length} / 20 字`;

  valAction.textContent = result.nextAction;
  limitAction.textContent = `${result.nextAction.length} / 15 字`;

  if (result.apiError) {
    badgeSource.textContent = `来源: 本地规则 (⚠️ API 异常已降级)`;
    badgeSource.style.background = '#8b0000';
    badgeSource.style.color = '#ffffff';
    badgeSource.title = `API 错误信息: ${result.apiError}`;
  } else {
    badgeSource.textContent = `来源: ${result.source.toUpperCase()}`;
    badgeSource.style.background = '';
    badgeSource.style.color = '';
    badgeSource.title = '';
  }
  badgeRate.textContent = `脱水率: ${result.compressionRate}%`;

  const hashHex = (result.hashValue % 65535).toString(16).toUpperCase().padStart(4, '0');
  badgeAcoustic.textContent = `和弦指纹: #${hashHex}`;

  specimenMeta.textContent = `原始: ${result.originalLength} 字 → 脱水后: ${result.dehydratedLength} 字 (精简 ${result.originalLength - result.dehydratedLength} 字)`;

  btnCopyMarkdown.disabled = false;
  btnSaveToShelf.disabled = false;

  // Flash card with 90s aesthetic relief border
  specimenCard.style.outline = '2px solid #000000';
  setTimeout(() => {
    specimenCard.style.outline = 'none';
  }, 400);
}

function loadCardToMain(card: DehydratedResult): void {
  rawTextInput.value = card.originalText;
  updateCharCount();
  renderResultToCard(card);
  showToast('已将历史卡片载入工作区');
}

// ============================================================================
// Dehydrate Execution Flow
// ============================================================================

async function handleDehydrate(): Promise<void> {
  const text = rawTextInput.value.trim();
  if (!text) {
    showToast('请先输入或选择预设长文本');
    rawTextInput.focus();
    return;
  }

  if (isProcessing) return;
  isProcessing = true;

  btnDehydrate.disabled = true;
  btnResetAll.disabled = true;
  statusLed.className = 'status-led processing';

  try {
    const result = await processDehydration(text, apiConfig, (progress, label) => {
      updateDotMatrix(progress);
      progressStatusLabel.textContent = label;
    });

    renderResultToCard(result);
    updateDotMatrix(100);

    if (result.apiError) {
      progressStatusLabel.textContent = 'API 异常已降级为本地规则';
      showToast(`⚠️ API 鉴权/调用失败，已自动降级至本地规则脱水！`);
    } else {
      progressStatusLabel.textContent = '脱水完成 (COMPLETED)';
      showToast('思绪脱水完成，泛音和弦已鸣响');
    }
  } catch (err: unknown) {
    console.error('Dehydration failed:', err);
    progressStatusLabel.textContent = '错误 (ERROR)';
    showToast(err instanceof Error ? err.message : '处理发生未知异常');
  } finally {
    isProcessing = false;
    btnDehydrate.disabled = false;
    btnResetAll.disabled = false;
    statusLed.className = 'status-led idle';
  }
}

// ============================================================================
// Settings Modal Logic
// ============================================================================

function openSettingsModal(): void {
  selectProvider.value = apiConfig.provider;
  inputApiKey.value = apiConfig.apiKey;
  inputBaseUrl.value = apiConfig.baseUrl || '';
  inputModelName.value = apiConfig.modelName || '';
  updateModalFieldsVisibility();
  settingsModal.classList.add('open');
}

function closeSettingsModal(): void {
  settingsModal.classList.remove('open');
}

function updateModalFieldsVisibility(): void {
  const provider = selectProvider.value;
  if (provider === 'local') {
    groupApiKey.style.display = 'none';
    groupBaseUrl.style.display = 'none';
    groupModelName.style.display = 'none';
  } else {
    groupApiKey.style.display = 'flex';
    groupBaseUrl.style.display = 'flex';
    groupModelName.style.display = 'flex';
  }
}

function handleSaveSettings(): void {
  apiConfig = {
    provider: selectProvider.value as ProviderType,
    apiKey: inputApiKey.value.trim(),
    baseUrl: inputBaseUrl.value.trim(),
    modelName: inputModelName.value.trim(),
  };
  saveApiConfig(apiConfig);
  updateEngineLabel();
  closeSettingsModal();
  showToast('API 与模型配置已更新');
}

// ============================================================================
// Initialization & Event Attachments
// ============================================================================

function initEvents(): void {
  // Realtime Char count
  rawTextInput.addEventListener('input', updateCharCount);

  // Preset sample buttons
  document.querySelectorAll('.sample-pill-btn[data-sample]').forEach(btn => {
    btn.addEventListener('click', e => {
      const idx = Number((e.currentTarget as HTMLElement).dataset.sample);
      const sample = SAMPLE_THOUGHTS[idx];
      if (sample) {
        rawTextInput.value = sample.text;
        updateCharCount();
        showToast(`已装载样本: ${sample.title}`);
      }
    });
  });

  btnClearInput.addEventListener('click', () => {
    rawTextInput.value = '';
    updateCharCount();
    showToast('文本已清空');
  });

  // Main Action: Dehydrate
  btnDehydrate.addEventListener('click', handleDehydrate);

  // Reset
  btnResetAll.addEventListener('click', () => {
    rawTextInput.value = '';
    updateCharCount();
    currentResult = null;
    valEntity.textContent = '等待脱水输入...';
    valConflict.textContent = '等待脱水输入...';
    valAction.textContent = '等待脱水输入...';
    limitEntity.textContent = '0 / 20 字';
    limitConflict.textContent = '0 / 20 字';
    limitAction.textContent = '0 / 15 字';
    badgeRate.textContent = '脱水率: --%';
    badgeSource.textContent = '来源: 本地规则';
    badgeAcoustic.textContent = '声学印记: 待生成';
    specimenMeta.textContent = '原始: 0 字 → 脱水后: 0 字';
    btnCopyMarkdown.disabled = true;
    btnSaveToShelf.disabled = true;
    updateDotMatrix(0);
    progressStatusLabel.textContent = '就绪 (READY)';
    showToast('工作区已重置');
  });

  // Copy Markdown
  btnCopyMarkdown.addEventListener('click', () => {
    if (currentResult) {
      copyCardAsMarkdown(currentResult);
    }
  });

  // Save to Shelf
  btnSaveToShelf.addEventListener('click', () => {
    if (currentResult) {
      historyCards.unshift(currentResult);
      saveHistoryCards(historyCards);
      renderDrawerList();
      showToast('已存入本地卡片历史抽屉');
    }
  });

  // Sound Toggle
  btnToggleSound.addEventListener('click', () => {
    isMuted = !isMuted;
    soundFx.setMuted(isMuted);
    saveSoundMuted(isMuted);
    updateSoundButton();
    showToast(isMuted ? '音效已静音' : '音效已开启');
  });

  // Drawer Controls
  btnOpenDrawer.addEventListener('click', openDrawer);
  btnCloseDrawer.addEventListener('click', closeDrawer);
  drawerOverlay.addEventListener('click', closeDrawer);
  btnClearAllHistory.addEventListener('click', () => {
    if (confirm('确认清空所有历史卡片？此操作无法撤销。')) {
      historyCards = [];
      saveHistoryCards(historyCards);
      renderDrawerList();
      showToast('历史抽屉已清空');
    }
  });

  // Settings Controls
  btnOpenSettings.addEventListener('click', openSettingsModal);
  btnCloseSettings.addEventListener('click', closeSettingsModal);
  btnCancelSettings.addEventListener('click', closeSettingsModal);
  selectProvider.addEventListener('change', updateModalFieldsVisibility);
  btnSaveSettings.addEventListener('click', handleSaveSettings);

  // Window Minimize / Close buttons (Authentic NeXT UI feel)
  let isMinimized = false;
  btnWinMinimize.addEventListener('click', () => {
    isMinimized = !isMinimized;
    windowBody.style.display = isMinimized ? 'none' : 'flex';
    btnWinMinimize.textContent = isMinimized ? '▲' : '▼';
  });

  btnWinClose.addEventListener('click', () => {
    if (confirm('确定要最小化并关闭当前工作台视图吗？')) {
      windowBody.style.display = 'none';
      showToast('窗口已最小化，再次点击标题栏控制按钮可恢复');
      setTimeout(() => {
        windowBody.style.display = 'flex';
      }, 1000);
    }
  });
}

// Initial Boot
updateEngineLabel();
updateSoundButton();
updateCharCount();
renderDrawerList();
initEvents();
