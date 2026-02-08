# Claude Code 项目配置展示

> 大多数软件工程师现在都严重低估了LLM代理的能力，尤其是Claude Code这样的工具。

一旦你设置好Claude Code，你可以将它指向你的代码库，让它学习你的约定，采纳最佳实践，并优化一切直到它基本上像一个超级强力的队友一样运作。**真正的解锁点是建立一套坚实的可重用"[技能](#skills---domain-knowledge)"，加上几个"[代理](#agents---specialized-assistants)"来处理你经常做的事情。**

### 实际应用示例

**自定义UI库？** 我们有一个[技能来解释如何使用它](.claude/skills/core-components/SKILL.md)。同样适用于[我们如何编写测试](.claude/skills/testing-patterns/SKILL.md)、[我们如何构造GraphQL](.claude/skills/graphql-schema/SKILL.md)，以及基本上我们想要在仓库中完成所有事情的方式。所以当Claude生成代码时，它已经开箱即用地匹配我们的模式和标准。

**自动化质量门？** 我们使用[hooks](.claude/settings.json)来自动格式化代码、在测试文件更改时运行测试、TypeScript类型检查，甚至[阻止在主分支上的编辑](.claude/settings.md)。Claude Code还创建了大量ESLint自动化，包括自定义规则和预先捕获问题的linting检查。

**深度代码审查？** 我们有一个[代码审查代理](.claude/agents/code-reviewer.md)，Claude在进行更改后运行。它遵循详细的检查清单，涵盖TypeScript严格模式、错误处理、加载状态、变更模式等。当PR提交时，我们有一个[GitHub Action](.github/workflows/pr-claude-code-review.yml)来自动进行完整的PR审查。

**定时维护？** 我们有定时运行的GitHub工作流代理：

- [月度文档同步](.github/workflows/scheduled-claude-code-docs-sync.yml) - 读取上个月的提交并确保文档保持一致
- [周度代码质量](.github/workflows/scheduled-claude-code-quality.yml) - 审查随机目录并自动修复问题
- [双周依赖审计](.github/workflows/scheduled-claude-code-dependency-audit.yml) - 通过测试验证的安全依赖更新

