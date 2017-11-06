#!/bin/bash

case "$1" in

        test)
            xvfb-run -l npm run test 2> /dev/null || :
            ;;

        test_ci)
            xvfb-run -l npm run test_ci
            ;;

        *)
            echo $"Usage: $0 {test|test_ci}"
            exit 1
esac