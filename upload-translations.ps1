$token = "734e16be07a04592870ce8847b9213ae1c601c6f"
$projectId = "7835424467bf5c965b0411.50285011"

# Prepare the file content
Write-Host "Reading source file..."
$filePath = "src/locale/messages.xlf"
$fileContent = [System.IO.File]::ReadAllBytes($filePath)
$fileContentBase64 = [System.Convert]::ToBase64String($fileContent)

$body = @{
    filename = "messages.xlf"
    data = $fileContentBase64
    lang_iso = "fr"
    detect_icu_plurals = $true
    convert_placeholders = $true
    replace_modified = $false
    apply_tm = $true
    tags = @("angular")
} | ConvertTo-Json

$headers = @{
    "X-Api-Token" = $token
    "Accept" = "application/json"
    "Content-Type" = "application/json"
}

$uploadUrl = "https://api.lokalise.com/api2/projects/$projectId/files/upload"

Write-Host "Uploading to Lokalise..."
Write-Host "URL: $uploadUrl"
Write-Host "Headers:"
$headers | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri $uploadUrl -Method Post -Headers $headers -Body $body -Verbose
    Write-Host "Response:"
    $response | ConvertTo-Json
    Write-Host "Upload successful!"
} catch {
    Write-Host "Error: $_"
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)"
    Write-Host "Status Description: $($_.Exception.Response.StatusDescription)"
    
    if ($_.ErrorDetails) {
        Write-Host "Error Details: $($_.ErrorDetails.Message)"
    }
    exit 1
}
