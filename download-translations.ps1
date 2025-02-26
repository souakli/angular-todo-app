$token = "c7184a5189a10521e223c3a3339e06b0272edada"
$projectId = "7835424467bf5c965b0411.50285011"

$headers = @{
    "X-Api-Token" = $token
    "Content-Type" = "application/json"
}

$body = @{
    format = "xliff"
    original_filenames = $false
    bundle_structure = "src/locale/%LANG_ISO%.%FORMAT%"
    filter_langs = @("fr", "en", "ar")
    export_empty_as = "base"
    replace_breaks = $false
} | ConvertTo-Json

$downloadUrl = "https://api.lokalise.com/api2/projects/$projectId/files/download"

$response = Invoke-RestMethod -Uri $downloadUrl -Method Post -Headers $headers -Body $body

# Le lien de téléchargement est dans $response.bundle_url
Invoke-WebRequest -Uri $response.bundle_url -OutFile "translations.zip"

# Décompresser le fichier
Expand-Archive -Path "translations.zip" -DestinationPath "." -Force

# Nettoyer
Remove-Item "translations.zip"
