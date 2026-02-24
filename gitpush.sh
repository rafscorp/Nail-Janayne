#!/bin/zsh

git add .
git commit -m "update"

git push https://${GIT_USERNAME}:${GIT_TOKEN}@github.com/${GIT_USERNAME}/${GIT_REPO}.git
