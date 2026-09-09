<#
.SYNOPSIS
    Publica en GitHub los issues de arte definidos en docs/issues/*.md

.DESCRIPTION
    Lee el frontmatter YAML de cada archivo (title, labels), crea las etiquetas
    que falten y abre un issue por archivo. Los issues se crean SIN asignar:
    el equipo de arte los recoge desde el tablero.

.EXAMPLE
    gh auth login          # una sola vez
    .\scripts\crear-issues.ps1
#>

[CmdletBinding()]
param(
    [string]$Repo = "JeanCarloLond/Subterfuge",
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"

# gh se instala fuera del PATH de la sesión actual; lo recargamos por si acaso.
$env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" +
            [System.Environment]::GetEnvironmentVariable("Path", "User")

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    throw "GitHub CLI no encontrado. Instálalo con: winget install --id GitHub.cli"
}

gh auth status 2>&1 | Out-Null
if (-not $?) {
    throw "No has iniciado sesión en GitHub. Ejecuta primero: gh auth login"
}

$raizIssues = Join-Path $PSScriptRoot "..\docs\issues"
$archivos = Get-ChildItem -Path $raizIssues -Filter "*.md" | Sort-Object Name

if ($archivos.Count -eq 0) {
    throw "No se encontraron issues en $raizIssues"
}

# Colores por etiqueta. Paleta del proyecto, no la de GitHub por defecto.
$coloresEtiqueta = @{
    "arte"            = "8c2f2f"
    "fase-1"          = "4a4038"
    "fase-2"          = "4a4038"
    "fase-3"          = "4a4038"
    "prioridad-alta"  = "b02e2e"
    "prioridad-media" = "8a6d3b"
    "prioridad-baja"  = "5a5a5a"
    "bloqueante"      = "000000"
}

$etiquetasCreadas = @{}

foreach ($archivo in $archivos) {
    $contenido = Get-Content $archivo.FullName -Raw -Encoding UTF8

    # Frontmatter delimitado por --- al inicio del archivo.
    if ($contenido -notmatch '(?s)^---\s*\r?\n(.*?)\r?\n---\s*\r?\n(.*)$') {
        Write-Warning "$($archivo.Name): sin frontmatter válido, se omite."
        continue
    }

    $frontmatter = $Matches[1]
    $cuerpo = $Matches[2].Trim()

    $titulo = $null
    $etiquetas = @()

    foreach ($linea in $frontmatter -split "\r?\n") {
        if ($linea -match '^\s*title:\s*"?(.+?)"?\s*$') { $titulo = $Matches[1] }
        if ($linea -match '^\s*labels:\s*(.+?)\s*$') {
            $etiquetas = $Matches[1] -split ',' | ForEach-Object { $_.Trim() } |
                         Where-Object { $_ }
        }
    }

    if (-not $titulo) {
        Write-Warning "$($archivo.Name): sin 'title' en el frontmatter, se omite."
        continue
    }

    # Crear etiquetas que aún no existan en el repo.
    foreach ($etiqueta in $etiquetas) {
        if ($etiquetasCreadas.ContainsKey($etiqueta)) { continue }
        $etiquetasCreadas[$etiqueta] = $true

        $color = if ($coloresEtiqueta.ContainsKey($etiqueta)) {
            $coloresEtiqueta[$etiqueta]
        } else { "cccccc" }

        if ($DryRun) {
            Write-Host "  [dry-run] etiqueta: $etiqueta (#$color)" -ForegroundColor DarkGray
        } else {
            # --force actualiza el color si la etiqueta ya existía.
            gh label create $etiqueta --repo $Repo --color $color --force 2>&1 | Out-Null
        }
    }

    if ($DryRun) {
        Write-Host "[dry-run] issue: $titulo" -ForegroundColor Cyan
        Write-Host "          labels: $($etiquetas -join ', ')" -ForegroundColor DarkGray
        continue
    }

    # Sin --assignee a propósito: los issues quedan abiertos y sin asignar.
    $url = gh issue create `
        --repo $Repo `
        --title $titulo `
        --body $cuerpo `
        --label ($etiquetas -join ',')

    Write-Host "creado: $titulo" -ForegroundColor Green
    Write-Host "        $url" -ForegroundColor DarkGray
}

Write-Host ""
Write-Host "Listo. Issues abiertos y sin asignar en $Repo" -ForegroundColor Green
