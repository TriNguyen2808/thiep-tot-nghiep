import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { CheckinPhoto } from '@/types';

const checkinsFilePath = path.join(process.cwd(), 'data', 'checkins.json');
const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'checkin');
const tmpCheckinsFilePath = path.join('/tmp', 'checkins.json');

// In-memory fallback
let checkinsMemory: CheckinPhoto[] = [];

export async function GET() {
  try {
    // 1. Đọc từ /tmp nếu có
    if (fs.existsSync(tmpCheckinsFilePath)) {
      try {
        const fileContents = fs.readFileSync(tmpCheckinsFilePath, 'utf8');
        const data: CheckinPhoto[] = JSON.parse(fileContents);
        return NextResponse.json({ success: true, data });
      } catch (e) {}
    }

    // 2. Đọc từ file gốc bundled trong project
    if (fs.existsSync(checkinsFilePath)) {
      try {
        const fileContents = fs.readFileSync(checkinsFilePath, 'utf8');
        const data: CheckinPhoto[] = JSON.parse(fileContents);
        return NextResponse.json({ success: true, data });
      } catch (e) {}
    }

    // 3. Fallback memory
    return NextResponse.json({ success: true, data: checkinsMemory });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { imageBase64, guestName } = await request.json();

    if (!imageBase64) {
      return NextResponse.json({ success: false, error: 'Thiếu dữ liệu ảnh' }, { status: 400 });
    }

    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    const fileName = `checkin-${timestamp}-${random}.png`;

    let publicUrl = imageBase64; // Mặc định dùng data url an toàn cho Vercel

    // Thử ghi file vào ổ đĩa (chạy local)
    try {
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      const filePath = path.join(uploadsDir, fileName);
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      fs.writeFileSync(filePath, buffer);
      publicUrl = `/uploads/checkin/${fileName}`;
    } catch (writeErr) {
      // Trên Vercel EROFS: dùng trực tiếp dataUrl imageBase64
      publicUrl = imageBase64;
    }

    const newCheckin: CheckinPhoto = {
      id: `chk-${timestamp}`,
      imageUrl: publicUrl,
      guestName: guestName || 'Khách mời tốt nghiệp',
      createdAt: new Date().toISOString(),
    };

    checkinsMemory.unshift(newCheckin);

    // Thử lưu checkins.json nếu được
    try {
      let checkins: CheckinPhoto[] = [];
      if (fs.existsSync(checkinsFilePath)) {
        try {
          checkins = JSON.parse(fs.readFileSync(checkinsFilePath, 'utf8'));
        } catch (e) {
          checkins = [];
        }
      }
      checkins.unshift(newCheckin);
      fs.writeFileSync(checkinsFilePath, JSON.stringify(checkins, null, 2), 'utf8');
    } catch (saveErr) {
      // Lưu vào /tmp của Vercel
      try {
        fs.writeFileSync(tmpCheckinsFilePath, JSON.stringify(checkinsMemory, null, 2), 'utf8');
      } catch (e) {}
    }

    return NextResponse.json({
      success: true,
      message: 'Đã lưu ảnh check-in vào dự án thành công!',
      data: newCheckin,
    });
  } catch (error: any) {
    console.error('Error saving checkin:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
