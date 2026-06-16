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

1. 克隆仓库到本地
   ```bash
   git clone https://github.com/smallksh/Yohaku.git
   ```

2. 打开 Chrome 浏览器，在地址栏输入 `chrome://extensions/` 并回车

3. 打开右上角的「开发者模式」开关

4. 点击左上角的「加载已解压的扩展程序」按钮

5. 在弹出的文件选择窗口中，找到并选择项目文件夹中的 **`src`** 目录

6. 点击「选择文件夹」，扩展程序即安装完成

## 🚀 使用指南

1. 点击浏览器右上角的余白图标，点击「开始留白」
2. 正常浏览网页，余白会在后台默默记录
3. 浏览结束后，再次点击余白图标，点击「结束留白」
4. 在记录列表中勾选需要操作的记录：
   - **删除选中**：只删除勾选的记录，未勾选的保留
   - **保留选中**：保留所有记录（快捷关闭）
   - **导出选中**：导出勾选的记录，支持 JSON / CSV / Markdown 三种格式

## 📄 开源协议

MIT License © 2026 smallksh

详见 [LICENSE](./LICENSE) 文件。