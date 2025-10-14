import { sanitizeBasic } from '@/utils/sanitize';

/**
 * Unit tests for sanitizeBasic utility function
 *
 * Tests HTML sanitization to remove dangerous tags and event handlers
 * while preserving basic formatting tags
 */

describe('sanitizeBasic', () => {
  describe('dangerous content removal', () => {
    it('should remove script tags and their content', () => {
      const input = 'Hello <script>alert("XSS")</script> World';
      const result = sanitizeBasic(input);
      expect(result).not.toContain('<script>');
      expect(result).not.toContain('alert');
      expect(result).toBe('Hello  World');
    });

    it('should remove script tags with attributes', () => {
      const input = '<script type="text/javascript" src="evil.js">alert("XSS")</script>';
      const result = sanitizeBasic(input);
      expect(result).not.toContain('<script');
      expect(result).not.toContain('alert');
      expect(result).toBe('');
    });

    it('should remove multiple script tags', () => {
      const input =
        '<script>alert(1)</script>Text<script>alert(2)</script>More<script>alert(3)</script>';
      const result = sanitizeBasic(input);
      expect(result).not.toContain('<script>');
      expect(result).not.toContain('alert');
      expect(result).toBe('TextMore');
    });

    it('should remove nested script tags', () => {
      const input = '<div><script>alert("XSS")</script></div>';
      const result = sanitizeBasic(input);
      expect(result).not.toContain('<script>');
      expect(result).toBe('<div></div>');
    });
  });

  describe('event handler removal', () => {
    it('should remove onClick event handlers with double quotes', () => {
      const input = '<a href="#" onClick="alert(1)">Click me</a>';
      const result = sanitizeBasic(input);
      expect(result).not.toContain('onClick');
      expect(result).not.toContain('alert');
      expect(result).toBe('<a href="#">Click me</a>');
    });

    it('should remove onClick event handlers with single quotes', () => {
      const input = "<a href='#' onClick='alert(\"XSS\")'>Click me</a>";
      const result = sanitizeBasic(input);
      expect(result).not.toContain('onClick');
      expect(result).not.toContain('alert');
    });

    it('should remove onmouseover event handlers', () => {
      const input = '<img src="x.jpg" onmouseover="alert(\'XSS\')" />';
      const result = sanitizeBasic(input);
      expect(result).not.toContain('onmouseover');
      expect(result).not.toContain('alert');
      expect(result).toContain('src="x.jpg"');
    });

    it('should remove onerror event handlers', () => {
      const input = '<img src="x" onerror="alert(\'XSS\')" />';
      const result = sanitizeBasic(input);
      expect(result).not.toContain('onerror');
      expect(result).not.toContain('alert');
    });

    it('should remove multiple event handlers', () => {
      const input =
        '<button onClick="alert(1)" onmouseover="alert(2)" onmouseout="alert(3)">Click</button>';
      const result = sanitizeBasic(input);
      expect(result).not.toContain('onClick');
      expect(result).not.toContain('onmouseover');
      expect(result).not.toContain('onmouseout');
      expect(result).not.toContain('alert');
      expect(result).toBe('<button>Click</button>');
    });

    it('should remove event handlers without quotes', () => {
      const input = '<div onclick=alert(1)>Test</div>';
      const result = sanitizeBasic(input);
      expect(result).not.toContain('onclick');
      expect(result).not.toContain('alert');
    });

    it('should handle case-insensitive event handlers', () => {
      const input = '<div ONCLICK="alert(1)" OnClick="alert(2)">Test</div>';
      const result = sanitizeBasic(input);
      expect(result).not.toContain('ONCLICK');
      expect(result).not.toContain('OnClick');
      expect(result).not.toContain('alert');
    });
  });

  describe('allowed tags preservation', () => {
    it('should preserve bold tags', () => {
      const input = 'This is <b>bold</b> text';
      const result = sanitizeBasic(input);
      expect(result).toBe('This is <b>bold</b> text');
    });

    it('should preserve italic tags', () => {
      const input = 'This is <i>italic</i> text';
      const result = sanitizeBasic(input);
      expect(result).toBe('This is <i>italic</i> text');
    });

    it('should preserve underline tags', () => {
      const input = 'This is <u>underlined</u> text';
      const result = sanitizeBasic(input);
      expect(result).toBe('This is <u>underlined</u> text');
    });

    it('should preserve strong tags', () => {
      const input = 'This is <strong>strong</strong> text';
      const result = sanitizeBasic(input);
      expect(result).toBe('This is <strong>strong</strong> text');
    });

    it('should preserve em tags', () => {
      const input = 'This is <em>emphasized</em> text';
      const result = sanitizeBasic(input);
      expect(result).toBe('This is <em>emphasized</em> text');
    });

    it('should preserve span tags', () => {
      const input = 'This is <span>span</span> text';
      const result = sanitizeBasic(input);
      expect(result).toBe('This is <span>span</span> text');
    });

    it('should preserve br tags', () => {
      const input = 'Line 1<br />Line 2';
      const result = sanitizeBasic(input);
      expect(result).toBe('Line 1<br />Line 2');
    });

    it('should preserve multiple allowed tags', () => {
      const input = '<b>Bold</b>, <i>Italic</i>, <u>Underline</u>, and <strong>Strong</strong>';
      const result = sanitizeBasic(input);
      expect(result).toBe(
        '<b>Bold</b>, <i>Italic</i>, <u>Underline</u>, and <strong>Strong</strong>'
      );
    });

    it('should preserve nested allowed tags', () => {
      const input = '<b>Bold <i>and italic</i></b>';
      const result = sanitizeBasic(input);
      expect(result).toBe('<b>Bold <i>and italic</i></b>');
    });
  });

  describe('combined scenarios', () => {
    it('should remove dangerous content while preserving safe content', () => {
      const input =
        '<b>Safe</b><script>alert("XSS")</script><i>Also safe</i><img src="x" onerror="alert(1)" />';
      const result = sanitizeBasic(input);
      expect(result).toContain('<b>Safe</b>');
      expect(result).toContain('<i>Also safe</i>');
      expect(result).not.toContain('<script>');
      expect(result).not.toContain('onerror');
      expect(result).not.toContain('alert');
    });

    it('should handle complex nested HTML', () => {
      const input =
        '<div><p onclick="alert(1)">Paragraph with <strong>bold</strong> text</p><script>evil()</script></div>';
      const result = sanitizeBasic(input);
      expect(result).toContain('<strong>bold</strong>');
      expect(result).not.toContain('onclick');
      expect(result).not.toContain('<script>');
      expect(result).not.toContain('alert');
      expect(result).not.toContain('evil');
    });

    it('should handle real-world Editor.js content', () => {
      const input =
        'This is a paragraph with <b>bold</b> and <i>italic</i> text<script>malicious()</script>';
      const result = sanitizeBasic(input);
      expect(result).toBe('This is a paragraph with <b>bold</b> and <i>italic</i> text');
    });
  });

  describe('edge cases', () => {
    it('should handle empty string', () => {
      const result = sanitizeBasic('');
      expect(result).toBe('');
    });

    it('should handle plain text without HTML', () => {
      const input = 'Plain text without any HTML tags';
      const result = sanitizeBasic(input);
      expect(result).toBe('Plain text without any HTML tags');
    });

    it('should handle text with only safe tags', () => {
      const input = '<b>Only</b> <i>safe</i> <strong>tags</strong> <em>here</em>';
      const result = sanitizeBasic(input);
      expect(result).toBe('<b>Only</b> <i>safe</i> <strong>tags</strong> <em>here</em>');
    });

    it('should handle malformed script tags', () => {
      const input = '<script>alert("test")</script test="value">';
      const result = sanitizeBasic(input);
      expect(result).not.toContain('alert');
      expect(result).not.toContain('<script>');
    });

    it('should handle HTML entities', () => {
      const input = 'Text with &lt; &gt; &amp; entities';
      const result = sanitizeBasic(input);
      expect(result).toBe('Text with &lt; &gt; &amp; entities');
    });
  });
});
