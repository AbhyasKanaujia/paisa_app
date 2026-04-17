# Paisa App

## Coding

1. Always monitor `cd /Users/abhyas/projects/paisa_app && .venv/bin/ptw --clear --runner "./run_tests.sh" 2>&1 | grep --line-buffered -E "passed|failed|error|ERROR|FAILED|Running|watching"`
2. Model in src/models/ is the source of truth for the structure of the database. It must contain static methods and instance methods for better encapsulation.
3. src/services/ are the only files that directly interact with the database. 
4.

## Frontend UI Style

All frontend work must strictly follow `resources/style.md`. This file is the single source of truth for fonts, colors, spacing, layout, and interaction patterns. Do not make any UI decisions that contradict it.
