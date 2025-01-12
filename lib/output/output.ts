import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

interface OutputStackProps extends cdk.StackProps {
  stackName: string;
  computeStackName: string;
}

export default class OutputStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: OutputStackProps) {
    const { stackName, computeStackName } = props;

    super(scope, id, {
      ...props,
      stackName,
    });

    const ec2PublicIp = cdk.Fn.importValue(
      `${computeStackName}-ec2-public-ip`
    );

    new cdk.CfnOutput(this, 'EC2InstancePublicIp', {
      value: ec2PublicIp,
    });
  }
}
