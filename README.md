# BeatTool

在线节拍器，专为吉他练习设计。基于 Web Audio API 精准时序，支持自定义拍号与倒计时停止。

## 功能

- **BPM 调节** — 20–300 范围，滑块 / 按钮 / 键盘快捷键 / 预设
- **拍号** — 2/4, 3/4, 4/4, 6/8, 8/8 预设 + 自定义 (numerator 1–16)
- **定时停止** — 倒计时归零自动停止播放
- **视听反馈** — 强拍 / 弱拍区分音色，节拍指示灯脉冲动效
- **暗色模式** — 一键切换，localStorage 持久化

## 技术栈

| 层面     | 选型                        |
| -------- | --------------------------- |
| 框架     | Vue 3 + TypeScript          |
| 构建     | Vite                        |
| 样式     | Tailwind CSS 4              |
| UI 组件  | shadcn-vue (Reka UI)        |
| 图标     | lucide-vue-next             |
| 音频     | Web Audio API               |
| 包管理   | pnpm                        |
| 部署     | Docker + Nginx              |

## 本地开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器 (HMR)
pnpm dev

# 生产构建
pnpm build

# 预览构建产物
pnpm preview
```

## Docker 部署

```bash
# 构建并启动
docker compose up -d

# 访问 http://localhost:8080
```

手动构建镜像：

```bash
docker build -t beattool .
docker run -d -p 8080:80 beattool
```

## 目录结构

```
src/
├── main.ts                         # 入口
├── App.vue                         # 根组件，全局状态
├── assets/css/main.css             # Tailwind 4 + shadcn 变量
├── lib/utils.ts                    # cn() 工具函数
├── components/
│   ├── ui/                         # shadcn-vue 组件
│   ├── MetronomeDisplay.vue        # BPM 数字 + -/+ 按钮
│   ├── BpmSlider.vue               # BPM 滑块
│   ├── TimeSignature.vue           # 拍号预设
│   ├── CustomTimeSignature.vue     # 自定义拍号
│   ├── PlayButton.vue              # 播放/停止
│   ├── BeatIndicator.vue           # 节拍指示灯
│   ├── CountdownDisplay.vue        # 倒计时
│   └── PresetTempo.vue             # 速度预设
└── composables/
    ├── useMetronome.ts             # 节拍引擎
    └── useCountdown.ts             # 倒计时逻辑
```

## 浏览器支持

Chrome / Firefox / Edge 最新版。需要 Web Audio API 支持。

## 更新日志

### v0.2.2 (2026-05-14)
- 修复：停止播放后短时间内再次播放会出现重复声音，改为 close AudioContext 彻底销毁已排队的音频节点
- 修复：播放中切换 BPM 或拍号时出现重复节拍声音，改为切换时销毁并重建 AudioContext
- 新增：README 更新日志

### v0.2.1 (2026-05-14)
- 修复：停止播放后声音不停止（GainNode 静音 + 版本号模板显示）
- 优化：调度器唤醒间隔固定 25ms，解决快速拍号下掉拍问题

### v0.2.0 (2026-05-13)
- 新增：页面标题 BeatTool + 版本号
- 新增：节拍校对面板（预期间隔、实际间隔、累计漂移）
- 优化：自定义拍号弹窗 + 滚轮输入
- 优化：倒计时预设（5/10/15/20/30 分钟）+ 弹窗编辑
- 修复：BPM 始终以四分音符为基准，切换拍号时速度感不变

### v0.1.0 (2026-05-13)
- 初始版本：BPM 调节、拍号预设/自定义、倒计时停止、暗色模式、动效

## 许可

MIT
