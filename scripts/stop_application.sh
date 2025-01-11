#!/bin/bash

if [ -f /home/ec2-user/fastapi-app/app.pid ]; then
  pid=$(cat /home/ec2-user/fastapi-app/app.pid)
  kill -9 $pid || true
  rm /home/ec2-user/fastapi-app/app.pid
fi
