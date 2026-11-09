import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { INITIAL_WISHES } from '@/data/initialData';
import { Wish } from '@/types';

const dataFilePath = path.join(process.cwd(), 'data', 'wishes.json');
const tmpFilePath = path.join('/tmp', 'wishes.json');

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

    if (!message || !message.trim()) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng nhập lời chúc!' },
        { status: 400 }
      );
    }

    const finalName = isPublic ? (name?.trim() || 'Bạn Thân Mến') : 'Một người bạn ẩn danh 🤫';

    const newWish: Wish = {
      id: `wish-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: finalName,
      attendance: attendance || 'yes',
      message: message.trim(),
      images: Array.isArray(images) ? images : [],
      isPublic: Boolean(isPublic),
      likes: 0,
      createdAt: new Date().toISOString(),
    };

    const current = getStoredWishes();
    const updated = [newWish, ...current];
    persistWishes(updated);

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
