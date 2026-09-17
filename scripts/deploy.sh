#!/usr/bin/env bash
# Deploy do Find the Markers para https://m.zanona.com.br/find-the-markers/
# Uso: scripts/deploy.sh
# 1) testes precisam passar; 2) backup no servidor; 3) rsync; 4) smoke test.
set -euo pipefail
cd "$(dirname "$0")/.."

echo "== 1/4 testes =="
node --test tests/*.test.js > /dev/null
echo "node tests: OK"

HOST=vm-matteo
DEST=/var/www/html/find-the-markers
STAMP=$(date +%Y%m%d-%H%M%S)

echo "== 2/4 backup =="
ssh "$HOST" "sudo test -d $DEST && sudo cp -a $DEST $DEST.bak.$STAMP && echo backup: $DEST.bak.$STAMP"

echo "== 3/4 rsync =="
rsync -az --delete \
  --exclude .git --exclude .omo --exclude tests/artifacts \
  --exclude '20260911_*.jpg' --exclude 'Screenshot_*.png' \
  --exclude '*.bak.*' \
  --rsync-path="sudo rsync" \
  ./ "$HOST:$DEST/"

echo "== 4/4 smoke test (HTTP) =="
code=$(curl -s -o /dev/null -w '%{http_code}' https://m.zanona.com.br/find-the-markers/)
mainjs=$(curl -s -o /dev/null -w '%{http_code}' https://m.zanona.com.br/find-the-markers/game/main.js)
echo "index: $code · game/main.js: $mainjs"
[ "$code" = "200" ] && [ "$mainjs" = "200" ] || { echo "SMOKE TEST FALHOU"; exit 1; }
echo "deploy concluído: https://m.zanona.com.br/find-the-markers/"
