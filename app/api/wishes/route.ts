import { NextResponse } from 'next/server';
import { INITIAL_WISHES } from '@/data/initialData';
import { Wish } from '@/types';

// In-memory store cho runtime Next.js
let wishesMemory: Wish[] = [...INITIAL_WISHES];

export async function GET() {
  return NextResponse.json({
    success: true,
    data: wishesMemory,
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

    wishesMemory.unshift(newWish);

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

    const targetWish = wishesMemory.find((w) => w.id === id);
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

    wishesMemory = wishesMemory.filter((w) => w.id !== id);

    return NextResponse.json({
      success: true,
      message: 'Đã xóa lời chúc thành công!',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
