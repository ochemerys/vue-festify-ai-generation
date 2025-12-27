@echo off
REM Test Setup Script for Windows
REM This script ensures the test environment is properly configured before running tests

echo Setting up test environment...
echo.

REM Check if .env.test exists
if not exist ".env.test" (
    echo Creating .env.test...
    (
        echo # Test Environment Configuration
        echo DATABASE_TEST_URL="postgresql://postgres:postgres@localhost:5433/inventory_test"
        echo JWT_SECRET="test-jwt-secret-key-do-not-use-in-production"
        echo NODE_ENV="test"
    ) > .env.test
    echo [OK] Created .env.test
)

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not running
    echo Please start Docker Desktop and try again
    exit /b 1
)
echo [OK] Docker is running

REM Check if test database container exists
docker ps -a | findstr inventory-test-db >nul 2>&1
if errorlevel 1 (
    echo Creating and starting test database...
    docker-compose -f docker-compose.test.yml up -d
    echo [OK] Test database created and started
) else (
    REM Check if it's running
    docker ps | findstr inventory-test-db >nul 2>&1
    if errorlevel 1 (
        echo Starting test database...
        docker-compose -f docker-compose.test.yml up -d
        echo [OK] Test database started
    ) else (
        echo [OK] Test database is running
    )
)

REM Wait for database to be ready
echo Waiting for database to be ready...
timeout /t 3 /nobreak >nul

REM Check database connection
docker exec inventory-test-db pg_isready -U postgres >nul 2>&1
if errorlevel 1 (
    echo Waiting a bit longer...
    timeout /t 5 /nobreak >nul
    docker exec inventory-test-db pg_isready -U postgres >nul 2>&1
    if errorlevel 1 (
        echo [ERROR] Database failed to start
        echo Check logs with: docker logs inventory-test-db
        exit /b 1
    )
)
echo [OK] Database is ready

REM Run migrations
echo Running database migrations...
pnpm --filter @inventory/db prisma migrate deploy >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Migrations may have failed (this might be okay if already applied^)
) else (
    echo [OK] Migrations completed
)

echo.
echo ========================================
echo Test environment is ready!
echo ========================================
echo.
echo You can now run tests with:
echo   pnpm test                    # Run backend tests
echo   pnpm test:all                # Run all package tests
echo   pnpm test:watch              # Run tests in watch mode
echo   pnpm --filter backend test:coverage  # Run with coverage
echo.
echo To stop the test database:
echo   docker-compose -f docker-compose.test.yml down
echo.
