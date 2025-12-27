#!/bin/bash

# Test Setup Script
# This script ensures the test environment is properly configured before running tests

set -e  # Exit on error

echo "🔧 Setting up test environment..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env.test exists
if [ ! -f ".env.test" ]; then
    echo -e "${RED}❌ .env.test file not found${NC}"
    echo "Creating .env.test..."
    cat > .env.test << EOF
# Test Environment Configuration
DATABASE_TEST_URL="postgresql://postgres:postgres@localhost:5433/inventory_test"
JWT_SECRET="test-jwt-secret-key-do-not-use-in-production"
NODE_ENV="test"
EOF
    echo -e "${GREEN}✅ Created .env.test${NC}"
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running${NC}"
    echo "Please start Docker and try again"
    exit 1
fi

echo -e "${GREEN}✅ Docker is running${NC}"

# Check if test database container exists
if docker ps -a | grep -q inventory-test-db; then
    echo -e "${YELLOW}���️  Test database container exists${NC}"
    
    # Check if it's running
    if docker ps | grep -q inventory-test-db; then
        echo -e "${GREEN}✅ Test database is running${NC}"
    else
        echo "Starting test database..."
        docker-compose -f docker-compose.test.yml up -d
        echo -e "${GREEN}✅ Test database started${NC}"
    fi
else
    echo "Creating and starting test database..."
    docker-compose -f docker-compose.test.yml up -d
    echo -e "${GREEN}✅ Test database created and started${NC}"
fi

# Wait for database to be ready
echo "Waiting for database to be ready..."
sleep 3

# Check database connection
if docker exec inventory-test-db pg_isready -U postgres > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Database is ready${NC}"
else
    echo -e "${RED}❌ Database is not ready${NC}"
    echo "Waiting a bit longer..."
    sleep 5
    
    if docker exec inventory-test-db pg_isready -U postgres > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Database is ready${NC}"
    else
        echo -e "${RED}❌ Database failed to start${NC}"
        echo "Check logs with: docker logs inventory-test-db"
        exit 1
    fi
fi

# Run migrations
echo "Running database migrations..."
if pnpm --filter @inventory/db prisma migrate deploy > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Migrations completed${NC}"
else
    echo -e "${YELLOW}⚠️  Migrations may have failed (this might be okay if already applied)${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Test environment is ready!${NC}"
echo ""
echo "You can now run tests with:"
echo "  pnpm test                    # Run backend tests"
echo "  pnpm test:all                # Run all package tests"
echo "  pnpm test:watch              # Run tests in watch mode"
echo "  pnpm --filter backend test:coverage  # Run with coverage"
echo ""
echo "To stop the test database:"
echo "  docker-compose -f docker-compose.test.yml down"
echo ""
