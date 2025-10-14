#!/bin/bash
#
# Gittu v2: A comprehensive and robust git utility script.
# Architected for safety, clarity, and efficiency.
#

# --- Configuration ---
# The name of the keychain entry holding the GPG password
GPG_KEYCHAIN_SERVICE="picture-this-gpg"

# The primary development branch for rebasing
MAIN_BRANCH="main"

# An array of sensitive files to be automatically encrypted before committing.
# Paths should be relative to the git root.
SENSITIVE_FILES=(
    ".env"
    "src/screens/WebFriendlyLogin.tsx"
)

# --- State ---
# Cache the GPG password to avoid redundant keychain lookups.
GPG_PASS=""

# --- Helper Functions ---

# Fetches the GPG password from the macOS Keychain.
# Caches the password in a global variable to improve performance.
# Exits with an error if the password is not found.
function get_gpg_pass() {
    if [ -n "$GPG_PASS" ]; then
        echo "$GPG_PASS"
        return
    fi

    GPG_PASS=$(security find-generic-password -a "$USER" -s "$GPG_KEYCHAIN_SERVICE" -w)
    if [ -z "$GPG_PASS" ]; then
        echo "Error: GPG password '$GPG_KEYCHAIN_SERVICE' not found in Keychain."
        echo "Please add it using: security add-generic-password -a "$USER" -s "$GPG_KEYCHAIN_SERVICE" -w "YOUR_PASSWORD""
        exit 1
    fi
    echo "$GPG_PASS"
}

# Encrypts a single file using GPG.
# @param $1: The path to the file to encrypt.
function encrypt_file() {
    local file_to_encrypt="$1"
    if [ ! -f "$file_to_encrypt" ]; then
        echo "Error: File not found at '$file_to_encrypt'"
        return 1
    fi

    local gpg_pass
    gpg_pass=$(get_gpg_pass)

    echo "Encrypting '$file_to_encrypt'..."
    gpg --batch --yes --passphrase "$gpg_pass" --symmetric --cipher-algo AES256 -o "$file_to_encrypt.gpg" "$file_to_encrypt"
    if [ $? -ne 0 ]; then
        echo "Error: GPG encryption failed for '$file_to_encrypt'."
        return 1
    fi
    echo "'$file_to_encrypt.gpg' created/updated."
}

# To be called from a pre-commit hook.
# Automatically encrypts any staged sensitive files.
function pre_commit_encrypt_hook() {
    for file in "${SENSITIVE_FILES[@]}"; do
        if git diff --cached --name-only | grep -q "^$file$"; then
            echo "Sensitive file '$file' detected in staging. Encrypting..."
            encrypt_file "$file"
            git reset "$file" # Unstage the original file
            git add "$file.gpg" # Stage the encrypted version
            echo "Unstaged '$file' and staged '$file.gpg'."
        fi
    done

    # Final check to ensure no unencrypted sensitive files are staged
    for file in "${SENSITIVE_FILES[@]}"; do
        if git diff --cached --name-only | grep -q "^$file$"; then
            echo "FATAL: Unencrypted sensitive file '$file' is still staged. Aborting commit."
            exit 1
        fi
    done
}

# --- Main Commands ---

function command_status() {
    echo "--- Git Status ---"
    git status
    echo -e "
--- Tracked files that are usually ignored ---"
    git ls-files --ignored --exclude-standard
    echo "------------------"
}

function command_add() {
    echo "--- Staging all changes (including new and deleted files) ---"
    git add -A
    if [ $? -ne 0 ]; then
        echo "Error: 'git add -A' failed."
        return 1
    fi
    echo "All changes have been staged."
    git status -s
}

