import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { CheckinPhoto } from '@/types';

const checkinsFilePath = path.join(process.cwd(), 'data', 'checkins.json');
const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'checkin');

export async function GET() {
  try {
    if (fs.existsSync(checkinsFilePath)) {
      const fileContents = fs.readFileSync(checkinsFilePath, 'utf8');
      const data: CheckinPhoto[] = JSON.parse(fileContents);
      return NextResponse.json({ success: true, data });
    }
    return NextResponse.json({ success: true, data: [] });
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

    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    const fileName = `checkin-${timestamp}-${random}.png`;
    const filePath = path.join(uploadsDir, fileName);

    // Bóc tách base64
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/checkin/${fileName}`;

    const newCheckin: CheckinPhoto = {
      id: `chk-${timestamp}`,
      imageUrl: publicUrl,
      guestName: guestName || 'Khách mời tốt nghiệp',
      createdAt: new Date().toISOString(),
    };

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

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Thiếu id ảnh' }, { status: 400 });
    }

    if (fs.existsSync(checkinsFilePath)) {
      let checkins: CheckinPhoto[] = JSON.parse(fs.readFileSync(checkinsFilePath, 'utf8'));
      const target = checkins.find((c) => c.id === id);

      // Nếu có file cục bộ trong uploads, xóa đi
      if (target && target.imageUrl.startsWith('/uploads/checkin/')) {
        const localFile = path.join(process.cwd(), 'public', target.imageUrl);
        if (fs.existsSync(localFile)) {
          try {
            fs.unlinkSync(localFile);
          } catch (e) {}
        }
      }

      checkins = checkins.filter((c) => c.id !== id);
      fs.writeFileSync(checkinsFilePath, JSON.stringify(checkins, null, 2), 'utf8');
      return NextResponse.json({ success: true, message: 'Đã xóa ảnh check-in' });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

