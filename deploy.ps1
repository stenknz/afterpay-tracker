param(
  [ValidateSet("Local","NAS")]
  [string]$Environment = "Local"
)

$ErrorActionPreference = "Stop"

if ($Environment -eq "Local") {
  Write-Host "=== ACCEPTANCE TESTING (Local Docker Desktop) ==="
  Write-Host ""

  Write-Host "[1/3] Pulling latest image from Docker Hub..."
  docker compose pull
  if ($LASTEXITCODE -ne 0) { Write-Host "ERROR: Pull failed." -ForegroundColor Red; exit 1 }

  Write-Host "[2/3] Restarting container..."
  docker compose up -d --force-recreate
  if ($LASTEXITCODE -ne 0) { Write-Host "ERROR: Start failed." -ForegroundColor Red; exit 1 }

  Write-Host "[3/3] Waiting for app to be ready..."
  Start-Sleep -Seconds 3
  docker logs afterpay-tracker --tail 5

  Write-Host ""
  Write-Host "=== ACCEPTANCE TESTING READY ===" -ForegroundColor Green
  Write-Host "Open: http://localhost:7672"
  Write-Host ""
  Write-Host "After testing, if changes are approved, run:" -ForegroundColor Yellow
  Write-Host "  .\deploy.ps1 -Environment NAS"
  Write-Host ""
} else {
  $NAS_IP = "192.168.0.100"
  $NAS_USER = "stenk"
  $NAS_PATH = "/volume1/Docker/afterpay-tracker"

  Write-Host "=== PRODUCTION DEPLOY (NAS $NAS_IP) ==="
  Write-Host ""

  Write-Host "[1/3] Syncing compose file to NAS..."
  bash -c "rsync -avz docker-compose.yml ${NAS_USER}@${NAS_IP}:${NAS_PATH}/"
  if ($LASTEXITCODE -ne 0) { Write-Host "ERROR: rsync compose failed." -ForegroundColor Red; exit 1 }

  Write-Host "[2/3] Syncing uploads to NAS Data volume..."
  bash -c "rsync -avz 'public/uploads/' ${NAS_USER}@${NAS_IP}:${NAS_PATH}/Data/uploads/"
  if ($LASTEXITCODE -ne 0) { Write-Host "ERROR: rsync uploads failed." -ForegroundColor Red; exit 1 }

  Write-Host "[3/3] Pulling and restarting on NAS..."
  ssh -t "${NAS_USER}@${NAS_IP}" "cd ${NAS_PATH} && sudo docker compose pull && sudo docker compose up -d"
  if ($LASTEXITCODE -ne 0) { Write-Host "ERROR: NAS deploy failed." -ForegroundColor Red; exit 1 }

  Write-Host ""
  Write-Host "=== PRODUCTION DEPLOYED ===" -ForegroundColor Green
  Write-Host ""
}
