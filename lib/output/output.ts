import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

interface OutputStackProps extends cdk.StackProps {
  stackName: string;
  ec2InstancePublicIp: string;
}

export default class OutputStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: OutputStackProps) {
    const { stackName, ec2InstancePublicIp } = props;

    super(scope, id, {
      ...props,
      stackName,
    });

    new cdk.CfnOutput(this, 'EC2InstancePublicIp', {
      value: ec2InstancePublicIp,
    });
  }
}
