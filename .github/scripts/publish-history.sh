#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${RUN_ID:-}" ]]; then
  echo "RUN_ID is required" >&2
  exit 1
fi

cd "$(git rev-parse --show-toplevel)"

existing="$(mktemp)"
if git ls-remote --exit-code --heads origin gh-pages >/dev/null 2>&1; then
  git fetch origin gh-pages:refs/remotes/origin/gh-pages
  if git cat-file -e refs/remotes/origin/gh-pages:runs.json 2>/dev/null; then
    git show refs/remotes/origin/gh-pages:runs.json > "$existing"
  else
    printf '%s\n' '{"runs":[]}' > "$existing"
  fi
else
  printf '%s\n' '{"runs":[]}' > "$existing"
fi

node .github/scripts/publish-dashboard.js "$existing" site

index_file="$(mktemp)"
export GIT_INDEX_FILE="$index_file"
git read-tree --empty
git --work-tree=site add -A -f
tree="$(git write-tree)"
rm -f "$GIT_INDEX_FILE"
unset GIT_INDEX_FILE

parent_args=()
if git rev-parse --verify --quiet refs/remotes/origin/gh-pages >/dev/null; then
  parent_args=(-p "$(git rev-parse refs/remotes/origin/gh-pages)")
fi

new_commit="$(
  GIT_AUTHOR_NAME='github-actions[bot]' \
  GIT_AUTHOR_EMAIL='41898282+github-actions[bot]@users.noreply.github.com' \
  GIT_COMMITTER_NAME='github-actions[bot]' \
  GIT_COMMITTER_EMAIL='41898282+github-actions[bot]@users.noreply.github.com' \
  git commit-tree "$tree" "${parent_args[@]}" -m "record regression run ${RUN_ID}"
)"

git push origin "${new_commit}:refs/heads/gh-pages"
