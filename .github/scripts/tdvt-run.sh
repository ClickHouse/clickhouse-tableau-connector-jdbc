#!/usr/bin/env bash
# Starts ClickHouse/clickhouse-tableau-tdvt's TDVT workflow against one connector commit and waits
# for it, so its result becomes this repo's check.
#
#   tdvt-run.sh run      dispatch, find the run by correlation id, watch it to completion
#   tdvt-run.sh cancel   cancel the run `run` started, unless `run` saw it complete or cancelled it
#
# Env: APP_ID, APP_PRIVATE_KEY (a GitHub App installed on the tdvt repo with Actions read/write),
# CORRELATION_ID; for `run` also CONNECTOR_REF, JDBC_VERSION, CH_TARGETS.
#
# The tdvt repo is private and a run can wait hours for the one Tableau host, but an App installation
# token lasts one hour, so the token is re-minted as it ages rather than taken once from
# create-github-app-token.
set -euo pipefail

TDVT_REPO=ClickHouse/clickhouse-tableau-tdvt
WORKFLOW=tableau-tdvt.yml
STATE_DIR="${RUNNER_TEMP:-/tmp}"
RUN_ID_FILE="$STATE_DIR/tdvt-run-id"
DONE_FILE="$STATE_DIR/tdvt-run-done"
# TDVT and image-update runs queue for the one Tableau host. A TDVT run takes ~15 min, but an image
# update can hold the host for hours. Give up on a run that has not started after 2 h: with the TDVT
# workflow's own worst case (215 min of job timeouts) that still fits the run step's 350 min.
MAX_QUEUE_WAIT=${MAX_QUEUE_WAIT:-$((2 * 3600))}

b64url() { openssl base64 -A | tr '+/' '-_' | tr -d '='; }

have_app() { [ -n "${APP_ID:-}" ] && [ -n "${APP_PRIVATE_KEY:-}" ]; }

mint_once() {
  local now h p s jwt inst tok
  now=$(date +%s)
  h=$(printf '{"alg":"RS256","typ":"JWT"}' | b64url)
  p=$(printf '{"iat":%d,"exp":%d,"iss":"%s"}' $((now - 60)) $((now + 540)) "$APP_ID" | b64url)
  s=$(printf '%s.%s' "$h" "$p" | openssl dgst -sha256 -sign <(printf '%s\n' "$APP_PRIVATE_KEY") -binary | b64url) || return 1
  jwt="$h.$p.$s"
  inst=$(curl -fsS -H "Authorization: Bearer $jwt" -H "Accept: application/vnd.github+json" \
    "https://api.github.com/repos/$TDVT_REPO/installation" | jq -r '.id // empty') || return 1
  [ -n "$inst" ] || return 1
  tok=$(curl -fsS -X POST -H "Authorization: Bearer $jwt" -H "Accept: application/vnd.github+json" \
    "https://api.github.com/app/installations/$inst/access_tokens" \
    -d "{\"repositories\":[\"${TDVT_REPO#*/}\"],\"permissions\":{\"actions\":\"write\"}}" | jq -r '.token // empty') || return 1
  [ -n "$tok" ] || return 1
  echo "::add-mask::$tok"
  export GH_TOKEN=$tok
  MINTED_AT=$now
}

mint() {
  have_app || { echo "::error::TDVT_APP_ID / TDVT_APP_PRIVATE_KEY are not set"; exit 1; }
  local i
  for i in 1 2 3; do
    mint_once && return 0
    echo "::warning::minting a token for $TDVT_REPO failed (attempt $i)"
    [ "$i" = 3 ] || sleep 10
  done
  echo "::error::could not mint a token for $TDVT_REPO - is the GitHub App installed there?"
  exit 1
}

fresh() { [ $(( $(date +%s) - MINTED_AT )) -lt 2700 ] || mint; }

find_run() {
  gh api "repos/$TDVT_REPO/actions/workflows/$WORKFLOW/runs?event=workflow_dispatch&per_page=30" \
    --jq "[.workflow_runs[] | select(.display_title | contains(\"[corr:$CORRELATION_ID]\")) | .id] | first // empty"
}

