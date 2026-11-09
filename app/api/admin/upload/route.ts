import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const REPO_OWNER = process.env.GITHUB_REPO_OWNER || 'TriNguyen2808';
const REPO_NAME = process.env.GITHUB_REPO_NAME || 'thiep-tot-nghiep';

function getGitHubToken(request: Request): string | undefined {
  const headerToken = request.headers.get('x-github-token');
  if (headerToken && headerToken.trim()) return headerToken.trim();
  return process.env.GITHUB_TOKEN?.trim();
}

export async function POST(request: Request) {
  try {
    const token = getGitHubToken(request);
    const contentType = request.headers.get('content-type') || '';
    const uploadedUrls: string[] = [];

    // Danh sách các file cần xử lý (buffer, fileName, mimeType)
    const filesToProcess: { buffer: Buffer; fileName: string; mimeType: string }[] = [];

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const rawFiles: File[] = [];

      formData.forEach((value, key) => {
        if (value instanceof File && (key === 'files' || key === 'file' || key.startsWith('file'))) {
          rawFiles.push(value);
        }
      });

      if (rawFiles.length === 0) {
        return NextResponse.json({ success: false, error: 'Không tìm thấy file nào được gửi lên' }, { status: 400 });
      }

      for (const file of rawFiles) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const ext = path.extname(file.name) || '.jpg';
        const cleanBase = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30);
        const uniqueFilename = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}_${cleanBase}${ext}`;
        const mimeType = file.type || 'image/jpeg';
        filesToProcess.push({ buffer, fileName: uniqueFilename, mimeType });
      }
    } else {
      // Trường hợp gửi JSON base64
      const body = await request.json();
      const list = body.images && Array.isArray(body.images) ? body.images : body.image ? [body.image] : [];
      for (const base64Data of list) {
        const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          const mimeType = matches[1];
          const ext = mimeType.split('/')[1] || 'jpg';
          const buffer = Buffer.from(matches[2], 'base64');
          const uniqueFilename = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;
          filesToProcess.push({ buffer, fileName: uniqueFilename, mimeType });
        }
      }
    }

    // XỬ LÝ LƯU TỪNG FILE
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    const isVercel = Boolean(process.env.VERCEL);

    for (const item of filesToProcess) {
      let savedUrl = '';

      // 1. NẾU CÓ GITHUB TOKEN: UPLOAD TRỰC TIẾP LÊN GITHUB REPOSITORY
      if (token) {
        try {
          const ghPath = `public/uploads/${item.fileName}`;
          const contentBase64 = item.buffer.toString('base64');

          const ghRes = await fetch(
            `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${ghPath}`,
            {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${token}`,
                'User-Agent': 'NextJS-Thiep-Moi-App',
                'Content-Type': 'application/json',
                'Accept': 'application/vnd.github.v3+json',
              },
              body: JSON.stringify({
                message: `Upload ${item.fileName} via Admin Dashboard`,
                content: contentBase64,
                branch: 'main',
              }),
            }
          );

          if (ghRes.ok) {
            // Dùng đường dẫn raw của GitHub để hiển thị ngay lập tức không bị delay
            savedUrl = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main/${ghPath}`;
          } else {
            console.warn('GitHub upload failed, falling back:', await ghRes.text());
          }
        } catch (ghErr) {
          console.warn('Lỗi kết nối GitHub khi upload ảnh:', ghErr);
        }
      }

      // 2. NẾU CHƯA LƯU ĐƯỢC VÀ ĐANG CHẠY LOCAL (KHÔNG PHẢI VERCEL)
      if (!savedUrl && !isVercel) {
        try {
          if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
          }
          const filePath = path.join(uploadDir, item.fileName);
          fs.writeFileSync(filePath, item.buffer);
          savedUrl = `/uploads/${item.fileName}`;
        } catch (localErr) {
          console.warn('Lỗi ghi file local:', localErr);
        }
      }

      // 3. FALLBACK AN TOÀN TUYỆT ĐỐI CHO VERCEL: CHUYỂN THÀNH DATA URL (KHÔNG CẦN Ổ ĐĨA GHI)
      if (!savedUrl) {
        savedUrl = `data:${item.mimeType};base64,${item.buffer.toString('base64')}`;
      }

      uploadedUrls.push(savedUrl);
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
