import CodeBlock from '../components/CodeBlock';

export default function TestDemoPage() {
  const demoCode = `<!-- CodePen Demo -->
<!-- HTML -->
<div class="container">
  <div class="card">
    <div class="card-header">
      <h3>CSS 动画演示</h3>
    </div>
    <div class="card-body">
      <div class="animated-box">
        <span>悬停我</span>
      </div>
    </div>
  </div>
</div>

<!-- CSS -->
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  width: 300px;
}

.card-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  text-align: center;
}

.card-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.card-body {
  padding: 30px;
  text-align: center;
}

.animated-box {
  display: inline-block;
  padding: 15px 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.animated-box::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.animated-box:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 15px 35px rgba(102, 126, 234, 0.4);
}

.animated-box:hover::before {
  left: 100%;
}

.animated-box span {
  position: relative;
  z-index: 1;
  font-weight: 600;
}

<!-- JavaScript -->
// 添加点击效果
document.addEventListener('DOMContentLoaded', function() {
  const animatedBox = document.querySelector('.animated-box');
  
  animatedBox.addEventListener('click', function() {
    this.style.transform = 'translateY(-3px) scale(1.05) rotate(5deg)';
    setTimeout(() => {
      this.style.transform = 'translateY(-3px) scale(1.05)';
    }, 200);
  });
});
`;

  const htmlCode = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HTML 示例</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .highlight {
            background: #ffeb3b;
            padding: 2px 4px;
            border-radius: 3px;
        }
        .button {
            background: #2196f3;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            margin: 5px;
        }
        .button:hover {
            background: #1976d2;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>HTML 代码高亮演示</h1>
        <p>这是一个 <span class="highlight">HTML</span> 页面的示例，展示了各种 HTML 元素的使用。</p>
        
        <h2>表单元素</h2>
        <form>
            <label for="name">姓名：</label>
            <input type="text" id="name" name="name" placeholder="请输入姓名">
            <br><br>
            
            <label for="email">邮箱：</label>
            <input type="email" id="email" name="email" placeholder="请输入邮箱">
            <br><br>
            
            <label for="message">留言：</label>
            <textarea id="message" name="message" rows="4" placeholder="请输入留言"></textarea>
            <br><br>
            
            <button type="submit" class="button">提交</button>
            <button type="reset" class="button">重置</button>
        </form>
        
        <h2>列表</h2>
        <ul>
            <li>无序列表项 1</li>
            <li>无序列表项 2</li>
            <li>无序列表项 3</li>
        </ul>
        
        <ol>
            <li>有序列表项 1</li>
            <li>有序列表项 2</li>
            <li>有序列表项 3</li>
        </ol>
    </div>
</body>
</html>`;

  const cssCode = `/* CSS 代码高亮演示 */

/* 基础样式重置 */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    line-height: 1.6;
    color: #333;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
}

/* 容器样式 */
.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

/* 卡片组件 */
.card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    margin-bottom: 20px;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.card-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 20px;
    font-size: 18px;
    font-weight: 600;
}

.card-body {
    padding: 20px;
}

/* 按钮样式 */
.btn {
    display: inline-block;
    padding: 12px 24px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    text-decoration: none;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
}

.btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

.btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

.btn-secondary {
    background: #6c757d;
    color: white;
}

.btn-secondary:hover {
    background: #5a6268;
    transform: translateY(-2px);
}

/* 动画效果 */
@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.fade-in {
    animation: fadeIn 0.6s ease-out;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .container {
        padding: 10px;
    }
    
    .card {
        margin-bottom: 15px;
    }
    
    .btn {
        padding: 10px 20px;
        font-size: 13px;
    }
}

/* 特殊效果 */
.glow {
    box-shadow: 0 0 20px rgba(102, 126, 234, 0.5);
}

.text-gradient {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}`;

  const jsCode = `// JavaScript 代码高亮演示

// 类定义
class AnimationManager {
    constructor() {
        this.animations = new Map();
        this.isRunning = false;
    }
    
    // 添加动画
    addAnimation(name, animation) {
        this.animations.set(name, animation);
        console.log(\`动画 "\${name}" 已添加\`);
    }
    
    // 播放动画
    playAnimation(name) {
        const animation = this.animations.get(name);
        if (animation) {
            animation.play();
            console.log(\`播放动画: \${name}\`);
        } else {
            console.warn(\`动画 "\${name}" 不存在\`);
        }
    }
    
    // 停止所有动画
    stopAll() {
        this.animations.forEach(animation => {
            if (animation.stop) {
                animation.stop();
            }
        });
        console.log('所有动画已停止');
    }
}

// 工具函数
const utils = {
    // 防抖函数
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // 节流函数
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    
    // 深拷贝
    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }
        
        if (obj instanceof Date) {
            return new Date(obj.getTime());
        }
        
        if (obj instanceof Array) {
            return obj.map(item => this.deepClone(item));
        }
        
        if (typeof obj === 'object') {
            const clonedObj = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    clonedObj[key] = this.deepClone(obj[key]);
                }
            }
            return clonedObj;
        }
    }
};

// 事件处理
document.addEventListener('DOMContentLoaded', function() {
    console.log('页面加载完成');
    
    // 初始化动画管理器
    const animationManager = new AnimationManager();
    
    // 添加一些示例动画
    const fadeInAnimation = {
        play: () => {
            document.querySelectorAll('.fade-in').forEach(el => {
                el.style.opacity = '0';
                el.style.transform = 'translateY(20px)';
                
                setTimeout(() => {
                    el.style.transition = 'all 0.6s ease-out';
                    el.style.opacity = '1';
                    el.style.transform = 'translateY(0)';
                }, 100);
            });
        },
        stop: () => {
            document.querySelectorAll('.fade-in').forEach(el => {
                el.style.transition = 'none';
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            });
        }
    };
    
    animationManager.addAnimation('fadeIn', fadeInAnimation);
    
    // 绑定事件
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            console.log(\`按钮被点击: \${this.textContent}\`);
            
            // 添加点击效果
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });
    
    // 窗口大小变化处理
    const handleResize = utils.debounce(() => {
        console.log(\`窗口大小变化: \${window.innerWidth}x\${window.innerHeight}\`);
    }, 250);
    
    window.addEventListener('resize', handleResize);
});

// 导出模块（如果使用模块系统）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AnimationManager, utils };
}`;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">代码高亮和 CodePen Demo 测试</h1>
        
        <div className="space-y-8">
          {/* CodePen Demo */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">CodePen Demo 示例</h2>
            <CodeBlock language="codepen">
              {demoCode}
            </CodeBlock>
          </section>
          
          {/* HTML 代码 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">HTML 代码高亮</h2>
            <CodeBlock language="html">
              {htmlCode}
            </CodeBlock>
          </section>
          
          {/* CSS 代码 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">CSS 代码高亮</h2>
            <CodeBlock language="css">
              {cssCode}
            </CodeBlock>
          </section>
          
          {/* JavaScript 代码 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">JavaScript 代码高亮</h2>
            <CodeBlock language="javascript">
              {jsCode}
            </CodeBlock>
          </section>
        </div>
      </div>
    </div>
  );
} 