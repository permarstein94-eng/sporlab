const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, ShadingType, HeadingLevel,
  PageBreak, LevelFormat, VerticalAlign
} = require('docx');

// Read markdown file
const mdFile = 'C:\\Users\\PerMarstein\\Documents\\Codex\\2026-05-20\\files-mentioned-by-the-user-lesehefte\\testinstruks.md';
const content = fs.readFileSync(mdFile, 'utf8');
const lines = content.split('\n');

// Parse markdown to document structure
const docChildren = [];

// Title page
docChildren.push(
  new Paragraph({
    children: [
      new TextRun({
        text: 'SporLab E8/E9',
        bold: true,
        size: 60,
        font: 'Arial'
      })
    ],
    alignment: AlignmentType.CENTER,
    spacing: { before: 400, after: 200 }
  }),
  new Paragraph({
    children: [
      new TextRun({
        text: 'Testinstruks',
        size: 48,
        font: 'Arial'
      })
    ],
    alignment: AlignmentType.CENTER,
    spacing: { after: 600 }
  }),
  new Paragraph({
    children: [
      new TextRun({
        text: 'For hundeførere som trener E8 og E9',
        size: 24,
        font: 'Arial',
        italics: true
      })
    ],
    alignment: AlignmentType.CENTER,
    spacing: { after: 400 }
  }),
  new Paragraph({
    children: [
      new TextRun({
        text: 'Juni 2026',
        size: 24,
        font: 'Arial'
      })
    ],
    alignment: AlignmentType.CENTER,
    spacing: { after: 400 }
  }),
  new Paragraph({ children: [new PageBreak()] })
);

// Parse content
let i = 0;
while (i < lines.length) {
  const line = lines[i];

  // Heading 1
  if (line.startsWith('# ') && !line.startsWith('## ')) {
    const text = line.replace(/^# /, '').trim();
    docChildren.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun({ text, bold: true, size: 32, font: 'Arial' })],
        spacing: { before: 300, after: 200 }
      })
    );
    i++;
    continue;
  }

  // Heading 2
  if (line.startsWith('## ')) {
    const text = line.replace(/^## /, '').trim();
    docChildren.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun({ text, bold: true, size: 28, font: 'Arial' })],
        spacing: { before: 200, after: 150 }
      })
    );
    i++;
    continue;
  }

  // Table (markdown style: | col | col |)
  if (line.trim().startsWith('|')) {
    const tableRows = [];
    let tableLineIdx = i;

    // Collect all table lines
    while (tableLineIdx < lines.length && lines[tableLineIdx].trim().startsWith('|')) {
      const cells = lines[tableLineIdx]
        .split('|')
        .map(cell => cell.trim())
        .filter(cell => cell && !cell.match(/^-+$/)); // Skip separator lines

      if (cells.length > 0) {
        tableRows.push(
          new TableRow({
            children: cells.map(cellText =>
              new TableCell({
                borders: {
                  top: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
                  bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
                  left: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
                  right: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' }
                },
                shading: tableLineIdx === i ? { fill: 'E8E8E8', type: ShadingType.CLEAR } : {},
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: cellText, bold: tableLineIdx === i, size: 22 })],
                    alignment: AlignmentType.LEFT
                  })
                ]
              })
            )
          })
        );
      }
      tableLineIdx++;
    }

    if (tableRows.length > 0) {
      const colCount = tableRows[0].children.length;
      const colWidth = Math.floor(9360 / colCount);
      docChildren.push(
        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: Array(colCount).fill(colWidth),
          rows: tableRows
        })
      );
      docChildren.push(new Paragraph({ children: [new TextRun('')], spacing: { after: 150 } }));
    }
    i = tableLineIdx;
    continue;
  }

  // List items (- or *)
  if (line.match(/^\s*[-*]\s+/)) {
    const text = line.replace(/^\s*[-*]\s+/, '').trim();
    docChildren.push(
      new Paragraph({
        numbering: { reference: 'bullets', level: 0 },
        children: [new TextRun(text)],
        spacing: { after: 80 }
      })
    );
    i++;
    continue;
  }

  // Bold text (**text**)
  let textContent = line;
  const boldRegex = /\*\*(.+?)\*\*/g;
  const italicRegex = /\*(.+?)\*/g;
  const linkRegex = /\[(.+?)\]\((.+?)\)/g;

  // Empty line
  if (line.trim() === '') {
    docChildren.push(new Paragraph({ children: [new TextRun('')], spacing: { after: 100 } }));
    i++;
    continue;
  }

  // Regular paragraph
  if (line.trim()) {
    const children = [];
    let lastIndex = 0;

    // Parse inline formatting: **bold**, *italic*, [link](url)
    const parseInline = (text) => {
      const runs = [];
      let idx = 0;

      while (idx < text.length) {
        const boldMatch = text.substring(idx).match(/^\*\*(.+?)\*\*/);
        const italicMatch = text.substring(idx).match(/^\*(.+?)\*/);
        const linkMatch = text.substring(idx).match(/^\[(.+?)\]\((.+?)\)/);

        if (boldMatch) {
          runs.push(new TextRun({ text: boldMatch[1], bold: true, size: 22 }));
          idx += boldMatch[0].length;
        } else if (linkMatch && !boldMatch && !italicMatch) {
          // URL as-is (plain text)
          runs.push(new TextRun({ text: linkMatch[2], size: 22, color: '0563C1', underline: {} }));
          idx += linkMatch[0].length;
        } else if (italicMatch && !boldMatch) {
          runs.push(new TextRun({ text: italicMatch[1], italics: true, size: 22 }));
          idx += italicMatch[0].length;
        } else {
          const nextBold = text.substring(idx).search(/\*\*/);
          const nextItalic = text.substring(idx).search(/\*/);
          const nextLink = text.substring(idx).search(/\[/);

          const next = Math.min(
            nextBold >= 0 ? nextBold : Infinity,
            nextItalic >= 0 ? nextItalic : Infinity,
            nextLink >= 0 ? nextLink : Infinity
          );

          if (next === Infinity) {
            if (idx < text.length) {
              runs.push(new TextRun({ text: text.substring(idx), size: 22 }));
            }
            break;
          }

          runs.push(new TextRun({ text: text.substring(idx, idx + next), size: 22 }));
          idx += next;
        }
      }
      return runs;
    };

    docChildren.push(
      new Paragraph({
        children: parseInline(textContent),
        spacing: { after: 100 }
      })
    );
  }

  i++;
}

// Configure numbering for bullets
const doc = new Document({
  numbering: {
    config: [
      {
        reference: 'bullets',
        levels: [
          {
            level: 0,
            format: LevelFormat.BULLET,
            text: '•',
            alignment: AlignmentType.LEFT,
            style: {
              paragraph: {
                indent: { left: 720, hanging: 360 }
              }
            }
          }
        ]
      }
    ]
  },
  sections: [
    {
      properties: {
        page: {
          size: {
            width: 12240,  // US Letter width
            height: 15840 // US Letter height
          },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } // 1 inch margins
        }
      },
      children: docChildren
    }
  ],
  styles: {
    default: {
      document: {
        run: { font: 'Arial', size: 22 }
      }
    }
  }
});

// Write document
Packer.toBuffer(doc).then(buffer => {
  const outputPath = 'C:\\Users\\PerMarstein\\Documents\\Codex\\2026-05-20\\files-mentioned-by-the-user-lesehefte\\SporLab_Testinstruks.docx';
  fs.writeFileSync(outputPath, buffer);
  console.log(`✅ Document created: ${outputPath}`);
});
