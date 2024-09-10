Make .env file and add all the detail which is present in .env.local
Write any DB_PASSWORD and DB_USER
Make sure there is Docker is present on the device

docker --version
docker-compose --version

if(present){
    docker-compose build
    docker-compose up
}
else{
    Install Docker desktop "https://www.docker.com/products/docker-desktop/"
}

PostgreSQL instance running on port 5432
Node.js server running on 8080