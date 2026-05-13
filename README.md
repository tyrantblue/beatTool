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

## 许可

MIT
