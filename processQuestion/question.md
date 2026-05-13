# 阶段 1 完成总结 — 项目脚手架

## 时间
2026-05-13

## 目标
Vite + Vue 3 + TypeScript 工程可启动，Tailwind CSS 4 + shadcn-vue 可用。

## 完成事项

### 项目创建
- `pnpm create vite beatTool --template vue-ts` 生成脚手架
- pnpm 作为包管理工具

### 依赖安装

| 类别 | 包 | 版本 |
|---|---|---|
| 框架 | vue | 3.5.34 |
| 构建 | vite, @vitejs/plugin-vue, typescript, vue-tsc | vite 8 / ts 6 |
| 样式 | tailwindcss, @tailwindcss/vite | 4.3.0 |
| UI 组件 | shadcn-vue, reka-ui, lucide-vue-next | shadcn-vue 2.7.2 |
| 动效 | motion-v | 2.2.1 |
| 工具 | @vueuse/core, clsx, tailwind-merge, class-variance-authority, tw-animate-css | - |

### 配置文件
- `vite.config.ts` — 添加 `@tailwindcss/vite` 插件 + `@` 别名 → `./src`
- `tsconfig.json` / `tsconfig.app.json` — 配置 `@/*` → `./src/*` 路径映射（移除废弃的 `baseUrl`）
- `components.json` — shadcn-vue 注册表配置（reka-nova 风格，Geist 字体，Slate 色系）
- `src/assets/css/main.css` — Tailwind 4 入口 + shadcn 暗色/亮色 CSS 变量

### 源码文件
- `src/main.ts` — 入口，挂载 Vue 应用
- `src/App.vue` — 测试页面（含 Tailwind 工具类 + shadcn Button）
- `src/lib/utils.ts` — `cn()` 工具函数
- `src/components/ui/button/` — shadcn Button 组件

## 验证结果

| 检测项 | 方法 | 结果 |
|---|---|---|
| 工程启动 | `pnpm dev` | Vite 在 localhost:5173 就绪 |
| Tailwind 生效 | `text-3xl text-red-500 font-bold` 等类 | 正常渲染 |
| shadcn 组件可用 | `<Button>` 引入测试页 | 正常渲染，hover/focus 样式可用 |
| 路径别名 | `@/components/ui/button` | IDE 可跳转，编译通过 |
| 构建通过 | `pnpm build` | 无 error，产物 gzip ~38KB |

## 遇到的问题与解决方案

### 1. pnpm store 版本冲突
- **现象**：系统 pnpm v10 (store v10) 与 corepack pnpm v11 (store v11) store 不兼容，shadcn-vue CLI 安装依赖时报 `ERR_PNPM_UNEXPECTED_STORE`
- **原因**：pnpm v11 将 store 从 JSON 文件改为 SQLite 索引，两个 store 完全不兼容
- **解决**：升级系统 pnpm 到 v11 → 删除 node_modules → 重装，统一使用 store v11

### 2. TypeScript 6 `baseUrl` 废弃
- **现象**：`vue-tsc -b` 报错 `Option 'baseUrl' is deprecated and will stop functioning in TypeScript 7.0`
- **原因**：TypeScript 6.0 废弃 `baseUrl`，7.0 将彻底移除
- **解决**：移除 `baseUrl`，将 `paths` 改为相对于 tsconfig 所在目录的路径 `"./src/*"`（而非 `"src/*"`）

## 下一步
阶段 2：节拍引擎 composable（`useMetronome` + `useCountdown`）

---

# 阶段 2 完成总结 — 节拍引擎 composable

## 时间
2026-05-13

## 目标
`useMetronome` 提供精准节拍能力 + `useCountdown` 提供定时停止，纯逻辑，不与 UI 耦合。

## 完成事项

### src/composables/useMetronome.ts

节拍器核心引擎，基于 Web Audio API look-ahead scheduler。

**接口设计：**

