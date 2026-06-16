# 余白 Yohaku

> 浏览之后，不必留下所有痕迹。

余白是一个浏览器扩展。它不提供传统的无痕模式，而是允许你在正常浏览的同时，决定哪些记录应该留下，哪些记录应该成为余白。

## ✨ 功能特性

- **留白会话**：一键开始/结束，期间正常浏览
- **记录选择**：结束留白后，可以精确选择要删除/导出的记录
- **三种导出格式**：JSON / CSV / Markdown
- **深色模式**：浅色 / 深色 / 跟随系统
- **状态持久化**：浏览器重启后自动恢复会话状态

## 📸 截图

### 主界面

![主界面](./docs/images/screenshot-main.png)

### 记录管理

![记录管理](./docs/images/screenshot-records.png)

### 导出选项

![导出选项](./docs/images/screenshot-export.png)

## 📥 安装

### 方法一：从 GitHub Releases 安装（推荐）

1. 访问 [Releases 页面](https://github.com/smallksh/Yohaku/releases)
2. 下载最新版本的 `yohaku.crx` 文件
3. 打开 Chrome，访问 `chrome://extensions/`
4. 开启右上角「开发者模式」
5. 将下载的 `.crx` 文件拖入页面
6. 点击「添加扩展程序」确认安装

### 方法二：从源码安装（开发模式）

1. 克隆仓库
   ```bash
   git clone https://github.com/smallksh/Yohaku.git