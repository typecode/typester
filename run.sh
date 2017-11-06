#!/bin/bash

APP_NAME="typester"

case "$1" in

        up)
            docker run --rm -v "$(pwd):/app" "$APP_NAME" /app/test/run.sh test
            ;;

        up_ci)
            docker run --rm -v "$(pwd):/app" "$2" /app/test/run.sh test_ci
            ;;

        *)
            echo $"Usage: $0 {up|up_ci|build_local|build_ci}"
            exit 1
esac