# deploy.ps1 — 1-Click GitHub Pages Deployment Script for LUNA GLOW

$RepoUrl = "https://github.com/Ar-Rawi/Luna-Glow.git"
$moonDir = "C:\Users\kp\OneDrive\Workspace\Agency Farm\moon-app"
Set-Location $moonDir

Write-Host "LUNA GLOW 24/7 GitHub Pages Deployment Pipeline"

git config --global user.name "Ar-Rawi"
git config --global user.email "ar-rawi@users.noreply.github.com"

if (-not (Test-Path "$moonDir\.git")) {
    git init
}

git checkout -B main
git remote remove origin 2>$null
git remote add origin $RepoUrl

Write-Host "Staging files for deployment..."
git add .
git commit -m "Deploy LUNA GLOW 24/7 Marine Observatory to GitHub Pages"

Write-Host "Pushing to GitHub main branch..."
git push -u origin main --force

Write-Host "Deployment Code Pushed Successfully!"
