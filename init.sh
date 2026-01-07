#!/bin/bash

# Everything - Personal Habit/Goal Tracker
# Initialization Script for Development Environment

set -e

echo "=========================================="
echo "  Everything - Development Setup"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js version
echo -e "\n${YELLOW}Checking Node.js version...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js is not installed. Please install Node.js 18+ first.${NC}"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}Node.js version 18+ is required. Current version: $(node -v)${NC}"
    exit 1
fi
echo -e "${GREEN}Node.js $(node -v) detected${NC}"

# Check PostgreSQL
echo -e "\n${YELLOW}Checking PostgreSQL...${NC}"
if ! command -v psql &> /dev/null; then
    echo -e "${RED}PostgreSQL is not installed or not in PATH.${NC}"
    echo "Please install PostgreSQL and ensure 'psql' is available."
    exit 1
fi
echo -e "${GREEN}PostgreSQL detected${NC}"

# Create environment file if it doesn't exist
if [ ! -f .env ]; then
    echo -e "\n${YELLOW}Creating .env file...${NC}"
    cat > .env << 'EOF'
# Database Configuration
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/everything?schema=public"

# Photo Storage Directory (change to your preferred location)
PHOTO_STORAGE_DIR="./uploads/photos"

# Application Settings
NODE_ENV=development
NEXT_PUBLIC_APP_NAME="Everything"
EOF
    echo -e "${GREEN}.env file created${NC}"
    echo -e "${YELLOW}Please update DATABASE_URL with your PostgreSQL credentials if different${NC}"
else
    echo -e "${GREEN}.env file already exists${NC}"
fi

# Install dependencies
echo -e "\n${YELLOW}Installing dependencies...${NC}"
npm install

# Create uploads directory for photos
echo -e "\n${YELLOW}Creating uploads directory...${NC}"
mkdir -p uploads/photos
echo -e "${GREEN}Uploads directory created${NC}"

# Generate Prisma client
echo -e "\n${YELLOW}Generating Prisma client...${NC}"
npx prisma generate

# Check if database exists and run migrations
echo -e "\n${YELLOW}Setting up database...${NC}"
echo "Attempting to run Prisma migrations..."

# Try to push schema to database
if npx prisma db push --accept-data-loss 2>/dev/null; then
    echo -e "${GREEN}Database schema applied successfully${NC}"
else
    echo -e "${YELLOW}Could not apply schema automatically.${NC}"
    echo "Please ensure PostgreSQL is running and DATABASE_URL is correct in .env"
    echo "Then run: npx prisma db push"
fi

# Seed predefined data (categories, achievements, etc.)
echo -e "\n${YELLOW}Seeding initial data...${NC}"
if npm run seed 2>/dev/null; then
    echo -e "${GREEN}Initial data seeded successfully${NC}"
else
    echo -e "${YELLOW}Seed script not available yet or failed${NC}"
    echo "This will be set up during implementation"
fi

echo -e "\n=========================================="
echo -e "${GREEN}  Setup Complete!${NC}"
echo "=========================================="
echo ""
echo "To start the development server:"
echo -e "  ${GREEN}npm run dev${NC}"
echo ""
echo "The app will be available at:"
echo -e "  ${GREEN}http://localhost:3000${NC}"
echo ""
echo "Other useful commands:"
echo "  npm run build     - Build for production"
echo "  npm run lint      - Run ESLint"
echo "  npx prisma studio - Open Prisma database viewer"
echo ""
echo "=========================================="
