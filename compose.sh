#!/usr/bin/env bash

docker compose pull;
docker compose -p "$(basename $(pwd))" up --build --remove-orphans $1;
