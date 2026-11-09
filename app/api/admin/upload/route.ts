import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const contentType = request.headers.get('content-type') || '';
    const uploadedUrls: string[] = [];

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const files: File[] = [];

      // Lấy tất cả các file từ formData (cả trường 'files' và 'file')
      formData.forEach((value, key) => {
        if (value instanceof File && (key === 'files' || key === 'file' || key.startsWith('file'))) {
          files.push(value);
        }
      });

      if (files.length === 0) {
        return NextResponse.json({ success: false, error: 'Không tìm thấy file nào được gửi lên' }, { status: 400 });
      }

      for (const file of files) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Tạo tên file an toàn kèm timestamp
        const ext = path.extname(file.name) || '.jpg';
        const cleanBase = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 40);
        const uniqueFilename = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}_${cleanBase}${ext}`;
        const filePath = path.join(uploadDir, uniqueFilename);

        fs.writeFileSync(filePath, buffer);
        uploadedUrls.push(`/uploads/${uniqueFilename}`);
      }
    } else {
      // Trường hợp gửi JSON base64
      const body = await request.json();
      if (body.images && Array.isArray(body.images)) {
        for (const base64Data of body.images) {
          const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
          if (matches && matches.length === 3) {
            const ext = matches[1].split('/')[1] || 'jpg';
            const buffer = Buffer.from(matches[2], 'base64');
            const uniqueFilename = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;
            const filePath = path.join(uploadDir, uniqueFilename);
            fs.writeFileSync(filePath, buffer);
            uploadedUrls.push(`/uploads/${uniqueFilename}`);
          }
        }
      } else if (body.image) {
        const matches = body.image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          const ext = matches[1].split('/')[1] || 'jpg';
          const buffer = Buffer.from(matches[2], 'base64');
          const uniqueFilename = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;
          const filePath = path.join(uploadDir, uniqueFilename);
          fs.writeFileSync(filePath, buffer);
          uploadedUrls.push(`/uploads/${uniqueFilename}`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Đã tải lên ${uploadedUrls.length} ảnh thành công!`,
      urls: uploadedUrls,
      url: uploadedUrls[0] || '',
    });
  } catch (error: any) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

