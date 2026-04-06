# Script to run database migrations for WellMate
# This script creates all the necessary tables in MySQL

Write-Host "🚀 Starting database migrations..." -ForegroundColor Green

# Check if mysql command exists
$mysqlPath = Get-Command mysql -ErrorAction SilentlyContinue

if (-not $mysqlPath) {
    Write-Host "❌ MySQL client not found. Please install MySQL and add it to PATH." -ForegroundColor Red
    Write-Host "   Or run manually: mysql -u root WellMate < database_setup.sql" -ForegroundColor Yellow
    exit 1
}

# Run the migration
Write-Host "📦 Creating tables in 'WellMate' database..." -ForegroundColor Cyan

try {
    $sqlFile = Join-Path $PSScriptRoot "database_setup.sql"
    
    if (-not (Test-Path $sqlFile)) {
        Write-Host "❌ database_setup.sql not found at: $sqlFile" -ForegroundColor Red
        exit 1
    }

    # Execute the SQL migration
    mysql -u root WellMate < $sqlFile
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Migrations completed successfully!" -ForegroundColor Green
        Write-Host "   Tables created:" -ForegroundColor Green
        Write-Host "   • users" -ForegroundColor Green
        Write-Host "   • weight_goals" -ForegroundColor Green
        Write-Host "   • meals" -ForegroundColor Green
        Write-Host "   • health_logs" -ForegroundColor Green
        Write-Host "   • health_events" -ForegroundColor Green
        Write-Host "   • physical_activities" -ForegroundColor Green
        Write-Host "   • smoking_logs" -ForegroundColor Green
        Write-Host "   • sport_programs" -ForegroundColor Green
    } else {
        Write-Host "❌ Migration failed with exit code: $LASTEXITCODE" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
    exit 1
}