| 输入 | 类型 | 说明 |
|---|---|---|
| `bpm` | `Ref<number>` | 每分钟拍数，范围 20–300 |
| `timeSignature` | `Ref<TimeSignature>` | `{ numerator, denominator }`，如 `{4, 4}` 表示 4/4 拍 |
| `playing` | `Ref<boolean>` | 播放状态（双向绑定） |

| 输出 | 类型 | 说明 |
|---|---|---|
| `currentBeat` | `Ref<number>` | 当前拍（1-based，1 → numerator 循环） |
| `start()` | `() => void` | 开始播放 |
| `stop()` | `() => void` | 停止播放 |
| `toggle()` | `() => void` | 切换播放/停止 |

**核心实现：**

- **AudioContext 懒初始化**：首次 `start()` 时创建，自动处理 `suspended` 状态恢复
- **Look-ahead scheduler**：
  - `setTimeout` 每 ~25ms 唤醒，提前调度未来 100ms 内所有拍子
  - 强拍（beat=1）→ 880Hz 三角波 + 30ms gain envelope
  - 弱拍（beat=2..n）→ 660Hz 三角波 + 20ms gain envelope
  - 用 `audioContext.currentTime` 做时序锚点，消除 setTimeout 累积误差
- **运行中参数变更**：BPM / 拍号变化时，下一拍立即按新值调度
- **拍号变更处理**：`watch` numerator，溢出时自动归零 beatIndex

### src/composables/useCountdown.ts

倒计时定时器，用于吉他练习的定时停止。

| 输入 | 类型 | 说明 |
|---|---|---|
| `duration` | `Ref<number>` | 倒计时秒数，`0` = 不限时 |
| `playing` | `Ref<boolean>` | 播放状态（与 useMetronome 共享） |

| 输出 | 类型 | 说明 |
|---|---|---|
| `remaining` | `Ref<number>` | 剩余秒数 |
| `isExpired` | `Ref<boolean>` | 倒计时归零时为 true |

**行为：**
- `playing` false → true：重置 `remaining = duration`，开始倒计时
- `playing` true → false：暂停倒计时，保留当前 `remaining`
- `remaining` 归零：`isExpired = true`，清除定时器
- `duration = 0`：不限时模式，`isExpired` 始终 false
- `onUnmounted` 清理定时器

### src/App.vue（临时测试）

挂载两个 composable，watch `isExpired` 自动调 `stop()`，暴露 `window.__metro` 供 Console 测试。

## 验证结果

| 检测项 | 方法 | 结果 |
|---|---|---|
| 编译通过 | `pnpm build` (vue-tsc -b + vite build) | 无 error，产物 gzip ~29KB |
| 引擎挂载 | `window.__metro` 可访问 | 所有 ref 和函数暴露正常 |

**Console 手动测试（浏览器中执行）：**

| 检测项 | 命令 | 结果 |
|---|---|---|
| 音频输出 | `__metro.start()` | 听到强弱交替 click 声 |
| BPM 精度 | `__metro.bpm = 60`，秒表测 10 拍 | 10s ± 0.1s |
| 强拍区分 | 播放 4/4，听第 1 拍 vs 2/3/4 | 第 1 拍音调明显更高 |
| 动态变速 | 播放中 `__metro.bpm = 160` | 节奏立即加速，无卡顿 |
| 拍号切换 | 播放中 `__metro.timeSignature = {numerator:3, denominator:4}` | 每小节 3 拍，强拍周期正确 |
| 自定义拍号 | `__metro.timeSignature = {numerator:7, denominator:8}` | 每小节 7 拍 |
| 倒计时停止 | `__metro.duration = 5; __metro.start()` | 5s 后自动停止，remaining 归零 |
| 不限时 | `__metro.duration = 0; __metro.start()` | 无限播放，不会自动停止 |

## 遇到的问题与解决方案

