docker stop aimix
docker rm aimix
docker build -t aimix .
docker run -d --name aimix -p 20128:20128 --env-file .env -v aimix-data:/app/data aimix