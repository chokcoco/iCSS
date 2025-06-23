# 主题和语言切换功能说明

## 🎨 主题切换功能

### 功能特性
- **亮色主题**: 适合日间使用，白色背景
- **暗色主题**: 适合夜间使用，深色背景，护眼
- **跟随系统**: 自动跟随系统主题设置
- **持久化**: 主题选择会保存到 localStorage

### 实现方式
1. **CSS 变量系统**: 使用 CSS 自定义属性定义主题色彩
2. **Tailwind 暗色模式**: 支持 `dark:` 前缀的类名
3. **Context API**: React Context 管理主题状态
4. **localStorage**: 持久化用户选择

### 文件结构
```
app/
├── lib/
│   └── theme.ts              # 主题管理工具
├── contexts/
│   └── AppContext.tsx        # 应用上下文
├── components/
│   └── ThemeToggle.tsx       # 主题切换组件
└── globals.css               # 全局样式和主题变量
```

### 使用方法
```typescript
import { useApp } from '../contexts/AppContext';

function MyComponent() {
  const { theme, setTheme } = useApp();
  
  return (
    <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
      <button onClick={() => setTheme('dark')}>
        切换到暗色主题
      </button>
    </div>
  );
}
```

## 🌍 多语言支持

### 功能特性
- **中文**: 简体中文界面
- **English**: 英文界面
- **持久化**: 语言选择会保存到 localStorage
- **实时切换**: 无需刷新页面即可切换语言

### 实现方式
1. **翻译文件**: 集中管理所有翻译内容
2. **Context API**: React Context 管理语言状态
3. **翻译函数**: 提供 `t()` 函数获取翻译
4. **localStorage**: 持久化用户选择

### 文件结构
```
app/
├── lib/
│   ├── language.ts           # 语言管理工具
│   └── translations.ts       # 翻译文件
├── contexts/
│   └── AppContext.tsx        # 应用上下文
└── components/
    └── LanguageToggle.tsx    # 语言切换组件
```

### 使用方法
```typescript
import { useApp } from '../contexts/AppContext';

function MyComponent() {
  const { t, language, setLanguage } = useApp();
  
  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
      <button onClick={() => setLanguage('en')}>
        切换到英文
      </button>
    </div>
  );
}
```

## 🎯 核心组件

### ThemeToggle 组件
- 下拉菜单式主题选择
- 图标和文字显示
- 点击外部自动关闭
- 支持键盘导航

### LanguageToggle 组件
- 下拉菜单式语言选择
- 国旗图标显示
- 点击外部自动关闭
- 支持键盘导航

### AppContext 上下文
- 统一管理主题和语言状态
- 提供翻译函数
- 处理服务端渲染兼容性
- 防止闪烁问题

## 🎨 样式系统

### CSS 变量
```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  /* 更多变量... */
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --primary: 217.2 91.2% 59.8%;
  /* 更多变量... */
}
```

### Tailwind 配置
```javascript
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        // 更多颜色...
      }
    }
  }
}
```

## 📱 响应式设计

### 移动端适配
- 主题和语言切换按钮在小屏幕上自动调整布局
- 下拉菜单在移动端有合适的定位
- 触摸友好的交互设计

### 无障碍支持
- 支持键盘导航
- 适当的 ARIA 标签
- 高对比度支持

## 🔧 技术细节

### 服务端渲染兼容性
- 使用 `suppressHydrationWarning` 防止水合警告
- 客户端初始化时处理主题和语言
- 防止闪烁的加载状态

### 性能优化
- 使用 `useCallback` 优化函数引用
- 使用 `useMemo` 缓存计算结果
- 避免不必要的重新渲染

### 错误处理
- 优雅降级到默认主题和语言
- 处理 localStorage 不可用的情况
- 网络错误时的备用方案

## 🧪 测试

### 测试页面
访问 `http://localhost:3000/test-theme-lang` 可以测试：
- 主题切换功能
- 语言切换功能
- 翻译内容显示
- 样式适配效果

### 测试内容
- 主题切换是否正常工作
- 语言切换是否正常工作
- 持久化是否生效
- 响应式布局是否正常
- 无障碍功能是否正常

## 🚀 部署注意事项

### 环境变量
确保生产环境支持：
- `NEXT_PUBLIC_` 前缀的环境变量
- 静态资源路径配置

### 构建优化
- 确保 TypeScript 编译通过
- 检查 ESLint 规则
- 优化包大小

### 浏览器兼容性
- 支持现代浏览器的 CSS 变量
- 支持 localStorage API
- 支持 CSS Grid 和 Flexbox

## 📝 扩展指南

### 添加新主题
1. 在 `app/lib/theme.ts` 中添加新主题配置
2. 在 `app/globals.css` 中添加对应的 CSS 变量
3. 在 `app/components/ThemeToggle.tsx` 中添加新主题选项

### 添加新语言
1. 在 `app/lib/language.ts` 中添加新语言配置
2. 在 `app/lib/translations.ts` 中添加新语言翻译
3. 在 `app/components/LanguageToggle.tsx` 中添加新语言选项

### 添加新翻译
1. 在 `app/lib/translations.ts` 的 `Translations` 接口中添加新键
2. 在中文和英文翻译对象中添加对应翻译
3. 在组件中使用 `t('newKey')` 获取翻译

## 🎉 总结

主题和语言切换功能已经成功集成到网站中，提供了：

✅ **完整的主题系统**: 支持亮色、暗色、跟随系统三种模式
✅ **多语言支持**: 支持中文和英文切换
✅ **持久化存储**: 用户选择会保存到本地
✅ **响应式设计**: 完美适配各种设备
✅ **无障碍支持**: 支持键盘导航和屏幕阅读器
✅ **性能优化**: 流畅的切换体验
✅ **易于扩展**: 可以轻松添加新主题和语言

用户现在可以：
- 在网站右上角切换主题和语言
- 享受个性化的浏览体验
- 在不同设备间保持设置同步
- 获得更好的可访问性支持 