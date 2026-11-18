<#
.SYNOPSIS
    Operaciones del portal ISTQB Academy en Docker (Windows).

.DESCRIPTION
    Envoltorio de `docker compose` para las tareas que se repiten: arrancar,
    parar, ver logs, respaldar, restaurar, dar permisos de administrador y
    publicar por tunel sin IP ni dominio.

.EXAMPLE
    .\istqb.ps1 init
.EXAMPLE
    .\istqb.ps1 tunnel
#>
[CmdletBinding()]
param(
    [Parameter(Position = 0)][string]$Command = "help",
    [Parameter(Position = 1)][string]$Argument
)

$ErrorActionPreference = "Stop"
Set-Location -LiteralPath $PSScriptRoot

function Read-DotEnv {
    $map = @{}
    if (-not (Test-Path -LiteralPath ".env")) { return $map }
    foreach ($line in Get-Content -LiteralPath ".env") {
        $trimmed = $line.Trim()
        if ($trimmed -eq "" -or $trimmed.StartsWith("#")) { continue }
        $separator = $trimmed.IndexOf("=")
        if ($separator -lt 1) { continue }
        $map[$trimmed.Substring(0, $separator).Trim()] = $trimmed.Substring($separator + 1).Trim()
    }
    return $map
}

function New-Secret {
    $bytes = New-Object byte[] 32
    [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
    return (($bytes | ForEach-Object { $_.ToString("x2") }) -join "")
}

function Assert-Docker {
    if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
        throw "Docker no esta instalado o no esta en el PATH."
    }
    Invoke-Native { & docker info 2>&1 | Out-Null }
    if ($LASTEXITCODE -ne 0) {
        throw "El motor de Docker no responde. Esta Docker Desktop iniciado?"
    }
}

function Initialize-Env {
    if (Test-Path -LiteralPath ".env") { return }
    Copy-Item -LiteralPath ".env.example" -Destination ".env"
    $content = Get-Content -LiteralPath ".env" -Raw
    $content = $content -replace "(?m)^SESSION_SECRET=.*$", "SESSION_SECRET=$(New-Secret)"
    # Solo hexadecimal: el valor se inserta dentro de DATABASE_URL y caracteres
    # como @ : / ? # romperian la cadena de conexion.
    $content = $content -replace "(?m)^POSTGRES_PASSWORD=.*$", "POSTGRES_PASSWORD=$(New-Secret)"
    [System.IO.File]::WriteAllText((Join-Path $PWD ".env"), $content)
    Write-Host "Creado deploy\.env con SESSION_SECRET y POSTGRES_PASSWORD aleatorios."
    Write-Host "Revisa SITE_ADDRESS si vas a publicar con un dominio."
}

# docker escribe su progreso en stderr. Con $ErrorActionPreference = "Stop",
# PowerShell 5.1 trata esa salida como un error y aborta el script, asi que la
# preferencia se relaja solo durante la llamada y el fallo real se detecta por
# el codigo de salida.
function Invoke-Native {
    param([scriptblock]$Action)
    $previous = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    try { & $Action } finally { $ErrorActionPreference = $previous }
}

function Invoke-Compose {
    param([string[]]$ComposeArgs)
    Invoke-Native { & docker compose @ComposeArgs }
    if ($LASTEXITCODE -ne 0) { throw "Fallo: docker compose $($ComposeArgs -join ' ')" }
}

# Igual que docker compose: una variable de entorno del proceso gana sobre el
# valor de .env, para poder sobreescribir un puerto sin editar el archivo.
function Get-Setting {
    param([hashtable]$Map, [string]$Name, [string]$Default)
    $fromEnvironment = [Environment]::GetEnvironmentVariable($Name)
    if ($fromEnvironment) { return $fromEnvironment }
    if ($Map.ContainsKey($Name) -and $Map[$Name] -ne "") { return $Map[$Name] }
    return $Default
}

$settings = Read-DotEnv
$dbUser = Get-Setting $settings "POSTGRES_USER" "istqb"
$dbName = Get-Setting $settings "POSTGRES_DB" "istqb"
$dbPassword = Get-Setting $settings "POSTGRES_PASSWORD" ""
$siteAddress = Get-Setting $settings "SITE_ADDRESS" "http://:80"
$httpPort = Get-Setting $settings "HTTP_PORT" "80"

