import React from 'react';

const parseFormattedTokens = (text) => {
  if (!text) return [];
  const regex = /(\*\*(.*?)\*\*|\*(.*?)\*|`([^`]+)`)/g;
  let lastIndex = 0;
  let match;
  const tokens = [];

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ type: 'text', content: text.substring(lastIndex, match.index) });
    }
    if (match[2] !== undefined) {
      tokens.push({ type: 'bold', content: match[2] });
    } else if (match[3] !== undefined) {
      tokens.push({ type: 'italic', content: match[3] });
    } else if (match[4] !== undefined) {
      tokens.push({ type: 'code', content: match[4] });
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    tokens.push({ type: 'text', content: text.substring(lastIndex) });
  }

  return tokens;
};

const renderInline = (text) => {
  const tokens = parseFormattedTokens(text);
  return tokens.map((token, idx) => {
    if (token.type === 'bold') {
      return <strong key={idx} className="font-bold">{token.content}</strong>;
    }
    if (token.type === 'italic') {
      return <em key={idx} className="italic">{token.content}</em>;
    }
    if (token.type === 'code') {
      return (
        <code key={idx} className="px-1.5 py-0.5 rounded bg-slate-200/60 dark:bg-slate-700/60 font-mono text-[11px] text-emerald-600 dark:text-emerald-400">
          {token.content}
        </code>
      );
    }
    return <span key={idx}>{token.content}</span>;
  });
};

export const FormattedMessage = ({ content }) => {
  if (!content) return null;

  const lines = content.split('\n');

  return (
    <div className="space-y-1.5 leading-relaxed">
      {lines.map((line, lineIdx) => {
        const trimmed = line.trim();

        if (!trimmed) {
          return <div key={lineIdx} className="h-1" />;
        }

        if (trimmed.startsWith('#')) {
          const headingText = trimmed.replace(/^#+\s*/, '');
          return (
            <h4 key={lineIdx} className="font-poppins font-bold text-xs text-emerald-600 dark:text-emerald-400 mt-2 mb-1">
              {renderInline(headingText)}
            </h4>
          );
        }

        const isBullet = trimmed.startsWith('• ') || trimmed.startsWith('- ') || (trimmed.startsWith('* ') && !trimmed.startsWith('**'));
        if (isBullet) {
          const bulletText = trimmed.replace(/^(•|-|\*)\s*/, '');
          return (
            <div key={lineIdx} className="flex items-start gap-2 pl-1 py-0.5">
              <span className="text-emerald-500 font-bold select-none text-xs">•</span>
              <div className="flex-1">{renderInline(bulletText)}</div>
            </div>
          );
        }

        return <div key={lineIdx}>{renderInline(line)}</div>;
      })}
    </div>
  );
};
