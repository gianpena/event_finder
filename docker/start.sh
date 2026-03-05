#!/bin/bash

if [[ ! -d ./event-finder ]]; then
  git clone https://github.com/Aaryan1524/event_finder.git event-finder
  CLONED=1
fi

cd event-finder
[[ ! -z $CLONED ]] && git pull origin main
npm install; npm prune
npm run build
npm start