cd C:\Users\jsky6\nxt\nxt-app

# load env
$envFile = ".env.local"
Get-Content $envFile | ForEach-Object {
  if ($_ -match "^(.*?)=(.*)$") {
    [System.Environment]::SetEnvironmentVariable($matches[1], $matches[2])
  }
}

# start server (if not running)
Start-Process powershell -ArgumentList "npm run dev" -WindowStyle Hidden
Start-Sleep -Seconds 10

# call admin tool
$body = @{ token=$env:ADMIN_TOKEN; limit=10 } | ConvertTo-Json
Invoke-RestMethod -Method POST -Uri http://localhost:3000/api/run -ContentType "application/json" -Body $body
