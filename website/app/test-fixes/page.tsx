import CodeBlock from '../components/CodeBlock';

// 解析行内 Markdown
const parseInlineMarkdown = (text: string): React.ReactNode => {
  const parts: React.ReactNode[] = [];
  let currentText = '';
  let i = 0;
  
  while (i < text.length) {
    // 处理 HTML 图片标签 <img ...>
    if (text.slice(i, i + 4) === '<img') {
      if (currentText) {
        parts.push(currentText);
        currentText = '';
      }
      i += 4;
      let imgTag = '<img';
      let inQuotes = false;
      let quoteChar = '';
      
      while (i < text.length) {
        const char = text[i];
        imgTag += char;
        
        if ((char === '"' || char === "'") && !inQuotes) {
          inQuotes = true;
          quoteChar = char;
        } else if (char === quoteChar && inQuotes) {
          inQuotes = false;
        } else if (char === '>' && !inQuotes) {
          i++;
          break;
        }
        i++;
      }
      
      // 解析 img 标签属性
      const srcMatch = imgTag.match(/src\s*=\s*["']([^"']+)["']/);
      const altMatch = imgTag.match(/alt\s*=\s*["']([^"']+)["']/);
      const widthMatch = imgTag.match(/width\s*=\s*["']?(\d+)["']?/);
      
      if (srcMatch) {
        const src = srcMatch[1];
        const alt = altMatch ? altMatch[1] : '';
        const width = widthMatch ? widthMatch[1] : undefined;
        
        parts.push(
          <img 
            key={`html-img-${i}`} 
            src={src} 
            alt={alt} 
            width={width}
            className="max-w-full h-auto rounded-lg my-4" 
          />
        );
      } else {
        parts.push(imgTag);
      }
    }
    // 处理 Markdown 图片 ![alt](url)
    else if (text.slice(i, i + 2) === '![') {
      if (currentText) {
        parts.push(currentText);
        currentText = '';
      }
      i += 2;
      let altText = '';
      while (i < text.length && text[i] !== ']') {
        altText += text[i];
        i++;
      }
      if (i < text.length && text[i] === ']' && text[i + 1] === '(') {
        i += 2;
        let url = '';
        while (i < text.length && text[i] !== ')') {
          url += text[i];
          i++;
        }
        if (i < text.length) {
          parts.push(
            <img 
              key={`img-${i}`} 
              src={url} 
              alt={altText} 
              className="max-w-full h-auto rounded-lg my-4" 
            />
          );
          i++;
        } else {
          parts.push(`![${altText}](${url}`);
        }
      } else {
        parts.push(`![${altText}`);
      }
    }
    // 处理链接 [text](url)
    else if (text[i] === '[') {
      if (currentText) {
        parts.push(currentText);
        currentText = '';
      }
      i++;
      let linkText = '';
      while (i < text.length && text[i] !== ']') {
        linkText += text[i];
        i++;
      }
      if (i < text.length && text[i] === ']' && text[i + 1] === '(') {
        i += 2;
        let url = '';
        while (i < text.length && text[i] !== ')') {
          url += text[i];
          i++;
        }
        if (i < text.length) {
          // 检查是否是 CodePen 链接
          const codepenMatch = url.match(/codepen\.io\/([^\/]+)\/pen\/([^\/\?]+)/);
          if (codepenMatch) {
            const [, username, penId] = codepenMatch;
            parts.push(
              <div key={`codepen-${i}`} className="my-6">
                <iframe
                  src={`https://codepen.io/${username}/embed/${penId}?default-tab=result`}
                  className="w-full h-96 border-0 rounded-lg"
                  title={`CodePen: ${linkText}`}
                  loading="lazy"
                />
                <div className="mt-2 text-center">
                  <a 
                    href={url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-sm text-gray-600 hover:text-gray-800 underline"
                  >
                    在 CodePen 中查看完整代码 →
                  </a>
                </div>
              </div>
            );
          } else {
            parts.push(
              <a 
                key={`link-${i}`} 
                href={url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-primary-600 hover:text-primary-700 underline"
              >
                {linkText}
              </a>
            );
          }
          i++;
        } else {
          parts.push(`[${linkText}](${url}`);
        }
      } else {
        parts.push(`[${linkText}`);
      }
    }
    // 处理粗体 **text**
    else if (text.slice(i, i + 2) === '**') {
      if (currentText) {
        parts.push(currentText);
        currentText = '';
      }
      i += 2;
      let boldText = '';
      while (i < text.length && text.slice(i, i + 2) !== '**') {
        boldText += text[i];
        i++;
      }
      if (i < text.length) {
        parts.push(<strong key={`bold-${i}`} className="font-bold">{boldText}</strong>);
        i += 2;
      } else {
        parts.push(`**${boldText}`);
      }
    }
    // 处理斜体 *text*
    else if (text[i] === '*') {
      if (currentText) {
        parts.push(currentText);
        currentText = '';
      }
      i++;
      let italicText = '';
      while (i < text.length && text[i] !== '*') {
        italicText += text[i];
        i++;
      }
      if (i < text.length) {
        parts.push(<em key={`italic-${i}`} className="italic">{italicText}</em>);
        i++;
      } else {
        parts.push(`*${italicText}`);
      }
    }
    // 处理行内代码 `code`
    else if (text[i] === '`') {
      if (currentText) {
        parts.push(currentText);
        currentText = '';
      }
      i++;
      let codeText = '';
      while (i < text.length && text[i] !== '`') {
        codeText += text[i];
        i++;
      }
      if (i < text.length) {
        parts.push(
          <code key={`code-${i}`} className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">
            {codeText}
          </code>
        );
        i++;
      } else {
        parts.push(`\`${codeText}`);
      }
    } else {
      currentText += text[i];
      i++;
    }
  }
  
  if (currentText) {
    parts.push(currentText);
  }
  
  return parts.length === 1 ? parts[0] : parts;
};

// 改进的 Markdown 解析函数
const parseMarkdown = (text: string): React.ReactNode[] => {
  if (!text) return [];
  
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let currentCodeBlock = '';
  let inCodeBlock = false;
  let codeLanguage = '';
  let inList = false;
  let listItems: React.ReactNode[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // 检测代码块开始
    if (line.startsWith('```')) {
      // 结束当前列表
      if (inList && listItems.length > 0) {
        elements.push(
          <ul key={`ul-${i}`} className="mb-4 pl-6 list-disc">
            {listItems}
          </ul>
        );
        listItems = [];
        inList = false;
      }
      
      if (!inCodeBlock) {
        // 开始代码块
        inCodeBlock = true;
        codeLanguage = line.slice(3).trim() || 'text';
        currentCodeBlock = '';
      } else {
        // 结束代码块
        inCodeBlock = false;
        if (currentCodeBlock.trim()) {
          // 检测是否是 CodePen 格式
          const isCodePen = codeLanguage === 'codepen' || 
                           currentCodeBlock.includes('<!-- CodePen Demo -->') ||
                           currentCodeBlock.includes('<!-- HTML -->') ||
                           currentCodeBlock.includes('<!-- CSS -->') ||
                           currentCodeBlock.includes('<!-- JavaScript -->');
          
          elements.push(
            <CodeBlock key={`code-${i}`} language={isCodePen ? 'codepen' : codeLanguage}>
              {currentCodeBlock.trim()}
            </CodeBlock>
          );
        }
        currentCodeBlock = '';
        continue;
      }
    } else if (inCodeBlock) {
      // 在代码块内
      currentCodeBlock += line + '\n';
    } else {
      // 普通文本处理
      if (line.trim() === '') {
        // 结束当前列表
        if (inList && listItems.length > 0) {
          elements.push(
            <ul key={`ul-${i}`} className="mb-4 pl-6 list-disc">
              {listItems}
            </ul>
          );
          listItems = [];
          inList = false;
        }
        elements.push(<br key={`br-${i}`} />);
      } else if (line.startsWith('### ')) {
        // 结束当前列表
        if (inList && listItems.length > 0) {
          elements.push(
            <ul key={`ul-${i}`} className="mb-4 pl-6 list-disc">
              {listItems}
            </ul>
          );
          listItems = [];
          inList = false;
        }
        elements.push(
          <h3 key={`h3-${i}`} className="text-lg font-bold text-gray-900 mt-6 mb-4">
            {parseInlineMarkdown(line.slice(4))}
          </h3>
        );
      } else if (line.startsWith('## ')) {
        // 结束当前列表
        if (inList && listItems.length > 0) {
          elements.push(
            <ul key={`ul-${i}`} className="mb-4 pl-6 list-disc">
              {listItems}
            </ul>
          );
          listItems = [];
          inList = false;
        }
        elements.push(
          <h2 key={`h2-${i}`} className="text-xl font-bold text-gray-900 mt-6 mb-4">
            {parseInlineMarkdown(line.slice(3))}
          </h2>
        );
      } else if (line.startsWith('# ')) {
        // 结束当前列表
        if (inList && listItems.length > 0) {
          elements.push(
            <ul key={`ul-${i}`} className="mb-4 pl-6 list-disc">
              {listItems}
            </ul>
          );
          listItems = [];
          inList = false;
        }
        elements.push(
          <h1 key={`h1-${i}`} className="text-2xl font-bold text-gray-900 mt-6 mb-4">
            {parseInlineMarkdown(line.slice(2))}
          </h1>
        );
      } else if (line.startsWith('* ') || line.startsWith('- ')) {
        inList = true;
        listItems.push(
          <li key={`li-${i}`} className="mb-1">
            {parseInlineMarkdown(line.slice(2))}
          </li>
        );
      } else {
        // 结束当前列表
        if (inList && listItems.length > 0) {
          elements.push(
            <ul key={`ul-${i}`} className="mb-4 pl-6 list-disc">
              {listItems}
            </ul>
          );
          listItems = [];
          inList = false;
        }
        
        // 检查是否是独立的 CodePen 链接
        const codepenLinkMatch = line.match(/^\[([^\]]+)\]\((https:\/\/codepen\.io\/[^\/]+\/pen\/[^\/\?]+)\)$/);
        if (codepenLinkMatch) {
          const [, linkText, url] = codepenLinkMatch;
          const codepenMatch = url.match(/codepen\.io\/([^\/]+)\/pen\/([^\/\?]+)/);
          if (codepenMatch) {
            const [, username, penId] = codepenMatch;
            elements.push(
              <div key={`codepen-block-${i}`} className="my-6">
                <iframe
                  src={`https://codepen.io/${username}/embed/${penId}?default-tab=result`}
                  className="w-full h-96 border-0 rounded-lg"
                  title={`CodePen: ${linkText}`}
                  loading="lazy"
                />
                <div className="mt-2 text-center">
                  <a 
                    href={url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-sm text-gray-600 hover:text-gray-800 underline"
                  >
                    在 CodePen 中查看完整代码 →
                  </a>
                </div>
              </div>
            );
          } else {
            elements.push(
              <p key={`p-${i}`} className="mb-3 leading-relaxed">
                {parseInlineMarkdown(line)}
              </p>
            );
          }
        } else {
          elements.push(
            <p key={`p-${i}`} className="mb-3 leading-relaxed">
              {parseInlineMarkdown(line)}
            </p>
          );
        }
      }
    }
  }
  
  // 处理未闭合的列表
  if (inList && listItems.length > 0) {
    elements.push(
      <ul key="ul-final" className="mb-4 pl-6 list-disc">
        {listItems}
      </ul>
    );
  }
  
  // 处理未闭合的代码块
  if (inCodeBlock && currentCodeBlock.trim()) {
    // 检测是否是 CodePen 格式
    const isCodePen = codeLanguage === 'codepen' || 
                     currentCodeBlock.includes('<!-- CodePen Demo -->') ||
                     currentCodeBlock.includes('<!-- HTML -->') ||
                     currentCodeBlock.includes('<!-- CSS -->') ||
                     currentCodeBlock.includes('<!-- JavaScript -->');
    
    elements.push(
      <CodeBlock key="code-final" language={isCodePen ? 'codepen' : codeLanguage}>
        {currentCodeBlock.trim()}
      </CodeBlock>
    );
  }
  
  return elements;
};

export default function TestFixesPage() {
  const testContent = `# 测试修复功能

## HTML 图片标签测试

这是一个 HTML 图片标签：
<img width=160 src="https://raw.githubusercontent.com/chokcoco/chokcoco/main/gzh_style.png">

这是另一个带 alt 属性的图片：
<img src="https://github.com/chokcoco/iCSS/assets/8554143/aa45cff6-d6b0-4c80-9289-04eac2110075" alt="测试图片" width="300">

## Markdown 图片测试

这是 Markdown 格式的图片：
![测试图片](https://github.com/chokcoco/iCSS/assets/8554143/aa45cff6-d6b0-4c80-9289-04eac2110075)

## CodePen 链接测试

这是一个 CodePen 链接：
[CSS 动画演示](https://codepen.io/chokcoco/pen/abPmOyx)

这是另一个 CodePen 链接：
[渐变边框效果](https://codepen.io/chokcoco/pen/abPmOyx)

## 普通链接测试

这是一个普通链接：
[GitHub 仓库](https://github.com/chokcoco/iCSS)

## 混合内容测试

这里有一些**粗体文本**和*斜体文本*，以及一些 \`行内代码\`。

还有一张图片：<img src="https://github.com/chokcoco/iCSS/assets/8554143/aa45cff6-d6b0-4c80-9289-04eac2110075" width="200">

以及一个 CodePen 链接：[查看演示](https://codepen.io/chokcoco/pen/abPmOyx)

## 列表测试

- 列表项 1
- 列表项 2 包含 [链接](https://github.com)
- 列表项 3 包含图片 <img src="https://github.com/chokcoco/iCSS/assets/8554143/aa45cff6-d6b0-4c80-9289-04eac2110075" width="100">

## 代码块测试

\`\`\`html
<div class="container">
  <img src="test.jpg" alt="测试">
  <a href="https://codepen.io">CodePen</a>
</div>
\`\`\`

\`\`\`css
.container {
  background: url('image.jpg');
  border: 1px solid #ccc;
}
\`\`\`
`;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">修复功能测试</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="prose max-w-none">
            {parseMarkdown(testContent)}
          </div>
        </div>
      </div>
    </div>
  );
} 