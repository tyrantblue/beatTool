# 节拍器 Web 应用 — 开发计划

## 项目概述

基于 **Vue 3 + Web Audio API** 的在线节拍器，支持 BPM 调节、拍号设置、视听反馈。纯前端、无需后端。

## 技术栈

| 层面 | 选型 | 说明 |
|---|---|---|
| 包管理 | pnpm | 快速、节省磁盘、严格依赖解析 |
| 框架 | Vue 3 (Composition API) + TypeScript | `<script setup>` 语法 |
| 构建 | Vite | 开发热更新，生产打包 |
| UI 组件 | shadcn-vue (Reka-UI 底层) | 无 runtime 依赖，按需复制组件源码 |
| 样式 | Tailwind CSS 4 | CSS-first 配置，无需 `tailwind.config.js` |
| 动效 | Inspira UI | 120+ 动画组件，motion-v + GSAP 驱动 |
| 音频 | Web Audio API | 振荡器合成 click 声，sample 级时序精度 |
| 工具库 | @vueuse/core | `useIntervalFn`、`useDark` 等 composition 工具 |

## 目录结构

```
beatTool/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── PLAN.md
└── src/
    ├── main.ts                     # 入口，挂载 Vue 应用
    ├── App.vue                     # 根组件，布局框架
    ├── vite-env.d.ts
    ├── assets/
    │   └── css/
    │       └── main.css            # Tailwind 4 入口 + CSS 变量 + Inspira 基础样式
    ├── lib/
    │   └── utils.ts                # cn() 工具函数 (clsx + tailwind-merge)
    ├── components/
    │   ├── ui/                     # shadcn-vue 组件 (Button, Slider, Select 等)
    │   │   └── ...
    │   ├── MetronomeDisplay.vue    # BPM 数字展示 + +/- 按钮
    │   ├── BpmSlider.vue           # BPM 滑块
    │   ├── TimeSignature.vue       # 常用拍号快捷选择
    │   ├── CustomTimeSignature.vue # 自定义拍号面板 (numerator / denominator)
    │   ├── PlayButton.vue          # 播放/停止按钮 (Inspira 动效)
    │   ├── BeatIndicator.vue       # 拍点指示灯 (Inspira 脉冲动效)
    │   ├── CountdownDisplay.vue    # 倒计时显示 + 时间设置
    │   └── PresetTempo.vue         # 预设速度快捷按钮
    └── composables/
        ├── useMetronome.ts         # 节拍引擎核心
        └── useCountdown.ts         # 倒计时定时停止逻辑
```

## 开发阶段

### 阶段 1：项目脚手架

**目标**：Vite + Vue 3 工程可启动，shadcn-vue + Tailwind 4 可用。

**操作步骤：**

- [ ] `pnpm create vite beatTool --template vue-ts`
- [ ] 安装依赖：
  ```
  pnpm add tailwindcss @tailwindcss/vite
  pnpm add clsx tailwind-merge class-variance-authority
  pnpm add motion-v @vueuse/core
  ```
- [ ] 初始化 shadcn-vue：`pnpm dlx shadcn-vue@latest init` (New York style, Slate, CSS variables)
- [ ] 配置 `vite.config.ts` 添加 `@tailwindcss/vite` 插件 + `@` 别名
- [ ] 配置 `tsconfig.json` 添加 `@/*` → `./src/*` 路径映射
- [ ] 编写 `src/assets/css/main.css`：`@import 'tailwindcss'` + shadcn CSS 变量

**达成标准：**

1. `pnpm dev` 启动无报错，浏览器打开能看到默认 Vite + Vue 欢迎页
2. 浏览器 DevTools 检查 computed style，确认 Tailwind 工具类（如 `text-3xl`、`bg-red-500`）已生效
3. 从 shadcn-vue 复制一个 Button 组件到页面，渲染正常、hover/focus 样式可用
4. `pnpm build` 构建无错误

**测试方式：**

| 检测项 | 方法 | 期望结果 |
|---|---|---|
| 工程启动 | `pnpm dev` | Vite 启动，终端输出 localhost 地址 |
| Tailwind 生效 | 在 App.vue 写 `<div class="text-3xl text-red-500">test</div>` | 页面出现红色大号文字 |
| shadcn 组件可用 | 引入 `<Button>Click</Button>` 到 App.vue | 按钮渲染，有点击反馈样式 |
| 路径别名 | `import '@/lib/utils'` 不报 ESLint/TS 错误 | IDE 可跳转，编译通过 |
| 构建通过 | `pnpm build` | dist/ 目录生成，无 error |

