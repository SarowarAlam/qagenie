const ExcelJS = require('exceljs');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

const OUTPUT_DIR = path.join(__dirname, '../../exports');
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

class ExcelService {
  async generateTraceabilityMatrix({ storyKey, summary, testCases, acceptanceCriteria }) {
    const wb = new ExcelJS.Workbook();
    wb.creator = 'QAGenie';
    wb.created = new Date();

    // ─── Cover Sheet ──────────────────────────────────────────────────────────
    const cover = wb.addWorksheet('Cover');
    cover.mergeCells('A1:F1');
    cover.getCell('A1').value = 'QAGenie - Traceability Matrix';
    cover.getCell('A1').font = { bold: true, size: 18, color: { argb: 'FF1E40AF' } };
    cover.getCell('A1').alignment = { horizontal: 'center' };
    cover.getCell('A2').value = `Story: ${storyKey} - ${summary}`;
    cover.getCell('A3').value = `Generated: ${new Date().toLocaleString()}`;
    cover.getCell('A4').value = `Total Test Cases: ${testCases.length}`;

    // ─── Traceability Matrix Sheet ────────────────────────────────────────────
    const ws = wb.addWorksheet('Traceability Matrix');
    const headerStyle = {
      font: { bold: true, color: { argb: 'FFFFFFFF' } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E40AF' } },
      alignment: { horizontal: 'center', vertical: 'middle', wrapText: true },
      border: {
        top: { style: 'thin' }, bottom: { style: 'thin' },
        left: { style: 'thin' }, right: { style: 'thin' }
      }
    };

    ws.columns = [
      { header: 'Story ID', key: 'storyId', width: 12 },
      { header: 'Requirement / AC', key: 'requirement', width: 45 },
      { header: 'Test Case ID', key: 'tcId', width: 12 },
      { header: 'Test Case Title', key: 'tcTitle', width: 40 },
      { header: 'Type', key: 'type', width: 14 },
      { header: 'Priority', key: 'priority', width: 12 },
      { header: 'Status', key: 'status', width: 12 },
    ];

    // Style header row
    ws.getRow(1).eachCell(cell => Object.assign(cell, headerStyle));
    ws.getRow(1).height = 35;

    // Priority color map
    const priorityColors = {
      Critical: 'FFEF4444', High: 'FFFB923C', Medium: 'FFFBBF24', Low: 'FF34D399'
    };
    const typeColors = {
      Positive: 'FF86EFAC', Negative: 'FFFCA5A5',
      Boundary: 'FFFDE68A', Validation: 'FFA5B4FC'
    };

    let row = 2;
    for (const tc of testCases) {
      const r = ws.addRow({
        storyId: storyKey,
        requirement: tc.requirementRef || 'General',
        tcId: tc.id,
        tcTitle: tc.title,
        type: tc.type,
        priority: tc.priority,
        status: 'Not Executed',
      });
      r.height = 20;

      // Color priority cell
      const priColor = priorityColors[tc.priority];
      if (priColor) {
        r.getCell('priority').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: priColor } };
      }
      // Color type cell
      const typeColor = typeColors[tc.type];
      if (typeColor) {
        r.getCell('type').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: typeColor } };
      }

      r.eachCell(cell => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          right: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        };
        cell.alignment = { vertical: 'middle', wrapText: true };
      });

      // Alternate row shading
      if (row % 2 === 0) {
        r.eachCell(cell => {
          if (!cell.fill?.fgColor?.argb || cell.fill.fgColor.argb === 'FF000000') {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
          }
        });
      }
      row++;
    }

    // ─── Test Cases Detail Sheet ──────────────────────────────────────────────
    const tcSheet = wb.addWorksheet('Test Cases Detail');
    tcSheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Title', key: 'title', width: 40 },
      { header: 'Type', key: 'type', width: 14 },
      { header: 'Priority', key: 'priority', width: 12 },
      { header: 'Preconditions', key: 'preconditions', width: 35 },
      { header: 'Steps', key: 'steps', width: 55 },
      { header: 'Expected Result', key: 'expected', width: 40 },
    ];
    tcSheet.getRow(1).eachCell(cell => Object.assign(cell, headerStyle));
    tcSheet.getRow(1).height = 35;

    for (const tc of testCases) {
      const stepsText = (tc.steps || [])
        .map(s => `${s.stepNo}. ${s.action} → ${s.expectedResult}`)
        .join('\n');
      const r = tcSheet.addRow({
        id: tc.id,
        title: tc.title,
        type: tc.type,
        priority: tc.priority,
        preconditions: (tc.preconditions || []).join('\n'),
        steps: stepsText,
        expected: tc.expectedResult,
      });
      r.height = Math.max(30, (tc.steps || []).length * 18);
      r.eachCell(cell => {
        cell.alignment = { vertical: 'top', wrapText: true };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          right: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        };
      });
    }

    // ─── Summary Sheet ────────────────────────────────────────────────────────
    const sumSheet = wb.addWorksheet('Summary');
    const counts = {
      total: testCases.length,
      positive: testCases.filter(t => t.type === 'Positive').length,
      negative: testCases.filter(t => t.type === 'Negative').length,
      boundary: testCases.filter(t => t.type === 'Boundary').length,
      validation: testCases.filter(t => t.type === 'Validation').length,
      critical: testCases.filter(t => t.priority === 'Critical').length,
      high: testCases.filter(t => t.priority === 'High').length,
      medium: testCases.filter(t => t.priority === 'Medium').length,
      low: testCases.filter(t => t.priority === 'Low').length,
    };
    const summaryData = [
      ['Metric', 'Count'],
      ['Total Test Cases', counts.total],
      ['Positive Scenarios', counts.positive],
      ['Negative Scenarios', counts.negative],
      ['Boundary Cases', counts.boundary],
      ['Validation Cases', counts.validation],
      ['', ''],
      ['Priority Breakdown', ''],
      ['Critical', counts.critical],
      ['High', counts.high],
      ['Medium', counts.medium],
      ['Low', counts.low],
    ];
    summaryData.forEach((row, i) => {
      const r = sumSheet.addRow(row);
      if (i === 0 || i === 7) r.eachCell(cell => Object.assign(cell, headerStyle));
    });
    sumSheet.getColumn(1).width = 30;
    sumSheet.getColumn(2).width = 15;

    const fileName = `qagenie_${storyKey}_${Date.now()}.xlsx`;
    const filePath = path.join(OUTPUT_DIR, fileName);
    await wb.xlsx.writeFile(filePath);
    return { filePath, fileName };
  }
}

module.exports = new ExcelService();
