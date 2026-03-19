import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export const runtime = "nodejs";

const DATA_DIR = path.join(process.cwd(), "data");
const HISTORY_FILE = path.join(DATA_DIR, "ai-lab-history.json");

interface HistoryRecord {
  id: string;
  title: string;
  type: "product" | "clothing" | "model";
  createdAt: string;
  duration: string;
  status: "completed" | "processing" | "failed";
  hasEnglish: boolean;
  desc: string;
  videoUrl?: string;
  imageUrls?: string[];
  originalVideoUrl?: string;
}

async function ensureDataDir() {
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true });
  }
}

async function readHistory(): Promise<HistoryRecord[]> {
  await ensureDataDir();
  if (!existsSync(HISTORY_FILE)) {
    return [];
  }
  try {
    const data = await readFile(HISTORY_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeHistory(records: HistoryRecord[]): Promise<void> {
  await ensureDataDir();
  await writeFile(HISTORY_FILE, JSON.stringify(records, null, 2), "utf-8");
}

// GET - 获取历史列表
export async function GET() {
  try {
    const history = await readHistory();
    // 按时间倒序
    history.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return NextResponse.json({ success: true, history });
  } catch (error: any) {
    console.error("Read history error:", error);
    return NextResponse.json(
      { error: "获取历史记录失败" },
      { status: 500 }
    );
  }
}

// POST - 新增历史记录
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      type = "product",
      duration = "0:30",
      status = "completed",
      hasEnglish = false,
      desc = "",
      videoUrl,
      imageUrls,
      originalVideoUrl,
    } = body;

    if (!title) {
      return NextResponse.json({ error: "缺少标题" }, { status: 400 });
    }

    const record: HistoryRecord = {
      id: uuidv4(),
      title,
      type,
      createdAt: new Date().toLocaleString("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
      duration,
      status,
      hasEnglish,
      desc,
      videoUrl,
      imageUrls,
      originalVideoUrl,
    };

    const history = await readHistory();
    history.unshift(record);
    await writeHistory(history);

    return NextResponse.json({ success: true, record });
  } catch (error: any) {
    console.error("Write history error:", error);
    return NextResponse.json(
      { error: "保存历史记录失败" },
      { status: 500 }
    );
  }
}
