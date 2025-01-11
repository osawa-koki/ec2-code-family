import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

interface NetworkStackProps extends cdk.StackProps {
  stackName: string;
}

export default class NetworkStack extends cdk.Stack {
  public readonly vpc: ec2.Vpc;
  public readonly selectedSubnets: ec2.SelectedSubnets;

  constructor(scope: Construct, id: string, props: NetworkStackProps) {
    const { stackName } = props;

    super(scope, id, {
      ...props,
      stackName,
    });

    const vpc = new ec2.Vpc(this, 'MyVpc', {
      maxAzs: 2,
      natGateways: 0,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'public-subnet',
          subnetType: ec2.SubnetType.PUBLIC,
        },
      ],
    });

    this.vpc = vpc;
    this.selectedSubnets = vpc.selectSubnets({ subnetGroupName: 'public-subnet' });
  }
}