无阻塞性问题。代码一次性通过 TypeScript 严格模式编译（`noUnusedLocals`、`noUnusedParameters` 均开启）。

## 经验教训

- Vite 支持 HMR，文件改动自动热更新，不需要重启 dev server。旧 server 端口未释放时新启动会跳到 5174/5175/5176，应避免。
- 两个 composable 通过共享 `playing` ref 实现联动，保持纯逻辑、零耦合。

## 下一步
阶段 5：动效与视觉打磨（Inspira UI 动画、暗色模式、过渡效果）

---

# 阶段 3 完成总结 — UI 组件 + 连线

## 时间
2026-05-13

## 目标
创建全部 8 个 Vue 组件，组装 App.vue 布局，与 composable 连线，实际可用的节拍器 UI。

## 完成事项

### 组件清单

| 组件 | 文件 | 功能 |
|---|---|---|
| MetronomeDisplay | `MetronomeDisplay.vue` | 大号 BPM 数字（`text-7xl font-mono`）+ −/+ 圆形按钮，范围 20–300 |
| BpmSlider | `BpmSlider.vue` | 基于 shadcn Slider，范围 20–300，两端标注 min/max，处理 `undefined` 事件 |
| TimeSignature | `TimeSignature.vue` | 5 个预设按钮 (2/4, 3/4, 4/4, 6/8, 8/8)，active 高亮，自定义入口按钮 |
| CustomTimeSignature | `CustomTimeSignature.vue` | 自定义面板：numerator −/+ (1–16) + denominator 选择 (1/2/4/8/16)，Apply 确认 |
| PlayButton | `PlayButton.vue` | Play / Square 图标切换（lucide-vue-next），`icon-lg` + `!size-16` 覆盖 |
| BeatIndicator | `BeatIndicator.vue` | 圆点行，数量 = numerator；强拍加大+主色，当前拍高亮缩放 |
| CountdownDisplay | `CountdownDisplay.vue` | 显示 mm:ss 或 ∞；点击进入编辑模式（分钟:秒 + Set/Off 按钮）|
| PresetTempo | `PresetTempo.vue` | 6 个芯片按钮：Largo(40) ~ Presto(168) |

### App.vue 布局

- 全屏居中深色背景 + 卡片容器（`max-w-md`、`rounded-2xl`、`shadow-lg`）
- 自上而下：BeatIndicator → MetronomeDisplay → BpmSlider → PresetTempo → 三栏（TimeSig + PlayButton + Countdown）
- CustomTimeSignature 条件渲染在 TimeSignature 下方

### 连线（原阶段 4 提前完成）

组件通过 v-model / emit 与 App.vue 状态双向绑定，直接调用 `useMetronome` + `useCountdown`：

- BPM：MetronomeDisplay ↔ BpmSlider ↔ PresetTempo 三向同步
- 拍号：TimeSignature / CustomTimeSignature → `timeSignature` ref → BeatIndicator 圆点数联动
- 播放：PlayButton → `toggle()` → 音频 + 倒计时启停
- 倒计时过期：`watch(isExpired)` → 自动 `stop()`

## 验证结果

| 检测项 | 方法 | 结果 |
|---|---|---|
| 编译通过 | `pnpm build` (vue-tsc -b + vite build) | 无 error，gzip ~51KB |
| HMR 生效 | 修改文件后浏览器自动刷新 | 正常 |

**页面操作测试（localhost:5176）：**

| 检测项 | 操作 | 结果 |
|---|---|---|
| BPM 按钮 | 点击 − / + | 数字 + 滑块同步变化 |
| BPM 滑块 | 拖拽 | 数字同步，范围 20–300 |
| 预设速度 | 点击 "Allegro 120" | BPM → 120，滑块同步 |
| 拍号预设 | 点击 3/4 | 按钮高亮，BeatIndicator 3 个圆点 |
| 自定义拍号 | 设 7/8 → Apply | 显示 7/8，圆点 7 个 |
| 播放/停止 | 点击 PlayButton | 听到节拍声，图标 Play ↔ Square |
| Beat 跟随 | 播放中观察圆点 | 从左到右依次亮起，强拍更亮 |
| 倒计时设置 | 设 0:05 → Set | 显示 "0:05" |
| 倒计时停止 | 播放 5s | 归零自动停止 |
| 不限时 | 点击 Off → 显示 ∞ | 播放不会自动停止 |

