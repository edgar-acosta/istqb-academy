# Levanta un runner de GitLab en Docker, en esta misma maquina.
#
# Uso:
#   .\start-runner.ps1 -Token "glrt-xxxxxxxxxxxxxxxx"
#
# Antes hay que crear el runner en GitLab:
#   Settings > CI/CD > Runners > Create project runner
# y copiar el token que aparece una sola vez.
[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)][string]$Token,
    [string]$GitLabUrl = "https://gitlab.tecnomotum.com",
    [string]$Name = "istqb-runner-docker",
    [int]$Concurrent = 1,
    [string]$Container = "gitlab-runner"
)

$ErrorActionPreference = "Stop"
Set-Location -LiteralPath $PSScriptRoot

function Invoke-Native {
    param([scriptblock]$Action)
    $previous = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    try { & $Action } finally { $ErrorActionPreference = $previous }
}

if ($Token -notmatch '^glrt-[A-Za-z0-9_.\-]+$') {
    throw "El token debe empezar con 'glrt-'. Copia el que genero GitLab al crear el runner."
}
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    throw "Docker no esta instalado o no esta en el PATH."
}
Invoke-Native { & docker info 2>&1 | Out-Null }
if ($LASTEXITCODE -ne 0) { throw "El motor de Docker no responde. Esta Docker Desktop iniciado?" }

# config.toml guarda el token: se genera desde el ejemplo y no se versiona.
$template = Get-Content -LiteralPath "config.toml.example" -Raw
$config = $template.
    Replace("glrt-REEMPLAZA_ESTE_TOKEN", $Token).
    Replace('url = "https://gitlab.tecnomotum.com"', 'url = "' + $GitLabUrl + '"').
    Replace('name = "istqb-runner-docker"', 'name = "' + $Name + '"').
    Replace("concurrent = 1", "concurrent = $Concurrent")
[System.IO.File]::WriteAllText((Join-Path $PWD "config.toml"), $config)
Write-Host "Escrito config.toml para $Name ($GitLabUrl)."

# Un contenedor anterior con el mismo nombre impediria arrancar el nuevo.
$existing = (Invoke-Native { & docker ps -a --filter "name=^/$Container$" --format "{{.Names}}" }) -join ""
if ($existing.Trim() -eq $Container) {
    Write-Host "Eliminando el contenedor anterior '$Container'..."
    Invoke-Native { & docker rm -f $Container | Out-Null }
}

Write-Host "Descargando la imagen del runner..."
Invoke-Native { & docker pull gitlab/gitlab-runner:latest }
if ($LASTEXITCODE -ne 0) { throw "No se pudo descargar gitlab/gitlab-runner:latest." }

# El runner necesita el socket de Docker para crear el contenedor de cada job.
# Eso equivale a acceso root en el host: usalo solo en una maquina de confianza.
Write-Host "Arrancando el runner..."
Invoke-Native {
    & docker run -d --name $Container --restart always `
        -v "${PSScriptRoot}:/etc/gitlab-runner" `
        -v "/var/run/docker.sock:/var/run/docker.sock" `
        gitlab/gitlab-runner:latest
}
if ($LASTEXITCODE -ne 0) { throw "No se pudo arrancar el contenedor del runner." }

Start-Sleep -Seconds 10
Write-Host ""
Write-Host "=== estado del contenedor ==="
$status = (Invoke-Native { & docker ps --filter "name=^/$Container$" --format "{{.Names}}  {{.Status}}" }) -join ""
if ($status.Trim()) { Write-Host $status } else { Write-Host "(no esta en ejecucion)" }

Write-Host ""
Write-Host "=== ultimas lineas del log ==="
$tail = (Invoke-Native { & docker logs --tail 15 $Container 2>&1 }) -join "`n"
Write-Host $tail

Write-Host ""
if ($status.Trim()) {
    Write-Host "Comprueba en GitLab: Settings > CI/CD > Runners (debe salir verde)." -ForegroundColor Green
    Write-Host "Si aparece en rojo, el token es de otro proyecto o ya fue usado."
} else {
    Write-Host "El contenedor no sigue en ejecucion. Revisa: docker logs $Container" -ForegroundColor Yellow
}
Write-Host ""
Write-Host "Logs en vivo:  docker logs -f $Container"
Write-Host "Detener:       docker stop $Container"
