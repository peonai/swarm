# 蜂群 AI — 需求分析 v0.2（Server + Skill 方向）

> v0.1 → v0.2 重大转向：从本地 daemon 改为服务器部署 + Agent Skill 集成

## 1. 核心方向

**一句话**：部署在服务器的用户画像中心，agent 通过 Skill 学会调用 API 读写画像。

**关键转变**：
- ~~本地 Profile Daemon~~ → 服务器部署（自托管或云托管）
- ~~P2P/CRDT 同步~~ → 服务器为单一数据源
- ~~多语言 SDK~~ → Agent Skill（SKILL.md）+ REST API
- ~~零安装~~ → 用户注册账号，agent 装 Skill

## 2. 系统架构

```
┌─────────────────────────────────┐
│        蜂群 AI Server           │
│                                 │
│  ┌──────────┐  ┌─────────────┐  │
│  │ REST API │  │  Web 管理台  │  │
│  └────┬─────┘  └──────┬──────┘  │
│       └────────┬───────┘        │
│          ┌─────▼──────┐         │
│          │ Core Engine │         │
│          │ • 用户画像   │         │
│          │ • Agent 人设 │         │
│          │ • 共享记忆   │         │
│          │ • 权限管理   │         │
│          └─────────────┘         │
│          ┌─────────────┐         │
│          │  PostgreSQL  │         │
│          └─────────────┘         │
└─────────────────────────────────┘
       ▲          ▲          ▲
       │          │          │
  ┌────┴───┐ ┌───┴────┐ ┌──┴─────┐
  │OpenClaw│ │ Claude │ │ 任意   │
  │+ Skill │ │+ Skill │ │ Agent  │
  └────────┘ └────────┘ └────────┘
```

## 3. 核心数据模型

### 3.1 用户画像（Profile）
```json
{
  "userId": "user_xxx",
  "layers": {
    "identity": { "name": "邱展悦", "language": "zh-CN", "timezone": "Asia/Shanghai" },
    "preferences": { "communication_style": "direct", "tech_stack": ["TypeScript", "React"] },
    "context": { "current_projects": ["swarm-ai", "repurpose-ext"], "mood": "focused" }
  }
}
```

### 3.2 Agent 人设（Persona）
```json
{
  "agentId": "peon",
  "name": "Peon",
  "personality": "直接、实在、不废话",
  "instructions": "先动手再开口，说实话哪怕不好听",
  "constraints": ["不泄露私人数据", "破坏性操作先问"]
}
```

### 3.3 共享记忆（Memory）
```json
{
  "key": "project_repurpose_pivot",
  "content": "Repurpose 从 Next.js 网站转为 Chrome 插件",
  "source": "agent:peon",
  "tags": ["project", "decision"],
  "createdAt": "2026-02-19T00:00:00Z"
}
```

## 4. API 设计

### 认证
- API Key per agent：`Authorization: Bearer swarm_xxx`
- 每个 key 绑定 agent 身份和权限范围

### 端点
```
GET    /api/v1/profile              # 读取用户画像
PATCH  /api/v1/profile              # 更新画像字段
POST   /api/v1/profile/observe      # 提交观察（agent 推断）

GET    /api/v1/persona/:agentId     # 读取 agent 人设
GET    /api/v1/persona/me           # 读取当前 agent 人设

GET    /api/v1/memory               # 查询共享记忆
POST   /api/v1/memory               # 写入记忆条目
GET    /api/v1/memory/search?q=     # 语义搜索记忆
```

## 5. Agent Skill 集成

Skill 是一个目录，包含：
```
swarm-ai-skill/
├── SKILL.md          # 教 agent 怎么用（集成文档）
├── scripts/
│   └── setup.sh      # 可选：自动配置
└── examples/
    └── usage.md      # 使用示例
```

SKILL.md 核心内容：
1. 什么是蜂群 AI（一句话）
2. 认证方式（API Key 从哪拿）
3. 会话开始时：调 GET /profile 和 GET /persona/me
4. 交互中：有新发现时调 POST /profile/observe
5. 需要历史上下文时：调 GET /memory/search

## 6. Web 管理界面

### P0 功能
- 用户注册/登录
- 画像编辑（三层可视化编辑）
- Agent 管理（添加 agent、分配 API Key、设置权限）
- 记忆浏览和管理

### P1 功能
- Agent 人设编辑器
- 画像变更历史
- API 调用日志/审计
- 数据导入/导出

## 7. 技术栈（建议）

- **后端**：Node.js + Express/Fastify
- **数据库**：PostgreSQL（画像+记忆）+ pgvector（语义搜索）
- **前端**：React + Tailwind（管理界面）
- **部署**：Docker compose（自托管）/ Vercel + Supabase（云托管）
- **认证**：JWT + API Key

## 8. MVP 范围（P0-alpha，2-4 周）

- [ ] 服务器：REST API（画像 CRUD + 记忆 CRUD）
- [ ] 认证：API Key 基础认证
- [ ] 管理界面：最简画像编辑 + Agent 管理
- [ ] Skill：OpenClaw Agent Skill（SKILL.md + 示例）
- [ ] 集成：Peon 作为第一个接入的 agent

**不做**：语义搜索、E2E 加密、多用户、agent 人设管理

## 9. 待辩论问题（Round 2）

1. **自托管 vs 云托管优先**：先做 Docker 自托管还是先做云服务？
2. **Skill 通用性**：SKILL.md 只能教会支持 Skill 的 agent（如 OpenClaw），其他 agent 怎么办？
3. **数据安全**：服务器存储明文画像，安全性如何保证？
4. **定价**：自托管免费 + 云托管收费？还是按 API 调用量收费？
5. **与 MCP 的关系**：API 是否同时暴露为 MCP Server？
6. **市场时机**：现在做这个方向，竞争对手有谁？

---

*v0.2 | 2026-02-20 | 方向：Server + Skill | 作者：Peon ⛏️*
