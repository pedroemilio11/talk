#!/usr/bin/env bash
set -euo pipefail

PORT="${PORT:-3350}"
BASE_URL="http://127.0.0.1:${PORT}"

cd "$(dirname "$0")/.."

corepack pnpm build >/dev/null

PORT="$PORT" OPENAI_API_KEY='' ZAPI_SEND_URL='' node dist/main.js >/tmp/fluxi-smoke.log 2>&1 &
PID=$!
cleanup() {
  kill "$PID" >/dev/null 2>&1 || true
  wait "$PID" 2>/dev/null || true
}
trap cleanup EXIT

for _ in 1 2 3 4 5 6 7 8; do
  if curl -s "$BASE_URL/fluxi-talk/health" >/tmp/fluxi-health.json; then
    break
  fi
  sleep 1
done

post() {
  local phone="$1"
  local text="$2"
  local message_id="${3:-}"
  local payload="{\"phone\":\"${phone}\",\"text\":\"${text}\"}"
  if [[ -n "$message_id" ]]; then
    payload="{\"phone\":\"${phone}\",\"text\":\"${text}\",\"messageId\":\"${message_id}\"}"
  fi

  curl -s -X POST "$BASE_URL/fluxi-talk/webhook/zapi" \
    -H 'content-type: application/json' \
    -d "$payload"
}

# cliente
post '+55 85 99999-2001' '1' >/tmp/fx-c1.json
post '+55 85 99999-2001' 'Pedro' >/tmp/fx-c2.json
post '+55 85 99999-2001' '1' >/tmp/fx-c3.json
post '+55 85 99999-2001' '3' >/tmp/fx-c4.json

# fornecedor
post '+55 85 99999-2002' '2' >/tmp/fx-f1.json
post '+55 85 99999-2002' 'XPTO LTDA' >/tmp/fx-f2.json
post '+55 85 99999-2002' '12345678000199' >/tmp/fx-f3.json
post '+55 85 99999-2002' 'cobranca' >/tmp/fx-f4.json
post '+55 85 99999-2002' 'Obra Sul' >/tmp/fx-f5.json

# corretor
post '+55 85 99999-2003' '3' >/tmp/fx-r1.json
post '+55 85 99999-2003' 'Carla' >/tmp/fx-r2.json
post '+55 85 99999-2003' 'Imobi Prime' >/tmp/fx-r3.json

# lead
post '+55 85 99999-2004' '4' >/tmp/fx-l1.json

METRICS="$(curl -s "$BASE_URL/fluxi-talk/metrics")"
CLIENT_PROTOCOL="$(node -e 'const fs=require("fs"); const j=JSON.parse(fs.readFileSync("/tmp/fx-c4.json","utf8")); process.stdout.write(j.protocol || "");')"
CLIENT_MESSAGES="$(curl -s "$BASE_URL/fluxi-talk/conversations/5585999992001/messages")"
CLIENT_TICKET="$(curl -s "$BASE_URL/fluxi-talk/tickets/${CLIENT_PROTOCOL}")"

# dedupe
post '+55 85 99999-2099' '4' 'dup-1' >/tmp/fx-d1.json
post '+55 85 99999-2099' '4' 'dup-1' >/tmp/fx-d2.json

# asserts básicos
grep -q '"action":"registered"' /tmp/fx-c4.json
grep -q '"action":"registered"' /tmp/fx-f5.json
grep -q '"action":"transferred"' /tmp/fx-r3.json
grep -q '"action":"transferred"' /tmp/fx-l1.json
echo "$METRICS" | grep -q '"totalConversations":4'
echo "$CLIENT_MESSAGES" | grep -q '"direction":"inbound"'
echo "$CLIENT_MESSAGES" | grep -q '"direction":"outbound"'
echo "$CLIENT_TICKET" | grep -q "\"protocol\":\"${CLIENT_PROTOCOL}\""
grep -q '"action":"duplicate_ignored"' /tmp/fx-d2.json

echo "SMOKE OK"
echo "health=$(cat /tmp/fluxi-health.json)"
echo "metrics=${METRICS}"
