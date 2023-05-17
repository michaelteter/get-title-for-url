#!/bin/bash

# The $0 variable contains the name of the script.
# The dirname command gets the directory from a file path.
# (thanks Jimmy)

# The BASH_SOURCE[0] variable contains the name of the script.
script_name="${BASH_SOURCE[0]}"

# The readlink -f command follows symbolic links to find the ultimate destination.
resolved_script="$(readlink -f "$script_name")"

# The dirname command gets the directory from a file path.
script_dir="$(dirname "$resolved_script")"

# The cd command changes to this directory and the pwd command then prints the working directory.
cd "$script_dir" >/dev/null 2>&1
actual_dir=$(pwd)

cd "$actual_dir"

clojure -M:run

