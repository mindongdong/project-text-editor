/**
 * Format Summary Utility
 *
 * Converts structured summary data into formatted text for display
 */

export interface SummaryData {
  startDate: string; // YYYY-MM-DD format
  endDate: string; // YYYY-MM-DD format
  advisor: string;
  participants: string[];
}

/**
 * Format date from YYYY-MM-DD to YYYY.MM.DD
 */
function formatDate(dateString: string): string {
  if (!dateString) return '';
  return dateString.replace(/-/g, '.');
}

/**
 * Format summary data into structured text
 *
 * Output format:
 * 기간 : YYYY.MM.DD.~YYYY.MM.DD
 * 지도교수 : {advisor}
 * 참여학생 : {participant1}, {participant2}, ...
 *
 * @param data - Structured summary data
 * @returns Formatted summary string with HTML line breaks
 */
export function formatSummary(data: SummaryData): string {
  const { startDate, endDate, advisor, participants } = data;

  const lines: string[] = [];

  // Period line (required)
  if (startDate && endDate) {
    const formattedStart = formatDate(startDate);
    const formattedEnd = formatDate(endDate);
    lines.push(`기간 : ${formattedStart}~${formattedEnd}`);
  }

  // Advisor line (optional)
  if (advisor && advisor.trim()) {
    lines.push(`지도교수 : ${advisor.trim()}`);
  }

  // Participants line (optional)
  if (participants && participants.length > 0) {
    const participantsList = participants
      .filter(p => p.trim()) // Filter out empty strings
      .map(p => p.trim())
      .join(', ');
    if (participantsList) {
      lines.push(`참여학생 : ${participantsList}`);
    }
  }

  return lines.join('<br>');
}

/**
 * Parse formatted summary back to structured data (for editing)
 *
 * @param summary - Formatted summary string with HTML line breaks
 * @returns Structured summary data or null if invalid
 */
export function parseSummary(summary: string): SummaryData | null {
  if (!summary) {
    return null;
  }

  const lines = summary.split('<br>');
  const data: Partial<SummaryData> = {
    startDate: '',
    endDate: '',
    advisor: '',
    participants: [],
  };

  for (const line of lines) {
    const trimmedLine = line.trim();

    // Parse period
    if (trimmedLine.startsWith('기간 :')) {
      const dateRange = trimmedLine.replace('기간 :', '').trim();
      const [start, end] = dateRange.split('~').map(d => d.trim());
      data.startDate = start.replace(/\./g, '-');
      data.endDate = end.replace(/\./g, '-');
    }

    // Parse advisor
    if (trimmedLine.startsWith('지도교수 :')) {
      data.advisor = trimmedLine.replace('지도교수 :', '').trim();
    }

    // Parse participants
    if (trimmedLine.startsWith('참여학생 :')) {
      const participantsStr = trimmedLine.replace('참여학생 :', '').trim();
      data.participants = participantsStr.split(',').map(p => p.trim()).filter(p => p);
    }
  }

  return data as SummaryData;
}

/**
 * Validate summary data
 *
 * @param data - Structured summary data
 * @returns Error message if invalid, null if valid
 */
export function validateSummaryData(data: Partial<SummaryData>): string | null {
  // Period is required
  if (!data.startDate || !data.endDate) {
    return '기간은 필수 입력 항목입니다';
  }

  // Validate date format (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(data.startDate) || !dateRegex.test(data.endDate)) {
    return '날짜 형식이 올바르지 않습니다 (YYYY-MM-DD)';
  }

  // Validate end date is after start date
  if (new Date(data.endDate) < new Date(data.startDate)) {
    return '종료일은 시작일보다 이후여야 합니다';
  }

  return null;
}
