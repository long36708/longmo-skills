---
name: portless
description: Portless development server proxy that eliminates port conflicts by routing through localhost subdomains. Use when setting up development servers, managing multiple apps, avoiding port conflicts, or working with monorepos and turborepo projects.
---

# Portless - Development Server Proxy

Portless is a development server proxy that eliminates port conflicts by routing requests through localhost subdomains (e.g., `https://myapp.localhost`). It automatically manages ports, TLS certificates, and host file entries.

## Quick Start

Run portless in your project directory:

```bash
portless        # runs "dev" script from package.json, accessible at https://<project>.localhost
```

Portless automatically:
- Infers app name from `package.json`, git root, or directory name
- Assigns random ports in 4000-4999 range
- Sets up HTTPS with auto-generated certificates
- Updates `/etc/hosts` for local domain resolution

## Configuration

### portless.json

Create `portless.json` to override defaults:

```json
{
  "name": "myapp",
  "script": "dev",
  "appPort": 3000,
  "proxy": true
}
```

**Fields:**

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `name` | string | inferred | Base app name (worktree prefix still applies) |
| `script` | string | `"dev"` | Name of `package.json` script to run |
| `appPort` | number | auto | Fixed port for the child process |
| `proxy` | boolean | auto | Route through proxy; set `false` for non-server scripts |
| `apps` | object | - | Overrides for workspace packages (monorepo) |
| `turbo` | boolean | `true` | Set `false` to use direct spawning instead of turborepo |

### package.json "portless" key

Add configuration directly to `package.json`:

```json
{
  "name": "@myorg/web",
  "portless": "myapp"
}
```

Or with full options:

```json
{
  "name": "@myorg/web",
  "portless": {
    "name": "myapp",
    "script": "dev:app"
  }
}
```

**Precedence:** CLI flags > `package.json` "portless" key > `portless.json` app entry > defaults

## Monorepo Support

Place one `portless.json` at repo root to cover all workspace packages:

```json
{
  "apps": {
    "apps/web": { "name": "myapp" },
    "apps/api": { "name": "api.myapp" }
  }
}
```

```bash
portless                  # from repo root: start all packages with "dev" script
cd apps/web && portless   # start just one package
portless --script start   # run "start" instead of "dev"
```

Without `apps` map, hostnames follow `<package>.<project>.localhost` convention. Project name comes from npm scope (e.g., `@myorg/web` → `myorg`).

## Turborepo Integration

For turborepo projects, use portless as the dev script:

```json
{
  "scripts": {
    "dev": "portless",
    "dev:app": "next dev"
  },
  "portless": {
    "name": "myapp",
    "script": "dev:app"
  }
}
```

Running `pnpm dev` at root executes turbo, which runs `portless` in each package. No `turbo.json` changes needed.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORTLESS_PORT` | Proxy port | `443` (HTTPS) / `80` (HTTP) |
| `PORTLESS_HTTPS` | Set to `0` to disable HTTPS | on |
| `PORTLESS_LAN` | Set to `1` to enable LAN mode (mDNS `.local`) | off |
| `PORTLESS_TLD` | Custom TLD instead of `.localhost` (e.g., `test`) | `localhost` |
| `PORTLESS_APP_PORT` | Fixed app port (skip auto-assignment) | random 4000-4999 |
| `PORTLESS_SYNC_HOSTS` | Set to `0` to disable `/etc/hosts` auto-sync | on |
| `PORTLESS_STATE_DIR` | Override state directory | `~/.portless` |
| `PORTLESS` | Set to `0` to bypass proxy | enabled |

## State Directory

Portless stores state in `~/.portless` (override with `PORTLESS_STATE_DIR`):

| File | Purpose |
|------|---------|
| `routes.json` | Maps hostnames to ports |
| `routes.lock` | Prevents concurrent writes |
| `proxy.pid` | PID of running proxy |
| `proxy.port` | Port proxy is listening on |
| `proxy.log` | Proxy daemon log output |
| `proxy.lan` | LAN mode and last known IP |

## Port Assignment

Apps get random ports in 4000-4999 range. Portless sets `PORT` and `HOST` environment variables before running your command.

For frameworks that ignore `PORT` (Vite, Astro, React Router, Angular, Expo, React Native), portless auto-injects the correct `--port` and `--host` flags.

## Common Workflows

### Single App Development

```bash
# Basic usage
portless

