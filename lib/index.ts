import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

import NetworkStack from './network/network';
import ComputeStack from './compute/compute';
import DeployStack from './deploy/deploy';

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
      deploymentGroupName: process.env.BASE_STACK_NAME!,
    });
    computeStack.addDependency(networkStack);

    const deployStack = new DeployStack(this, 'DeployStack', {
      stackName: `${process.env.BASE_STACK_NAME!}-deploy`,
      deploymentGroupName: process.env.BASE_STACK_NAME!,
    });
    deployStack.addDependency(computeStack);
  }
}
