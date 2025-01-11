#!/bin/bash

cd /home/ec2-user/fastapi-app

nohup uvicorn main:app --host 0.0.0.0 --port 8000 > /dev/null 2>&1 &
echo $! > /home/ec2-user/fastapi-app/app.pid
