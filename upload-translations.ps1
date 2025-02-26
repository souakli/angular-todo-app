$token = "c7184a5189a10521e223c3a3339e06b0272edada"
$projectId = "7835424467bf5c965b0411.50285011"

# Upload the source file
$boundary = [System.Guid]::NewGuid().ToString()
$filePath = "src/locale/messages.xlf"
$fileContent = [System.IO.File]::ReadAllBytes($filePath)
$fileContentBase64 = [System.Convert]::ToBase64String($fileContent)

$body = @{
    filename = "messages.xlf"
    data = $fileContentBase64
    lang_iso = "fr"
    convert_placeholders = $true
} | ConvertTo-Json

$headers = @{
    "X-Api-Token" = $token
    "Content-Type" = "application/json"
}

$uploadUrl = "https://api.lokalise.com/api2/projects/$projectId/files/upload"

Invoke-RestMethod -Uri $uploadUrl -Method Post -Headers $headers -Body $body
