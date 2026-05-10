---
name: rtk
description: RTK CLI 代理工具，可减少 60-90% 的 LLM token 消耗。用于 Claude Code、Cursor 或其他 AI 编程助手时优化命令输出并节省 token。涵盖安装、配置、hook 设置以及 git、文件、测试、构建等 rtk 命令的使用。
metadata:
  author: Longmo
  version: "2026.5.10"
  source: Generated from https://github.com/rtk-ai/rtk
---

# RTK - 高性能 CLI 代理

RTK 是一个单一 Rust 二进制文件，在命令输出到达 LLM 上下文之前进行过滤和压缩，以 <10ms 的开销减少 60-90% 的 token 消耗。

## 安装

### Homebrew（推荐）

```bash
brew install rtk
```

### 快速安装（Linux/macOS）

```bash
curl -fsSL https://raw.githubusercontent.com/rtk-ai/rtk/refs/heads/master/install.sh | sh
```

安装到 `~/.local/bin`。如需要添加到 PATH：

```bash
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc  # 或 ~/.zshrc
```

### Cargo

```bash
cargo install --git https://github.com/rtk-ai/rtk
```

**注意：** crates.io 上存在另一个名为 "rtk" 的项目（Rust Type Kit）。

如果 `rtk gain` 失败，说明安装了错误的包。请使用上面的 `cargo install --git` 命令。

### 预编译二进制文件

