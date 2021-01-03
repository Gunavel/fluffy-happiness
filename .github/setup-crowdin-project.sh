#!/usr/bin/env bash
set -e # Exit immediately if any scripts returns non zero status


echo "GITHUB_REPOSITORY=$GITHUB_REPOSITORY"
repo_name=$(echo "${GITHUB_REPOSITORY}" | cut -d'/' -f 2-)
echo "repo_name=$repo_name"
resp=$(curl -XGET -H 'Authorization: Bearer ${{ secrets.TOK }}' -H "Content-type: application/json" 'https://api.crowdin.com/api/v2/projects')
echo "resp=$resp"
