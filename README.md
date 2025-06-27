# Budget Tracker

A modern, feature-rich budget tracking application built with React, Node.js, and SQLite.

## Features

- 📊 **Real-time budget tracking** with income and expense management
- 🏷️ **Categorized entries** with color-coded organization
- 📅 **Multiple period views**: Current period, Timeline, and Calendar views
- 🔍 **Search and filtering** capabilities
- 📈 **Visual expense breakdown** with interactive pie charts
- 🌓 **Dark/Light mode** toggle
- 💾 **Automatic saving** with network sync
- 📱 **Responsive design** for mobile and desktop
- 🏃‍♂️ **Quick calculations** with running totals preview

## Quick Start with Docker

### Option 1: Docker Compose (Recommended)

```bash
# Clone or navigate to the project directory
cd /home/ad/Project/Budget

# Build and start the application
docker-compose up -d

# Access the application
open http://localhost:3001
```

### Option 2: Docker Build & Run

```bash
# Build the Docker image
docker build -t budget-tracker .

# Run the container
docker run -d \
  --name budget-tracker \
  -p 3001:3001 \
  -v budget_data:/app/data \
  budget-tracker

# Access the application
open http://localhost:3001
```

## Network Access

The application will be accessible on your network at:
- **Local**: http://localhost:3001
- **Network**: http://YOUR_IP_ADDRESS:3001

Replace `YOUR_IP_ADDRESS` with your machine's IP address to access from other devices on your network.

## Development Setup

If you want to run it locally without Docker:

```bash
# Install dependencies
npm install

# Start the development server and backend
npm start

# Or run them separately:
npm run server  # Backend on port 3001
npm run dev     # Frontend on port 5173
```

## Data Persistence

- **Docker**: Data is persisted in a Docker volume (`budget_data`)
- **Local**: Data is stored in `budget.db` SQLite file

## Docker Commands

```bash
# View logs
docker-compose logs -f

# Stop the application
docker-compose down

# Update the application
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Backup database
docker run --rm -v budget_data:/data -v $(pwd):/backup alpine tar czf /backup/budget-backup.tar.gz -C /data .

# Restore database
docker run --rm -v budget_data:/data -v $(pwd):/backup alpine tar xzf /backup/budget-backup.tar.gz -C /data
```

## Environment Variables

- `NODE_ENV`: Set to `production` in Docker
- `PORT`: Server port (default: 3001)

## Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Vite
- **Backend**: Node.js, Express, SQLite
- **Containerization**: Docker, Docker Compose
- **Icons**: Lucide React

## License

This project is open source and available under the [MIT License](LICENSE).