从 [releases](https://github.com/rtk-ai/rtk/releases) 下载：

- **macOS:** `rtk-x86_64-apple-darwin.tar.gz` / `rtk-aarch64-apple-darwin.tar.gz`
- **Linux:** `rtk-x86_64-unknown-linux-musl.tar.gz` / `rtk-aarch64-unknown-linux-gnu.tar.gz`
- **Windows:** `rtk-x86_64-pc-windows-msvc.zip`

**Windows 用户：** 解压 zip 文件并将 `rtk.exe` 放在 PATH 中的某个位置（例如 `C:\Users\<you>\.local\bin`）。

从命令提示符、PowerShell 或 Windows Terminal 运行 RTK — 不要双击 .exe 文件。

为了获得最佳体验，请使用 WSL，完整 hook 系统可以原生工作。

### 验证安装

```bash
rtk --version   # 应显示 "rtk 0.28.2"
rtk gain        # 应显示 token 节省统计
```

## 快速开始

### 步骤 1：为 AI 工具初始化 Hook

```bash
# Claude Code / Copilot（默认）
rtk init -g

# Gemini CLI
rtk init -g --gemini

# Codex (OpenAI)
rtk init -g --codex

# Cursor
rtk init -g --agent cursor

# Windsurf
rtk init --agent windsurf

# Cline / Roo Code
rtk init --agent cline

# Kilo Code
rtk init --agent kilocode

# Google Antigravity
rtk init --agent antigravity
```

### 步骤 2：重启 AI 工具

初始化后，重启你的 AI 编程助手。Hook 会透明地重写 Bash 命令（例如 `git status` → `rtk git status`）在执行之前。

### 步骤 3：测试

```bash
git status  # 自动重写为 rtk git status
```

**重要提示：** Hook 仅在 Bash 工具调用时运行。Claude Code 内置工具如 Read、Grep 和 Glob 不会通过 Bash hook，因此不会自动重写。

要为这些工作流获取 RTK 的紧凑输出，请使用 shell 命令（`cat/head/tail`、`rg/grep`、`find`）或直接调用 `rtk read`、`rtk grep` 或 `rtk find`。

## 工作原理

```
不使用 rtk:                                    使用 rtk:

Claude  --git status-->  shell  -->  git         Claude  --git status-->  RTK  -->  git
^                                   |            ^                      |          |
|        ~2,000 tokens (原始)        |            |   ~200 tokens        | filter   |
+-----------------------------------+            +------- (过滤后) ------+----------+
```

对每种命令类型应用四种策略：

1. **智能过滤** - 移除噪音（注释、空白、样板代码）
2. **分组** - 聚合相似项（按目录的文件、按类型的错误）
3. **截断** - 保留相关上下文，削减冗余
4. **去重** - 将重复的日志行折叠为计数

## 核心命令

### 文件操作

```bash
rtk ls .                        # Token 优化的目录树
rtk read file.rs                # 智能文件读取
rtk read file.rs -l aggressive  # 仅签名（剥离函数体）
rtk smart file.rs               # 2 行启发式代码摘要
rtk find "*.rs" .               # 紧凑的查找结果
rtk grep "pattern" .            # 分组的搜索结果
rtk diff file1 file2            # 精简的差异
```

### Git 操作

```bash
rtk git status                  # 紧凑的状态
rtk git log -n 10               # 单行提交
rtk git diff                    # 精简的差异
rtk git add                     # -> "ok"
rtk git commit -m "msg"         # -> "ok abc1234"
rtk git push                    # -> "ok main"
rtk git pull                    # -> "ok 3 files +10 -2"
```

### GitHub CLI

```bash
rtk gh pr list                  # 紧凑的 PR 列表
rtk gh pr view 42               # PR 详情 + 检查
rtk gh issue list               # 紧凑的问题列表
rtk gh run list                 # 工作流运行状态
```

### 测试运行器

```bash
rtk jest                        # Jest 紧凑（仅失败）
rtk vitest                      # Vitest 紧凑（仅失败）
rtk playwright test             # E2E 结果（仅失败）
rtk pytest                      # Python 测试 (-90%)
rtk go test                     # Go 测试 (NDJSON, -90%)
rtk cargo test                  # Cargo 测试 (-90%)
rtk rake test                   # Ruby minitest (-90%)
rtk rspec                       # RSpec 测试 (JSON, -60%+)
rtk err <cmd>                   # 仅过滤任何命令的错误
rtk test <cmd>                  # 通用测试包装器 - 仅失败 (-90%)
```

### 构建和 Lint

```bash
rtk lint                        # ESLint 按规则/文件分组
rtk lint biome                  # 支持其他 linters
rtk tsc                         # TypeScript 错误按文件分组
rtk next build                  # Next.js 构建紧凑
rtk prettier --check .          # 需要格式化的文件
rtk cargo build                 # Cargo 构建 (-80%)
rtk cargo clippy                # Cargo clippy (-80%)
rtk ruff check                  # Python linting (JSON, -80%)
rtk golangci-lint run           # Go linting (JSON, -85%)
rtk rubocop                     # Ruby linting (JSON, -60%+)
```

### 包管理器

```bash
rtk pnpm list                   # 紧凑的依赖树
rtk pip list                    # Python 包（自动检测 uv）
rtk pip outdated                # 过时的包
rtk bundle install              # Ruby gems（剥离 Using 行）
rtk prisma generate             # Schema 生成（无 ASCII 艺术）
```

### AWS 命令

```bash
rtk aws sts get-caller-identity # 单行身份
rtk aws ec2 describe-instances  # 紧凑的实例列表
rtk aws lambda list-functions   # 名称/运行时/内存（剥离密钥）
rtk aws logs get-log-events     # 仅时间戳消息
rtk aws cloudformation describe-stack-events  # 失败优先
rtk aws dynamodb scan           # 解包类型注解
rtk aws iam list-roles          # 剥离策略文档
rtk aws s3 ls                   # 截断并 tee 恢复
```

### 容器

```bash
rtk docker ps                   # 紧凑的容器列表
rtk docker images               # 紧凑的镜像列表
rtk docker logs <container>     # 去重的日志
rtk docker compose ps           # Compose 服务
rtk kubectl pods                # 紧凑的 pod 列表
rtk kubectl logs <pod>          # 去重的日志
rtk kubectl services            # 紧凑的服务列表
```

### 数据和分析

```bash
rtk json config.json            # 无值的结构
rtk deps                        # 依赖摘要
rtk env -f AWS                  # 过滤的环境变量
rtk log app.log                 # 去重的日志
rtk curl <url>                  # 截断 + 保存完整输出
rtk wget <url>                  # 下载，剥离进度条
rtk summary <long command>      # 启发式摘要
rtk proxy <command>             # 原始直通 + 跟踪
```

## Token 节省分析

### 查看节省统计

```bash
rtk gain                        # 摘要统计
rtk gain --graph                # ASCII 图表（最近 30 天）
rtk gain --history              # 最近的命令历史
rtk gain --daily                # 每日细分
rtk gain --all --format json    # JSON 导出用于仪表板
```

### 发现优化机会

```bash
rtk discover                    # 查找错过的节省机会
rtk discover --all --since 7    # 所有项目，最近 7 天
```

### 会话分析

```bash
rtk session                     # 显示最近会话中的 RTK 采用情况
```

## 全局标志

```bash
-u, --ultra-compact    # ASCII 图标，内联格式（额外 token 节省）
-v, --verbose          # 增加 verbosity (-v, -vv, -vvv)
```

## 示例

### 目录列表

```bash
# ls -la (45 行, ~800 tokens)
drwxr-xr-x  15 user staff 480 ...
-rw-r--r--   1 user staff 1234 ...
...

# rtk ls (12 行, ~150 tokens)
my-project/
+-- src/ (8 files)
|   +-- main.rs
+-- Cargo.toml
```

### Git 操作

```bash
# git push (15 行, ~200 tokens)
Enumerating objects: 5, done.
Counting objects: 100% (5/5), done.
Delta compression using up to 8 threads
...

# rtk git push (1 行, ~10 tokens)
ok main
```

### 测试输出

```bash
# cargo test (失败时 200+ 行)
running 15 tests
test utils::test_parse ... ok
test utils::test_format ... ok
...

# rtk test cargo test (~20 行)
FAILED: 2/15 tests
  test_edge_case: assertion failed
  test_overflow: panic at utils.rs:18
```

## 自动重写 Hook 详解

Hook 透明地拦截 Bash 命令并在执行前将其重写为 `rtk <command>`。这发生在 shell 级别，因此 AI 工具永远不会看到重写 — 它只接收压缩后的输出。

### 支持的 AI 工具

- Claude Code / Copilot（默认）
- Gemini CLI
- Codex (OpenAI)
- Cursor
- Windsurf
- Cline / Roo Code
- Kilo Code
- Google Antigravity

### Hook 限制

Hook 仅在 Bash 工具调用时运行。Claude Code 中的内置工具如 Read、Grep 和 Glob 不会通过 Bash hook。对于这些工作流：

- 使用 shell 命令：`cat`、`head`、`tail`、`rg`、`grep`、`find`
- 或直接调用 RTK：`rtk read`、`rtk grep`、`rtk find`

## 配置

RTK 开箱即用，使用合理的默认值。配置文件通常存储在：

- **Linux/macOS:** `~/.config/rtk/`
- **Windows:** `%APPDATA%\rtk\`

### 环境变量

```bash
# 禁用遥测（可选）
export RTK_TELEMETRY=0

# 自定义配置路径
export RTK_CONFIG=/path/to/config.toml
```

## 故障排除

### 安装了错误的包

如果 `rtk gain` 失败，你可能安装了错误的 "rtk" 包（Rust Type Kit）。修复方法：

```bash
# 卸载错误的包
cargo uninstall rtk

# 安装正确的包
cargo install --git https://github.com/rtk-ai/rtk
```

### Hook 不工作

1. 确保为你的 AI 工具运行了 `rtk init -g`
2. 重启你的 AI 编程助手
3. 验证 hook 是否激活：`rtk session`

### Windows 问题

为了在 Windows 上获得最佳体验，请使用 WSL（Windows Subsystem for Linux），完整 hook 系统可以原生工作。

### PATH 问题

如果安装后找不到 `rtk` 命令：

```bash
# 添加到 PATH
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc  # 或 ~/.zshrc
source ~/.bashrc  # 或 ~/.zshrc
```

## 最佳实践

1. **始终初始化 hooks** - 安装后运行 `rtk init -g`
2. **使用超紧凑模式** 以获得最大节省：`rtk ls -u`
3. **监控你的节省** - 定期检查 `rtk gain` 查看 token 减少情况
4. **发现机会** - 运行 `rtk discover` 查找你遗漏的命令
5. **对内置工具工作流使用直接 RTK 命令**（Read、Grep、Glob）

## 关键优势

- **60-90% token 减少** 常见开发命令
- **<10ms 开销** - 可忽略的性能影响
- **100+ 支持的命令** - git、测试、构建、AWS、Docker 等
- **单一二进制文件** - 无依赖，易于部署
- **透明操作** - 与 AI 编程助手自动配合工作

<!--
Source references:
- https://github.com/rtk-ai/rtk/blob/master/README.md
- https://github.com/rtk-ai/rtk
-->
