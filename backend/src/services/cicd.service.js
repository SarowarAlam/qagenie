/**
 * CI/CD Template Generator
 * Generates GitHub Actions or Jenkinsfile for the generated test suite
 */

const generateGitHubActions = ({ projectName, framework }) => `# ============================================================
# QAGenie Generated - GitHub Actions CI/CD Pipeline
# Project: ${projectName}
# Framework: ${framework || 'Java/Maven + Cucumber'}
# Generated: ${new Date().toISOString()}
# ============================================================

name: QA Automation Pipeline

on:
  push:
    branches: [ main, develop, 'release/**' ]
  pull_request:
    branches: [ main, develop ]
  schedule:
    # Run regression every day at 2 AM UTC
    - cron: '0 2 * * *'
  workflow_dispatch:
    inputs:
      environment:
        description: 'Target Environment'
        required: true
        default: 'staging'
        type: choice
        options: [ staging, qa, production ]
      tags:
        description: 'Cucumber Tags (e.g. @smoke or @regression)'
        required: false
        default: '@smoke'

env:
  JAVA_VERSION: '17'
  MAVEN_OPTS: '-Xmx2048m'

jobs:
  # ─── Code Quality Gate ─────────────────────────────────────────────────────
  code-quality:
    name: Code Quality Check
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Java
        uses: actions/setup-java@v4
        with:
          java-version: \${{ env.JAVA_VERSION }}
          distribution: 'temurin'
          cache: maven

      - name: Compile project
        run: mvn compile -q

      - name: Run checkstyle
        run: mvn checkstyle:check -q

  # ─── Unit & Integration Tests ─────────────────────────────────────────────
  unit-tests:
    name: Unit Tests
    needs: code-quality
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Java
        uses: actions/setup-java@v4
        with:
          java-version: \${{ env.JAVA_VERSION }}
          distribution: 'temurin'
          cache: maven

      - name: Run unit tests
        run: mvn test -Dtest="**/unit/**" -q

      - name: Publish test results
        uses: dorny/test-reporter@v1
        if: always()
        with:
          name: Unit Test Results
          path: target/surefire-reports/*.xml
          reporter: java-junit

  # ─── API Tests ────────────────────────────────────────────────────────────
  api-tests:
    name: API Tests
    needs: unit-tests
    runs-on: ubuntu-latest
    env:
      BASE_URL: \${{ vars.API_BASE_URL_STAGING }}
      API_KEY: \${{ secrets.API_KEY_STAGING }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          java-version: \${{ env.JAVA_VERSION }}
          distribution: 'temurin'
          cache: maven

      - name: Run API tests
        run: mvn test -Dcucumber.filter.tags="@api" -Denv=\${{ github.event.inputs.environment || 'staging' }}

      - name: Upload API test report
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: api-test-report
          path: target/cucumber-reports/

  # ─── UI / E2E Tests ───────────────────────────────────────────────────────
  e2e-tests:
    name: E2E UI Tests
    needs: api-tests
    runs-on: ubuntu-latest
    strategy:
      matrix:
        browser: [ chrome, firefox ]
      fail-fast: false
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          java-version: \${{ env.JAVA_VERSION }}
          distribution: 'temurin'
          cache: maven

      - name: Install browser drivers
        run: |
          if [ "\${{ matrix.browser }}" == "chrome" ]; then
            sudo apt-get update && sudo apt-get install -y google-chrome-stable
          else
            sudo apt-get update && sudo apt-get install -y firefox
          fi

      - name: Run E2E tests (\${{ matrix.browser }})
        run: |
          mvn test \\
            -Dcucumber.filter.tags="\${{ github.event.inputs.tags || '@smoke' }}" \\
            -Dbrowser=\${{ matrix.browser }} \\
            -Dheadless=true \\
            -Denv=\${{ github.event.inputs.environment || 'staging' }}

      - name: Upload screenshots on failure
        uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: failure-screenshots-\${{ matrix.browser }}
          path: target/screenshots/

      - name: Upload test report
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: e2e-report-\${{ matrix.browser }}
          path: target/cucumber-reports/

  # ─── Consolidate & Notify ─────────────────────────────────────────────────
  report:
    name: Publish Reports & Notify
    needs: [ unit-tests, api-tests, e2e-tests ]
    if: always()
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Download all artifacts
        uses: actions/download-artifact@v4
        with:
          path: all-reports/

      - name: Notify Slack on failure
        if: failure()
        uses: slackapi/slack-github-action@v1.26.0
        with:
          payload: |
            {
              "text": ":x: QA Pipeline Failed for \`\${{ github.repository }}\`",
              "blocks": [{
                "type": "section",
                "text": {
                  "type": "mrkdwn",
                  "text": ":x: *QA Pipeline Failed*\\nRepo: \`\${{ github.repository }}\`\\nBranch: \`\${{ github.ref_name }}\`\\n<\${{ github.server_url }}/\${{ github.repository }}/actions/runs/\${{ github.run_id }}|View Run>"
                }
              }]
            }
        env:
          SLACK_WEBHOOK_URL: \${{ secrets.SLACK_WEBHOOK_URL }}
          SLACK_WEBHOOK_TYPE: INCOMING_WEBHOOK
`;