### 阶段 2：节拍引擎 composable

**目标**：`useMetronome` 提供精准节拍能力 + `useCountdown` 提供定时停止，纯逻辑，不与 UI 耦合。

**操作步骤：**

- [ ] 创建 `src/composables/useMetronome.ts`
  - **输入**：
    - `bpm` (Ref<number>, 范围 20–300)
    - `timeSignature` (Ref<{ numerator: number; denominator: number }>)
    - `playing` (Ref<boolean>)
  - **输出**：
    - `currentBeat` (Ref<number>, 1-based, 从 1 到 numerator)
    - `start()`, `stop()`, `toggle()`
  - **AudioContext 懒初始化**：首次 `start()` 时创建 `AudioContext`，兼容浏览器自动播放策略
  - **Look-ahead scheduler**：
    - 每 ~25ms 唤醒一次 (`setTimeout`)
    - 提前调度未来 100ms 内所有拍子的音频事件
    - 强拍 (beat=1) → 880Hz 三角波 + 30ms gain envelope
    - 弱拍 (beat=2..n) → 660Hz 三角波 + 20ms gain envelope
    - 拍号分母对应音符时值：BPM 始终以「分母音符 = 1 拍」计算间隔
      - 例：4/4 拍 BPM=120 → 每拍 500ms
      - 例：6/8 拍 BPM=120 → 每拍 500ms（八分音符 = 1 拍）
  - **时序纠偏**：对比 `audioContext.currentTime` 与预期时间，动态修正下次 scheduler 唤醒间隔
  - **运行中参数变更**：BPM / 拍号变化时，下一拍立即按新参数调度，不中断播放
- [ ] 创建 `src/composables/useCountdown.ts`
  - **输入**：`duration` (Ref<number>, 秒), `playing` (Ref<boolean>)
  - **输出**：`remaining` (Ref<number>, 秒), `isExpired` (Ref<boolean>)
  - **逻辑**：
    - 每次 `playing` 从 false → true 时，重置 `remaining = duration.value`
    - 基于 `setInterval` 每秒递减 `remaining`
    - `remaining` 归零时设置 `isExpired = true`，通知调用方停止播放
    - `playing` 变 false 时暂停倒计时（保留当前 remaining）
  - **边界处理**：`duration` 为 0 时表示不限时，`isExpired` 始终为 false

**达成标准：**

1. Console 中调用 `start()` 能听到节拍器 click 声，`stop()` 后立即静默
2. BPM=60, 4/4 拍，秒表测 10 拍总时长 = 10s ± 0.1s
3. 4/4 拍强拍 (beat=1) 音调明显高于 2/3/4 拍
4. 播放中 BPM 120 → 160，下一拍立即提速无卡顿
5. 播放中 4/4 → 3/4，下一小节起每小节 3 拍
6. 设置倒计时 5s → 启动播放 → 5s 后自动停止，`remaining` 显示归零过程

**测试方式：**

| 检测项 | 方法 | 期望结果 |
|---|---|---|
| 音频输出 | 临时在 App.vue 调用 `useMetronome`，按钮触发 `toggle()` | 听到强弱交替 click 声 |
| BPM 精度 | BPM=60, 4/4，秒表测 10 拍 | 10s ± 0.1s |
| 强拍区分 | BPM=120, 4/4，仔细听第 1 拍 vs 2/3/4 | 第 1 拍音调更高 |
| 动态变速 | 播放中在 console 修改 `bpm.value` | 节奏实时变化 |
| 拍号切换 | 播放中 `numerator` 4 → 3 | 每小节 3 拍，强拍周期正确 |
| 自定义拍号 | 设置 7/8 拍 | 每小节 7 拍，8 分音符 = 1 拍 |
| 倒计时 | 设 duration=5，start()，观察 console | 5s 后 `isExpired` 变 true，播放停止 |
| 不限时 | duration=0，start() | 无限播放，`isExpired` 始终 false |
| AudioContext 恢复 | 播放 → 停止等 10s → 再播放 | 正常出声，无 "context suspended" |

