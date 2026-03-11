#!/bin/bash
# ═══════════════════════════════════════════════════════
# Lab Runtime Entrypoint
#
# ⚠️  IMPORTANT — Security note on aliases:
#     Shell aliases only apply to interactive login shells.
#     When the backend runs:
#       docker exec <container> bash -c "ls"
#     it spawns a NON-interactive, NON-login shell.
#     Aliases are NOT loaded in that context and have
#     zero security effect for API-driven commands.
#
#     Real command blocking is enforced by:
#       backend/services/command_policy.py
#     which checks every command BEFORE sending it to
#     docker exec. This file is for the interactive
#     shell session only (if a user ever gets a terminal).
# ═══════════════════════════════════════════════════════
set -e

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║   🔐 CyberCare Password Cracking Lab         ║"
echo "║   Isolated Educational Environment           ║"
echo "╚══════════════════════════════════════════════╝"
echo ""

# ── Privacy: disable shell history ──
export HISTFILE=/dev/null
unset HISTFILE
export HISTSIZE=0

# ── Minimal, safe PATH — only standard system binaries ──
export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

# ── For interactive shells only: block dangerous commands ──
# These aliases only protect against accidental misuse in
# an interactive session. API commands are blocked upstream.
if [[ $- == *i* ]]; then
    alias rm='echo "❌ rm is disabled in this lab environment"'
    alias shutdown='echo "❌ shutdown is disabled"'
    alias reboot='echo "❌ reboot is disabled"'
    alias poweroff='echo "❌ poweroff is disabled"'
    alias wget='echo "❌ network access is disabled"'
    alias curl='echo "❌ network access is disabled"'
    alias nc='echo "❌ network access is disabled"'
    alias nmap='echo "❌ network scanning is disabled"'
    alias python3='echo "❌ python3 is not available in this lab"'
    alias python='echo "❌ python is not available in this lab"'
    alias perl='echo "❌ perl is not available in this lab"'
    alias bash='echo "❌ spawning subshells is disabled"'
    alias sh='echo "❌ spawning subshells is disabled"'

    echo "✅ Interactive shell ready"
    echo "📂 Working directory: $(pwd)"
    echo "📋 Allowed tools: john, hashcat, ls, cat, pwd, file, echo, clear, whoami"
    echo "🚫 Network access, file deletion, and shell escapes are disabled"
    echo ""
fi

# ── Hand off to the requested command (default: bash) ──
exec "$@"