run() {
  mint
  echo "Dispatching $WORKFLOW: connector_ref=$CONNECTOR_REF jdbc_version=$JDBC_VERSION ch_targets=$CH_TARGETS corr=$CORRELATION_ID"
  gh workflow run "$WORKFLOW" -R "$TDVT_REPO" --ref main \
    -f connector_ref="$CONNECTOR_REF" -f jdbc_version="$JDBC_VERSION" \
    -f ch_targets="$CH_TARGETS" -f correlation_id="$CORRELATION_ID"
  local dispatched_at
  dispatched_at=$(date +%s)

  local id=""
  for _ in $(seq 1 30); do
    sleep 10
    id=$(find_run) || id=""
    [ -n "$id" ] && break
  done
  [ -n "$id" ] || { echo "::error::dispatched run [corr:$CORRELATION_ID] never appeared"; exit 1; }
  echo "$id" > "$RUN_ID_FILE"

  local url="https://github.com/$TDVT_REPO/actions/runs/$id"
  echo "TDVT run: $url"
  echo "TDVT run: [$id]($url) — connector \`$CONNECTOR_REF\`, JDBC \`$JDBC_VERSION\`, targets \`$CH_TARGETS\`" >> "${GITHUB_STEP_SUMMARY:-/dev/null}"

  local state="" fails=0
  while :; do
    fresh
    if ! state=$(gh api "repos/$TDVT_REPO/actions/runs/$id" --jq '.status + " " + (.conclusion // "")'); then
      fails=$((fails + 1))
      [ "$fails" -lt 10 ] || { echo "::error::lost track of $url after $fails failed polls"; exit 1; }
      echo "::warning::poll failed ($fails in a row), retrying"
      sleep 60; continue
    fi
    fails=0
    echo "$(date -u +%H:%M:%S) $state"
    [ "${state%% *}" = completed ] && break
    if [ "${state%% *}" != in_progress ] && [ $(( $(date +%s) - dispatched_at )) -gt "$MAX_QUEUE_WAIT" ]; then
      # Marked done only once cancelled, so the always() cancel step retries a failed cancel.
      if gh run cancel "$id" -R "$TDVT_REPO"; then
        touch "$DONE_FILE"
      else
        echo "::warning::could not cancel $url; the cancel step will retry"
      fi
      echo "::error::the TDVT host stayed busy for $((MAX_QUEUE_WAIT / 60)) min; gave up on $url - re-run this check later"
      exit 1
    fi
    sleep 60
  done
  touch "$DONE_FILE"

  gh api "repos/$TDVT_REPO/actions/runs/$id/jobs" \
    --jq '.jobs[] | "\(.name): \(.conclusion // .status)"' | tee -a "${GITHUB_STEP_SUMMARY:-/dev/null}" || true
  case "${state#* }" in
    success) ;;
    cancelled) echo "::error::the TDVT run was cancelled (runner unavailable, or by hand) - re-run this check. $url"; exit 1 ;;
    *) echo "::error::TDVT run concluded '${state#* }' - see $url"; exit 1 ;;
  esac
}

cancel() {
  [ ! -e "$DONE_FILE" ] || exit 0
  # Without the App nothing can have been dispatched, and there is nothing to cancel with.
  have_app || { echo "no TDVT run was started"; exit 0; }
  mint
  local id
  id=$(cat "$RUN_ID_FILE" 2>/dev/null || true)
  # Interrupted between dispatch and finding the run: the correlation id still identifies it.
  [ -n "$id" ] || id=$(find_run || true)
  [ -n "$id" ] || { echo "no TDVT run was started"; exit 0; }
  if [ "$(gh api "repos/$TDVT_REPO/actions/runs/$id" --jq .status)" = completed ]; then
    echo "TDVT run $id already completed"; exit 0
  fi
  gh run cancel "$id" -R "$TDVT_REPO" || echo "::warning::could not cancel TDVT run $id"
}

"${1:?usage: tdvt-run.sh run|cancel}"