switch ($Command.ToLowerInvariant()) {
    "help" {
        @"
Uso: .\istqb.ps1 <comando> [argumento]

  init                 Crea deploy\.env con secretos aleatorios.
  secret               Imprime un SESSION_SECRET nuevo.
  up                   Construye y arranca la app, la base y el proxy.
  down                 Detiene y elimina los contenedores (los datos se conservan).
  restart              Reinicia los servicios sin reconstruir.
  status               Estado y healthchecks de los contenedores.
  logs                 Sigue los logs de la aplicacion.
  backup               Respalda la base a backups\istqb-<fecha>.sql.gz.
  restore <archivo>    Reemplaza la base con un respaldo (destructivo).
  admin <usuario>      Da permisos de administrador a una cuenta existente.
  psql                 Abre una consola SQL interactiva.
  migrate <archivo.db> Importa los datos de la version local en SQLite.
  tunnel               Publica por tunel Cloudflare sin IP ni dominio.
  update               Reconstruye la imagen con los cambios actuales.
"@
    }
    "secret" {
        New-Secret
    }
    "init" {
        Initialize-Env
    }
    "up" {
        Assert-Docker
        Initialize-Env
        Invoke-Compose @("up", "-d", "--build")
        Write-Host ""
        if ($siteAddress -like "http*") {
            Write-Host "Portal local en http://localhost:$httpPort/"
            Write-Host "Para compartirlo sin IP ni dominio usa: .\istqb.ps1 tunnel"
        } else {
            Write-Host "Portal disponible en https://$siteAddress/"
        }
    }
    "down" {
        Invoke-Compose @("down")
    }
    "restart" {
        Invoke-Compose @("restart")
    }
    "status" {
        Invoke-Compose @("ps")
    }
    "logs" {
        Invoke-Compose @("logs", "-f", "--tail", "100", "app")
    }
    "tunnel" {
        Assert-Docker
        Initialize-Env
        Invoke-Compose @("--profile", "quick", "up", "-d", "--build")
        Write-Host "Esperando la URL publica del tunel..."
        $url = $null
        for ($attempt = 0; $attempt -lt 10 -and -not $url; $attempt++) {
            Start-Sleep -Seconds 3
            $logs = (Invoke-Native { & docker compose logs quicktunnel 2>&1 }) -join "`n"
            if ($logs -match "https://[a-z0-9-]+\.trycloudflare\.com") { $url = $Matches[0] }
        }
        if ($url) {
            Write-Host ""
            Write-Host "Portal disponible en $url" -ForegroundColor Green
            Write-Host "La URL es temporal: cambia cada vez que se reinicia el contenedor."
        } else {
            Write-Host "Aun no hay URL. Revisa: docker compose logs quicktunnel" -ForegroundColor Yellow
        }
    }
    "backup" {
        Assert-Docker
        $directory = Join-Path $PWD "backups"
        New-Item -ItemType Directory -Force -Path $directory | Out-Null
        $stamp = Get-Date -Format "yyyyMMdd-HHmmss"
        $target = Join-Path $directory "istqb-$stamp.sql.gz"
        $inside = "/tmp/istqb-backup.sql.gz"
        $dump = 'pg_dump -U "' + $dbUser + '" -d "' + $dbName + '" --schema=academy | gzip -9 > ' + $inside
        Invoke-Compose @("exec", "-T", "db", "sh", "-c", $dump)
        Invoke-Compose @("cp", "db:$inside", $target)
        Invoke-Compose @("exec", "-T", "db", "rm", "-f", $inside)
        Write-Host "Respaldo guardado en $target"
    }
    "restore" {
        if (-not $Argument) { throw "Uso: .\istqb.ps1 restore <archivo.sql.gz>" }
        $source = (Resolve-Path -LiteralPath $Argument).Path
        Write-Host "ATENCION: esto reemplaza TODOS los datos actuales de la base." -ForegroundColor Yellow
        $answer = Read-Host "Escribe SI para continuar"
        if ($answer -ne "SI") { Write-Host "Cancelado."; break }
        $inside = "/tmp/istqb-restore.sql.gz"
        Invoke-Compose @("cp", $source, "db:$inside")
        $drop = 'psql -U "' + $dbUser + '" -d "' + $dbName + '" -c "DROP SCHEMA academy CASCADE;"'
        Invoke-Compose @("exec", "-T", "db", "sh", "-c", $drop)
        $load = 'gunzip -c ' + $inside + ' | psql -v ON_ERROR_STOP=1 -U "' + $dbUser + '" -d "' + $dbName + '"'
        Invoke-Compose @("exec", "-T", "db", "sh", "-c", $load)
        Invoke-Compose @("exec", "-T", "db", "rm", "-f", $inside)
        Write-Host "Base restaurada desde $source"
    }
    "admin" {
        if (-not $Argument) { throw "Uso: .\istqb.ps1 admin <usuario>" }
        if ($Argument -notmatch "^[a-zA-Z0-9._-]+$") { throw "Nombre de usuario no valido." }
        $sql = "UPDATE academy.users SET role='admin' WHERE username='" + $Argument.ToLowerInvariant() + "';"
        Invoke-Compose @("exec", "-T", "db", "psql", "-U", $dbUser, "-d", $dbName, "-c", $sql)
        Write-Host "Revisa arriba que la fila se haya actualizado (UPDATE 1)."
    }
    "psql" {
        Invoke-Compose @("exec", "db", "psql", "-U", $dbUser, "-d", $dbName)
    }
    "migrate" {
        if (-not $Argument) { throw "Uso: .\istqb.ps1 migrate <ruta\istqb.db>" }
        Assert-Docker
        $source = (Resolve-Path -LiteralPath $Argument).Path
        $sourceDirectory = Split-Path -Parent $source
        $sourceName = Split-Path -Leaf $source
        $url = "postgresql://" + $dbUser + ":" + $dbPassword + "@db:5432/" + $dbName + "?sslmode=disable"
        # La imagen ya trae Node, better-sqlite3 y pg, asi que no hace falta
        # instalar nada en el host para importar la base local.
        $script = "node /app/scripts/migrate-sqlite-postgres.mjs backup /data/$sourceName /tmp/snapshot.db"
        $script = $script + " && node /app/scripts/migrate-sqlite-postgres.mjs import /tmp/snapshot.db"
        Invoke-Native { & docker compose run --rm --entrypoint sh -v "${sourceDirectory}:/data:ro" -e "MIGRATION_DATABASE_URL=$url" app -c $script }
        if ($LASTEXITCODE -ne 0) { throw "La importacion fallo; la base de destino no se modifico." }
    }
    "update" {
        Assert-Docker
        Invoke-Compose @("build", "--pull")
        Invoke-Compose @("up", "-d")
        Write-Host "Imagen reconstruida y servicios actualizados."
    }
    default {
        Write-Host "Comando no reconocido: $Command" -ForegroundColor Yellow
        & $PSCommandPath help
        exit 1
    }
}