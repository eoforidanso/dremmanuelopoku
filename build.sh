#!/usr/bin/env bash
# Assembles the deployable site into dist/.
# The site is plain HTML/CSS/JS, so this is a copy plus a .nojekyll marker for
# GitHub Pages — there is no bundler or transpiler to run.
set -euo pipefail

root="$(cd "$(dirname "$0")" && pwd)"
out="$root/dist"

rm -rf "$out"
mkdir -p "$out"

cp "$root/index.html" "$root/styles.css" "$root/script.js" "$out/"
cp -R "$root/assets" "$out/assets"

# Stop GitHub Pages running the files through Jekyll.
touch "$out/.nojekyll"

# Drop macOS cruft that may have hitched a ride.
find "$out" -name '.DS_Store' -delete

echo "Built $(find "$out" -type f | wc -l | tr -d ' ') files into dist/"
