## 任务背景

用户想在本机启动 OpenCut 项目（开源视频剪辑工具）。

## 执行过程

1. Git clone 失败（磁盘空间问题）
2. 改用本地已有代码目录启动
3. 发现缺少 bun 运行时
4. npm install 完成后 turbo 报错
5. 用户自行在终端执行安装

## 关键结果

- npm install 成功（652 packages）
- Node 版本冲突（v23 vs 要求 20/22），但警告可忽略
- turbo 无法运行：需要安装 bun
- 建议方案：`npm install -g bun` 或直接进 `apps/web` 用 npm 启动
- 备选：使用在线版 opencut.app

## 结论建议

安装 bun 后即可本地运行 OpenCut，或直接使用 opencut.app。