function command_commit() {
    # Optional: Run external cleanup script
    if [ -f "../reXexl.sh" ]; then
        echo "--- Running external cleanup script: ../reXexl.sh ---"
        ../reXexl.sh
        echo "Cleanup done."
    fi

    echo -e "
--- Committing Files ---"
    echo "Conventional commit types: feat, fix, docs, style, refactor, test, chore"
    read -p "Enter commit message: " commit_msg

    if [ -z "$commit_msg" ]; then
        echo "Commit aborted: message cannot be empty."
        return 1
    fi

    git commit -m "$commit_msg"
    local commit_status=$?

    if [ $commit_status -ne 0 ]; then
        echo "Git commit failed. Aborting push."
        return $commit_status
    fi

    echo -e "
--- Pushing to Remote ---"
    local current_branch
    current_branch=$(git rev-parse --abbrev-ref HEAD)
    read -p "Push to origin/$current_branch? (y/n): " push_confirm
    if [[ "$push_confirm" == "y" ]]; then
        git push -u origin "$current_branch"
    else
        echo "Push skipped."
    fi
}

function command_restore() {
    echo "--- Restore Menu ---"
    echo "1. Unstage a specific file (git reset <file>)"
    echo "2. Unstage all files (git reset)"
    echo "3. Discard all local changes (git restore .)"
    read -p "Choose an option (1-3): " choice

    case "$choice" in
        1) read -p "File to unstage: " file; git reset "$file" ;; 
        2) echo "Unstaging all files..."; git reset ;; 
        3) 
            read -p "Discard ALL local changes? This cannot be undone. (y/n): " confirm
            if [[ "$confirm" == "y" ]]; then
                echo "Discarding all local changes..."
                git restore .
            else
                echo "Cancelled."
            fi
            ;; 
        *) echo "Invalid option." ;; 
    esac
}

function command_fix() {
    echo "--- Fix-it Menu ---"
    echo "1. Untrack a file (but keep it locally)"
    echo "2. Forcefully DELETE all untracked files"
    read -p "Choose an option (1-2): " choice

    case "$choice" in
        1) read -p "File to untrack: " file; git rm --cached "$file" ;; 
        2) 
            read -p "DELETE all untracked files/directories? This is permanent. (y/n): " confirm
            if [[ "$confirm" == "y" ]]; then
                echo "Cleaning untracked files..."
                git clean -fd
            else
                echo "Cancelled."
            fi
            ;; 
        *) echo "Invalid option." ;; 
    esac
}

function command_rebase() {
    echo "Starting interactive rebase against '$MAIN_BRANCH'..."
    git rebase -i "$MAIN_BRANCH"
}

# --- Script Entrypoint ---

# A single, unified function to dispatch commands.
function main() {
    local command="$1"
    local arg="$2"

    case "$command" in
        status) command_status ;; 
        add) command_add ;; 
        commit) command_commit ;; 
        encrypt) 
            if [ -n "$arg" ]; then
                encrypt_file "$arg"
            else
                echo "Usage: $0 encrypt [file_path]"
            fi
            ;; 
        restore) command_restore ;; 
        fix) command_fix ;; 
        rebase) command_rebase ;; 
        pre-commit-encrypt) pre_commit_encrypt_hook ;; 
        *) 
            echo "Error: Unknown command '$command'"
            show_menu
            exit 1
            ;; 
    esac
}

# Shows an interactive menu for the user to choose a command.
function show_menu() {
    echo -e "
--- Gittu Main Menu ---"
    echo "1. status    - Show git status."
    echo "2. add       - Stage all new, modified, and deleted files."
    echo "3. commit    - The full add, commit, push workflow."
    echo "4. encrypt   - Encrypt a specific file."
    echo "5. restore   - Unstage or discard local changes."
    echo "6. fix       - Tools to fix common problems."
    echo "7. rebase    - Start an interactive rebase on '$MAIN_BRANCH'."
    echo "8. exit      - Exit the script."
    echo "----------------------"
    read -p "Enter your choice (1-8): " choice

    case "$choice" in
        1) main "status" ;; 
        2) main "add" ;; 
        3) main "commit" ;; 
        4) 
            read -p "File to encrypt: " file
            if [ -n "$file" ]; then
                main "encrypt" "$file"
            else
                echo "Error: No file path provided."
            fi
            ;; 
        5) main "restore" ;; 
        6) main "fix" ;; 
        7) main "rebase" ;; 
        8) echo "Exiting."; exit 0 ;; 
        *) echo "Invalid choice." ;; 
    esac
}

# If a command is provided, execute it directly. Otherwise, show the menu.
if [ -n "$1" ]; then
    main "$1" "$2"
else
    while true; do
        show_menu
    done
fi