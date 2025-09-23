#!/usr/bin/env bash
set -e

# Check for bg-white without accompanying text color
violations=$(grep -RIn --include=*.{tsx,jsx,html} 'bg-white' src | grep -v 'text-' || true)
if [ -n "$violations" ]; then
  echo "Found bg-white without explicit text color:" && echo "$violations"
fi

# Check for light backgrounds in dark mode without dark text override
violations_dark=$(grep -RIn --include=*.{tsx,jsx,html} -E 'dark:bg-(white|slate-100|slate-200|gray-100)' src | grep -v 'dark:text-' || true)
if [ -n "$violations_dark" ]; then
  echo "Found dark mode light backgrounds without dark:text:" && echo "$violations_dark"
fi

if [ -z "$violations" ] && [ -z "$violations_dark" ]; then
  echo "No light button contrast issues found."
fi
