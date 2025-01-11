import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

import NetworkStack from './network/network';
import ComputeStack from './compute/compute';

export class IndexStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, {
      ...props,
      stackName: process.env.BASE_STACK_NAME!,
    });

    const networkStack = new NetworkStack(this, 'NetworkStack', {
      stackName: `${process.env.BASE_STACK_NAME!}-network`,
    });

    const computeStack = new ComputeStack(this, 'ComputeStack', {
      stackName: `${process.env.BASE_STACK_NAME!}-compute`,
      vpc: networkStack.vpc,
      selectedSubnets: networkStack.selectedSubnets,
      deployGroup: process.env.BASE_STACK_NAME!,
    });
    computeStack.addDependency(networkStack);
  }
}
