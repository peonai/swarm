# 蜂群 AI — 第二轮辩论（Server + Skill 方向）

> Peon 自辩自驳 | 2026-02-20 | 基于 REQUIREMENTS v0.2

---

## 1. Server vs Daemon 的取舍

### 质疑
从本地 daemon 转向服务器部署，确实解决了冷启动和 CRDT 复杂度，但引入了新问题：
- **延迟**：每次 agent 启动都要网络请求拉画像，弱网环境体验差
- **可用性**：服务器挂了 = 所有 agent 丢失画像，单点故障
- **隐私倒退**：v0.1 的核心卖点是「本地优先、用户控制数据」，现在数据在服务器上，跟 ChatGPT Memory 有什么区别？

### 反驳
- 延迟：画像数据量小（几 KB），一次请求 < 100ms，agent 可以本地缓存
- 可用性：自托管方案用户自己控制，云托管做多可用区
- 隐私：自托管 = 数据在自己服务器上，跟本地 daemon 本质一样。云托管版本可以做 E2E 加密

### 结论
**提供两种部署模式**：自托管（Docker，数据完全自控）+ 云托管（便捷但需信任）。MVP 先做自托管，验证后再做云托管。agent 端加本地缓存，断网也能用上次的画像。

---

## 2. Skill 通用性

### 质疑
SKILL.md 是 OpenClaw 的概念。ChatGPT 没有 Skill 系统，Claude 没有，Gemini 也没有。所谓「agent 通过 Skill 集成」实际上只有 OpenClaw 能用。这跟 Round 1 的封闭生态问题本质一样——只是换了个说法。

### 反驳
Skill 的本质是「教 agent 怎么调 API」，不同 agent 有不同的实现方式：
- **OpenClaw**：装 Skill 目录，自动学会
- **Claude Projects**：把 API 文档放进 Project Knowledge
- **ChatGPT GPTs**：通过 Actions 配置 API 调用
- **开发者自建 agent**：直接调 REST API

REST API 是通用的，Skill 只是 OpenClaw 的便捷包装。

### 结论
**核心是 API，Skill 是锦上添花。** 提供：(1) REST API 文档（通用）；(2) OpenAPI/Swagger spec（GPTs Actions 可直接导入）；(3) OpenClaw Skill（便捷集成）；(4) MCP Server（支持 MCP 的 agent 直接用）。四种接入方式覆盖主流场景。

---

## 3. 自托管 vs 云托管

### 质疑
自托管需要用户有服务器、会 Docker，门槛太高。目标用户是「重度 AI 用户」不是「DevOps 工程师」。云托管易用但要处理多租户隔离、数据安全、合规，开发成本高。先做哪个？

### 反驳
- 自托管的目标用户是开发者和技术型用户——这恰好是早期采用者
- 云托管可以后做，但需要从架构上预留多租户支持

### 结论
**先自托管（Docker Compose 一键部署），后云托管。** 理由：(1) 早期用户是技术型，能接受 Docker；(2) 自托管不需要处理多租户和支付；(3) 自托管用户的反馈帮助打磨产品，再做云托管。

---

## 4. 商业可行性

### 质疑
v0.2 的商业模式比 v0.1 清晰了一点（服务器 = 可以收费），但核心问题没变：
- 自托管免费 → 技术用户都自建，不付费
- 云托管收费 → 跟 Mem0、Zep 正面竞争
- API 调用量收费 → 画像读写频率低，ARPU 极低

### 反驳
变现不靠基础 API，靠增值服务：
- **画像智能**：AI 自动从交互中提炼画像（不只是存储，是理解）
- **跨 agent 洞察**：「你的 coding agent 发现你最近在学 Rust，要不要同步给你的学习 agent？」
- **企业版**：团队画像管理、合规审计、SSO

### 结论
**短期不追求变现，先追求用户量。** 个人版完全免费（自托管），等用户量到一定规模再推企业版和增值服务。这是开源基础设施的标准路径。

---

## 5. 竞品分析

### 质疑
这个赛道已经有玩家了：
- **Mem0**：AI memory layer，提供 API 存储和检索 AI 对话记忆，已融资
- **Zep**：长期记忆服务，支持用户画像和会话历史
- **LangMem**：LangChain 生态的记忆管理
- **Letta (MemGPT)**：有状态 agent 框架，内置记忆管理

这些产品已经在做「AI agent 的记忆/画像服务」，蜂群 AI 的差异化在哪？

### 反驳
关键差异：
- Mem0/Zep/LangMem 聚焦**单 agent 记忆**，蜂群聚焦**跨 agent 画像同步**
- 它们是开发者工具（SDK），蜂群有**用户管理界面**（非技术用户也能管理画像）
- 它们不管 agent 人设，蜂群把**画像 + 人设 + 记忆**统一管理
- 蜂群的 Skill 集成方式更轻量——不需要改代码，装个 Skill 就行

### 结论
**差异化在「跨 agent」和「用户可控」。** 但要诚实：如果 Mem0 加一个「跨 agent 同步」功能，差异化就没了。护城河在于：(1) 先发优势——先占「跨 agent 画像」这个定位；(2) Skill 生态——让接入尽可能简单；(3) 用户体验——管理界面做到非技术用户也能用。

---

## 6. MCP 兼容

### 质疑
Round 1 建议「做 MCP Server」，v0.2 没有明确回应。API 是否应该同时暴露为 MCP Server？

### 反驳
成本低、收益高：
- MCP Server 就是把 REST API 包一层 MCP 协议，工作量 1-2 天
- 所有支持 MCP 的 agent（Claude Desktop、OpenClaw、Cursor 等）直接能用
- 不做 MCP = 放弃一大批潜在用户

### 结论
**P0 就做 MCP Server。** 工作量小，收益大。REST API + MCP Server 双协议暴露。

---

## 7. MVP 范围评估

### 质疑
v0.2 的 P0-alpha：
- 服务器 REST API（画像 CRUD + 记忆 CRUD）
- API Key 认证
- 管理界面（画像编辑 + Agent 管理）
- OpenClaw Skill
- Peon 集成

2-4 周能做完吗？

### 反驳
拆解工作量：
- 后端 API（Express + PostgreSQL）：3-4 天
- API Key 认证：1 天
- 管理界面（React + Tailwind）：5-7 天
- OpenClaw Skill：1 天
- Peon 集成测试：1-2 天
- 总计：11-15 天，2-3 周可完成

### 结论
**范围合理，但建议进一步精简管理界面。** P0-alpha 的管理界面只做：(1) 画像查看/编辑；(2) API Key 生成。Agent 管理和记忆浏览放到 P0-beta。这样可以压缩到 2 周。

---

## 总结

| # | 议题 | 结论 |
|---|------|------|
| 1 | Server vs Daemon | 先自托管 Docker，agent 端加本地缓存 |
| 2 | Skill 通用性 | API 为核心，Skill/OpenAPI/MCP 四种接入方式 |
| 3 | 自托管 vs 云托管 | 先自托管，后云托管 |
| 4 | 商业可行性 | 短期不变现，先追用户量 |
| 5 | 竞品 | 差异化在「跨 agent」+「用户可控」，但护城河薄 |
| 6 | MCP | P0 就做，成本低收益高 |
| 7 | MVP 范围 | 合理，精简管理界面后 2 周可完成 |

**Round 2 核心结论：Server + Skill 方向比 v0.1 务实得多，竞品存在但差异化明确。最大风险从「技术复杂度」变成了「市场竞争」——需要快速推出 MVP 抢占「跨 agent 画像」这个定位。**

---

*Round 2 | Peon ⛏️ | 2026-02-20*
