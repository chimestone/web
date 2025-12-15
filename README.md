# Chime Stone 个人网站

一个简洁优雅的个人网站，包含首页展示和笔记管理功能。

## 功能特性

### 🏠 首页
- 响应式设计，适配各种设备
- 个人信息展示
- 头像悬停3D翻转效果
- 优雅的动画过渡效果

### 📝 笔记系统
- **便利贴展示**：笔记以彩色便利贴形式展示，仿真纸张效果
- **Markdown支持**：完整支持Markdown语法
- **数学公式**：支持Obsidian风格的数学公式渲染
  - 行内公式：`$E=mc^2$`
  - 块级公式：`$$\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}$$`
- **智能预览**：便利贴智能显示多个一级标题，超出时自动省略
- **本地存储**：使用localStorage保存笔记数据
- **响应式布局**：网格布局自适应屏幕大小

## 技术栈

- **前端**：HTML5, CSS3, JavaScript (ES6+)
- **样式**：CSS Grid, Flexbox, CSS动画
- **Markdown渲染**：Marked.js
- **数学公式**：KaTeX
- **存储**：localStorage
- **字体**：Microsoft YaHei, Comic Sans MS

## 文件结构

```
web/
├── index.html              # 首页
├── notes.html             # 笔记列表页
├── note-detail.html       # 笔记详情页
├── assets/
│   ├── css/
│   │   ├── main.css       # 主样式文件
│   │   ├── notes.css      # 笔记页面样式
│   │   └── note-detail.css # 笔记详情页样式
│   ├── js/
│   │   └── main.js        # 主要JavaScript功能
│   ├── img/
│   │   └── avatar.jpg     # 头像图片
│   └── json/
│       └── images.json    # 背景图片配置
└── README.md              # 项目说明
```

## 特色功能

### 便利贴效果
- 6种不同颜色的渐变背景
- 随机旋转角度模拟真实便签
- 悬停放大效果
- 仿真横线和纸张纹理

### 数学公式渲染
- 兼容Obsidian语法
- 支持复杂数学表达式
- 错误处理和友好提示
- 深色主题适配

### 响应式设计
- 移动端友好
- 自适应网格布局
- 触摸设备优化

## 使用方法

1. 直接在浏览器中打开 `index.html`
2. 点击导航栏"笔记"进入笔记管理
3. 点击"添加新笔记"创建笔记
4. 支持Markdown语法和数学公式
5. 点击便利贴查看完整内容

## 浏览器兼容性

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 开发说明

### 本地开发
直接用浏览器打开HTML文件即可，无需服务器环境。

### 自定义配置
- 修改 `assets/css/main.css` 调整主题色彩
- 修改 `assets/img/avatar.jpg` 更换头像
- 修改 `assets/json/images.json` 配置背景图片

## 更新日志

### v2.0.0 (2024-12)
- ✨ 新增笔记系统
- ✨ 便利贴展示效果
- ✨ Markdown和数学公式支持
- ✨ 响应式笔记布局
- 🎨 优化UI设计和动画效果

### v1.0.0 (2024-12)
- 🎉 初始版本发布
- ✨ 个人主页展示
- ✨ 响应式设计
- ✨ 3D头像效果

## 许可证

MIT License

## 作者

Chime Stone

---

*"钟磬昼不响，空山自泠泠" - 张元凯*