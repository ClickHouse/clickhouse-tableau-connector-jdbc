#!/usr/bin/env bash
# Starts ClickHouse/clickhouse-tableau-tdvt's TDVT workflow against one connector commit and waits
# for it, so its result becomes this repo's check.
#
#   tdvt-run.sh run      dispatch, find the run by correlation id, watch it to completion
#   tdvt-run.sh cancel   cancel the run a cancelled `run` started
#
# Env: APP_ID, APP_PRIVATE_KEY (a GitHub App installed on the tdvt repo with Actions read/write);
# for `run` also CONNECTOR_REF, JDBC_VERSION, CORRELATION_ID.
#
# The tdvt repo is private and a run takes hours, but an App installation token lasts one hour, so
# the token is re-minted as it ages rather than taken once from create-github-app-token.
set -euo pipefail

TDVT_REPO=ClickHouse/clickhouse-tableau-tdvt
WORKFLOW=tableau-tdvt.yml
RUN_ID_FILE="${RUNNER_TEMP:-/tmp}/tdvt-run-id"

b64url() { openssl base64 -A | tr '+/' '-_' | tr -d '='; }

mint() {
  local key now h p s jwt inst
  key=$(mktemp); chmod 600 "$key"
  printf '%s\n' "$APP_PRIVATE_KEY" > "$key"
  now=$(date +%s)
  h=$(printf '{"alg":"RS256","typ":"JWT"}' | b64url)
  p=$(printf '{"iat":%d,"exp":%d,"iss":"%s"}' $((now - 60)) $((now + 540)) "$APP_ID" | b64url)
  s=$(printf '%s.%s' "$h" "$p" | openssl dgst -sha256 -sign "$key" -binary | b64url)
  rm -f "$key"
  jwt="$h.$p.$s"
  inst=$(curl -fsS -H "Authorization: Bearer $jwt" -H "Accept: application/vnd.github+json" \
    "https://api.github.com/repos/$TDVT_REPO/installation" | jq -r .id)
  GH_TOKEN=$(curl -fsS -X POST -H "Authorization: Bearer $jwt" -H "Accept: application/vnd.github+json" \
    "https://api.github.com/app/installations/$inst/access_tokens" \
    -d "{\"repositories\":[\"${TDVT_REPO#*/}\"],\"permissions\":{\"actions\":\"write\"}}" | jq -r .token)
  echo "::add-mask::$GH_TOKEN"
  export GH_TOKEN
  MINTED_AT=$now
}

fresh() { [ $(( $(date +%s) - MINTED_AT )) -lt 2700 ] || mint; }

run() {
  mint
  echo "Dispatching $WORKFLOW: connector_ref=$CONNECTOR_REF jdbc_version=$JDBC_VERSION corr=$CORRELATION_ID"
  gh workflow run "$WORKFLOW" -R "$TDVT_REPO" --ref main \
    -f connector_ref="$CONNECTOR_REF" -f jdbc_version="$JDBC_VERSION" -f correlation_id="$CORRELATION_ID"

  local id=""
  for _ in $(seq 1 30); do
    sleep 10
    id=$(gh api "repos/$TDVT_REPO/actions/workflows/$WORKFLOW/runs?event=workflow_dispatch&per_page=30" \
      --jq ".workflow_runs[] | select(.display_title | contains(\"[corr:$CORRELATION_ID]\")) | .id" | head -1)
    [ -n "$id" ] && break
  done
  [ -n "$id" ] || { echo "::error::dispatched run [corr:$CORRELATION_ID] never appeared"; exit 1; }
  echo "$id" > "$RUN_ID_FILE"

  local url="https://github.com/$TDVT_REPO/actions/runs/$id"
  echo "TDVT run: $url"
  echo "TDVT run: [$id]($url) — connector \`$CONNECTOR_REF\`, JDBC \`$JDBC_VERSION\`" >> "${GITHUB_STEP_SUMMARY:-/dev/null}"

  local state=""
  while :; do
    fresh
    state=$(gh api "repos/$TDVT_REPO/actions/runs/$id" --jq '.status + " " + (.conclusion // "")')
    echo "$(date -u +%H:%M:%S) $state"
    [ "${state%% *}" = completed ] && break
    sleep 60
  done

  gh api "repos/$TDVT_REPO/actions/runs/$id/jobs" \
    --jq '.jobs[] | "\(.name): \(.conclusion // .status)"' | tee -a "${GITHUB_STEP_SUMMARY:-/dev/null}"
  [ "${state#* }" = success ] || { echo "::error::TDVT run concluded '${state#* }' — see $url"; exit 1; }
}

cancel() {
  [ -s "$RUN_ID_FILE" ] || { echo "no TDVT run was started"; exit 0; }
  mint
  gh run cancel "$(cat "$RUN_ID_FILE")" -R "$TDVT_REPO" || true
}

"${1:?usage: tdvt-run.sh run|cancel}"
