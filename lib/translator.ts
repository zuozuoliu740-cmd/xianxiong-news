/**
 * 微软 Edge 翻译 API（免费、无需注册）
 * 原理：借用 Edge 浏览器翻译功能的公开 Token 端点
 * Token 有效期约 10 分钟，超过后自动刷新
 */

// ---- Token 缓存 ----
let cachedToken: string | null = null;
let tokenExpireAt: number = 0;
const TOKEN_TTL = 9 * 60 * 1000; // 9 分钟（稍早于 10 分钟过期）

// ---- 翻译结果缓存（避免相同文本重复请求）----
const translateCache = new Map<string, string>();

async function getToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpireAt) return cachedToken;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch("https://edge.microsoft.com/translate/auth", {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0",
      },
    });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`Token fetch failed: ${res.status}`);
    cachedToken = await res.text();
    tokenExpireAt = Date.now() + TOKEN_TTL;
    return cachedToken;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

/**
 * 批量翻译英文文本到中文
 * @param texts 英文文本数组（每次最多 25 条）
 * @returns 对应中文数组，翻译失败时保留原文
 */
export async function translateToZh(texts: string[]): Promise<string[]> {
  if (texts.length === 0) return [];

  // 检查缓存，过滤出未翻译的
  const results: string[] = new Array(texts.length).fill("");
  const needTranslate: Array<{ idx: number; text: string }> = [];

  for (let i = 0; i < texts.length; i++) {
    const cached = translateCache.get(texts[i]);
    if (cached) {
      results[i] = cached;
    } else {
      needTranslate.push({ idx: i, text: texts[i] });
    }
  }

  if (needTranslate.length === 0) return results;

  try {
    const token = await getToken();

    // 每批最多 25 条
    const BATCH = 25;
    for (let start = 0; start < needTranslate.length; start += BATCH) {
      const batch = needTranslate.slice(start, start + BATCH);
      const body = JSON.stringify(batch.map((b) => ({ Text: b.text })));

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 10000);

      try {
        const res = await fetch(
          "https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&from=en&to=zh-Hans",
          {
            method: "POST",
            signal: controller.signal,
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body,
          }
        );
        clearTimeout(timer);

        if (!res.ok) throw new Error(`Translate API error: ${res.status}`);

        const data = (await res.json()) as Array<{
          translations: Array<{ text: string; to: string }>;
        }>;

        for (let i = 0; i < batch.length; i++) {
          const translated = data[i]?.translations?.[0]?.text ?? batch[i].text;
          results[batch[i].idx] = translated;
          // 写入缓存
          translateCache.set(batch[i].text, translated);
        }
      } catch (batchErr) {
        clearTimeout(timer);
        // 这批失败，保留原文
        for (const b of batch) {
          results[b.idx] = b.text;
        }
        console.error("[translator] batch failed:", batchErr);
      }
    }
  } catch (tokenErr) {
    console.error("[translator] token failed:", tokenErr);
    // token 获取失败，全部保留原文
    for (const b of needTranslate) {
      results[b.idx] = b.text;
    }
  }

  return results;
}

/**
 * 判断文本是否主要为英文（用于决定是否需要翻译）
 */
export function isEnglish(text: string): boolean {
  if (!text) return false;
  // 统计英文字母占比，超过 60% 认为是英文
  const letters = text.replace(/[^a-zA-Z\u4e00-\u9fff]/g, "");
  if (letters.length === 0) return false;
  const ascii = text.replace(/[^a-zA-Z]/g, "").length;
  return ascii / letters.length > 0.6;
}
