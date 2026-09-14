import { ApiConfig, DehydratedResult } from './types';
import { soundFx } from './audio';

/**
 * 停用修饰词与冗长口水话词表
 */
const FILLER_PATTERNS = [
  /说实话[，,、 ]*/g,
  /整个人感觉特别心累[，,、 ]*/g,
  /我觉得[，,、 ]*/g,
  /我认为[，,、 ]*/g,
  /可能[，,、 ]*/g,
  /大概[，,、 ]*/g,
  /总的来说[，,、 ]*/g,
  /也就是[，,、 ]*/g,
  /很多时候[，,、 ]*/g,
  /其实[，,、 ]*/g,
  /大家都在说[，,、 ]*/g,
  /核心症结就是[，,、 ]*/g,
  /最大的卡点在于[，,、 ]*/g,
  /当下最稳妥的做法就是[，,、 ]*/g,
  /所以我感觉今天不能再扯皮了[，,、 ]*/g,
  /不能再继续这种内耗了[，,、 ]*/g,
  /感觉这几个月自己[，,、 ]*/g,
  /陷入了一种[，,、 ]*/g,
  /今天下午和.*?开了.*?长会[，,、 ]*/g,
  /最近一直在琢磨[，,、 ]*/g,
];

/**
 * 矛盾/卡点关键词特征库
 */
const CONFLICT_KEYWORDS = [
  '卡死', '卡点', '瓶颈', '溢出', '耗尽', '延期', '冲突', '难点',
  '风险', '缺少', '没有', '不足', '阻碍', '限制', '吃不消', '内耗',
  '逃避', '报错', '不通', '拉扯', '超标', '缺陷', '症结', '但是',
  '然而', '可是', '但'
];

/**
 * 下一步行动关键词特征库
 */
const ACTION_KEYWORDS = [
  '立刻', '马上', '必须', '下一步', '计划', '引入', '拉上', '召开',
  '编写', '提交', '转换', '重构', '升级', '上线', '优化', '执行',
  '敲出', '收拾', '安排', '联系', '降级', '锁定', '推进', '验证'
];

/**
 * 本地智能规则脱水引擎 (无需 API Key，纯本地断词与启发式特征提取)
 */
