Write-Host "Stashing local changes..."
git stash save "Local work before pull"

Write-Host "Creating backup directory..."
New-Item -ItemType Directory -Force -Path ".git_backup" | Out-Null

Write-Host "Moving untracked files..."
$filesToBackup = @(
    "app/admin/_components/DashboardClient.tsx",
    "public/uploads/news/news_1774875602619.webp",
    "scripts/create-admin.js",
    "scripts/migrate-admin-pool.js",
    "scripts/migrate-admin-to-mongo.js"
)

foreach ($file in $filesToBackup) {
    if (Test-Path $file) {
        $dest = Join-Path ".git_backup" (Split-Path $file -Leaf)
        Move-Item -Path $file -Destination $dest -Force
        Write-Host "Moved $file"
    }
}

Write-Host "Pulling changes..."
git pull

Write-Host "Restoring stashed changes..."
git stash pop
