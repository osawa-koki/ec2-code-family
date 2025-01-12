import * as fs from 'fs';
import * as os from 'os';
import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

interface ComputeStackProps extends cdk.StackProps {
  stackName: string;
  vpc: ec2.Vpc;
  selectedSubnets: ec2.SelectedSubnets;
  deploymentGroupName: string;
}

export default class ComputeStack extends cdk.Stack {
  public readonly ec2Instance: ec2.Instance;
  constructor(scope: Construct, id: string, props: ComputeStackProps) {
    const { stackName, deploymentGroupName } = props;

    super(scope, id, {
      ...props,
      stackName,
    });

    const securityGroup = new ec2.SecurityGroup(this, 'MySecurityGroup', {
      vpc: props.vpc,
      allowAllOutbound: true,
      description: 'Security group for EC2 instance with CodeDeploy',
    });
    securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(8000),
      'Allow HTTP traffic'
    );
    securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(443),
      'Allow HTTPS traffic for CodeDeploy agent'
    );
    securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(22),
      'Allow SSH access'
    );

    const publicKeyPath = process.env.SSH_PUBLIC_KEY_MATERIAL_PATH!.replace('~', os.homedir());
    const keyPair = new ec2.KeyPair(this, 'MyKeyPair', {
      keyPairName: `${stackName}-key-pair`,
      publicKeyMaterial: fs.readFileSync(publicKeyPath, 'utf8'),
    });

    const instanceRole = new iam.Role(this, 'MyInstanceRole', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AWSCodeDeployFullAccess'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonS3ReadOnlyAccess'),
      ],
    });
    instanceRole.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'codedeploy:*',
        'codedeploy-commands-secure:*',
        's3:Get*',
        's3:List*'
      ],
      resources: ['*'],
    }));

    const ec2Instance = new ec2.Instance(this, 'MyInstance', {
      vpc: props.vpc,
      vpcSubnets: props.selectedSubnets,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.NANO),
      machineImage: ec2.MachineImage.latestAmazonLinux2023(),
      securityGroup: securityGroup,
      keyPair: keyPair,
      role: instanceRole,
    });
    ec2Instance.userData.addCommands(
      'sudo yum update -y',
      'sudo yum install -y ruby wget',
      'wget https://aws-codedeploy-ap-northeast-1.s3.amazonaws.com/latest/install',
      'chmod +x ./install',
      'sudo ./install auto',
      'sudo systemctl enable codedeploy-agent',
      'sudo systemctl start codedeploy-agent'
    );
    cdk.Tags.of(ec2Instance).add('DeployGroup', deploymentGroupName);

    new cdk.CfnOutput(this, 'EC2InstancePublicIp', {
      value: ec2Instance.instancePublicIp,
      exportName: `${stackName}-ec2-public-ip`,
    });

    this.ec2Instance = ec2Instance;
  }
}
