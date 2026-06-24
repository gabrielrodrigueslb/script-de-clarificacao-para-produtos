$ErrorActionPreference = "Stop"

$localPort = 15432
$jumpHost = "145.223.27.100"
$jumpUser = "root"
$remoteDbHost = "38.210.53.194"
$remoteDbPort = 5432

$existingTunnel = Get-NetTCPConnection -State Listen -LocalPort $localPort -ErrorAction SilentlyContinue |
  ForEach-Object { Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue } |
  Where-Object { $_ -and $_.ProcessName -eq "ssh" } |
  Select-Object -First 1

if ($existingTunnel) {
  Write-Host "Tunnel SSH ja esta ativo em localhost:$localPort (PID $($existingTunnel.Id))."
  exit 0
}

$sshArgs = @(
  "-o", "ExitOnForwardFailure=yes",
  "-o", "ServerAliveInterval=60",
  "-o", "StrictHostKeyChecking=accept-new",
  "-L", "${localPort}:${remoteDbHost}:${remoteDbPort}",
  "${jumpUser}@${jumpHost}",
  "-N"
)

Write-Host "Abrindo tunnel SSH em localhost:$localPort -> ${remoteDbHost}:${remoteDbPort} via ${jumpUser}@${jumpHost}."
Write-Host "Se a chave SSH nao estiver configurada, a janela vai pedir a senha da VPS."

Start-Process powershell -ArgumentList @(
  "-NoExit",
  "-Command",
  "ssh $($sshArgs -join ' ')"
)
