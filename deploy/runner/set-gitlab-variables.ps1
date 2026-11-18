# Carga en GitLab las tres variables que necesita el pipeline.
#
# Uso:
#   .\set-gitlab-variables.ps1 -GitLabToken "glpat-xxxx" -VercelToken "xxxx"
#
# -GitLabToken: token personal de GitLab con scope "api" (User Settings > Access Tokens)
# -VercelToken: token de Vercel (vercel.com/account/tokens)
#
# VERCEL_ORG_ID y VERCEL_PROJECT_ID se leen de .vercel\project.json si existe
# (ejecuta antes: npx vercel@latest link). Si no existe, pasalos a mano.
[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)][string]$GitLabToken,
    [Parameter(Mandatory = $true)][string]$VercelToken,
    [string]$GitLabUrl = "https://gitlab.tecnomotum.com",
    [string]$ProjectPath = "edgaracosta/istqb-academy",
    [string]$OrgId,
    [string]$ProjectId
)

$ErrorActionPreference = "Stop"

function Invoke-Native {
    param([scriptblock]$Action)
    $previous = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    try { & $Action } finally { $ErrorActionPreference = $previous }
}

# Los IDs de Vercel se pueden tomar del enlace local en vez de teclearlos.
$projectJson = Join-Path (Split-Path -Parent (Split-Path -Parent $PSScriptRoot)) ".vercel\project.json"
if ((Test-Path -LiteralPath $projectJson)) {
    $link = Get-Content -LiteralPath $projectJson -Raw | ConvertFrom-Json
    if (-not $OrgId) { $OrgId = $link.orgId }
    if (-not $ProjectId) { $ProjectId = $link.projectId }
    Write-Host "IDs leidos de .vercel\project.json"
} elseif (-not $OrgId -or -not $ProjectId) {
    throw "Falta -OrgId/-ProjectId y no existe .vercel\project.json. Ejecuta 'npx vercel@latest link' o pasalos a mano."
}

if ($GitLabToken -notmatch '^glpat-[A-Za-z0-9_.\-]+$') {
    Write-Host "Aviso: el token de GitLab no empieza con 'glpat-'. Se intentara igualmente." -ForegroundColor Yellow
}

$projectIdEncoded = [System.Uri]::EscapeDataString($ProjectPath)
$apiBase = "$GitLabUrl/api/v4/projects/$projectIdEncoded/variables"
$headers = @{ "PRIVATE-TOKEN" = $GitLabToken }

$variables = @(
    @{ key = "VERCEL_TOKEN";      value = $VercelToken; description = "Token de acceso de Vercel" },
    @{ key = "VERCEL_ORG_ID";     value = $OrgId;       description = "Team ID de Vercel" },
    @{ key = "VERCEL_PROJECT_ID"; value = $ProjectId;   description = "Project ID de Vercel" }
)

foreach ($variable in $variables) {
    # masked enmascara el valor en los logs; protected se deja en false a
    # proposito: una variable protegida solo llega a jobs de ramas protegidas y
    # el job fallaria con el token vacio si main no lo esta.
    $body = @{
        key         = $variable.key
        value       = $variable.value
        masked      = $true
        protected   = $false
        variable_type = "env"
    }
    try {
        Invoke-RestMethod -Method Post -Uri $apiBase -Headers $headers -Body $body -ContentType "application/json" | Out-Null
        Write-Host "Creada   $($variable.key)"
    } catch {
        $status = $null
        if ($_.Exception.Response) { $status = [int]$_.Exception.Response.StatusCode }
        if ($status -eq 400) {
            # Ya existe: se actualiza en lugar de fallar.
            try {
                Invoke-RestMethod -Method Put -Uri "$apiBase/$($variable.key)" -Headers $headers -Body $body -ContentType "application/json" | Out-Null
                Write-Host "Actualizada $($variable.key)"
            } catch {
                Write-Host "Fallo al actualizar $($variable.key): $($_.Exception.Message)" -ForegroundColor Red
            }
        } else {
            Write-Host "Fallo al crear $($variable.key) (HTTP $status): $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "=== variables en el proyecto ==="
try {
    $actuales = Invoke-RestMethod -Method Get -Uri $apiBase -Headers $headers
    $actuales | ForEach-Object { "  {0}  masked={1}  protected={2}" -f $_.key, $_.masked, $_.protected }
} catch {
    Write-Host "No se pudo listar: $($_.Exception.Message)" -ForegroundColor Yellow
}
