import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { SiteConfig } from '@/types';

const dataFilePath = path.join(process.cwd(), 'data', 'siteData.json');
const tmpFilePath = path.join('/tmp', 'siteData.json');

const REPO_OWNER = process.env.GITHUB_REPO_OWNER || 'TriNguyen2808';
const REPO_NAME = process.env.GITHUB_REPO_NAME || 'thiep-tot-nghiep';
const GITHUB_FILE_PATH = 'data/siteData.json';

// Lấy Token từ Environment Variables hoặc từ Header x-github-token do Admin gửi lên
function getGitHubToken(request?: Request): string | undefined {
  if (request) {
    const headerToken = request.headers.get('x-github-token');
    if (headerToken && headerToken.trim()) return headerToken.trim();
  }
  return process.env.GITHUB_TOKEN?.trim();
}

export async function GET(request: Request) {
  const token = getGitHubToken(request);

  // 1. Nếu có GitHub Token hoặc đang trên môi trường Vercel: Thử lấy dữ liệu mới nhất từ GitHub
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
        `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${GITHUB_FILE_PATH}?ref=main&t=${Date.now()}`,
        { headers, cache: 'no-store' }
      );

      if (ghRes.ok) {
        const ghData: SiteConfig = await ghRes.json();
        return NextResponse.json({ success: true, data: ghData, source: 'github' });
      }
    } catch (ghErr) {
      console.warn('Lỗi đọc từ GitHub API, thử đọc fallback:', ghErr);
    }
  }

  // 2. Đọc từ /tmp nếu có bản cập nhật tạm trên serverless
  if (fs.existsSync(tmpFilePath)) {
    try {
      const tmpContents = fs.readFileSync(tmpFilePath, 'utf8');
      const data: SiteConfig = JSON.parse(tmpContents);
      return NextResponse.json({ success: true, data, source: 'tmp' });
    } catch (e) {}
  }

  // 3. Đọc từ file gốc bundled trong project
  try {
    if (fs.existsSync(dataFilePath)) {
      const fileContents = fs.readFileSync(dataFilePath, 'utf8');
      const data: SiteConfig = JSON.parse(fileContents);
      return NextResponse.json({ success: true, data, source: 'file' });
    }
    return NextResponse.json({ success: false, error: 'Data file not found' }, { status: 404 });
  } catch (error: any) {
    console.error('Error reading site data:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const updatedData: SiteConfig = await request.json();
    const token = getGitHubToken(request);

    // =========================================================================
    // CÁCH 1: NẾU CÓ GITHUB TOKEN -> TỰ ĐỘNG COMMIT THẲNG VÀO GITHUB REPO
    // =========================================================================
    if (token) {
      try {
        // 1. Lấy SHA hiện tại của file trên GitHub
        const getFileRes = await fetch(
          `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${GITHUB_FILE_PATH}?ref=main`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'User-Agent': 'NextJS-Thiep-Moi-App',
              'Accept': 'application/vnd.github.v3+json',
            },
            cache: 'no-store',
          }
        );

        let currentSha: string | undefined;
        if (getFileRes.ok) {
          const fileInfo = await getFileRes.json();
          currentSha = fileInfo.sha;
        }

        // 2. Commit nội dung mới lên GitHub
        const contentBase64 = Buffer.from(JSON.stringify(updatedData, null, 2), 'utf8').toString('base64');
        const updateRes = await fetch(
          `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${GITHUB_FILE_PATH}`,
          {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'User-Agent': 'NextJS-Thiep-Moi-App',
              'Content-Type': 'application/json',
              'Accept': 'application/vnd.github.v3+json',
            },
            body: JSON.stringify({
              message: 'Cập nhật cấu hình thiệp mời từ trang Admin web',
              content: contentBase64,
              sha: currentSha,
              branch: 'main',
            }),
          }
        );

        if (updateRes.ok) {
          // Lưu dự phòng vào /tmp
          try {
            fs.writeFileSync(tmpFilePath, JSON.stringify(updatedData, null, 2), 'utf8');
          } catch (e) {}

          return NextResponse.json({
            success: true,
            isGitHubSaved: true,
            message: 'Đã lưu và đồng bộ trực tiếp lên GitHub thành công! Toàn bộ khách mời sẽ thấy thông tin mới.',
            data: updatedData,
          });
        } else {
          const errData = await updateRes.json();
          console.warn('GitHub commit error:', errData);
          // Tiếp tục fallback ghi file bên dưới nếu có thể
        }
      } catch (ghErr: any) {
        console.warn('Lỗi kết nối GitHub API:', ghErr);
      }
    }

    // =========================================================================
    // CÁCH 2: NẾU CHẠY LOCALHOẶC KHÔNG CÓ TOKEN -> GHI FILE NỘI BỘ
    // =========================================================================
    try {
      fs.writeFileSync(dataFilePath, JSON.stringify(updatedData, null, 2), 'utf8');
      return NextResponse.json({ 
        success: true, 
        message: 'Đã lưu cấu hình thành công vào hệ thống!', 
        data: updatedData 
      });
    } catch (writeErr: any) {
      // Nếu chạy trên môi trường Read-Only của Vercel mà CHƯA có token
      if (writeErr.code === 'EROFS' || writeErr.message?.includes('read-only file system')) {
        try {
          fs.writeFileSync(tmpFilePath, JSON.stringify(updatedData, null, 2), 'utf8');
        } catch (tmpErr) {}

        return NextResponse.json({
          success: true,
          isVercelReadOnly: true,
          message: 'Đã lưu vào bộ nhớ phiên! Hãy thêm GITHUB_TOKEN trên Vercel để lưu vĩnh viễn trực tiếp trên web.',
          data: updatedData,
        });
      }
      throw writeErr;
    }
  } catch (error: any) {
    console.error('Error writing site data:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
