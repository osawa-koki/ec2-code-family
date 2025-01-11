FROM amazonlinux:2

WORKDIR /home/ec2-user/fastapi-app
EXPOSE 8000

RUN yum update -y && \
    yum install -y python3-pip && \
    yum clean all

COPY ./scripts/ ./scripts/
RUN chmod +x ./scripts/*
RUN ./scripts/before_install.sh
COPY ./main.py .

# Ref: ./scripts/start_application.sh
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