### 阶段 3：静态 UI 组件

**目标**：所有 Vue 组件完成布局与样式，尚不与 composable 连线。

**操作步骤：**

- [ ] `src/App.vue` — 整体居中布局，深色背景，卡片式主体
- [ ] `MetronomeDisplay.vue` — 大号 BPM 数字 + - / + 按钮
- [ ] `BpmSlider.vue` — 基于 shadcn Slider，范围 20–300
- [ ] `TimeSignature.vue` — 常用拍号快捷按钮 (2/4, 3/4, 4/4, 6/8, 8/8) + 自定义入口
- [ ] `CustomTimeSignature.vue` — 自定义拍号弹窗/面板：numerator (1–16) + denominator (1/2/4/8/16)
- [ ] `PlayButton.vue` — 播放/停止按钮，播放时图标切换
- [ ] `BeatIndicator.vue` — 一排圆点，数量 = 拍号分子，当前拍高亮
- [ ] `CountdownDisplay.vue` — 倒计时数字显示 + 时间设置面板（分钟:秒）
- [ ] `PresetTempo.vue` — BPM 预设按钮：Largo(40), Adagio(66), Andante(76), Moderato(108), Allegro(120), Presto(168)
- [ ] 移动端断点适配：`max-sm:` 下按钮放大、触摸友好

**达成标准：**

1. 页面打开后所有 8 个组件可见，布局紧凑、卡片式、深色背景
2. BPM 滑块拖拽时数字实时变化（本地 state）
3. 拍号快捷按钮点击后高亮，BeatIndicator 圆点数同步变化
4. 自定义拍号面板：选 7/8 → 圆点数变 7，拍号显示 "7/8"
5. 倒计时设置面板可输入分钟:秒，未播放时显示设定值
6. 预设速度按钮点击后 BPM 数字 + 滑块同步更新
7. Chrome DevTools 模拟 iPhone 14，控件无溢出

**测试方式：**

| 检测项 | 方法 | 期望结果 |
|---|---|---|
| 布局完整性 | 浏览器打开 localhost | 所有组件可见无重叠 |
| Slider 联动 | 拖拽滑块 | BPM 数字同步变化，20–300 范围正确 |
| 拍号快捷 | 点击 3/4 | 按钮高亮，BeatIndicator 圆点 3 个 |
| 自定义拍号 | 打开自定义面板 → 输入 7/8 → 确认 | 拍号显示 "7/8"，圆点数 7 |
| 倒计时设置 | 点击倒计时，设置 1:30 | 显示 "1:30" |
| 预设速度 | 点击 "Allegro 120" | 滑块移至 120，数字显示 120 |
| 响应式 | DevTools → iPhone 14 | 布局不溢出，触控区域 ≥ 44px |

### 阶段 4：UI 与引擎连线

**目标**：所有控件与 composable 联动，节拍器可实际使用。

- [ ] 在 `App.vue` 中实例化 `useMetronome` + `useCountdown`
- [ ] 通过 `provide`/`inject` 向子组件传递状态与方法
  - BPM 双向绑定：显示数字 ↔ 滑块 ↔ +/- 按钮 ↔ 键盘方向键
  - 拍号：快捷按钮 / 自定义面板 → `timeSignature` ref → BeatIndicator 圆点数更新
  - 播放/停止：PlayButton → `toggle()`，倒计时联动启停
  - Beat 指示器：`currentBeat` 变化 → 对应圆点高亮
  - 倒计时：`remaining` 变化 → CountdownDisplay 更新；`isExpired` → 自动 stop
- [ ] 键盘快捷键（via `@vueuse/core` `useMagicKeys`）：
  - `Space` → toggle 播放
  - `ArrowUp/ArrowDown` → BPM ± 1
  - `Shift + ArrowUp/ArrowDown` → BPM ± 10

**达成标准：**

1. 点击 PlayButton → 播放，倒计时开始倒数，图标切换；再次点击 → 停止，倒计时暂停
2. 播放中 BeatIndicator 逐点亮起，强拍亮第 1 个且更醒目
3. 播放中拖拽 Slider / 点预设 → 节奏实时变化
4. 切换拍号 → 圆点数 + 强拍周期同步变化
5. 设置 5s 倒计时 → 播放 → 5s 后自动停止，计时器显示 0:00
6. 键盘 Space/↑/↓/Shift+↑/Shift+↓ 全部正常

