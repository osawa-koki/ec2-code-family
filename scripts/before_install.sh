#!/bin/bash

# Install Python packages for FastAPI application
# You should use AMI which has packages(down below) installed for faster deployment.
yum update -y
yum install -y python3-pip
pip3 install fastapi uvicorn[standard]

mkdir -p /home/ec2-user/fastapi-app
