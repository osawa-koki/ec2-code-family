#!/bin/bash

# Install CodeDeploy agent
# You should use AMI which has packages(down below) installed for faster deployment.
yum install -y ruby wget
cd /home/ec2-user
wget https://aws-codedeploy-ap-northeast-1.s3.amazonaws.com/latest/install
chmod +x ./install
./install auto

# Install Python packages for FastAPI application
# You should use AMI which has packages(down below) installed for faster deployment.
yum update -y
yum install -y python3-pip
pip3 install fastapi uvicorn[standard]

mkdir -p /home/ec2-user/fastapi-app