**测试方式：**

| 检测项 | 方法 | 期望结果 |
|---|---|---|
| 播放/停止 | 点击播放按钮 | 听到节拍声，图标切换，倒计时运行 |
| Beat 跟随 | 播放 4/4, 120BPM | 圆点从左到右依次亮起，第 1 个更亮 |
| 滑块调速 | 播放中 120 → 80 | 节奏实时变慢，数字同步 |
| 拍号切换 | 播放中 4/4 → 3/4 | 每小节 3 拍，圆点数 3 |
| 自定义拍号 | 播放中切到 7/8 | 每小节 7 拍，强拍周期正确 |
| 倒计时停止 | 设 3s → 播放 → 等 3s | 自动停止，倒计时显示 0:00 |
| 键盘快捷键 | 按 Space/↑/↓/Shift+↑/Shift+↓ | 对应功能正确触发 |

### 阶段 5：动效与视觉打磨

**目标**：利用 Inspira UI 组件提升视觉表现力。

- [ ] **BeatIndicator** — 当前拍圆点使用 Inspira `pulse`/`glow` 动效，强拍额外放大 + 颜色区分
- [ ] **PlayButton** — 播放中按钮周围呼吸光圈，与 BPM 同频
- [ ] **BPM 数字** — BPM 变化时 Inspira 文字翻转/渐变动效
- [ ] **倒计时** — 最后 10s 数字变红 + 脉冲提醒动效
- [ ] **背景** — 可选 Inspira 极光/粒子背景，静默时低强度，播放时随 BPM 律动
- [ ] **暗色模式** — Tailwind 4 `@custom-variant dark` + `useDark`，localStorage 持久化
- [ ] **过渡动画** — `<Transition>` / `<TransitionGroup>` 处理组件出入场

**达成标准：**

1. 播放中 BeatIndicator 当前拍有明显脉冲/发光动画
2. PlayButton 呼吸光圈与 BPM 同频
3. BPM 变化有过渡动效
4. 倒计时 ≤ 10s 时数字变红脉冲
5. 暗色模式切换流畅，刷新保持
6. FPS ≥ 60 (Chrome Performance 录 30s 播放)

**测试方式：**

| 检测项 | 方法 | 期望结果 |
|---|---|---|
| Beat 动画 | 播放 60BPM, 4/4 | 每秒一个圆点脉冲，强拍更亮/更大 |
| 呼吸光圈 | 播放中观察 PlayButton | 光圈按 BPM 频率缩放，无卡顿 |
| BPM 过渡 | 连续 +5 BPM | 数字有渐变/翻转过渡 |
| 倒计时警告 | 设 12s → 播放，观察最后 10s | 数字变红 + 脉冲 |
| 暗色模式 | 切换后刷新 (F5) | 保持暗色，无闪白 |
| 性能 | Performance 面板录 30s | FPS ≥ 60 |

### 阶段 6：生产就绪

**目标**：可构建部署，完整的 PWA 体验。

- [ ] `pnpm build` 生产构建，验证产物体积
- [ ] 添加 `index.html` 的 `<title>` 与 favicon
- [ ] PWA：`vite-plugin-pwa` 可选，提供离线访问能力
- [ ] 性能检测：Lighthouse 评分 > 90
- [ ] 浏览器兼容：Chrome / Firefox / Edge 最新版
- [ ] 移动端真机触控测试

**达成标准：**

1. `pnpm build` 产物 gzip < 200KB，无 warning
2. 浏览器标签页显示应用名称与图标
3. Lighthouse 四项 ≥ 90
4. 三浏览器功能一致
5. 移动端触控精准，无 300ms 延迟感
6. （可选）断网可访问

**测试方式：**

| 检测项 | 方法 | 期望结果 |
|---|---|---|
| 构建产物 | `pnpm build` | 总 gzip < 200KB，无 error |
| 页面元信息 | 打开构建产物 | 标题 + favicon 正常 |
| Lighthouse | DevTools → Lighthouse → Desktop | 四项 ≥ 90 |
| 跨浏览器 | Chrome / FF / Edge 完整操作 | 功能一致，UI 无错位 |
| 移动端 | 手机扫描/局域网访问 | 触控精准，无布局溢出 |
| PWA | DevTools → Application → Manifest | manifest 可读取，离线可用 |
| 无控制台错误 | 完成所有测试后检查 Console | 无 error / warning |

