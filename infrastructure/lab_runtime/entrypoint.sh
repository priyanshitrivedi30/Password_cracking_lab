#!/bin/sh
set -e

echo "🚀 Starting Password Cracking Lab Environment"

# Disable history file (privacy)
export HISTFILE=/dev/null

# Set safe PATH (no system binaries exposed accidentally)
export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

# Block dangerous commands by aliasing
alias rm='echo "❌ rm command is disabled"'
alias shutdown='echo "❌ shutdown is disabled"'
alias reboot='echo "❌ reboot is disabled"'
alias poweroff='echo "❌ poweroff is disabled"'
alias init='echo "❌ init is disabled"'
alias mount='echo "❌ mount is disabled"'
alias umount='echo "❌ umount is disabled"'
alias wget='echo "❌ network access disabled"'
alias curl='echo "❌ network access disabled"'
alias nc='echo "❌ network access disabled"'
alias nmap='echo "❌ network scanning disabled"'

echo "✅ Environment locked down"
echo "🧪 Lab ready. Happy learning!"

# Start interactive shell (Terminal component connects here)
exec /bin/bash