export function dehydrateWithRules(text: string): {
  coreEntitiesAndAction: string;
  keyConflict: string;
  nextAction: string;
} {
  const cleanInput = text.trim();
  if (!cleanInput) {
    return {
      coreEntitiesAndAction: '无有效输入内容',
      keyConflict: '未检测到文本信息',
      nextAction: '输入或粘贴文本',
    };
  }

  // 1. 按句子与标点粗切
  const sentences = cleanInput
    .split(/[\r\n。！？；!?;\.]/)
    .map(s => s.trim())
    .filter(s => s.length > 2);

  // 2. 提取潜在矛盾/关键卡点 (<= 20 字)
  let bestConflict = '';
  let conflictScore = -1;

  for (const sentence of sentences) {
    // 句子细拆为从句
    const clauses = sentence.split(/[，,]/).map(c => c.trim()).filter(Boolean);
    for (const clause of clauses) {
      let score = 0;
      for (const kw of CONFLICT_KEYWORDS) {
        if (clause.includes(kw)) {
          score += kw.length > 1 ? 3 : 1;
        }
      }
      if (score > conflictScore) {
        conflictScore = score;
        // 清洗句首转折连词与前置冗余
        bestConflict = clause
          .replace(/^(但是|然而|可是|但|不过|虽然|核心症结就是|最大的卡点在于|最大的问题是|结果|中台那边的|其实就是)/, '')
          .replace(/^[，,、 ]+/, '')
          .trim();
      }
    }
  }

  if (!bestConflict || conflictScore === 0) {
    // 兜底策略：寻找含“不/难/慢/错”的短语
    const fallback = sentences.find(s => /[不难慢错差停卡]/.test(s));
    bestConflict = fallback ? fallback.slice(0, 20) : '未暴露显式阻碍卡点';
  }

  // 3. 提取下一步动作 (<= 15 字)
  let bestAction = '';
  let actionScore = -1;

  // 倒序寻找更符合人类在文末做决断的心理特征
  for (let i = sentences.length - 1; i >= 0; i--) {
    const sentence = sentences[i];
    const clauses = sentence.split(/[，,]/).map(c => c.trim()).filter(Boolean);
    for (const clause of clauses) {
      let score = 0;
      for (const kw of ACTION_KEYWORDS) {
        if (clause.includes(kw)) {
          score += kw.length > 1 ? 3 : 1;
        }
      }
      if (score > actionScore) {
        actionScore = score;
        bestAction = clause
          .replace(/^(所以|那么|因此|当下最稳妥的做法就是|不能再继续这种内耗了|今晚洗完澡就|明天一早我必须|我感觉|今天)/, '')
          .trim();
      }
    }
  }

  if (!bestAction || actionScore === 0) {
    const lastClause = sentences[sentences.length - 1];
    bestAction = lastClause ? lastClause.slice(0, 15) : '明确优先代办项';
  }

  // 4. 提取核心实体与动作 (<= 20 字)
  // 过滤掉已被识别为卡点和动作的句子，以及口水词
  let filteredText = cleanInput;
  FILLER_PATTERNS.forEach(pat => {
    filteredText = filteredText.replace(pat, '');
  });

  const remainingSentences = filteredText
    .split(/[\r\n。！？；!?;\.]/)
    .map(s => s.trim())
    .filter(s => s.length > 3);

  let bestEntityAction = '';
  for (const sentence of remainingSentences) {
    // 优先抓取含有业务/技术实体词的主谓宾结构
    const clauses = sentence.split(/[，,]/).map(c => c.trim()).filter(Boolean);
    for (const clause of clauses) {
      if (clause !== bestConflict && clause !== bestAction) {
        bestEntityAction = clause
          .replace(/^(今天|最近|我们|他们|其实|说实话)/, '')
          .trim();
        if (bestEntityAction.length >= 6) {
          break;
        }
      }
    }
    if (bestEntityAction.length >= 6) break;
  }

  if (!bestEntityAction) {
    bestEntityAction = cleanInput.slice(0, 20);
  }

  // 严格字数裁切 (符合题意：不超过20字、20字、15字)
  return {
    coreEntitiesAndAction: bestEntityAction.slice(0, 20),
    keyConflict: bestConflict.slice(0, 20),
    nextAction: bestAction.slice(0, 15),
  };
}

/**
 * 针对各 LLM 厂商的 API 脱水调用
 */
