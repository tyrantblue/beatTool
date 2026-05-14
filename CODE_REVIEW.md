# 代码审查规则

每次 `git push` 前必须逐条核对。本文件基于项目技术栈：Vue 3 (Composition API) + TypeScript + Tailwind CSS 4 + shadcn-vue。

---

## 1. TypeScript 类型安全

- [ ] **禁用 `any`**：除 `window.__metro` 等调试暴露外，不得使用 `any`
- [ ] **Props / Emits 显式类型**：所有 `defineProps` / `defineEmits` 必须有完整类型声明
- [ ] **composable 返回值类型**：复杂的 composable 返回对象应有明确接口定义
- [ ] **类型断言最小化**：优先用类型守卫（`if (!x) return`）而非 `!` 非空断言
- [ ] **无未使用变量**：`noUnusedLocals: true`, `noUnusedParameters: true`（项目已开启）
- [ ] **事件处理器参数类型匹配**：如 Reka UI 的 `@update:model-value` 类型是 `number[] | undefined`，handler 必须对应

## 2. Vue 3 组件规范

- [ ] **Props 只读，不直接修改**：数据变更通过 emit 通知父组件
- [ ] **`v-model` 双向绑定**：`props.foo` + `emit('update:foo')` 标准模式
- [ ] **单一职责**：每个组件只做一件事。复杂逻辑抽到 composable
- [ ] **模板表达式简洁**：模板内不允许复杂计算，用 `computed` 预处理
- [ ] **条件渲染优先级**：`v-if`（不渲染）vs `v-show`（常切换），按场景选
- [ ] **`v-for` 必须配 `:key`**：用唯一稳定标识，禁止用 index（除非列表固定不变）

## 3. Composable 设计

- [ ] **纯逻辑、无 UI 耦合**：composable 不 import 组件，不返回 vnode
- [ ] **单一职责**：`useMetronome` 只管节拍，`useCountdown` 只管倒计时，互不依赖
- [ ] **共享状态通过 Ref 参数传入**：如 `playing` ref 由调用方创建并传入两个 composable
- [ ] **副作用清理**：`setTimeout` / `setInterval` / `watch` 必须在 `stop()` 或 `onUnmounted` 中清理
- [ ] **AudioContext 生命周期**：`close()` 必须在停止时调用，不能泄露
- [ ] **无重复逻辑**：相同的清理代码必须抽取为公共函数

## 4. Tailwind CSS 4 / shadcn-vue 样式

- [ ] **无内联 style**：所有样式用 Tailwind class，禁止 `<div style="...">`
- [ ] **颜色用 CSS 变量**：`bg-background` / `text-foreground` / `border-border` 等语义变量，不用硬编码色值
- [ ] **`!important` 最小化**：仅用于覆盖 shadcn 组件内部样式，且必须注释原因
- [ ] **类名合并用 `cn()`**：`cn(baseClass, conditional && '...', props.class)`
- [ ] **暗色模式兼容**：使用 `dark:` 变体或 CSS 变量，不能只有亮色样式
- [ ] **响应式断点**：移动端至少验证 `max-sm:` 下不溢出

## 5. 代码整洁

- [ ] **DRY**：三行以上重复逻辑必须抽取
- [ ] **命名清晰**：变量名表达意图（`secondsPerBeat` 而非 `x`），布尔值用 `is`/`has`/`should` 前缀
- [ ] **函数短小**：单一职责，超过 30 行考虑拆分
- [ ] **无注释代码**：禁止注释掉的旧代码保留在文件中
- [ ] **注释解释 WHY 非 WHAT**：只注释非常规决策、隐蔽约束、已知问题。代码命名已解释做什么
- [ ] **无 console.log**：调试信息推送前删除（`__metro` 调试入口除外）
- [ ] **魔法数字命名**：`25` → `SCHEDULER_INTERVAL_MS` 或就近注释。拍值 880/660 这种有上下文的不算魔法

## 6. 功能正确性

- [ ] **停止即沉默**：`stop()` 后不得有残留音频
- [ ] **参数变更平稳**：BPM / 拍号切换时无重复音、无卡顿、无逻辑错位
- [ ] **状态一致性**：`playing` / `currentBeat` / `remaining` 在 start/stop/restart 后状态正确
- [ ] **边界值**：BPM 20/300、1/16 拍、1/16 拍、duration=0 等极端情况需验证
- [ ] **内存/音频资源**：每次 stop/restart 后旧的 AudioContext 和 oscillator 必须被回收

## 7. 提交规范

- [ ] **版本号更新**：`package.json` 版本号 + README 更新日志同步更新
- [ ] **提交信息**：`type: 中文简述` 格式（feat: / fix: / refactor: / docs: / chore:），正文英文
- [ ] **`.gitignore` 完整**：`node_modules`、`dist`、`.claude/settings.local.json` 不得提交

---

> 此文件面向前端开发者与 AI 协作审查。规则不追求穷举，只覆盖本项目实际高频问题。
