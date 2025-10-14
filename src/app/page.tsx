import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Welcome to Project Editor
        </h1>
        <p className="text-gray-600 mb-6">
          Editor.js 기반의 구조화된 게시물 작성 시스템입니다.
        </p>

        <div className="space-y-4">
          <div className="border-l-4 border-blue-500 pl-4 py-2">
            <h2 className="font-semibold text-lg mb-2">Phase 1 MVP 기능</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>제목 입력</li>
              <li>Paragraph와 Header 블록을 사용한 본문 작성</li>
              <li>JSON 형식으로 데이터 저장 및 조회</li>
            </ul>
          </div>

          <div className="flex gap-4 mt-8">
            <Link
              href="/projects/new"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              새 프로젝트 작성
            </Link>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-2">다음 단계</h3>
          <p className="text-sm text-gray-600">
            Phase 2에서는 이미지 업로드, 영상 임베드, 리스트, 전체 메타데이터 입력 기능이 추가됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}
