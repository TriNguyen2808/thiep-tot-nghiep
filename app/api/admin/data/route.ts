import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { SiteConfig } from '@/types';

const dataFilePath = path.join(process.cwd(), 'data', 'siteData.json');

export async function GET() {
  try {
    if (fs.existsSync(dataFilePath)) {
      const fileContents = fs.readFileSync(dataFilePath, 'utf8');
      const data: SiteConfig = JSON.parse(fileContents);
      return NextResponse.json({ success: true, data });
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
    fs.writeFileSync(dataFilePath, JSON.stringify(updatedData, null, 2), 'utf8');
    return NextResponse.json({ success: true, message: 'Đã lưu cấu hình thành công!', data: updatedData });
  } catch (error: any) {
    console.error('Error writing site data:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

