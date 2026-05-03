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
