# ec2-code-family

🦃🦃🦃 Codeファミリーを用いてEC2にアプリケーションをデプロイしてみる！  

## 実行方法

`.env.example`をコピーして`.env`ファイルを作成します。  
中身を適切に設定してください。  
また、公開鍵ペアを作成してください。  
公開鍵のパスを`SSH_PUBLIC_KEY_MATERIAL_PATH`に設定してください。  

DevContainerに入り、以下のコマンドを実行します。  
※ `~/.aws/credentials`にAWSの認証情報があることを前提とします。  

```shell
cdk bootstrap
cdk synth
cdk deploy --require-approval never --all
```

SSHでEC2に接続するためには、以下のコマンドを実行してください。  

```shell
ssh -i <秘密鍵のパス> ec2-user@<EC2のパブリックIPアドレス>

# ssh -i ~/.ssh/id_rsa ec2-user@<EC2のパブリックIPアドレス>
```

---

GitHub Actionsでデプロイするためには、以下のシークレットを設定してください。  

| シークレット名 | 説明 |
| --- | --- |
| AWS_ROLE_ARN | IAMロールARN (Ref: https://github.com/osawa-koki/oidc-integration-github-aws) |
| AWS_REGION | AWSリージョン |
| DOTENV | `.env`ファイルの内容 |

タグをプッシュすると、GitHub Actionsがデプロイを行います。  
手動でトリガーすることも可能です。  