# Custom name
portless --name myapp

# Different script
portless --script start

# Fixed port
portless --app-port 3000

# Disable HTTPS
portless --no-tls
```

### Multi-App Development

```bash
# Start all apps from monorepo root
portless

# Start specific app
cd apps/web && portless

# Override script for all apps
portless --script dev:custom
```

### LAN Access

Enable LAN mode for mobile device testing:

```bash
PORTLESS_LAN=1 portless
# Access via https://myapp.local on other devices
```

## Troubleshooting

### Port Conflicts

If port 443 or 80 is in use:

```bash
PORTLESS_PORT=8443 portless  # Use custom proxy port
```

### Hosts File Issues

If domains don't resolve:

```bash
# Check state directory
cat ~/.portless/routes.json

# Disable auto-sync if needed
PORTLESS_SYNC_HOSTS=0 portless
```

### Framework-Specific Issues

For frameworks that don't respect PORT env var, portless auto-injects flags. If issues persist, check framework documentation for custom port configuration.

<!--
Source references:
- https://github.com/antfu/portless
-->

## windows 注意手动安装 OpenSSL 的完整步骤：

### 1. 下载 OpenSSL 安装包

由于 OpenSSL 官方不直接提供 Windows 的安装程序，我们需要从被广泛认可且维护及时的第三方站点下载预编译好的二进制安装包。

*   **下载地址**：访问 [Slproweb OpenSSL 下载页](https://slproweb.com/products/Win32OpenSSL.html)。
*   **版本选择建议**：
    *   **常规使用（强烈推荐）**：下载 **`Win64 OpenSSL v3.x.x Light`** 版本（例如 `Win64 OpenSSL v3.3.2 Light`）。"Light" 版只包含核心运行库和命令行工具，体积小巧，完全能满足 VuePress 等工具的调用需求。
    *   **开发需求**：如果你后续需要编写 C/C++ 程序并调用 OpenSSL 的库文件，可以选择 `Full` 版本，它包含了开发所需的头文件和静态库。
    *   **兼容性需求**：如果你的项目对兼容性有极高要求（例如某些老旧的遗留系统），也可以选择 `Win64 OpenSSL v1.1.1w Light`，这是 1.1.1 系列最稳定的终版。

### 2. 运行安装程序

双击下载好的 `.exe` 安装包（建议右键选择“以管理员身份运行”），在安装向导中注意以下几个关键点：

1.  **许可协议**：接受协议并点击 Next。
2.  **选择安装位置**：建议保持默认路径（通常是 `C:\Program Files\OpenSSL-Win64`），**千万不要安装在包含中文或空格的目录下**，否则极易引发调用错误。
3.  **复制 DLL 文件（关键步骤）**：安装过程中会询问 `Copy OpenSSL DLLs to`（将 OpenSSL 动态链接库复制到哪个目录）。**强烈建议选择 `The Windows system directory`（Windows 系统目录）**。这样可以直接避免后续出现“无法定位 DLL”或 `spawnSync` 找不到依赖的报错。
4.  **完成安装**：点击 Install 等待进度条走完即可。

### 3. 手动配置环境变量

虽然安装程序通常会尝试自动配置，但为了确保万无一失（特别是解决 `ENOENT` 找不到命令的报错），建议手动确认一下：

1.  按 `Win + R` 键，输入 `sysdm.cpl` 打开系统属性。
2.  点击 **“高级”** 选项卡 -> **“环境变量”**。
3.  在下方的 **“系统变量”** 中找到 `Path`，双击打开。
4.  检查列表中是否存在 OpenSSL 的 `bin` 目录路径（例如 `C:\Program Files\OpenSSL-Win64\bin`）。
5.  如果没有，点击 **“新建”**，将该路径粘贴进去，然后一路点击“确定”保存退出。

### 4. 验证安装

1.  **彻底关闭**你当前打开的所有终端窗口（包括 CMD、PowerShell、VS Code 内置终端等）。
2.  **重新打开**一个新的终端窗口。
3.  输入以下命令并回车：
    ```powershell
    openssl version
    ```
    如果终端成功打印出类似 `OpenSSL 3.x.x ...` 的版本信息，说明 OpenSSL 已经手动安装并配置成功。

此时，再次去运行项目，`spawnSync openssl ENOENT` 的报错应该就会彻底消失了。
