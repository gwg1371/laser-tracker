#!/bin/sh
exec python -m http.server --directory "$(dirname "$0")" 3000 2>/dev/null
