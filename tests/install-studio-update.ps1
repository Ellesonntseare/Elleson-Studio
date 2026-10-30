$ErrorActionPreference = 'Stop'
$studioRoot = Split-Path -Parent $PSScriptRoot
$studioRelease = Join-Path $studioRoot 'release\0.5.0'
$studioInstaller = Join-Path $studioRelease 'Elleson-Studio-Setup-0.5.0.exe'
$studioInstalledRoot = Join-Path $env:LOCALAPPDATA 'Programs\Elleson Studio'
$studioInstalledExe = Join-Path $studioInstalledRoot 'Elleson Studio.exe'
$studioData = Join-Path $env:APPDATA 'elleson-studio'
$studioBackup = (Get-Content -LiteralPath (Join-Path $studioRelease 'backup-path.txt') -Raw).Trim()
$studioVerification = Get-Content -LiteralPath (Join-Path $studioRelease 'installer-verification.json') -Raw | ConvertFrom-Json
if ($studioVerification.ArchiveIntegrity -ne 'Passed' -or (Get-FileHash -LiteralPath $studioInstaller -Algorithm SHA256).Hash -ne $studioVerification.SHA256) { throw 'Installer verification is missing or no longer matches.' }
if (-not (Test-Path -LiteralPath (Join-Path $studioBackup 'manifest.json'))) { throw 'Verified project backup is required.' }
if (@(Get-Process -Name 'Elleson Studio' -ErrorAction SilentlyContinue | Where-Object { $_.Path -eq $studioInstalledExe }).Count) { throw 'Existing Studio is still running.' }
$studioManifest = @(Get-Content -LiteralPath (Join-Path $studioBackup 'manifest.json') -Raw | ConvertFrom-Json)
foreach ($studioRecord in $studioManifest) { if ((Get-FileHash -LiteralPath (Join-Path $studioData $studioRecord.RelativePath) -Algorithm SHA256).Hash -ne $studioRecord.SHA256) { throw 'Studio data changed since backup. Make a fresh backup before installing.' } }
$studioInstallProcess = Start-Process -FilePath $studioInstaller -ArgumentList '/S','/currentuser' -WindowStyle Hidden -PassThru
$studioInstallProcess.WaitForExit()
if ($studioInstallProcess.ExitCode -ne 0) { throw ('Installer failed with exit code ' + $studioInstallProcess.ExitCode) }
$studioRegistry = Get-ItemProperty -LiteralPath 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\1d018723-9d2d-59c9-bd8a-9629ff990230'
if ($studioRegistry.DisplayVersion -ne '0.5.0') { throw 'Installed registry version is incorrect.' }
$studioInstalledVersion = (Get-Item -LiteralPath $studioInstalledExe).VersionInfo.FileVersion
if ($studioInstalledVersion -ne '0.5.0') { throw 'Installed executable version is incorrect.' }
foreach ($studioRelative in @('Elleson Studio.exe','resources\app.asar','resources\tools\ffmpeg.exe','resources\speech\models\kokoro\kokoro-v1.0.onnx','resources\speech\models\kokoro\voices-v1.0.bin','resources\speech\models\tiny\model.bin','resources\speech\models\tts\en_GB-vctk-medium.onnx')) { if ((Get-FileHash -LiteralPath (Join-Path $studioInstalledRoot $studioRelative) -Algorithm SHA256).Hash -ne (Get-FileHash -LiteralPath (Join-Path (Join-Path $studioRelease 'win-unpacked') $studioRelative) -Algorithm SHA256).Hash) { throw ('Installed file differs: ' + $studioRelative) } }
$studioDatabaseRecords = @($studioManifest | Where-Object { $_.RelativePath.StartsWith('IndexedDB\') -or $_.RelativePath.StartsWith('Local Storage\') })
foreach ($studioRecord in $studioDatabaseRecords) { if ((Get-FileHash -LiteralPath (Join-Path $studioData $studioRecord.RelativePath) -Algorithm SHA256).Hash -ne $studioRecord.SHA256) { throw 'Saved database changed during installation.' } }
[pscustomobject]@{ Version=$studioInstalledVersion; InstallerExitCode=$studioInstallProcess.ExitCode; InstalledExe=$studioInstalledExe; ProjectBackup=$studioBackup; SavedDatabaseFilesUnchanged=$studioDatabaseRecords.Count; InstalledFilesMatch=$true; InstalledAt=(Get-Date -Format o) } | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $studioRelease 'installation-verification.json') -Encoding utf8
Get-Content -LiteralPath (Join-Path $studioRelease 'installation-verification.json')
