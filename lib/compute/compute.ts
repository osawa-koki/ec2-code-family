import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
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
      ec2.Port.tcp(80),
      'Allow HTTP traffic'
    );
    securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(443),
      'Allow HTTPS traffic for CodeDeploy agent'
    );

    const ec2Instance = new ec2.Instance(this, 'MyInstance', {
      vpc: props.vpc,
      vpcSubnets: props.selectedSubnets,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.NANO),
      machineImage: ec2.MachineImage.latestAmazonLinux2023(),
      securityGroup: securityGroup,
    });
    cdk.Tags.of(ec2Instance).add('DeployGroup', deploymentGroupName);

    this.ec2Instance = ec2Instance;
  }
}
