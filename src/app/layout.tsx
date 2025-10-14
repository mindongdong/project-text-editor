import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Project Editor - Editor.js 기반 게시물 작성',
  description: '구조화된 JSON 기반 프로젝트 게시물 에디터',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Project Editor
            </h1>
          </div>
        </header>
        <main className="min-h-screen">
          {children}
        </main>
        <footer className="bg-white border-t mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <p className="text-sm text-gray-500 text-center">
              Editor.js 기반 프로젝트 게시물 작성 시스템 - Phase 1 MVP
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
