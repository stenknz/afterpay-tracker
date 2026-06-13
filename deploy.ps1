$NAS_IP = "192.168.0.100"
$NAS_USER = "stenk"
$NAS_PATH = "/volume1/Docker/afterpay-tracker"

Write-Host "=== Syncing source to NAS ($NAS_IP) ==="
bash -c "rsync -avz --delete --exclude node_modules --exclude .next --exclude .git --exclude dev.db --exclude '*.md' ./ ${NAS_USER}@${NAS_IP}:${NAS_PATH}/"
bash -c "rsync -avz --exclude node_modules --exclude .next --exclude .git --exclude '*.md' 'public/uploads/' ${NAS_USER}@${NAS_IP}:${NAS_PATH}/Data/uploads/"

Write-Host "=== Building and deploying on NAS ==="
ssh -t "${NAS_USER}@${NAS_IP}" "cd ${NAS_PATH} && sudo docker compose build --pull && sudo docker compose up -d"
Write-Host "=== Done ==="