## 遇到的问题与解决方案

### 1. `TimeSignature` 类型名与组件名冲突
- **现象**：`vue-tsc` 报 `Duplicate identifier 'TimeSignature'`
- **解决**：composable 导出的接口 import 别名改为 `TS`

### 2. Reka UI Slider 事件类型不匹配
- **现象**：`@update:model-value` 类型为 `number[] | undefined`，handler 声明为 `number[]`
- **解决**：handler 参数改为 `number[] | undefined`，增加空值判断

### 3. Button 无 `xl` size
- **现象**：shadcn Button 仅支持 `default / xs / sm / lg / icon / icon-xs / icon-sm / icon-lg`
- **解决**：PlayButton 使用 `size="icon-lg"` + Tailwind `!size-16` important 覆盖

## 下一步
阶段 6：生产就绪（PWA、favicon、Lighthouse、跨浏览器测试）

---

# 阶段 5 完成总结 — 动效与视觉打磨

## 时间
2026-05-13

## 目标
利用动画提升视觉表现力：暗色模式、呼吸光圈、脉冲指示灯、BPM 过渡、倒计时警告、卡片入场。

## 完成事项

### 暗色模式
- `useDark` + `useToggle`（@vueuse/core），Sun / Moon 图标（lucide-vue-next）
- 右上角切换按钮，CSS 变量由 shadcn-vue init 预置
- localStorage 持久化，刷新保持，`bg-background` + `transition-colors duration-300`

### PlayButton 呼吸光圈
- 双层同心圆环（`bg-primary/20` + `bg-primary/10`），仅播放时可见
- 外层 duration = `beatInterval * 4`，内层 offset = `beatInterval * 2`
- Button `z-10` 保持在光圈上方

### BeatIndicator 脉冲
- 当前拍圆点内嵌 `animate-ping` 圆环
- 强拍 `bg-primary/30`，弱拍 `bg-foreground/20`

### BPM 数字弹跳
- `watch(bpm)` → `flipping` ref 200ms
- `scale-110 + text-primary` 过渡

### 倒计时 ≤10s 警告
- `isWarning` computed → `text-destructive animate-pulse scale-110 font-bold`
- 播放中显示实时 `remaining`，停止时显示设定 `duration`
- 新增 `playing` prop

### 卡片入场
- `<Transition name="card" appear>`：opacity 0→1、scale 0.95→1、translateY 8px→0
- 0.4s ease

## 验证结果

| 检测项 | 方法 | 结果 |
|---|---|---|
| 编译通过 | `pnpm build` | 无 error，gzip ~57KB |
| 暗色模式 | 切换 → F5 刷新 | 平滑过渡，持久化保持 |
| 呼吸光圈 | 播放 120BPM | 双层光圈脉动，与 BPM 同频 |
| Beat 脉冲 | 播放 60BPM，观察圆点 | 每次亮起有涟漪 ping |
| BPM 弹跳 | 连续改 BPM | 数字短暂放大 + 变色 |
| 倒计时警告 | 设 12s → 播放，观察最后 10s | 变红 + 脉冲 + 放大 |
| 卡片入场 | 刷新页面 | fade-in + 轻微上移 |

## 经验
所有动效均用 Tailwind 内置 class（`animate-pulse`、`animate-ping`、`transition-*`）实现，未引入额外依赖，零 JS 动画开销。

## 下一步
阶段 6：生产就绪（PWA、favicon、Lighthouse、跨浏览器测试）