export async function dehydrateWithLLM(
  text: string,
  config: ApiConfig
): Promise<{
  coreEntitiesAndAction: string;
  keyConflict: string;
  nextAction: string;
}> {
  const prompt = `你是一个极其冷酷、追求极致信息密度的"思绪脱水机"。
请将以下冗余杂乱的思考/随手记彻底脱水，剔除所有情绪词、寒暄、口水话和修饰语，仅提取最核心的骨架。

必须严格输出 JSON 格式（不要包含任何额外 Markdown 之外的解释），JSON 结构如下：
{
  "coreEntitiesAndAction": "核心实体与动作（严格不超过20个字）",
  "keyConflict": "潜在矛盾或关键卡点（严格不超过20个字）",
  "nextAction": "下一步动作（严格不超过15个字）"
}

待脱水文本：
${text}
`;

  let responseText = '';

  if (config.provider === 'gemini') {
    const model = config.modelName || 'gemini-1.5-flash';
    const base = config.baseUrl?.trim() || 'https://generativelanguage.googleapis.com';
    const url = `${base}/v1beta/models/${model}:generateContent?key=${encodeURIComponent(config.apiKey.trim())}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`Gemini API 错误 (${res.status}): ${errBody.slice(0, 120)}`);
    }

    const data = await res.json();
    responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  } else {
    // OpenAI / DeepSeek / Kimi (OpenAI 兼容协议)
    let defaultBase = 'https://api.openai.com/v1';
    let defaultModel = 'gpt-4o-mini';

    if (config.provider === 'deepseek') {
      defaultBase = 'https://api.deepseek.com';
      defaultModel = 'deepseek-chat';
    } else if (config.provider === 'kimi') {
      defaultBase = 'https://api.moonshot.cn/v1';
      defaultModel = 'moonshot-v1-8k';
    }

    const base = (config.baseUrl?.trim() || defaultBase).replace(/\/+$/, '');
    const url = `${base}/chat/completions`;
    const model = config.modelName?.trim() || defaultModel;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey.trim()}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: 'You are an extreme thought dehydrator. Output JSON only.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.1,
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`${config.provider.toUpperCase()} API 错误 (${res.status}): ${errBody.slice(0, 120)}`);
    }

    const data = await res.json();
    responseText = data.choices?.[0]?.message?.content || '';
  }

  // 解析并兜底提取 JSON
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('模型返回格式未能解析为 JSON');
  }

  const parsed = JSON.parse(jsonMatch[0]);

  return {
    coreEntitiesAndAction: String(parsed.coreEntitiesAndAction || '').trim().slice(0, 20),
    keyConflict: String(parsed.keyConflict || '').trim().slice(0, 20),
    nextAction: String(parsed.nextAction || '').trim().slice(0, 15),
  };
}

/**
 * 主执行函数：封装脱水流程，整合音效与指标计算
 */
export async function processDehydration(
  rawText: string,
  config: ApiConfig,
  onProgress?: (step: number, label: string) => void
): Promise<DehydratedResult> {
  const text = rawText.trim();
  if (!text) {
    throw new Error('请输入待脱水的文本内容');
  }

  // 1. 触发升调脉冲琶音 (Arpeggio)
  soundFx.playStartArpeggio();

  onProgress?.(20, '正在初始化脱水分析矩阵...');
  await new Promise(r => setTimeout(r, 120));

  let extracted: { coreEntitiesAndAction: string; keyConflict: string; nextAction: string };
  let source: DehydratedResult['source'] = 'local';
  let apiError: string | undefined = undefined;
  let fallbackNote: string | undefined = undefined;

  if (config.provider !== 'local' && config.apiKey.trim()) {
    onProgress?.(50, `调用 ${config.provider.toUpperCase()} 进行神经脱水...`);
    try {
      extracted = await dehydrateWithLLM(text, config);
      source = config.provider;
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.warn('LLM 调用失败，自动降级为本地规则解析:', errMsg);
      apiError = errMsg;
      fallbackNote = `API 报错 (${errMsg.slice(0, 45)}...)`;
      onProgress?.(70, `API 失败: ${errMsg.slice(0, 30)}，已降级至本地规则...`);
      await new Promise(r => setTimeout(r, 200));
      extracted = dehydrateWithRules(text);
      source = 'local';
    }
  } else {
    onProgress?.(60, '正在执行本地主谓宾与冲突矩阵启发式脱水...');
    await new Promise(r => setTimeout(r, 260));
    extracted = dehydrateWithRules(text);
    source = 'local';
  }

  onProgress?.(90, '正在合成晶体管和弦与哈希声学回响...');
  await new Promise(r => setTimeout(r, 100));

  // 结果组合与长度计算
  const originalLength = text.length;
  const dehydratedContent = `${extracted.coreEntitiesAndAction} ${extracted.keyConflict} ${extracted.nextAction}`;
  const dehydratedLength = dehydratedContent.length;
  const compressionRate = Math.max(0, Math.round(((originalLength - dehydratedLength) / originalLength) * 100));
  const hashValue = soundFx.hashString(dehydratedContent);

  // 2. 触发完成清脆泛音和弦与混响
  soundFx.playFinishChime(dehydratedContent);

  onProgress?.(100, '思绪脱水完成');

  return {
    id: 'th_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    timestamp: Date.now(),
    coreEntitiesAndAction: extracted.coreEntitiesAndAction,
    keyConflict: extracted.keyConflict,
    nextAction: extracted.nextAction,
    originalText: text,
    originalLength,
    dehydratedLength,
    compressionRate,
    hashValue,
    source,
    apiError,
    fallbackNote,
  };
}
