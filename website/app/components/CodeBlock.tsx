'use client';

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useState } from 'react';

interface CodeBlockProps {
  children: string;
  language?: string;
}

// CodePen Demo 组件
function CodePenDemo({ html, css, js }: { html: string; css: string; js: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const fullHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${css}</style>
</head>
<body>
  ${html}
  <script>${js}</script>
</body>
</html>
  `.trim();

  return (
    <div className="my-6 border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700">Live Demo</span>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          {isExpanded ? '收起' : '展开'}
        </button>
      </div>
      <div className={`transition-all duration-300 ${isExpanded ? 'h-96' : 'h-64'}`}>
        <iframe
          srcDoc={fullHtml}
          className="w-full h-full border-0"
          title="CodePen Demo"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    </div>
  );
}

export default function CodeBlock({ children, language = 'text' }: CodeBlockProps) {
  // 检测是否是 CodePen 格式的代码块
  const isCodePen = language === 'codepen' || children.includes('<!-- CodePen Demo -->');
  
  if (isCodePen) {
    // 解析 CodePen 格式的代码
    const lines = children.split('\n');
    let html = '';
    let css = '';
    let js = '';
    let currentSection = '';
    
    for (const line of lines) {
      if (line.includes('<!-- HTML -->')) {
        currentSection = 'html';
      } else if (line.includes('<!-- CSS -->')) {
        currentSection = 'css';
      } else if (line.includes('<!-- JavaScript -->')) {
        currentSection = 'js';
      } else if (line.includes('<!-- CodePen Demo -->')) {
        // 跳过注释行
        continue;
      } else {
        switch (currentSection) {
          case 'html':
            html += line + '\n';
            break;
          case 'css':
            css += line + '\n';
            break;
          case 'js':
            js += line + '\n';
            break;
        }
      }
    }
    
    return (
      <div className="my-6">
        <CodePenDemo html={html.trim()} css={css.trim()} js={js.trim()} />
        <div className="mt-4">
          <SyntaxHighlighter
            language="html"
            style={tomorrow}
            customStyle={{
              margin: 0,
              padding: '1rem',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              lineHeight: '1.4',
              backgroundColor: '#2d3748',
            }}
            showLineNumbers={true}
            wrapLines={true}
            lineProps={{
              style: {
                padding: '0.125rem 0',
                minHeight: '1.4em',
              },
            }}
          >
            {children}
          </SyntaxHighlighter>
        </div>
      </div>
    );
  }

  // 语言映射，确保正确的语法高亮
  const getLanguage = (lang: string) => {
    const languageMap: { [key: string]: string } = {
      'html': 'markup',
      'htm': 'markup',
      'xml': 'markup',
      'css': 'css',
      'scss': 'scss',
      'sass': 'sass',
      'less': 'less',
      'js': 'javascript',
      'javascript': 'javascript',
      'ts': 'typescript',
      'typescript': 'typescript',
      'jsx': 'jsx',
      'tsx': 'tsx',
      'json': 'json',
      'bash': 'bash',
      'shell': 'bash',
      'sh': 'bash',
      'python': 'python',
      'py': 'python',
      'java': 'java',
      'c': 'c',
      'cpp': 'cpp',
      'c++': 'cpp',
      'c#': 'csharp',
      'csharp': 'csharp',
      'php': 'php',
      'ruby': 'ruby',
      'rb': 'ruby',
      'go': 'go',
      'rust': 'rust',
      'rs': 'rust',
      'sql': 'sql',
      'yaml': 'yaml',
      'yml': 'yaml',
      'toml': 'toml',
      'ini': 'ini',
      'conf': 'ini',
      'diff': 'diff',
      'git': 'git',
    };
    
    return languageMap[lang.toLowerCase()] || lang.toLowerCase();
  };

  return (
    <div className="my-4">
      <SyntaxHighlighter
        language={getLanguage(language)}
        style={tomorrow}
        customStyle={{
          margin: 0,
          padding: '1rem',
          borderRadius: '0.5rem',
          fontSize: '0.875rem',
          lineHeight: '1.4',
          backgroundColor: '#2d3748',
        }}
        showLineNumbers={true}
        wrapLines={true}
        lineProps={{
          style: {
            padding: '0.125rem 0',
            minHeight: '1.4em',
          },
        }}
      >
        {children}
      </SyntaxHighlighter>
    </div>
  );
} 