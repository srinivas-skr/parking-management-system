#!/bin/bash

echo "🚀 Building Parking Management System Docker Image..."

# Build the Docker image
docker build -t parking-system:1.0.0 -t parking-system:latest .

if [ $? -eq 0 ]; then
    echo "✅ Docker image built successfully!"
    echo ""
    echo "Image Details:"
    docker images | grep parking-system
    echo ""
    echo "To run the application:"
    echo "  docker-compose -f docker-compose.prod.yml up -d"
    echo ""
    echo "To view logs:"
    echo "  docker-compose -f docker-compose.prod.yml logs -f parking-app"
    echo ""
    echo "To stop:"
    echo "  docker-compose -f docker-compose.prod.yml down"
else
    echo "❌ Docker build failed!"
    exit 1
fi
