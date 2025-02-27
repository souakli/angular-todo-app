$token = "c7184a5189a10521e223c3a3339e06b0272edada"
$projectId = "7835424467bf5c965b0411.50285011"

$headers = @{
    "X-Api-Token" = $token
    "Content-Type" = "application/json"
}

$body = @{
    format = "xliff"
    original_filenames = $false
    bundle_structure = "%LANG_ISO%.%FORMAT%"
    filter_langs = @("fr", "en", "ar")
    export_empty_as = "base"
    replace_breaks = $false
    include_tags = @("angular")
    export_sort = "first_added"
    indentation = "2sp"
    directory_prefix = "src/locale/"
} | ConvertTo-Json

$downloadUrl = "https://api.lokalise.com/api2/projects/$projectId/files/download"

$response = Invoke-RestMethod -Uri $downloadUrl -Method Post -Headers $headers -Body $body

Write-Host "Response from Lokalise:"
Write-Host ($response | ConvertTo-Json)

# Le lien de téléchargement est dans $response.bundle_url
if ($response.bundle_url) {
    Write-Host "Downloading translations..."
    Invoke-WebRequest -Uri $response.bundle_url -OutFile "translations.zip"
    
    Write-Host "Extracting translations..."
    Expand-Archive -Path "translations.zip" -DestinationPath "." -Force
    
    Write-Host "Cleaning up..."
    Remove-Item "translations.zip"
    
    Write-Host "Done!"
} else {
    Write-Error "No bundle URL in response"
    Write-Error ($response | ConvertTo-Json)
    exit 1
}