**智能技能建议？** 我们构建了一个[技能评估系统](#skill-evaluation-hooks)，它分析每个提示并根据关键词、文件路径和意图模式自动建议Claude应该激活哪些技能。

大量维护和质量工作就这样...自动化了。它运行得非常流畅。

**JIRA/Linear集成？** 我们通过[MCP服务器](.mcp.json)将Claude Code连接到我们的工单系统。现在Claude可以读取工单、理解需求、实现功能、更新工单状态，甚至在发现错误时创建新工单。[`/ticket`命令](.claude/commands/ticket.md)处理整个工作流——从读取验收标准到将PR链接回工单。

我们甚至使用Claude Code进行工单分类。它读取工单、深入代码库，并留下评论说明应该做什么。所以当工程师接手时，他们基本上已经完成了一半的工作。

**这里有这么多唾手可得的果实，说实话，人们没有全力以赴这一点真是让我震惊。**

---

## 目录

- [目录结构](#directory-structure)
- [快速开始](#quick-start)
- [验证你的配置](#verify-your-configuration)
- [配置参考](#configuration-reference)
  - [CLAUDE.md - 项目记忆](#claudemd---project-memory)
  - [settings.json - Hooks与环境](#settingsjson---hooks--environment)
  - [MCP服务器 - 外部集成](#mcp-servers---external-integrations)
  - [LSP服务器 - 实时代码智能](#lsp-servers---real-time-code-intelligence)
  - [技能评估Hooks](#skill-evaluation-hooks)
  - [技能 - 领域知识](#skills---domain-knowledge)
  - [代理 - 专门的助手](#agents---specialized-assistants)
  - [命令 - 斜杠命令](#commands---slash-commands)
- [GitHub Actions工作流](#github-actions-workflows)
- [最佳实践](#best-practices)
- [配置测试指南](#configuration-testing-guide)
- [此存储库中的示例](#examples-in-this-repository)

---

## 目录结构

```
your-project/
├── CLAUDE.md                      # 项目记忆（替代位置）
├── .mcp.json                      # MCP服务器配置（JIRA、GitHub等）
├── .claude/
│   ├── settings.json              # Hooks、环境、权限
│   ├── settings.local.json        # 个人覆盖（gitignored）
│   ├── settings.md                # 人类可读的hook文档
│   ├── .gitignore                 # 忽略本地/个人文件
│   │
│   ├── agents/                    # 自定义AI代理
│   │   └── code-reviewer.md       # 主动代码审查代理
│   │
│   ├── commands/                  # 斜杠命令（/command-name）
│   │   ├── onboard.md             # 深入任务探索
│   │   ├── pr-review.md           # PR审查工作流
│   │   └── ...
│   │
│   ├── hooks/                     # Hook脚本
│   │   ├── skill-eval.sh          # 提示词提交时的技能匹配
│   │   ├── skill-eval.js          # Node.js技能匹配引擎
│   │   └── skill-rules.json       # 模式匹配配置
│   │
│   ├── skills/                    # 领域知识文档
│   │   ├── README.md              # 技能概览
│   │   ├── testing-patterns/
│   │   │   └── SKILL.md
│   │   ├── graphql-schema/
│   │   │   └── SKILL.md
│   │   └── ...
│   │
│   ├── config-validator.sh        # 自动化配置验证脚本
│   ├── quick-test.sh              # 快速测试命令行脚本
│   ├── config-testing-checklist.md # 分层配置测试检查清单
│   │
│   └── rules/                     # 模块化指令（可选）
│       ├── code-style.md
│       └── security.md
│
└── .github/
    └── workflows/
        ├── pr-claude-code-review.yml           # 自动PR审查
        ├── scheduled-claude-code-docs-sync.yml # 月度文档同步
        ├── scheduled-claude-code-quality.yml   # 周度质量审查
        └── scheduled-claude-code-dependency-audit.yml
```

---

## 快速开始

### 1. 创建`.claude`目录

```bash
mkdir -p .claude/{agents,commands,hooks,skills}
```

### 2. 添加CLAUDE.md文件

在你的项目根目录创建`CLAUDE.md`，填入你的项目的关键信息。参见[CLAUDE.md](CLAUDE.md)获取完整示例。

```markdown
# 项目名称

## 快速事实

- **技术栈**: React、TypeScript、Node.js
- **测试命令**: `npm run test`
- **Lint命令**: `npm run lint`

## 关键目录

- `src/components/` - React组件
- `src/api/` - API层
- `tests/` - 测试文件

## 代码风格

- TypeScript严格模式
- 优先选择interfaces而非types
- 没有`any` - 使用`unknown`
```

### 3. 添加带hooks的settings.json

创建`.claude/settings.json`。参见[settings.json](.claude/settings.json)获取带有自动格式化、测试等功能的完整示例。

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "[ \"$(git branch --show-current)\" != \"main\" ] || { echo '{\"block\": true, \"message\": \"无法在主分支编辑\"}' >&2; exit 2; }",
            "timeout": 5
          }
        ]
      }
    ]
  }
}
```

### 4. 添加你的第一个技能

创建`.claude/skills/testing-patterns/SKILL.md`。参见[testing-patterns/SKILL.md](.claude/skills/testing-patterns/SKILL.md)获取完整示例。

```markdown
---
name: testing-patterns
description: 此项目的Jest测试模式。在编写测试、创建模拟或遵循TDD工作流时使用。
---

# 测试模式

## 测试结构

- 使用`describe`块进行分组
- 使用`it`进行单个测试
- 遵循AAA模式：准备、执行、断言

## 模拟

- 使用工厂函数：`getMockUser(overrides)`
- 模拟外部依赖，不是内部模块
```

> **提示：** `description`字段至关重要—Claude用它来决定何时应用该技能。包含用户会自然提及的关键词。

---

## 验证你的配置

配置完成后，验证所有配置层级是否正常工作。

### 快速验证（1分钟）

```bash
bash .claude/quick-test.sh
```

这会检查：
- ✅ 所有文件是否存在
- ✅ JSON格式是否有效
- ✅ 工具是否已安装
- ✅ 环境变量是否已设置

### 完整验证（5-10分钟）

```bash
bash .claude/config-validator.sh
```

这会运行详细的诊断：
- ✅ 验证每个配置文件
- ✅ 检查hook脚本权限
- ✅ 统计技能和代理
- ✅ 生成详细的检查结果报告

### 详细的手动测试

参见[配置测试指南](#配置测试指南)了解分层测试步骤和故障排查方法。

详细的测试检查清单可在 [config-testing-checklist.md](.claude/config-testing-checklist.md) 中找到。

---

## 配置参考

### CLAUDE.md - 项目记忆

CLAUDE.md是Claude的持久内存，在会话开始时自动加载。

**位置（按优先级）：**

1. `.claude/CLAUDE.md`（项目内的.claude文件夹）
2. `./CLAUDE.md`（项目根目录）
3. `~/.claude/CLAUDE.md`（用户级，所有项目）

**应该包含：**

- 项目技术栈和架构概览
- 关键命令（test、build、lint、deploy）
- 代码风格指南
- 重要目录及其用途
- 关键规则和约束

**📄 示例：** [CLAUDE.md](CLAUDE.md)

---

### settings.json - Hooks与环境

主配置文件，用于hooks、环境变量和权限设置。

**位置：** `.claude/settings.json`

**📄 示例：** [settings.json](.claude/settings.json) | [人类可读文档](.claude/settings.md)

#### Hook事件

| 事件               | 触发时机       | 用例                       |
| ------------------ | -------------- | -------------------------- |
| `PreToolUse`       | 工具执行前     | 阻止主分支编辑、验证命令   |
| `PostToolUse`      | 工具完成后     | 自动格式化、运行测试、lint |
| `UserPromptSubmit` | 用户提交提示词 | 添加上下文、建议技能       |
| `Stop`             | 代理完成       | 决定Claude是否继续         |

#### Hook响应格式

```json
{
  "block": true, // 阻止操作（仅限PreToolUse）
  "message": "原因", // 显示给用户的消息
  "feedback": "信息", // 非阻塞反馈
  "suppressOutput": true, // 隐藏命令输出
  "continue": false // 是否继续
}
```

#### 退出码

- `0` - 成功
- `2` - 阻塞错误（仅限PreToolUse，阻止工具）
- 其他 - 非阻塞错误

---

### MCP服务器 - 外部集成

MCP（Model Context Protocol）服务器让Claude Code连接到JIRA、GitHub、Slack、数据库等外部工具。这是如何实现"读取工单、实现功能并更新工单状态"这样的工作流的方式。

**位置：** `.mcp.json`（项目根目录，提交到git供团队共享）

**📄 示例：** [.mcp.json](.mcp.json)

#### MCP工作原理

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Claude Code   │────▶│   MCP服务器    │────▶│  外部API        │
│                 │◀────│  （本地桥接）   │◀────│  （JIRA、GitHub）│
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

MCP服务器在本地运行，为Claude提供与外部服务交互的工具。当你配置JIRA MCP服务器时，Claude会获得`jira_get_issue`、`jira_update_issue`、`jira_create_issue`等工具。

#### .mcp.json格式

```json
{
  "mcpServers": {
    "server-name": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-server-name"],
      "env": {
        "API_KEY": "${API_KEY}"
      }
    }
  }
}
```

**字段说明：**

| 字段      | 必需        | 说明                                            |
| --------- | ----------- | ----------------------------------------------- |
| `type`    | 是          | 服务器类型：`stdio`（本地进程）或`http`（远程） |
| `command` | 对stdio而言 | 要运行的可执行文件（如`npx`、`python`）         |
| `args`    | 否          | 命令行参数                                      |
| `env`     | 否          | 环境变量（支持`${VAR}`扩展）                    |
| `url`     | 对http而言  | 远程服务器URL                                   |
| `headers` | 对http而言  | 用于身份验证的HTTP头                            |

#### 示例：JIRA集成

```json
{
  "mcpServers": {
    "jira": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-jira"],
      "env": {
        "JIRA_HOST": "${JIRA_HOST}",
        "JIRA_EMAIL": "${JIRA_EMAIL}",
        "JIRA_API_TOKEN": "${JIRA_API_TOKEN}"
      }
    }
  }
}
```

**这将实现：**

- 读取工单详情、验收标准和评论
- 更新工单状态（待处理→进行中→审查中）
- 添加进度更新评论
- 在开发过程中发现错误时创建新工单
- 将PR链接到工单

**工作流示例与[`/ticket`命令](.claude/commands/ticket.md)：**

```
你: /ticket PROJ-123

Claude:
1. 从JIRA获取PROJ-123...
   "添加用户档案头像上传"

2. 读取验收标准...
   - 档案页面上的上传按钮
   - 支持JPG/PNG，最大5MB
   - 显示加载状态

3. 搜索代码库中相关文件...
   发现: src/screens/Profile/ProfileScreen.tsx

4. 创建分支: cw/PROJ-123-avatar-upload

5. [实现功能...]

6. 更新JIRA状态为"审查中"
   添加评论："PR #456已准备好审查"

7. 创建链接到PROJ-123的PR...
```

#### 常见MCP服务器配置

**问题追踪：**

```json
{
  "jira": {
    "type": "stdio",
    "command": "npx",
    "args": ["-y", "@anthropic/mcp-jira"],
    "env": {
      "JIRA_HOST": "${JIRA_HOST}",
      "JIRA_EMAIL": "${JIRA_EMAIL}",
      "JIRA_API_TOKEN": "${JIRA_API_TOKEN}"
    }
  },
  "linear": {
    "type": "stdio",
    "command": "npx",
    "args": ["-y", "@anthropic/mcp-linear"],
    "env": { "LINEAR_API_KEY": "${LINEAR_API_KEY}" }
  }
}
```

**代码与DevOps：**

```json
{
  "github": {
    "type": "stdio",
    "command": "npx",
    "args": ["-y", "@anthropic/mcp-github"],
    "env": { "GITHUB_TOKEN": "${GITHUB_TOKEN}" }
  },
  "sentry": {
    "type": "stdio",
    "command": "npx",
    "args": ["-y", "@anthropic/mcp-sentry"],
    "env": {
      "SENTRY_AUTH_TOKEN": "${SENTRY_AUTH_TOKEN}",
      "SENTRY_ORG": "${SENTRY_ORG}"
    }
  }
}
```

**通信：**

```json
{
  "slack": {
    "type": "stdio",
    "command": "npx",
    "args": ["-y", "@anthropic/mcp-slack"],
    "env": {
      "SLACK_BOT_TOKEN": "${SLACK_BOT_TOKEN}",
      "SLACK_TEAM_ID": "${SLACK_TEAM_ID}"
    }
  }
}
```

**数据库：**

```json
{
  "postgres": {
    "type": "stdio",
    "command": "npx",
    "args": ["-y", "@anthropic/mcp-postgres"],
    "env": { "DATABASE_URL": "${DATABASE_URL}" }
  }
}
```

#### 环境变量

MCP配置支持变量扩展：

- `${VAR}` - 扩展为环境变量（如果未设置则失败）
- `${VAR:-default}` - 如果VAR未设置，使用默认值

在你的shell配置或`.env`文件中设置这些（不要提交密钥！）：

```bash
export JIRA_HOST="https://yourcompany.atlassian.net"
export JIRA_EMAIL="you@company.com"
export JIRA_API_TOKEN="your-api-token"
```

#### settings.json中的MCP设置

在`settings.json`中，你可以自动批准MCP服务器：

```json
{
  "enableAllProjectMcpServers": true
}
```

或批准特定服务器：

```json
{
  "enabledMcpjsonServers": ["jira", "github", "slack"]
}
```

---

### LSP服务器 - 实时代码智能

LSP（语言服务器协议）为Claude提供实时的代码理解能力—类型信息、错误、补全和导航。Claude不仅仅是读取文本，而是可以像你的IDE一样"看到"你的代码。

**为什么这很重要：** 当你编辑TypeScript时，Claude立即知道你是否引入了类型错误。当你引用函数时，Claude可以跳转到其定义。这大大提高了代码生成的质量。

#### 启用LSP

LSP支持通过`settings.json`中的插件启用：

```json
{
  "enabledPlugins": {
    "typescript-lsp@claude-plugins-official": true,
    "pyright-lsp@claude-plugins-official": true
  }
}
```

#### Claude从LSP获得什么

| 功能         | 说明                         |
| ------------ | ---------------------------- |
| **诊断**     | 每次编辑后的实时错误和警告   |
| **类型信息** | 悬停信息、函数签名、类型定义 |
| **代码导航** | 跳转到定义、查找引用         |
| **补全**     | 上下文感知的符号建议         |

#### 可用的LSP插件

| 插件             | 语言                  | 先安装二进制                                           |
| ---------------- | --------------------- | ------------------------------------------------------ |
| `typescript-lsp` | TypeScript/JavaScript | `npm install -g typescript-language-server typescript` |
| `pyright-lsp`    | Python                | `pip install pyright`                                  |
| `rust-lsp`       | Rust                  | `rustup component add rust-analyzer`                   |

#### 自定义LSP配置

对于高级设置，创建`.lsp.json`：

```json
{
  "typescript": {
    "command": "typescript-language-server",
    "args": ["--stdio"],
    "extensionToLanguage": {
      ".ts": "typescript",
      ".tsx": "typescriptreact"
    },
    "initializationOptions": {
      "preferences": {
        "quotePreference": "single"
      }
    }
  }
}
```

#### 故障排查

如果LSP不工作：

1. **检查二进制是否已安装：**

   ```bash
   which typescript-language-server  # 应该返回一个路径
   ```

2. **启用调试日志：**

   ```bash
   claude --enable-lsp-logging
   ```

3. **检查插件状态：**
   ```bash
   claude /plugin  # 查看错误选项卡
   ```

---

### 技能评估Hooks

我们最强大的自动化功能之一是**技能评估系统**。它在每次提示词提交时运行，智能地建议应激活哪些技能。

**📄 文件：** [skill-eval.sh](.claude/hooks/skill-eval.sh) | [skill-eval.js](.claude/hooks/skill-eval.js) | [skill-rules.json](.claude/hooks/skill-rules.json)

#### 工作原理

当你提交提示词时，`UserPromptSubmit` hook触发我们的技能评估引擎：

1. **提示词分析** - 引擎分析你的提示词以查找：
   - **关键词**：简单的字词匹配（`test`、`form`、`graphql`、`bug`）
   - **模式**：正则表达式匹配（`\btest(?:s|ing)?\b`、`\.stories\.`）
   - **文件路径**：提取提及的文件（`src/components/Button.tsx`）
   - **意图**：检测你在尝试做什么（`create.*test`、`fix.*bug`）

2. **目录映射** - 文件路径被映射到相关技能：

   ```json
   {
     "src/components/core": "core-components",
     "src/graphql": "graphql-schema",
     ".github/workflows": "github-actions",
     "src/hooks": "react-ui-patterns"
   }
   ```

3. **置信度评分** - 每个触发器类型都有一个点值：

   ```json
   {
     "keyword": 2,
     "keywordPattern": 3,
     "pathPattern": 4,
     "directoryMatch": 5,
     "intentPattern": 4
   }
   ```

4. **技能建议** - 超过置信度阈值的技能被建议，并附带理由：

   ```
   需要激活技能

   检测到的文件路径：src/components/UserForm.tsx

   匹配的技能（按相关性排序）：
   1. formik-patterns（高置信度）
      匹配项：关键词"form"、路径"src/components/UserForm.tsx"
   2. react-ui-patterns（中置信度）
      匹配项：目录映射、关键词"component"
   ```

#### 配置

技能定义在[skill-rules.json](.claude/hooks/skill-rules.json)中：

```json
{
  "testing-patterns": {
    "description": "Jest测试模式和TDD工作流",
    "priority": 9,
    "triggers": {
      "keywords": ["test", "jest", "spec", "tdd", "mock"],
      "keywordPatterns": ["\\btest(?:s|ing)?\\b", "\\bspec\\b"],
      "pathPatterns": ["**/*.test.ts", "**/*.test.tsx"],
      "intentPatterns": [
        "(?:write|add|create|fix).*(?:test|spec)",
        "(?:test|spec).*(?:for|of|the)"
      ]
    },
    "excludePatterns": ["e2e", "maestro", "end-to-end"]
  }
}
```

#### 添加到你的项目

1. 将hooks复制到你的项目：

   ```bash
   cp -r .claude/hooks/ your-project/.claude/hooks/
   ```

2. 将hook添加到你的`settings.json`：

   ```json
   {
     "hooks": {
       "UserPromptSubmit": [
         {
           "hooks": [
             {
               "type": "command",
               "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/skill-eval.sh",
               "timeout": 5
             }
           ]
         }
       ]
     }
   }
   ```

3. 使用你项目的技能和触发器自定义[skill-rules.json](.claude/hooks/skill-rules.json)。

---

### 技能 - 领域知识

技能是Markdown文档，向Claude传授项目特定的模式和约定。

**位置：** `.claude/skills/{skill-name}/SKILL.md`

**📄 示例：**

- [testing-patterns](.claude/skills/testing-patterns/SKILL.md) - TDD、工厂函数、模拟
- [systematic-debugging](.claude/skills/systematic-debugging/SKILL.md) - 四阶段调试方法论
- [react-ui-patterns](.claude/skills/react-ui-patterns/SKILL.md) - 加载/错误/空状态
- [graphql-schema](.claude/skills/graphql-schema/SKILL.md) - 查询、变更、代码生成
- [core-components](.claude/skills/core-components/SKILL.md) - 设计系统、令牌
- [formik-patterns](.claude/skills/formik-patterns/SKILL.md) - 表单处理、验证

#### SKILL.md前置字段

| 字段            | 必需   | 最大长度 | 说明                                                              |
| --------------- | ------ | -------- | ----------------------------------------------------------------- |
| `name`          | **是** | 64字符   | 仅小写字母、数字和连字符。应与目录名匹配。                        |
| `description`   | **是** | 1024字符 | 技能做什么以及何时使用。Claude用此来决定何时应用技能。            |
| `allowed-tools` | 否     | -        | 逗号分隔的Claude可使用的工具列表（如`Read, Grep, Bash(npm:*)`）。 |
| `model`         | 否     | -        | 特定模型使用（如`claude-sonnet-4-20250514`）。                    |

#### SKILL.md格式

````markdown
---
name: skill-name
description: 此技能做什么以及何时使用它。包含用户会提及的关键词。
allowed-tools: Read, Grep, Glob
model: claude-sonnet-4-20250514
---

# 技能标题

## 何时使用

- 触发条件1
- 触发条件2

## 核心模式

### 模式名称

\`\`\`typescript
// 示例代码
\`\`\`

## 反模式

### 不要做什么

\`\`\`typescript
// 坏示例
\`\`\`

## 集成

- 相关技能：`other-skill`
  \`\`\`

#### 技能最佳实践

1. **保持SKILL.md专注** - 少于500行；将详细文档放在单独的引用文件中
2. **编写触发器丰富的描述** - Claude使用语义匹配描述来决定何时应用技能
3. **包含示例** - 展示好的和坏的模式，附带代码
4. **引用其他技能** - 展示技能如何协同工作
5. **使用精确文件名** - 必须是`SKILL.md`（区分大小写）

---

### 代理 - 专门的助手

代理是具有专注目的和自己提示的AI助手。

**位置：** `.claude/agents/{agent-name}.md`

**📄 示例：**

- [code-reviewer.md](.claude/agents/code-reviewer.md) - 带检查清单的全面代码审查
- [github-workflow.md](.claude/agents/github-workflow.md) - Git提交、分支、PR

#### 代理格式

```markdown
---
name: code-reviewer
description: 审查代码的质量、安全性和约定。在编写或修改代码后使用。
model: opus
---

# 代理系统提示

你是一名高级代码审查员...

## 你的流程

1. 运行`git diff`查看更改
2. 应用审查检查清单
3. 提供反馈

## 检查清单

- [ ] 无TypeScript`any`
- [ ] 包含错误处理
- [ ] 包含测试
```
````

#### 代理配置字段

| 字段          | 必需 | 说明                            |
| ------------- | ---- | ------------------------------- |
| `name`        | 是   | 小写字母和连字符                |
| `description` | 是   | 何时/为什么使用（最大1024字符） |
| `model`       | 否   | `sonnet`、`opus`或`haiku`       |
| `tools`       | 否   | 逗号分隔的工具列表              |

---

### 命令 - 斜杠命令

使用`/command-name`调用的自定义命令。

**位置：** `.claude/commands/{command-name}.md`

**📄 示例：**

- [onboard.md](.claude/commands/onboard.md) - 深入任务探索
- [pr-review.md](.claude/commands/pr-review.md) - PR审查工作流
- [pr-summary.md](.claude/commands/pr-summary.md) - 生成PR描述
- [code-quality.md](.claude/commands/code-quality.md) - 质量检查
- [docs-sync.md](.claude/commands/docs-sync.md) - 文档对齐

#### 命令格式

```markdown
---
description: 在命令列表中显示的简要描述
allowed-tools: Bash(git:*), Read, Grep
---

# 命令说明

你的任务是：$ARGUMENTS

## 步骤

1. 首先做这个
2. 然后做这个
```

#### 变量

- `$ARGUMENTS` - 所有参数作为单个字符串
- `$1`、`$2`、`$3` - 单个位置参数

#### 内联Bash

```markdown
当前分支: !`git branch --show-current`
最近的提交: !`git log --oneline -5`
```

---

## GitHub Actions工作流

使用Claude Code自动进行代码审查、质量检查和维护。

**📄 示例：**

- [pr-claude-code-review.yml](.github/workflows/pr-claude-code-review.yml) - 自动PR审查
- [scheduled-claude-code-docs-sync.yml](.github/workflows/scheduled-claude-code-docs-sync.yml) - 月度文档同步
- [scheduled-claude-code-quality.yml](.github/workflows/scheduled-claude-code-quality.yml) - 周度质量审查
- [scheduled-claude-code-dependency-audit.yml](.github/workflows/scheduled-claude-code-dependency-audit.yml) - 双周依赖审计

### PR代码审查

自动审查PR并响应`@claude`提及。

```yaml
name: PR - Claude Code审查
on:
  pull_request:
    types: [opened, synchronize, reopened]
  issue_comment:
    types: [created]

jobs:
  review:
    if: |
      github.event_name == 'pull_request' ||
      (github.event_name == 'issue_comment' &&
       github.event.issue.pull_request &&
       contains(github.event.comment.body, '@claude'))
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: anthropics/claude-code-action@beta
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          model: claude-opus-4-5-20251101
          prompt: |
            使用.claude/agents/code-reviewer.md标准审查此PR。
            运行`git diff origin/main...HEAD`查看更改。
```

### 定时工作流

| 工作流                                                                   | 计划              | 目的                       |
| ------------------------------------------------------------------------ | ----------------- | -------------------------- |
| [代码质量](.github/workflows/scheduled-claude-code-quality.yml)          | 每周（周日）      | 审查随机目录，自动修复问题 |
| [文档同步](.github/workflows/scheduled-claude-code-docs-sync.yml)        | 每月（1日）       | 确保文档与代码更改一致     |
| [依赖审计](.github/workflows/scheduled-claude-code-dependency-audit.yml) | 双周（1日和15日） | 通过测试验证的安全依赖更新 |

### 所需设置

将`ANTHROPIC_API_KEY`添加到你的仓库密钥中：

- 设置 → 密钥和变量 → 操作 → 新仓库密钥

### 成本估计

| 工作流   | 频率   | 预计成本       |
| -------- | ------ | -------------- |
| PR审查   | 每个PR | ~$0.05 - $0.50 |
| 文档同步 | 每月   | ~$0.50 - $2.00 |
| 依赖审计 | 双周   | ~$0.20 - $1.00 |
| 代码质量 | 每周   | ~$1.00 - $5.00 |

**预计月度总计：** ~$10 - $50（取决于PR量）

---

## 最佳实践

### 1. 从CLAUDE.md开始

你的`CLAUDE.md`是基础。应包括：

- 技术栈概览
- 关键命令
- 关键规则
- 目录结构

### 2. 逐步构建技能

不要尝试一次性记录所有内容：

1. 从你最常见的模式开始
2. 随着痛点出现添加技能
3. 保持每个技能专注于一个领域

### 3. 使用Hooks进行自动化

让hooks处理重复任务：

- 保存时自动格式化
- 测试文件更改时运行测试
- 模式更改时重新生成类型
- 保护分支上的阻塞编辑

### 4. 为复杂工作流创建代理

代理非常适合：

- 代码审查（带你的团队检查清单）
- PR创建和管理
- 调试工作流
- 任务入职

### 5. 利用GitHub Actions

自动化维护：

- 每个PR上进行PR审查
- 周度质量扫描
- 月度文档对齐
- 依赖更新

### 6. 对配置进行版本控制

提交所有内容除外：

- `settings.local.json`（个人偏好）
- `CLAUDE.local.md`（个人笔记）
- 用户特定的凭据

---

## 配置测试指南

### 测试你的配置是否生效

每个Claude Code配置层都可以独立测试。以下是逐项检查的完整指南：

---

#### 1. 测试CLAUDE.md - 项目记忆

**目的：** 验证Claude能否读取和应用你的项目约定

**测试步骤：**

1. 打开Claude Code（在你的项目中）
2. 在提示框中输入：
   ```
   根据CLAUDE.md中定义的代码风格，为一个登录表单创建TypeScript类型定义
   ```
3. **检查：** Claude是否遵循了你的规则？
   - ✅ 使用`interface`而非`type`（如果那是你的规则）
   - ✅ 避免使用`any`，改用`unknown`
   - ✅ 提及了正确的目录（如`src/hooks/`）

**故障排查：**

| 问题                          | 原因                        | 解决方案                                |
| ----------------------------- | --------------------------- | --------------------------------------- |
| Claude不遵循代码风格          | CLAUDE.md不在项目根目录     | 检查文件位置：应在 `./CLAUDE.md`        |
| Claude提及了错误的目录/命令   | 信息过时                    | 更新CLAUDE.md中的"关键目录"和"快速事实" |
| Claude忘记了规则在第三个任务  | 信息没有重复强调            | 在开始时的提示中再次提及关键规则        |

---

#### 2. 测试settings.json Hooks - 自动化

**目的：** 验证PostToolUse hooks是否在文件更改后触发

**Pre-Tool Hooks（防护）**

测试主分支保护：

1. 确保你在`main`分支上
2. 告诉Claude Code编辑任意文件
3. **检查：** 编辑应该被阻止并显示"Cannot edit files on main branch"消息

**Post-Tool Hooks - 自动格式化**

测试Prettier自动运行：

1. 创建一个新分支：`git checkout -b test/formatting`
2. 告诉Claude创建一个TypeScript文件：
   ```
   创建一个有意外格式的React组件（例如，不一致的间距）
   ```
3. **检查输出：** 你应该看到：
   ```
   反馈：正在应用格式化...
   反馈：格式化已应用。
   ```
4. **验证：** 打开创建的文件 - 它应该根据你的Prettier配置进行了格式化

**Post-Tool Hooks - 自动测试运行**

测试在`.test.ts`文件更改时运行测试：

1. 告诉Claude创建或编辑一个测试文件（`*.test.ts`或`*.test.tsx`）
2. **检查输出：** 你应该看到：
   ```
   反馈：运行测试...
   反馈：测试通过。
   ```
   或
   ```
   反馈：测试失败。见上方输出。
   ```

**故障排查：**

| 问题                                  | 原因                                   | 解决方案                                           |
| ------------------------------------- | -------------------------------------- | -------------------------------------------------- |
| hooks不运行（没有反馈消息）           | 项目中缺少npm脚本                      | 检查package.json中是否有`test`、`lint`脚本       |
| "找不到prettier"或"找不到npm test"    | npm包未安装                           | 运行`npm install`或检查package.json依赖           |
| 格式化反馈出现但文件未更改            | Prettier在你的项目中配置错误           | 检查`.prettierrc`或`prettier`配置                 |
| hooks返回"超时"                       | 命令执行时间过长                       | 增加settings.json中的`timeout`值                  |

---

#### 3. 测试技能评估Hook - skill-eval.sh

**目的：** 验证技能评估系统是否根据你的提示词建议正确的技能

**测试步骤：**

1. 打开Claude Code，提交不包含任何特定关键词的提示：
   ```
   嗨，我想做点什么
   ```
   **检查：** 不应该建议任何技能（或建议通用技能）

2. 现在提交一个包含技能关键词的提示：
   ```
   帮我修复一个单元测试，我刚改了一个React组件
   ```
   **检查：** 应该建议：
   - ✅ `testing-patterns`（关键词"test"）
   - ✅ `react-ui-patterns`（关键词"React component"）

3. 测试文件路径识别：
   ```
   更新src/graphql/queries.ts中的查询
   ```
   **检查：** 应该建议`graphql-schema`（目录映射）

4. 测试意图识别：
   ```
   创建一个新的Formik表单组件来处理用户注册
   ```
   **检查：** 应该建议`formik-patterns`（意图模式"create.*form"）

**故障排查：**

| 问题                              | 原因                          | 解决方案                                      |
| --------------------------------- | ----------------------------- | --------------------------------------------- |
| 没有显示技能建议                  | skill-eval.sh/js未正确配置    | 检查`.claude/hooks/`目录中的文件              |
| 建议了错误的技能                  | skill-rules.json配置不匹配    | 审查`.claude/hooks/skill-rules.json`规则      |
| Node.js"未找到"错误                | Node.js未安装或不在PATH中     | 安装Node.js或检查PATH环境变量                |
| "文件未找到"错误                  | 路径不正确                    | 验证hook脚本的完整路径                        |

**验证Hook文件完整性：**

```bash
# 检查必需的hook文件
ls -la .claude/hooks/
# 输出应该包括：
# - skill-eval.sh
# - skill-eval.js
# - skill-rules.json

# 验证skill-rules.json有效的JSON
cat .claude/hooks/skill-rules.json | jq '.' > /dev/null
# 如果没有输出，JSON是有效的
```

---

#### 4. 测试MCP服务器 - 外部集成

**目的：** 验证Claude能否连接到外部系统（JIRA、GitHub等）

**测试GitHub MCP（最简单的开始）：**

1. 设置环境变量：
   ```bash
   export GITHUB_TOKEN=ghp_your_personal_access_token
   ```
   
2. 在Claude Code中提交：
   ```
   从GitHub获取最近的5个issues
   ```

3. **检查：** Claude应该返回你仓库中的实际issues列表

4. **验证MCP是否加载：**
   查看Claude Code的工具列表 - 你应该看到GitHub操作（如`GetRepoIssues`、`CreateIssue`）

**测试JIRA MCP（如果已配置）：**

1. 设置环境变量：
   ```bash
   export JIRA_HOST=your-instance.atlassian.net
   export JIRA_EMAIL=your-email@company.com
   export JIRA_API_TOKEN=your_api_token
   ```

2. 提交：
   ```
   从JIRA获取所有分配给我的任务
   ```

3. **检查：** Claude应该返回实际的JIRA工单

**故障排查：**

| 问题                              | 原因                                  | 解决方案                          |
| --------------------------------- | ------------------------------------- | --------------------------------- |
| "MCP服务器未连接"                 | 环境变量未设置或不正确                | 验证`export`命令中的凭据          |
| "权限被拒绝"或"无效令牌"           | 令牌过期或权限不足                    | 更新令牌和权限范围                |
| MCP在列表中但无法使用              | .mcp.json中的配置不匹配               | 检查`.mcp.json`中的命令和args     |
| 工具运行时"超时"                  | 外部服务响应缓慢                      | 增加`.mcp.json`中的timeout        |

---

#### 5. 测试技能(Skills) - 领域知识

**目的：** 验证技能文档是否被正确应用

**测试一个技能的应用：**

1. 打开`.claude/skills/testing-patterns/SKILL.md`
2. 提交一个提示：
   ```
   帮我为UserForm组件编写单元测试
   ```

3. **检查：** Claude的回复应该：
   - ✅ 参考你的技能文档中的模式
   - ✅ 使用`describe()`、`it()`等正确的Jest语法
   - ✅ 遵循你定义的工厂模式（如果有的话）
   - ✅ 包括mock设置、测试结构等

**故障排查：**

| 问题                              | 原因                          | 解决方案                              |
| --------------------------------- | ----------------------------- | ------------------------------------- |
| 技能内容未被应用                  | SKILL.md不在预期位置          | 检查路径：`.claude/skills/{name}/SKILL.md` |
| Claude提供了不同于技能的建议      | 技能没有被激活                | 确保在提示中包含关键词以触发技能      |
| 技能格式导致解析错误              | 前置字段有问题                | 验证SKILL.md前面有`---`分隔符        |

---

#### 6. 测试命令(Commands) - 斜杠命令

**目的：** 验证自定义命令是否被正确识别和执行

**如果你定义了命令（例如`.claude/commands/onboard.md`）：**

1. 打开Claude Code
2. 输入斜杠命令：
   ```
   /onboard
   ```

3. **检查：** Claude应该：
   - ✅ 识别命令（不显示"未知命令"错误）
   - ✅ 根据命令文档中的指令运行
   - ✅ 可能提示输入（如果命令期望参数）

**故障排查：**

| 问题                              | 原因                          | 解决方案                              |
| --------------------------------- | ----------------------------- | ------------------------------------- |
| "未知命令"或无响应                | 命令文件不在预期位置          | 检查`.claude/commands/`中的文件       |
| 命令执行但行为不符预期            | 命令文档不清晰或缺失          | 检查命令文件的指令是否完整            |

---

#### 7. 完整集成测试

**目标：** 验证所有层级是否协同工作

**复杂工作流测试：**

1. 创建新分支：`git checkout -b test/integration`

2. 提交复杂提示：
   ```
   根据testing-patterns技能，为UserForm组件（在formik-patterns中定义）
   添加Formik验证表单。确保：
   - 包含单元测试
   - 在src/components/中遵循代码风格
   - 正确处理加载和错误状态
   ```

3. **检查以下内容是否全部工作：**
   - ✅ CLAUDE.md规则被应用（代码风格）
   - ✅ 技能被激活（testing、formik、react-ui）
   - ✅ 文件创建后自动格式化
   - ✅ 测试运行并通过
   - ✅ TypeScript类型检查通过
   - ✅ 没有在main分支上编辑的错误

**验证检查清单：**

```markdown
## 配置验证检查清单

- [ ] CLAUDE.md存在且包含关键信息
- [ ] .claude/settings.json存在且语法有效
- [ ] .claude/hooks/目录包含skill-eval.sh、skill-eval.js、skill-rules.json
- [ ] 至少1个技能文件存在于.claude/skills/
- [ ] 至少1个代理文件存在于.claude/agents/（可选）
- [ ] 至少1个命令文件存在于.claude/commands/（可选）
- [ ] .mcp.json存在（如果使用外部集成）
- [ ] 所有配置文件的JSON/YAML有效
- [ ] 已设置必需的环境变量
- [ ] 测试了防护hooks（main分支保护）
- [ ] 测试了自动化hooks（格式化、测试）
- [ ] 测试了技能评估（关键词识别）
- [ ] 测试了至少一个技能应用
```

---

#### 8. 诊断命令

使用这些命令来调试配置问题：

**验证JSON/YAML有效性：**

```bash
# 检查settings.json
cat .claude/settings.json | jq '.' > /dev/null && echo "✅ settings.json有效" || echo "❌ settings.json无效"

# 检查skill-rules.json
cat .claude/hooks/skill-rules.json | jq '.' > /dev/null && echo "✅ skill-rules.json有效" || echo "❌ skill-rules.json无效"

# 检查.mcp.json
cat .mcp.json | jq '.' > /dev/null && echo "✅ .mcp.json有效" || echo "❌ .mcp.json无效"
```

**验证文件存在：**

```bash
# 检查所有必需的配置文件
echo "检查关键配置文件..."
test -f CLAUDE.md && echo "✅ CLAUDE.md" || echo "❌ CLAUDE.md缺失"
test -f .claude/settings.json && echo "✅ settings.json" || echo "❌ settings.json缺失"
test -f .claude/hooks/skill-eval.sh && echo "✅ skill-eval.sh" || echo "❌ skill-eval.sh缺失"
test -f .mcp.json && echo "✅ .mcp.json" || echo "❌ .mcp.json缺失"
```

**验证脚本权限：**

```bash
# 确保hook脚本可执行
chmod +x .claude/hooks/skill-eval.sh

# 验证
test -x .claude/hooks/skill-eval.sh && echo "✅ skill-eval.sh可执行" || echo "❌ 权限问题"
```

**检查环境变量（针对MCP）：**

```bash
# 列出所有Claude Code相关的环境变量
env | grep -E "(JIRA|GITHUB|LINEAR|SENTRY|DATABASE|ANTHROPIC)" || echo "未检测到配置的环境变量"
```

---

## 此存储库中的示例

| 文件                                                                                                                         | 说明                                        |
| ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| [CLAUDE.md](CLAUDE.md)                                                                                                       | 项目记忆文件示例                            |
| [.claude/settings.json](.claude/settings.json)                                                                               | 完整的hooks配置                             |
| [.claude/settings.md](.claude/settings.md)                                                                                   | 人类可读的hooks文档                         |
| [.mcp.json](.mcp.json)                                                                                                       | MCP服务器配置（JIRA、GitHub、Slack等）      |
| **测试与验证**                                                                                                               |                                             |
| [.claude/config-validator.sh](.claude/config-validator.sh)                                                                   | 自动化配置验证脚本                          |
| [.claude/config-testing-checklist.md](.claude/config-testing-checklist.md)                                                   | 分层配置测试检查清单                        |
| **代理**                                                                                                                     |                                             |
| [.claude/agents/code-reviewer.md](.claude/agents/code-reviewer.md)                                                           | 全面的代码审查代理                          |
| [.claude/agents/github-workflow.md](.claude/agents/github-workflow.md)                                                       | Git工作流代理                               |
| **命令**                                                                                                                     |                                             |
| [.claude/commands/onboard.md](.claude/commands/onboard.md)                                                                   | 深入任务探索                                |
| [.claude/commands/ticket.md](.claude/commands/ticket.md)                                                                     | **JIRA/Linear工单工作流（读取→实现→更新）** |
| [.claude/commands/pr-review.md](.claude/commands/pr-review.md)                                                               | PR审查工作流                                |
| [.claude/commands/pr-summary.md](.claude/commands/pr-summary.md)                                                             | 生成PR摘要                                  |
| [.claude/commands/code-quality.md](.claude/commands/code-quality.md)                                                         | 质量检查                                    |
| [.claude/commands/docs-sync.md](.claude/commands/docs-sync.md)                                                               | 文档同步                                    |
| **Hooks**                                                                                                                    |                                             |
| [.claude/hooks/skill-eval.sh](.claude/hooks/skill-eval.sh)                                                                   | 技能评估包装器                              |
| [.claude/hooks/skill-eval.js](.claude/hooks/skill-eval.js)                                                                   | Node.js技能匹配引擎                         |
| [.claude/hooks/skill-rules.json](.claude/hooks/skill-rules.json)                                                             | 模式匹配规则                                |
| **技能**                                                                                                                     |                                             |
| [.claude/skills/testing-patterns/SKILL.md](.claude/skills/testing-patterns/SKILL.md)                                         | TDD、工厂函数、模拟                         |
| [.claude/skills/systematic-debugging/SKILL.md](.claude/skills/systematic-debugging/SKILL.md)                                 | 四阶段调试                                  |
| [.claude/skills/react-ui-patterns/SKILL.md](.claude/skills/react-ui-patterns/SKILL.md)                                       | 加载/错误/空状态                            |
| [.claude/skills/graphql-schema/SKILL.md](.claude/skills/graphql-schema/SKILL.md)                                             | 查询、变更、代码生成                        |
| [.claude/skills/core-components/SKILL.md](.claude/skills/core-components/SKILL.md)                                           | 设计系统、令牌                              |
| [.claude/skills/formik-patterns/SKILL.md](.claude/skills/formik-patterns/SKILL.md)                                           | 表单处理、验证                              |
| **GitHub工作流**                                                                                                             |                                             |
| [.github/workflows/pr-claude-code-review.yml](.github/workflows/pr-claude-code-review.yml)                                   | 自动PR审查                                  |
| [.github/workflows/scheduled-claude-code-docs-sync.yml](.github/workflows/scheduled-claude-code-docs-sync.yml)               | 月度文档同步                                |
| [.github/workflows/scheduled-claude-code-quality.yml](.github/workflows/scheduled-claude-code-quality.yml)                   | 周度质量审查                                |
| [.github/workflows/scheduled-claude-code-dependency-audit.yml](.github/workflows/scheduled-claude-code-dependency-audit.yml) | 双周依赖审计                                |

---

## 了解更多

- [Claude Code文档](https://docs.anthropic.com/en/docs/claude-code)
- [Claude Code Action](https://github.com/anthropics/claude-code-action) - GitHub Action
- [Anthropic API](https://docs.anthropic.com/en/api)

---

## 许可证

MIT - 将此用作你自己项目的模板。
