import { NextRequest, NextResponse } from "next/server";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";

export const runtime = "nodejs";

/**
 * 根据视频时长裁剪文本，使配音时长与视频匹配
 * 中文语速约 3.5~4 字/秒
 */
function trimTextForDuration(text: string, durationSec: number): string {
  const charsPerSec = 3.8;
  const targetChars = Math.floor(durationSec * charsPerSec);

  if (text.length <= targetChars) return text;

  // 按句号、感叹号、问号分割
  const sentences = text.split(/(?<=[。！？])/);
  let result = "";
  for (const s of sentences) {
    if ((result + s).length > targetChars) break;
    result += s;
  }

  // 如果没有完整句子能放下，按逗号分割
  if (!result) {
    const clauses = text.split(/(?<=[，、,；])/);
    for (const c of clauses) {
      if ((result + c).length > targetChars) break;
      result += c;
    }
  }

  return result || text.slice(0, targetChars);
}

export async function POST(req: NextRequest) {
  try {
    const { text, duration = 10, voice = "zh-CN-XiaoxiaoNeural" } = await req.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "缺少配音文本" }, { status: 400 });
    }

    // 清理文本：移除emoji和特殊符号
    const cleanText = text
      .replace(/[\u{1F600}-\u{1F9FF}]/gu, "")
      .replace(/[\u{2600}-\u{27BF}]/gu, "")
      .replace(/[\u{FE00}-\u{FE0F}]/gu, "")
      .replace(/[✨💛🧡❤️💚💙💜🤎🖤🤍⭐🌟]/g, "")
      .replace(/\s+/g, " ")
      .trim();

    const trimmedText = trimTextForDuration(cleanText, duration);

    console.log(
      `[TTS] 原始 ${text.length} 字 -> 裁剪 ${trimmedText.length} 字 (目标 ${duration}s)`
    );

    const tts = new MsEdgeTTS();
    await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
    const { audioStream } = tts.toStream(trimmedText);

    // 收集音频数据
    const chunks: Buffer[] = [];
    for await (const chunk of audioStream) {
      if (Buffer.isBuffer(chunk)) {
        chunks.push(chunk);
      }
    }
    const audioBuffer = Buffer.concat(chunks);

    if (audioBuffer.length === 0) {
      return NextResponse.json({ error: "配音生成结果为空" }, { status: 500 });
    }

    console.log(`[TTS] 生成完成: ${audioBuffer.length} bytes`);

    return new Response(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.length.toString(),
        "X-Voiceover-Text": encodeURIComponent(trimmedText),
      },
    });
  } catch (error: any) {
    console.error("Generate TTS error:", error);
    return NextResponse.json(
      { error: "配音生成失败: " + (error.message || "未知错误") },
      { status: 500 }
    );
  }
}
