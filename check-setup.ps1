# SkillTrade Setup Checker

Write-Host "🔍 Checking SkillTrade Setup..." -ForegroundColor Cyan
Write-Host ""

# Check Node.js
Write-Host "📦 Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found! Please install Node.js" -ForegroundColor Red
}

# Check npm
Write-Host "📦 Checking npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "✅ npm installed: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm not found!" -ForegroundColor Red
}

# Check MongoDB
Write-Host "🗄️ Checking MongoDB..." -ForegroundColor Yellow
try {
    $mongoService = Get-Service -Name MongoDB -ErrorAction Stop
    if ($mongoService.Status -eq "Running") {
        Write-Host "✅ MongoDB is running" -ForegroundColor Green
    } else {
        Write-Host "⚠️ MongoDB service found but not running. Start it with: net start MongoDB" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️ MongoDB service not found. Make sure MongoDB is installed" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📁 Checking Project Files..." -ForegroundColor Yellow

# Check backend .env
if (Test-Path ".\backend\.env") {
    Write-Host "✅ Backend .env file exists" -ForegroundColor Green
} else {
    Write-Host "❌ Backend .env missing! Copy from .env.example" -ForegroundColor Red
}

# Check frontend .env
if (Test-Path ".\frontend\.env") {
    Write-Host "✅ Frontend .env file exists" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend .env missing! Copy from .env.example" -ForegroundColor Red
}

# Check Firebase service account
if (Test-Path ".\backend\firebase-service-account.json") {
    Write-Host "✅ Firebase service account file exists" -ForegroundColor Green
} else {
    Write-Host "⚠️ Firebase service account missing! Download from Firebase Console" -ForegroundColor Yellow
}

# Check node_modules
if (Test-Path ".\backend\node_modules") {
    Write-Host "✅ Backend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "❌ Backend dependencies not installed. Run: cd backend && npm install" -ForegroundColor Red
}

if (Test-Path ".\frontend\node_modules") {
    Write-Host "✅ Frontend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend dependencies not installed. Run: cd frontend && npm install" -ForegroundColor Red
}

Write-Host ""
Write-Host "📝 Summary:" -ForegroundColor Cyan
Write-Host "1. Make sure MongoDB is running" -ForegroundColor White
Write-Host "2. Configure .env files with your Firebase credentials" -ForegroundColor White
Write-Host "3. Install dependencies if not already done" -ForegroundColor White
Write-Host "4. Run 'npm run dev' in both backend and frontend folders" -ForegroundColor White
Write-Host ""
Write-Host "📚 Need help? Check QUICKSTART_FIREBASE.md" -ForegroundColor Green
