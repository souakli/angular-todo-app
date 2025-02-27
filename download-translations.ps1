$token = "734e16be07a04592870ce8847b9213ae1c601c6f"
$projectId = "7835424467bf5c965b0411.50285011"

$headers = @{
    "X-Api-Token" = $token
}

$downloadUrl = "https://api.lokalise.com/api2/projects/$projectId/files/download"

# Corps de la requête minimal
$body = "format=xliff&langs=fr,en,ar"

Write-Host "Sending request to Lokalise..."
Write-Host "URL: $downloadUrl"
Write-Host "Body: $body"

try {
    $response = Invoke-RestMethod -Uri $downloadUrl -Method Post -Headers $headers -Body $body -ContentType "application/x-www-form-urlencoded"
    Write-Host "Response:"
    $response | ConvertTo-Json
    
    if ($response.bundle_url) {
        Write-Host "Downloading bundle from: $($response.bundle_url)"
        Invoke-WebRequest -Uri $response.bundle_url -OutFile "translations.zip"
        
        Write-Host "Extracting translations..."
        Expand-Archive -Path "translations.zip" -DestinationPath "src/locale" -Force
        Remove-Item "translations.zip"
        Write-Host "Translations downloaded and extracted successfully!"
    } else {
        throw "No bundle URL in response"
    }
} catch {
    Write-Host "Error: $_"
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)"
    Write-Host "Status Description: $($_.Exception.Response.StatusDescription)"
    exit 1
}
