# Dev Server Management Guide

This guide explains how to manage the Next.js development server for the kamkmPDF project.

## Starting the Dev Server

```bash
pnpm dev
```

This runs `next dev --turbo` and starts the server on `http://localhost:3000`.

## Checking if Server is Running

### Windows Command Prompt

```bash
netstat -ano | findstr :3000
```

### PowerShell

```powershell
Get-NetTCPConnection -LocalPort 3000
```

## Closing the Dev Server

### Method 1: Ctrl+C (Recommended)

- In the terminal where `pnpm dev` is running
- Press `Ctrl + C`
- This gracefully shuts down the server

### Method 2: Kill by Process ID

#### Step 1: Find the Process ID

```bash
netstat -ano | findstr :3000
```

Output example:

```
TCP    0.0.0.0:3000           0.0.0.0:0              LISTENING       15436
```

#### Step 2: Kill the Process

```bash
taskkill /PID 15436 /F
```

Replace `15436` with the actual PID from step 1.

### Method 3: Using Task Manager

1. Press `Ctrl + Shift + Esc` to open Task Manager
2. Go to the "Processes" tab
3. Look for "Node.js: Server-side" or "next dev" process
4. Right-click and select "End task"

### Method 4: Kill All Node Processes (Use with Caution)

```bash
taskkill /IM node.exe /F
```

⚠️ **Warning**: This kills ALL Node.js processes, not just the dev server.

### Method 5: Using PowerShell

```powershell
# Find and kill process on port 3000
Get-NetTCPConnection -LocalPort 3000 | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

## Troubleshooting

### Port Already in Use Error

If you get "Port 3000 is already in use":

1. Check what's using the port: `netstat -ano | findstr :3000`
2. Kill the process using the methods above
3. Or use a different port: `pnpm dev --port 3001`

### Server Won't Start

- Ensure no other processes are using port 3000
- Check if Node.js is installed: `node --version`
- Clear Next.js cache: `rm -rf .next` (or `rd /s /q .next` on Windows)

## Best Practices

- Always use `Ctrl + C` to stop the server gracefully
- Check port availability before starting
- Use different ports for multiple projects: `pnpm dev --port 3001`
- Monitor resource usage if the server seems slow

## Turbopack Notes

This project uses Turbopack for development (`--turbo` flag), which provides:

- Faster hot reloading
- Better development performance
- Some webpack configurations may not apply

If you encounter issues with Turbopack, you can disable it:

```bash
# Use regular webpack for dev
next dev
```