## 关键设计决策

### 1. 为什么用 Web Audio API 而非 `<audio>` 标签？

`<audio>` 的播放延迟不可控 (~10-50ms)，无法满足节拍器对时序精度的要求。`AudioContext.currentTime` 以 sample 级精度调度音频，误差 < 2ms。

### 2. 为什么 look-ahead scheduler 而不是 `setInterval`？

`setInterval` 受事件循环阻塞影响，回调延迟会累积。Look-ahead 模式每次醒来时一次性调度未来 100ms 内的所有拍子——即使主线程被短暂阻塞，已调度的音频仍会准时触发。

### 3. 为什么不用外部音频文件？

Web Audio 振荡器合成短促三角波作为 click 声：延迟更低、体积为零、无需网络请求、音色可动态调整。

### 4. 拍号分母的处理

BPM 始终以拍号的分母音符为 1 拍计算间隔。例如 6/8 拍 BPM=120 意味着八分音符 = 120bpm（每拍 500ms），而非四分音符 = 120bpm。这符合吉他练习的使用习惯。

### 5. 为什么用 shadcn-vue + Inspira UI 组合？

shadcn-vue 提供稳定、可访问的基础 UI 组件（Button/Slider/Select），Inspira UI 提供视觉炸裂的动画组件（脉冲/发光/背景特效）。两者互补：前者管功能交互，后者管视觉表现。

### 6. 为什么用 `provide`/`inject` 而非 Pinia？

当前应用状态简单（bpm, timeSignature, playing, currentBeat, countdown），引入 Pinia 是过度工程。`provide`/`inject` + 组合式 API 即可满足需求。后期如状态复杂度显著增长再升级。

## 组件树与数据流

```
App.vue  (provide: bpm, timeSignature, playing, currentBeat, remaining, actions)
├── MetronomeDisplay.vue     ← inject bpm, actions
├── BpmSlider.vue            ← inject bpm, actions
├── PresetTempo.vue          ← inject actions
├── TimeSignature.vue        ← inject timeSignature, actions
├── CustomTimeSignature.vue  ← inject timeSignature, actions
├── PlayButton.vue           ← inject playing, remaining, actions
├── BeatIndicator.vue        ← inject currentBeat, timeSignature
└── CountdownDisplay.vue     ← inject remaining, playing, actions
```

数据流向：

```
用户操作 → 子组件 emit / v-model
              ↓
         App.vue (ref 状态)
              ↓
    ┌─────────┼─────────┐
    ↓                    ↓
useMetronome        useCountdown
(bpm, ts, playing)  (duration, playing)
    ↓                    ↓
Web Audio API        setInterval 倒计时
    ↓                    ↓
currentBeat 更新     remaining / isExpired 更新
    ↓                    ↓
BeatIndicator       CountdownDisplay
(Inspira 动效)      (≤10s 红色脉冲)
```

## 依赖清单

```json
{
  "dependencies": {
    "vue": "^3.5",
    "@vueuse/core": "^14",
    "motion-v": "^2"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^6",
    "vite": "^8",
    "typescript": "~6.0",
    "tailwindcss": "^4",
    "@tailwindcss/vite": "^4",
    "clsx": "^2",
    "tailwind-merge": "^3",
    "class-variance-authority": "^0.7"
  }
}
```

> 注：shadcn-vue 与 Inspira UI 的组件通过复制源码方式引入，不出现在 `dependencies` 中。

## 验收标准

- [ ] BPM 范围 20–300，误差 < 2ms
- [ ] 常用拍号 2/4, 3/4, 4/4, 6/8, 8/8 + 自定义拍号均正确循环
- [ ] 倒计时归零后自动停止播放
- [ ] 键盘快捷键全部工作
- [ ] Chrome / Firefox / Edge 最新版运行正常
- [ ] 移动端触控可用，无布局错乱
- [ ] 暗色模式切换正常，刷新后保持
- [ ] `pnpm build` 产物 < 200KB (gzipped)
