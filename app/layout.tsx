import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Thiệp Mời Lễ Tốt Nghiệp • Trí Nguyễn | Graduation 2026',
  description: 'Thân mời bạn đến tham dự Lễ tốt nghiệp của Trí Nguyễn. Cùng lưu giữ những khoảnh khắc thanh xuân đáng nhớ nhất!',
  openGraph: {
    title: 'Thiệp Mời Lễ Tốt Nghiệp • Trí Nguyễn',
    description: 'Thân mời bạn đến chung vui và lưu giữ khoảnh khắc thanh xuân cùng Trí Nguyễn.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className="scroll-smooth">
      <head>
        {/* Load static precompiled Tailwind CSS để đảm bảo 100% luôn có CSS */}
        <link rel="stylesheet" href="/styles.css" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@300;400;500;600;700&family=Dancing+Script:wght@600;700&family=Playfair+Display:ital,wght@0,600;0,700;0,800;0,900;1,400;1,600&family=Space+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#FAFAFA] text-slate-800 min-h-screen selection:bg-navy-700 selection:text-white font-sans">
        {children}
      </body>
    </html>
  );
}
