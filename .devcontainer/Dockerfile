FROM node:22
# Install the aws-cdk version that matches aws-cdk-lib in package.json
RUN npm install --global aws-cdk@2.175.1
RUN apt-get update && \
    apt-get install --yes less
