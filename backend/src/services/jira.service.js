const axios = require('axios');
const logger = require('../utils/logger');

class JiraService {
  constructor() {
    this.baseURL = process.env.JIRA_BASE_URL;
    this.email = process.env.JIRA_EMAIL;
    this.apiToken = process.env.JIRA_API_TOKEN;
  }

  get client() {
    if (!this.baseURL || !this.email || !this.apiToken) {
      throw new Error('Jira credentials not configured. Check JIRA_BASE_URL, JIRA_EMAIL, JIRA_API_TOKEN in .env');
    }
    return axios.create({
      baseURL: `${this.baseURL}/rest/api/3`,
      auth: { username: this.email, password: this.apiToken },
      headers: { 'Content-Type': 'application/json' },
    });
  }

  /** List all accessible projects */
  async getProjects() {
    const resp = await this.client.get('/project/search?maxResults=50');
    return resp.data.values.map(p => ({
      id: p.id,
      key: p.key,
      name: p.name,
      avatarUrl: p.avatarUrls?.['48x48'],
    }));
  }

  /** Get epics for a project (issues of type Epic) */
  async getEpics(projectKey) {
    const jql = `project = "${projectKey}" AND issuetype = Epic ORDER BY created DESC`;
    const resp = await this.client.get(`/search?jql=${encodeURIComponent(jql)}&maxResults=50&fields=summary,description,status`);
    return resp.data.issues.map(i => ({
      id: i.id,
      key: i.key,
      summary: i.fields.summary,
      status: i.fields.status?.name,
    }));
  }

  /** Get stories under an epic */
  async getStories(epicKey) {
    const jql = `"Epic Link" = "${epicKey}" OR parent = "${epicKey}" AND issuetype = Story ORDER BY created DESC`;
    const resp = await this.client.get(`/search?jql=${encodeURIComponent(jql)}&maxResults=50&fields=summary,description,status,attachment`);
    return resp.data.issues.map(i => ({
      id: i.id,
      key: i.key,
      summary: i.fields.summary,
      status: i.fields.status?.name,
      hasAttachments: (i.fields.attachment || []).length > 0,
    }));
  }

  /** Get full story detail including acceptance criteria and attachments */
  async getStoryDetail(issueKey) {
    const resp = await this.client.get(`/issue/${issueKey}?fields=summary,description,attachment,comment,customfield_10016,customfield_10014`);
    const fields = resp.data.fields;

    // Parse description ADF to plain text
    const description = this._adfToText(fields.description);

    // Extract acceptance criteria from description or custom field
    const acceptanceCriteria = this._extractAcceptanceCriteria(description, fields.customfield_10016);

    // Get text attachments
    const attachments = await this._getTextAttachments(fields.attachment || []);

    return {
      key: issueKey,
      summary: fields.summary,
      description,
      acceptanceCriteria,
      attachments,
      storyPoints: fields.customfield_10016,
    };
  }

  /** Convert Atlassian Document Format to plain text */
  _adfToText(adf) {
    if (!adf) return '';
    if (typeof adf === 'string') return adf;
    const extractText = node => {
      if (!node) return '';
      if (node.type === 'text') return node.text || '';
      if (node.content) return node.content.map(extractText).join(node.type === 'paragraph' ? '\n' : ' ');
      return '';
    };
    return extractText(adf).trim();
  }

  /** Extract acceptance criteria section */
  _extractAcceptanceCriteria(description, customField) {
    if (customField) return customField;
    // Try to find AC section in description
    const acMatch = description.match(/acceptance criteria[:\n]([\s\S]*?)(?:\n\n|\n(?=[A-Z])|$)/i);
    if (acMatch) return acMatch[1].trim();
    return '';
  }

  /** Download and read text attachments (txt, md, csv) */
  async _getTextAttachments(attachments) {
    const textTypes = ['text/plain', 'text/markdown', 'text/csv'];
    const results = [];
    for (const att of attachments.slice(0, 5)) {
      if (textTypes.some(t => att.mimeType?.startsWith(t.split('/')[0]))) {
        try {
          const resp = await axios.get(att.content, {
            auth: { username: this.email, password: this.apiToken },
            responseType: 'text',
            timeout: 5000,
          });
          results.push({ filename: att.filename, content: resp.data.slice(0, 2000) });
        } catch (e) {
          logger.warn(`Failed to fetch attachment ${att.filename}: ${e.message}`);
        }
      }
    }
    return results;
  }
}

module.exports = new JiraService();
