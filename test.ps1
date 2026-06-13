$ErrorActionPreference = "Stop"

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
Write-Host "If changes are approved, deploy to production:" -ForegroundColor Yellow
Write-Host "  .\deploy.ps1"
Write-Host ""
