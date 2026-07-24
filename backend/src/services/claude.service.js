const Anthropic = require('@anthropic-ai/sdk');
const logger = require('../utils/logger');

class ClaudeService {
  constructor() {
    this.client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    this.model = 'claude-opus-4-5';
  }

  async complete(systemPrompt, userPrompt, maxTokens = 4096) {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });
    return response.content[0].text;
  }

  async completeJSON(systemPrompt, userPrompt, maxTokens = 4096) {
    const text = await this.complete(
      systemPrompt + '\n\nIMPORTANT: Respond ONLY with valid JSON. No markdown, no preamble, no explanation.',
      userPrompt,
      maxTokens
    );
    try {
      return JSON.parse(text.replace(/```json\n?|\n?```/g, '').trim());
    } catch (e) {
      logger.error('JSON parse failed:', text.slice(0, 200));
      throw new Error('AI returned invalid JSON: ' + e.message);
    }
  }

  // ─── Stage 1: Requirement Analysis ──────────────────────────────────────────

  async analyzeRequirements({ summary, description, acceptanceCriteria, figmaContext }) {
    const system = `You are a senior QA architect specializing in requirements analysis. 
Analyze software requirements and produce structured analysis reports.`;

    const user = `Analyze these requirements:

**Story Summary:** ${summary}

**Description:**
${description}

**Acceptance Criteria:**
${acceptanceCriteria || 'Not provided'}

**Figma/UI Context:**
${figmaContext || 'Not provided'}

Return JSON with this exact structure:
{
  "requirementSummary": "2-3 paragraph overview",
  "userFlowSummary": "Step-by-step user flow description",
  "assumptions": ["assumption1", "assumption2", ...],
  "ambiguities": [
    {"area": "...", "question": "...", "impact": "High|Medium|Low"}
  ],
  "components": ["UI component 1", "UI component 2", ...]
}`;

    return this.completeJSON(system, user, 2048);
  }

  // ─── Gap Analysis ────────────────────────────────────────────────────────────

  async analyzeGaps({ summary, description, acceptanceCriteria, analysis }) {
    const system = `You are a QA requirements expert specializing in finding gaps and missing specifications.`;

    const user = `Perform gap analysis on these requirements:

**Story:** ${summary}
**Description:** ${description}
**Acceptance Criteria:** ${acceptanceCriteria || 'None'}
**Initial Analysis:** ${JSON.stringify(analysis)}

Return JSON:
{
  "missingAcceptanceCriteria": [
    {"item": "...", "severity": "Critical|High|Medium|Low", "suggestion": "..."}
  ],
  "missingValidationRules": [
    {"field": "...", "missingRule": "...", "example": "..."}
  ],
  "missingErrorHandling": [
    {"scenario": "...", "expectedBehavior": "...", "severity": "Critical|High|Medium|Low"}
  ],
  "missingNavigationPaths": [
    {"from": "...", "to": "...", "trigger": "..."}
  ],
  "overallRiskLevel": "High|Medium|Low",
  "priorityRecommendations": ["rec1", "rec2", "rec3"]
}`;

    return this.completeJSON(system, user, 2048);
  }

  // ─── Test Case Generation ────────────────────────────────────────────────────

  async generateTestCases({ summary, description, acceptanceCriteria, analysis, gaps }) {
    const system = `You are a senior QA engineer. Generate comprehensive, executable test cases covering all scenarios.`;

    const user = `Generate complete test cases for:

**Story:** ${summary}
**Description:** ${description}
**AC:** ${acceptanceCriteria || 'None'}
**Analysis:** ${JSON.stringify(analysis)}
**Gaps Identified:** ${JSON.stringify(gaps)}

Return JSON with this structure:
{
  "testCases": [
    {
      "id": "TC-001",
      "title": "...",
      "type": "Positive|Negative|Boundary|Validation",
      "priority": "Critical|High|Medium|Low",
      "preconditions": ["..."],
      "steps": [
        {"stepNo": 1, "action": "...", "expectedResult": "..."}
      ],
      "expectedResult": "...",
      "requirementRef": "AC-1"
    }
  ]
}

Generate at least 15-20 test cases covering: positive flows, negative flows, boundary values, validation rules, error handling, navigation paths.`;

    return this.completeJSON(system, user, 6000);
  }

  // ─── Stage 2: Automation Generation ─────────────────────────────────────────

  async generateCucumberFeature({ summary, testCases }) {
    const system = `You are a BDD expert. Generate Cucumber feature files following Gherkin syntax best practices.`;
    const user = `Generate a Cucumber .feature file for:
**Story:** ${summary}
**Test Cases:** ${JSON.stringify(testCases?.slice(0, 10))}

Return ONLY the raw Gherkin text (no JSON wrapper, no markdown fences).`;
    return this.complete(system, user, 3000);
  }

  async generateStepDefinitions({ featureFile, framework = 'java' }) {
    const system = `You are a test automation engineer. Generate ${framework} step definitions for Cucumber.`;
    const user = `Generate ${framework} step definitions for this feature file:

${featureFile}

Generate complete, compilable ${framework} code with proper annotations and method signatures. 
For Java: use @Given/@When/@Then from io.cucumber.java.en
Include TODO comments for actual implementation.`;
    return this.complete(system, user, 3000);
  }

  async generatePageObject({ summary, frames, framework = 'java' }) {
    const system = `You are a test automation architect. Generate Page Object Model classes.`;
    const user = `Generate ${framework} Page Object class(es) for:
**Story/Feature:** ${summary}
**UI Frames/Components:** ${JSON.stringify(frames || [])}

For Java: Use Selenium WebDriver with @FindBy annotations.
Include proper encapsulation, element locators, and action methods.`;
    return this.complete(system, user, 2000);
  }

  async generateTestData({ testCases }) {
    const system = `You are a test data engineer. Generate comprehensive test data sets.`;
    const user = `Generate CSV test data for these test cases:
${JSON.stringify(testCases?.slice(0, 15))}

Return a CSV string with headers and at least 10-15 rows covering valid, invalid, and boundary data.
Return ONLY raw CSV text.`;
    return this.complete(system, user, 2000);
  }
}

module.exports = new ClaudeService();
