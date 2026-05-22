if [ "$1" = "start" ]; then
    echo "Starting development environment..."
    docker-compose up -d && docker exec -it ollama ollama pull sqlcoder:7b
elif [ "$1" = "stop" ]; then
    echo "Stopping development environment..."
    docker-compose down
elif [ "$1" = "restart" ]; then
    echo "Restarting development environment..."
    docker-compose down && docker-compose up -d && docker exec -it ollama ollama pull sqlcoder:7b
elif [ "$1" = "dev" ]; then
    echo "Starting production environment..."
    docker-compose down && docker-compose build && docker-compose up -d && docker exec -it ollama ollama pull sqlcoder:7b && docker-compose logs -f
else
    echo "Usage: ./start.sh [dev|prod]"
    exit 1
fi



