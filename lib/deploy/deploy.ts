import * as cdk from 'aws-cdk-lib';
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline';
import * as codepipeline_actions from 'aws-cdk-lib/aws-codepipeline-actions';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as codedeploy from 'aws-cdk-lib/aws-codedeploy';
import { Construct } from 'constructs';

interface DeployStackProps extends cdk.StackProps {
  stackName: string;
  deploymentGroupName: string;
}

export default class DeployStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: DeployStackProps) {
    const { stackName, deploymentGroupName } = props;

    super(scope, id, {
      ...props,
      stackName,
    });

    const deployGroup = new codepipeline.Pipeline(this, 'DeployGroup', {
      pipelineName: `${stackName}-pipeline`,
    });

    const sourceStage = deployGroup.addStage({
      stageName: 'Source',
    });
    const sourceOutput = new codepipeline.Artifact();
    const sourceAction = new codepipeline_actions.GitHubSourceAction({
      actionName: 'GitHub_Source',
      owner: process.env.GITHUB_OWNER!,
      repo: process.env.GITHUB_REPO!,
      branch: process.env.GITHUB_BRANCH!,
      oauthToken: cdk.SecretValue.unsafePlainText(process.env.GITHUB_PERSONAL_ACCESS_TOKEN!),
      output: sourceOutput,
    });
    sourceStage.addAction(sourceAction);

    const buildStage = deployGroup.addStage({
      stageName: 'Build',
    });
    const buildOutput = new codepipeline.Artifact();
    const buildAction = new codepipeline_actions.CodeBuildAction({
      actionName: 'CodeBuild',
      project: new codebuild.PipelineProject(this, 'MyProject', {
        projectName: `${stackName}-build`,
      }),
      input: sourceOutput,
      outputs: [buildOutput],
    });
    buildStage.addAction(buildAction);

    const deployStage = deployGroup.addStage({
      stageName: 'Deploy',
    });
    const application = new codedeploy.ServerApplication(this, 'Application', {
      applicationName: 'MyApplication'
    });
    const deploymentGroup = new codedeploy.ServerDeploymentGroup(this, 'DeploymentGroup', {
      deploymentGroupName: deploymentGroupName,
      application: application,
      ec2InstanceTags: new codedeploy.InstanceTagSet({
        'DeployGroup': [deploymentGroupName],
      })
    });
    const deployAction = new codepipeline_actions.CodeDeployServerDeployAction({
      actionName: 'CodeDeploy',
      input: buildOutput,
      deploymentGroup: deploymentGroup,
    });
    deployStage.addAction(deployAction);
  }
}
