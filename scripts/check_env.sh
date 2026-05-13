#!/usr/bin/env bash
set -o pipefail

RED=$(tput setaf 1 2>/dev/null || echo "")
GREEN=$(tput setaf 2 2>/dev/null || echo "")
YELLOW=$(tput setaf 3 2>/dev/null || echo "")
BOLD=$(tput bold 2>/dev/null || echo "")
RESET=$(tput sgr0 2>/dev/null || echo "")

pass() { echo "  ${GREEN}${BOLD}PASS${RESET} $1"; }
warn() { echo "  ${YELLOW}${BOLD}WARN${RESET} $1"; }
fail() { echo "  ${RED}${BOLD}FAIL${RESET} $1"; }
info() { echo "  $1"; }

echo ""
echo "${BOLD}Paisa App — Environment Check${RESET}"
echo "================================="
echo ""

# ----- .env file -----
# Canonical list: "VAR_NAME|Description for the user"
REQUIRED_VARS=(
  "MONGODB_URI|MongoDB connection string (e.g. mongodb+srv://user:pass@host/...)"
)

describe_var() {
  echo "${1%%|*}"   # name
}

describe_help() {
  echo "${1#*|}"    # description
}

echo "${BOLD}Config${RESET}"

if [ ! -f .env ]; then
    fail ".env file not found"
    echo ""
    info "Create ${BOLD}.env${RESET} at the project root with these values:"
    for entry in "${REQUIRED_VARS[@]}"; do
        name=$(describe_var "$entry")
        help=$(describe_help "$entry")
        info "  ${BOLD}${name}=<value>${RESET}"
        info "    ${help}"
        info "    Ask the user: \"What is your ${name}?\""
    done
    echo ""
    info "After creating .env, re-run: ./scripts/check_env.sh"
    exit 0
fi

pass ".env file found"

# Source .env
set -a && source .env && set +a

missing=""
missing_details=()
for entry in "${REQUIRED_VARS[@]}"; do
    name=$(describe_var "$entry")
    help=$(describe_help "$entry")
    val="${!name}"
    if [ -z "$val" ]; then
        missing="$missing  $name"
        missing_details+=("$entry")
    fi
done

if [ -n "$missing" ]; then
    warn "missing or empty vars in .env:$missing"
    echo ""
    for entry in "${missing_details[@]}"; do
        name=$(describe_var "$entry")
        help=$(describe_help "$entry")
        info "  Add to .env: ${BOLD}${name}=<value>${RESET}"
        info "    ${help}"
        info "    Ask the user: \"What is your ${name}?\""
    done
else
    pass "all required vars present"
fi

# Masked URI for display
if [ -n "$MONGODB_URI" ]; then
    masked=$(echo "$MONGODB_URI" | sed 's|://[^@]*@|://***:***@|')
    info "MONGODB_URI = $masked"
fi
echo ""

# ----- CLI tools -----
echo "${BOLD}Tools${RESET}"
check_tool() {
    local name=$1 install=$2
    if command -v "$name" &>/dev/null; then
        pass "$name — $(command -v "$name")"
    else
        fail "$name not found — install with: $install"
    fi
}
check_tool mongosh "brew install mongosh"
check_tool python3 "brew install python"
echo ""

# ----- MongoDB connectivity -----
echo "${BOLD}Database${RESET}"
if [ -z "$MONGODB_URI" ]; then
    warn "skipped — MONGODB_URI not set"
elif ! command -v mongosh &>/dev/null; then
    warn "skipped — mongosh not installed"
elif [ ! -x scripts/mongo ]; then
    warn "skipped — scripts/mongo not found or not executable"
else
    # Test via scripts/mongo — the actual helper the project depends on
    result=$(./scripts/mongo --quiet --eval "JSON.stringify(db.runCommand({ping:1}))" 2>&1)
    if echo "$result" | grep -q '"ok":1'; then
        pass "MongoDB ping via scripts/mongo"
    else
        fail "MongoDB ping via scripts/mongo failed"
        info "$result"
    fi
fi
echo ""

# ----- Python dependencies -----
echo "${BOLD}Python${RESET}"
if command -v python3 &>/dev/null; then
    pyver=$(python3 --version 2>&1)
    pass "$pyver"
    if [ -f pyproject.toml ]; then
        info "pyproject.toml found — run: pip install -e ."
    else
        warn "no pyproject.toml yet — set up the project first"
    fi
else
    warn "skipped — python3 not installed"
fi
echo ""

echo "${BOLD}=================================${RESET}"
echo "${BOLD}Check complete. Address any FAIL/WARN lines above before developing.${RESET}"
echo ""