const generateJenkinsfile = ({ projectName, framework }) => `// ============================================================
// QAGenie Generated - Jenkinsfile (Declarative Pipeline)
// Project: ${projectName}
// Framework: ${framework || 'Java/Maven + Cucumber'}
// Generated: ${new Date().toISOString()}
// ============================================================

pipeline {
    agent any

    tools {
        jdk 'JDK-17'
        maven 'Maven-3.9'
    }

    parameters {
        choice(
            name: 'ENVIRONMENT',
            choices: ['staging', 'qa', 'production'],
            description: 'Target environment'
        )
        string(
            name: 'CUCUMBER_TAGS',
            defaultValue: '@smoke',
            description: 'Cucumber tags to run (e.g. @regression, @smoke)'
        )
        choice(
            name: 'BROWSER',
            choices: ['chrome', 'firefox', 'edge'],
            description: 'Browser for UI tests'
        )
    }

    environment {
        MAVEN_OPTS = '-Xmx2048m -XX:MaxPermSize=512m'
        BASE_URL   = credentials("BASE_URL_\${params.ENVIRONMENT.toUpperCase()}")
        API_KEY    = credentials("API_KEY_\${params.ENVIRONMENT.toUpperCase()}")
    }

    options {
        timeout(time: 60, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '20'))
        timestamps()
        ansiColor('xterm')
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                echo "Building branch: \${env.BRANCH_NAME}"
            }
        }

        stage('Compile & Validate') {
            steps {
                sh 'mvn compile -q'
                sh 'mvn validate -q'
            }
        }

        stage('Unit Tests') {
            steps {
                sh 'mvn test -Dtest="**/unit/**" -q'
            }
            post {
                always {
                    junit 'target/surefire-reports/*.xml'
                }
            }
        }

        stage('API Tests') {
            steps {
                sh """
                    mvn test \\
                      -Dcucumber.filter.tags=@api \\
                      -Denv=\${params.ENVIRONMENT} \\
                      -DbaseUrl=\${BASE_URL}
                """
            }
            post {
                always {
                    publishHTML([
                        allowMissing: false,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'target/cucumber-reports',
                        reportFiles: 'index.html',
                        reportName: 'API Test Report'
                    ])
                }
            }
        }

        stage('E2E UI Tests') {
            steps {
                sh """
                    mvn test \\
                      -Dcucumber.filter.tags=\${params.CUCUMBER_TAGS} \\
                      -Dbrowser=\${params.BROWSER} \\
                      -Dheadless=true \\
                      -Denv=\${params.ENVIRONMENT} \\
                      -DbaseUrl=\${BASE_URL}
                """
            }
            post {
                always {
                    publishHTML([
                        allowMissing: false,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'target/cucumber-reports',
                        reportFiles: 'index.html',
                        reportName: 'E2E Test Report'
                    ])
                    archiveArtifacts artifacts: 'target/screenshots/**', allowEmptyArchive: true
                }
            }
        }

        stage('Generate Allure Report') {
            steps {
                sh 'mvn allure:report -q'
            }
            post {
                always {
                    allure([
                        includeProperties: false,
                        jdk: '',
                        properties: [],
                        reportBuildPolicy: 'ALWAYS',
                        results: [[path: 'target/allure-results']]
                    ])
                }
            }
        }
    }

    post {
        always {
            cleanWs()
        }
        failure {
            emailext(
                subject: "QA Pipeline FAILED: \${env.JOB_NAME} #\${env.BUILD_NUMBER}",
                body: """
                    <h2>QA Pipeline Failed</h2>
                    <p><b>Project:</b> \${env.JOB_NAME}</p>
                    <p><b>Build:</b> #\${env.BUILD_NUMBER}</p>
                    <p><b>Environment:</b> \${params.ENVIRONMENT}</p>
                    <p><b>Branch:</b> \${env.BRANCH_NAME}</p>
                    <p><a href="\${env.BUILD_URL}">View Build</a></p>
                """,
                recipientProviders: [[$class: 'DevelopersRecipientProvider']],
                mimeType: 'text/html'
            )
        }
        success {
            echo '✅ All QA tests passed!'
        }
    }
}
`;

module.exports = { generateGitHubActions, generateJenkinsfile };
