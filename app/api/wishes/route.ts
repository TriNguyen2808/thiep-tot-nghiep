import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { INITIAL_WISHES } from '@/data/initialData';
import { Wish } from '@/types';

const dataFilePath = path.join(process.cwd(), 'data', 'wishes.json');
const tmpFilePath = path.join('/tmp', 'wishes.json');

const REPO_OWNER = process.env.GITHUB_REPO_OWNER || 'TriNguyen2808';
const REPO_NAME = process.env.GITHUB_REPO_NAME || 'thiep-tot-nghiep';
const GITHUB_WISHES_FILE_PATH = 'data/wishes.json';

function getGitHubToken(): string | undefined {
  return process.env.GITHUB_TOKEN?.trim();
}

// In-memory store cho runtime Next.js
let wishesMemory: Wish[] = [...INITIAL_WISHES];

function getStoredWishes(): Wish[] {
  // 1. Thử đọc từ /tmp
  try {
    if (fs.existsSync(tmpFilePath)) {
      const data = JSON.parse(fs.readFileSync(tmpFilePath, 'utf-8'));
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch (_) {}

  // 2. Thử đọc từ data/wishes.json
  try {
    if (fs.existsSync(dataFilePath)) {
      const data = JSON.parse(fs.readFileSync(dataFilePath, 'utf-8'));
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch (_) {}

  return wishesMemory;
}

function persistWishes(list: Wish[]) {
  wishesMemory = list;
  try {
    fs.writeFileSync(tmpFilePath, JSON.stringify(list), 'utf-8');
  } catch (_) {}
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(list, null, 2), 'utf-8');
  } catch (_) {}
}

export async function GET() {
  const token = getGitHubToken();

  // 1. Thử lấy từ GitHub nếu có token hoặc đang trên Vercel
  if (token || process.env.VERCEL) {
    try {
      const headers: Record<string, string> = {
        'User-Agent': 'NextJS-Thiep-Moi-App',
        'Accept': 'application/vnd.github.v3.raw',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const ghRes = await fetch(
        `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${GITHUB_WISHES_FILE_PATH}?ref=main&t=${Date.now()}`,
        { headers, cache: 'no-store' }
      );

      if (ghRes.ok) {
        const ghData = await ghRes.json();
        if (Array.isArray(ghData)) {
          wishesMemory = ghData;
          return NextResponse.json({
            success: true,
            data: ghData,
            source: 'github',
          });
        }
      }
    } catch (e) {
      console.warn('Lỗi đọc wishes từ GitHub API, thử đọc local:', e);
    }
  }

  const current = getStoredWishes();
  return NextResponse.json({
    success: true,
    data: current,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, attendance, message, images, isPublic } = body;

    const finalName = isPublic ? (name?.trim() || 'Bạn Thân Mến') : 'Một người bạn ẩn danh 🤫';

    const newWish: Wish = {
      id: `wish-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: finalName,
      attendance: attendance || 'yes',
      message: (message || '').trim(),
      images: Array.isArray(images) ? images : [],
      isPublic: Boolean(isPublic),
      likes: 0,
      createdAt: new Date().toISOString(),
    };

    let current = getStoredWishes();
    const token = getGitHubToken();

    let currentSha: string | undefined;
    if (token) {
      try {
        const getFileRes = await fetch(
          `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${GITHUB_WISHES_FILE_PATH}?ref=main&t=${Date.now()}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'User-Agent': 'NextJS-Thiep-Moi-App',
              'Accept': 'application/vnd.github.v3+json',
            },
            cache: 'no-store',
          }
        );

        if (getFileRes.ok) {
          const fileInfo = await getFileRes.json();
          currentSha = fileInfo.sha;
          if (fileInfo.content) {
            const rawContent = Buffer.from(fileInfo.content, 'base64').toString('utf8');
            const parsed = JSON.parse(rawContent);
            if (Array.isArray(parsed)) {
              current = parsed;
            }
          }
        }
      } catch (err) {
        console.warn('Get GitHub wishes SHA error:', err);
      }
    }

    const updated = [newWish, ...current];
    persistWishes(updated);

    // Đồng bộ vĩnh viễn lên GitHub nếu có token
    if (token) {
      try {
        const contentBase64 = Buffer.from(JSON.stringify(updated, null, 2), 'utf8').toString('base64');
        await fetch(
          `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${GITHUB_WISHES_FILE_PATH}`,
          {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'User-Agent': 'NextJS-Thiep-Moi-App',
              'Content-Type': 'application/json',
              'Accept': 'application/vnd.github.v3+json',
            },
            body: JSON.stringify({
              message: `Lời chúc mới từ ${finalName}`,
              content: contentBase64,
              sha: currentSha,
              branch: 'main',
            }),
          }
        );
      } catch (ghErr) {
        console.warn('Lỗi commit lời chúc lên GitHub:', ghErr);
      }
    }

    return NextResponse.json({
      success: true,
      data: newWish,
      message: 'Gửi lời chúc thành công!',
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Đã xảy ra lỗi khi lưu lời chúc.' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, isPublic } = body;

    const current = getStoredWishes();
    const targetWish = current.find((w) => w.id === id);
    if (!targetWish) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy lời chúc!' },
        { status: 404 }
      );
    }

    if (typeof isPublic === 'boolean') {
      targetWish.isPublic = isPublic;
    } else {
      targetWish.likes = (targetWish.likes || 0) + 1;
    }

    persistWishes(current);

    return NextResponse.json({
      success: true,
      data: targetWish,
    });
  } catch (error) {
    console.error('Like error:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể cập nhật lời chúc.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Thiếu id lời chúc' }, { status: 400 });
    }

    const current = getStoredWishes();
    const updated = current.filter((w) => w.id !== id);
    persistWishes(updated);

    return NextResponse.json({
      success: true,
      message: 'Đã xóa lời chúc thành công!',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
