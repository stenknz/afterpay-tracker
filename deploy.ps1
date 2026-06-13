$NAS_IP = "192.168.0.100"
$NAS_USER = "stenk"
$NAS_PATH = "/volume1/Docker/afterpay-tracker"

Write-Host "=== Syncing compose file to NAS ($NAS_IP) ==="
bash -c "rsync -avz docker-compose.yml ${NAS_USER}@${NAS_IP}:${NAS_PATH}/"

Write-Host "=== Syncing uploads to NAS Data volume ==="
bash -c "rsync -avz 'public/uploads/' ${NAS_USER}@${NAS_IP}:${NAS_PATH}/Data/uploads/"

Write-Host "=== Pulling and deploying on NAS ==="
ssh -t "${NAS_USER}@${NAS_IP}" "cd ${NAS_PATH} && sudo docker compose pull && sudo docker compose up -d"
Write-Host "=== Done ==="
