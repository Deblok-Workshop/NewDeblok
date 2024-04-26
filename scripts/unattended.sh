while [ true ]; do
    echo "[i] Building styles..."
    bun run build
    echo "[i] Starting server..."
    bun run server/index.ts
    echo "[!] Server crashed! Restarting in 3 seconds..."
    echo "[i] Press CTRL + C to stop."
    sleep 3
done