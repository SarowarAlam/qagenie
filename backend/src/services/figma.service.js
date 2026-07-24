const axios = require('axios');
const logger = require('../utils/logger');

class FigmaService {
  constructor() {
    this.token = process.env.FIGMA_ACCESS_TOKEN;
    this.baseURL = 'https://api.figma.com/v1';
  }

  get client() {
    if (!this.token) throw new Error('FIGMA_ACCESS_TOKEN not configured');
    return axios.create({
      baseURL: this.baseURL,
      headers: { 'X-Figma-Token': this.token },
    });
  }

  /** Parse file key from URL or raw key */
  parseFileKey(input) {
    const match = input.match(/figma\.com\/(?:file|design)\/([a-zA-Z0-9]+)/);
    return match ? match[1] : input;
  }

  /** Get Figma file metadata and page structure */
  async getFileMetadata(fileKeyOrUrl) {
    const fileKey = this.parseFileKey(fileKeyOrUrl);
    const resp = await this.client.get(`/files/${fileKey}?depth=2`);
    const file = resp.data;

    const pages = file.document.children.map(page => ({
      id: page.id,
      name: page.name,
      frameCount: (page.children || []).filter(n => n.type === 'FRAME').length,
    }));

    const frames = [];
    for (const page of file.document.children) {
      for (const node of (page.children || [])) {
        if (node.type === 'FRAME' || node.type === 'COMPONENT') {
          frames.push({ id: node.id, name: node.name, page: page.name });
        }
      }
    }

    return {
      fileKey,
      fileName: file.name,
      lastModified: file.lastModified,
      version: file.version,
      thumbnailUrl: file.thumbnailUrl,
      pages,
      frames: frames.slice(0, 30),
    };
  }

  /** Get image exports for specific frames */
  async getFrameImages(fileKey, nodeIds) {
    if (!nodeIds || nodeIds.length === 0) return {};
    const ids = nodeIds.slice(0, 10).join(',');
    const resp = await this.client.get(`/images/${fileKey}?ids=${ids}&format=png&scale=1`);
    return resp.data.images || {};
  }

  /** Get all text content from a Figma file (for AI analysis) */
  async getFileTextContent(fileKeyOrUrl) {
    const fileKey = this.parseFileKey(fileKeyOrUrl);
    const resp = await this.client.get(`/files/${fileKey}`);
    const texts = [];
    const extractTexts = (node, path = '') => {
      if (node.type === 'TEXT') texts.push({ path, content: node.characters });
      if (node.children) node.children.forEach(child => extractTexts(child, `${path}/${node.name}`));
    };
    resp.data.document.children.forEach(page => extractTexts(page, page.name));
    return texts.slice(0, 200);
  }

  /** Get component list */
  async getComponents(fileKeyOrUrl) {
    const fileKey = this.parseFileKey(fileKeyOrUrl);
    const resp = await this.client.get(`/files/${fileKey}/components`);
    return (resp.data.meta?.components || []).map(c => ({
      key: c.key,
      name: c.name,
      description: c.description,
    }));
  }
}

module.exports = new FigmaService();
