#!/usr/bin/env bash
set -e # Exit immediately if any scripts returns non zero status

CROWDIN_API_TOKEN=$1
ESS=$2

echo "TOKEN=$CROWDIN_API_TOKEN"
echo "ESS=$ESS"

echo "GITHUB_REPOSITORY=$GITHUB_REPOSITORY"
repo_name=$(echo "${GITHUB_REPOSITORY}" | cut -d'/' -f 2-)
echo "repo_name=$repo_name"
resp=$(curl -XGET -H 'Authorization: Bearer "$CROWDIN_API_TOKEN"' -H "Content-type: application/json" "https://api.crowdin.com/api/v2/projects")
echo "resp=$resp"
