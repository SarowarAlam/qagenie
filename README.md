# QAGenie — AI-Powered QA Test Generation Platform

> Transform Jira stories + Figma designs into complete test suites using Claude AI.  
> From requirements to running CI/CD in a single workflow.

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Project Structure](#project-structure)
4. [Prerequisites](#prerequisites)
5. [Quick Start](#quick-start)
6. [Configuration](#configuration)
7. [Stage 1 — Manual Test Generation](#stage-1--manual-test-generation)
8. [Stage 2 — Automation Generation](#stage-2--automation-generation)
9. [API Reference](#api-reference)
10. [Docker Deployment](#docker-deployment)
11. [CI/CD Integration](#cicd-integration)
12. [Troubleshooting](#troubleshooting)

---

## Overview

QAGenie is a full-stack web application that automates the entire QA lifecycle:

| Stage | What It Does |
|-------|-------------|
| **Stage 1** | Jira integration → Figma integration → AI analysis → Gap report → Test cases → Traceability matrix → Export |
| **Stage 2** | Cucumber feature files → Step definitions → Page objects → Test data → CI/CD pipeline |

**Tech Stack:**
- **Frontend:** React 18 + Vite + Tailwind CSS + Zustand
- **Backend:** Node.js + Express
- **AI:** Anthropic Claude (claude-opus-4-5)
- **Integrations:** Jira Cloud REST API v3, Figma REST API
- **Exports:** ExcelJS (xlsx), Puppeteer (PDF), plain text

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Browser (React SPA)                   │
│  Step 1  Step 2  Step 3  Step 4  Step 5  Step 6 … Step 10│
└────────────────────────┬────────────────────────────────┘
                         │ HTTP /api/*
┌────────────────────────▼────────────────────────────────┐
│               Express Backend (Node.js)                  │
│                                                         │
│  /api/jira/*      → JiraService  → Jira Cloud API       │
│  /api/figma/*     → FigmaService → Figma API            │
│  /api/analysis/*  → ClaudeService → Anthropic API       │
│  /api/testgen/*   → ClaudeService → Anthropic API       │
│  /api/automation/*→ ClaudeService → Anthropic API       │
│  /api/export/*    → ExcelService  → .xlsx file          │
└─────────────────────────────────────────────────────────┘
```

---

## Project Structure

```
qagenie/
├── backend/
│   ├── src/
│   │   ├── index.js              # Express server entry point
│   │   ├── routes/
│   │   │   ├── jira.routes.js    # GET /api/jira/*
│   │   │   ├── figma.routes.js   # POST /api/figma/*
│   │   │   ├── analysis.routes.js# POST /api/analysis/*
│   │   │   ├── testgen.routes.js # POST /api/testgen/*
│   │   │   ├── automation.routes.js # POST /api/automation/*
│   │   │   └── export.routes.js  # POST /api/export/*
│   │   ├── services/
│   │   │   ├── jira.service.js   # Jira Cloud API client
│   │   │   ├── figma.service.js  # Figma API client
│   │   │   ├── claude.service.js # Anthropic AI client
│   │   │   ├── excel.service.js  # XLSX export
│   │   │   └── cicd.service.js   # CI/CD template generator
│   │   └── utils/
│   │       └── logger.js         # Winston logger
│   ├── .env.example
│   ├── package.json
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx               # Root, step router
│   │   ├── main.jsx
│   │   ├── index.css             # Tailwind + custom classes
│   │   ├── components/
│   │   │   └── Layout.jsx        # Sidebar navigation
│   │   ├── pages/
│   │   │   ├── Step1Jira.jsx     # Project → Epic → Story picker
│   │   │   ├── Step2Figma.jsx    # Figma URL connection
│   │   │   ├── Step3Analysis.jsx # AI requirement analysis
│   │   │   ├── Step4Gaps.jsx     # Gap analysis report
│   │   │   ├── Step5TestCases.jsx# Test case viewer
│   │   │   ├── Step6Traceability.jsx # Matrix table
│   │   │   ├── Step7Export.jsx   # Excel download
│   │   │   ├── Step8Automation.jsx # Cucumber + step defs
│   │   │   ├── Step9TestData.jsx # CSV test data
│   │   │   └── Step10CICD.jsx    # GitHub Actions / Jenkins
│   │   ├── services/
│   │   │   └── api.js            # Axios API client
│   │   └── store/
│   │       └── useStore.js       # Zustand global state
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── Dockerfile
│
├── docker-compose.yml
├── package.json                  # Workspace root
└── README.md
```

---

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | ≥ 18.x | Backend + frontend build |
| npm | ≥ 9.x | Package management |
| Jira Cloud account | — | Story access |
| Figma account | — | Design access (optional) |
| Anthropic API key | — | AI generation |

---

## Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/yourorg/qagenie.git
cd qagenie

# Install all dependencies (root + backend + frontend)
npm run install:all
```

### 2. Configure Environment

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```env
# Required
ANTHROPIC_API_KEY=sk-ant-api03-...

# Required for Jira
JIRA_BASE_URL=https://yourcompany.atlassian.net
JIRA_EMAIL=you@company.com
JIRA_API_TOKEN=your_jira_token_here

# Optional for Figma
FIGMA_ACCESS_TOKEN=figd_...
```

### 3. Run Development Servers

```bash
# From project root — starts both backend (3001) and frontend (5173)
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## Configuration

### Getting API Keys

#### Anthropic API Key
1. Go to https://console.anthropic.com
2. Navigate to **API Keys**
3. Click **Create Key**
4. Copy to `ANTHROPIC_API_KEY`

#### Jira API Token
1. Go to https://id.atlassian.com/manage-profile/security/api-tokens
2. Click **Create API token**
3. Copy to `JIRA_API_TOKEN`
4. Set `JIRA_EMAIL` to your Atlassian account email
5. Set `JIRA_BASE_URL` to `https://yourcompany.atlassian.net`

#### Figma Access Token
1. In Figma: **Account Settings → Personal access tokens**
2. Click **Generate new token**
3. Copy to `FIGMA_ACCESS_TOKEN`

---

## Stage 1 — Manual Test Generation

### Step 1: Jira Story Selection

- Browse your Jira projects → epics → stories
- Select a story to load its full detail:
  - Summary, description, acceptance criteria
  - Text attachments (`.txt`, `.md`, `.csv`)

**What gets extracted:** All text content is sent to Claude for analysis.

### Step 2: Figma Design (Optional)

- Paste a Figma file URL or file ID
- QAGenie reads:
  - File metadata (pages, frames, components)
  - All text nodes (labels, placeholders, error messages)
  - Frame thumbnail

**Why it helps:** UI text and layout context improves test specificity.

### Step 3: AI Requirement Analysis

Claude analyzes the story and returns:

```json
{
  "requirementSummary": "...",
  "userFlowSummary": "...",
  "assumptions": ["..."],
  "ambiguities": [
    { "area": "...", "question": "...", "impact": "High|Medium|Low" }
  ],
  "components": ["..."]
}
```

### Step 4: Gap Analysis

Identifies what's missing from your requirements:

| Gap Type | Examples |
|----------|---------|
| Missing AC | No empty state defined |
| Missing Validation | No max length for input fields |
| Missing Error Handling | API timeout not specified |
| Missing Navigation | Back button behavior undefined |

### Step 5: Test Case Generation

Generates structured test cases:

```json
{
  "id": "TC-001",
  "title": "Valid login with correct credentials",
  "type": "Positive",
  "priority": "Critical",
  "preconditions": ["User account exists", "App is on login screen"],
  "steps": [
    { "stepNo": 1, "action": "Enter valid email", "expectedResult": "Email accepted" },
    { "stepNo": 2, "action": "Enter valid password", "expectedResult": "Password masked" },
    { "stepNo": 3, "action": "Tap Login button", "expectedResult": "Dashboard displayed" }
  ],
  "expectedResult": "User is logged in and sees dashboard",
  "requirementRef": "AC-1"
}
```

**Types generated:**
- ✅ Positive scenarios
- ❌ Negative scenarios  
- ⚡ Boundary cases
- 🔍 Validation scenarios

### Step 6: Traceability Matrix

In-browser table showing:
```
Story ID | Requirement | Test Case ID | Title | Type | Priority
```

### Step 7: Export

Downloads a formatted `.xlsx` file with 4 sheets:
1. **Cover** — project metadata
2. **Traceability Matrix** — color-coded by priority and type
3. **Test Cases Detail** — full steps for each test case
4. **Summary** — counts by type and priority

---

## Stage 2 — Automation Generation

### Step 8: Cucumber Automation

**Feature File** — Gherkin BDD scenarios:
```gherkin
Feature: User Login

  Scenario: Valid login with correct credentials
    Given user is on the login page
    When user enters valid email "user@example.com"
    And user enters valid password "SecurePass123"
    And user taps the Login button
    Then the dashboard should be displayed
    And the welcome message should contain the user's name
```

**Step Definitions** — Available in Java, Python, or TypeScript:
```java
@When("user enters valid email {string}")
public void userEntersEmail(String email) {
    loginPage.enterEmail(email);
}
```

**Page Object Model:**
```java
public class LoginPage {
    @FindBy(id = "email-input")
    private WebElement emailField;

    @FindBy(id = "password-input")
    private WebElement passwordField;

    @FindBy(id = "login-btn")
    private WebElement loginButton;

    public void enterEmail(String email) {
        emailField.clear();
        emailField.sendKeys(email);
    }
}
```

### Step 9: Test Data Repository

Downloads a `.csv` file:
```csv
username,password,expected_result,test_type
user1@test.com,ValidPass1!,success,positive
user2@test.com,wrongpass,login_error,negative
user3@test.com,,required_field,boundary
a@b.co,ValidPass1!,success,boundary_email
```

### Step 10: CI/CD Pipeline

**GitHub Actions** (`.github/workflows/pipeline.yml`):
- Code quality gate
- Unit tests with JUnit reporter
- API tests with Cucumber tags
- E2E UI tests with Chrome + Firefox matrix
- Failure screenshots upload
- Slack notification on failure

**Jenkins** (`Jenkinsfile`):
- Parameterized builds (environment, browser, tags)
- Allure report integration
- Email notification on failure
- HTML report publishing

---

## API Reference

### Jira Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/jira/projects` | List all projects |
| GET | `/api/jira/projects/:key/epics` | Get epics for project |
| GET | `/api/jira/epics/:key/stories` | Get stories for epic |
| GET | `/api/jira/stories/:key` | Get full story detail |

### Figma Endpoints

| Method | Path | Body | Description |
|--------|------|------|-------------|
| POST | `/api/figma/metadata` | `{ figmaUrl }` | File metadata + pages |
| POST | `/api/figma/text-content` | `{ figmaUrl }` | All text nodes |
| POST | `/api/figma/images` | `{ fileKey, nodeIds }` | Frame image URLs |

### Analysis Endpoints

| Method | Path | Body | Description |
|--------|------|------|-------------|
| POST | `/api/analysis/requirements` | `{ summary, description, acceptanceCriteria, figmaContext }` | AI requirement analysis |
| POST | `/api/analysis/gaps` | `{ summary, description, acceptanceCriteria, analysis }` | Gap analysis |

### Test Generation

| Method | Path | Body | Description |
|--------|------|------|-------------|
| POST | `/api/testgen/test-cases` | `{ summary, description, acceptanceCriteria, analysis, gaps }` | Generate test cases |

### Automation

| Method | Path | Body | Description |
|--------|------|------|-------------|
| POST | `/api/automation/cucumber-feature` | `{ summary, testCases }` | Gherkin feature file |
| POST | `/api/automation/step-definitions` | `{ featureFile, framework }` | Step definitions |
| POST | `/api/automation/page-object` | `{ summary, frames, framework }` | Page object class |
| POST | `/api/automation/test-data` | `{ testCases }` | CSV test data |
| POST | `/api/automation/cicd` | `{ type, projectName, framework }` | CI/CD template |

### Export

| Method | Path | Body | Description |
|--------|------|------|-------------|
| POST | `/api/export/excel` | `{ storyKey, summary, testCases }` | Download .xlsx |

### Health

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Service status check |

---

## Docker Deployment

```bash
# Build and start everything
docker-compose up --build

# Frontend: http://localhost:80
# Backend: http://localhost:3001
```

Make sure `backend/.env` is populated before running Docker.

---

## CI/CD Integration

The generated CI/CD files assume a Maven project with this structure:

```
your-test-project/
├── pom.xml
├── src/test/
│   ├── java/
│   │   ├── stepdefs/         ← paste step definitions here
│   │   ├── pages/            ← paste page objects here
│   │   └── runners/
│   │       └── TestRunner.java
│   └── resources/
│       └── features/         ← paste .feature file here
└── src/test/resources/
    └── testdata/
        └── test_data.csv     ← paste CSV here
```

### Required Maven Dependencies

```xml
<dependencies>
  <dependency>
    <groupId>io.cucumber</groupId>
    <artifactId>cucumber-java</artifactId>
    <version>7.15.0</version>
  </dependency>
  <dependency>
    <groupId>io.cucumber</groupId>
    <artifactId>cucumber-junit</artifactId>
    <version>7.15.0</version>
  </dependency>
  <dependency>
    <groupId>org.seleniumhq.selenium</groupId>
    <artifactId>selenium-java</artifactId>
    <version>4.18.1</version>
  </dependency>
</dependencies>
```

---

## Troubleshooting

### "Failed to load Jira projects"
- Check `JIRA_BASE_URL`, `JIRA_EMAIL`, `JIRA_API_TOKEN` in `.env`
- Verify your Jira API token has read access to projects
- Jira URL must be `https://yourcompany.atlassian.net` (no trailing slash)

### "Figma connection failed"
- Verify `FIGMA_ACCESS_TOKEN` is set
- File must be accessible to the token owner
- Works with both `https://www.figma.com/file/XXXX` URLs and raw file IDs

### "AI returned invalid JSON"
- Rare; Claude occasionally adds markdown to JSON responses
- The service strips ` ```json ` fences automatically
- If persistent, check `ANTHROPIC_API_KEY` validity

### Excel download fails
- Backend needs write access to `backend/exports/` directory
- Files are auto-deleted 30 seconds after download

### Backend starts but frontend can't reach it
- Vite proxies `/api/*` to `http://localhost:3001`
- Ensure backend is running on port 3001
- Check `ALLOWED_ORIGINS` in `.env` includes `http://localhost:5173`

---

## License

MIT — built with ❤️ using Claude AI, React, and Node.js.
