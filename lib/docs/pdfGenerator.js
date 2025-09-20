import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Configuration for PDF generation
const PDF_CONFIG = {
  format: 'a4',
  orientation: 'portrait',
  margins: { top: 20, bottom: 20, left: 15, right: 15 },
  colors: {
    primary: '#3182CE',
    secondary: '#2D3748',
    accent: '#38B2AC',
    text: '#2D3748',
    lightText: '#718096',
    background: '#F7FAFC'
  },
  fonts: {
    title: 16,
    heading: 14,
    subheading: 12,
    body: 10,
    small: 8
  }
};

class DocumentationPDFGenerator {
  constructor() {
    this.doc = null;
    this.currentY = 0;
    this.pageHeight = 297; // A4 height in mm
    this.pageWidth = 210; // A4 width in mm
    this.margins = PDF_CONFIG.margins;
    this.contentWidth = this.pageWidth - this.margins.left - this.margins.right;
    this.toc = []; // Table of contents entries
    this.pageNumbers = {};
  }

  // Initialize PDF document
  init() {
    this.doc = new jsPDF({
      orientation: PDF_CONFIG.orientation,
      unit: 'mm',
      format: PDF_CONFIG.format
    });

    // Set document properties
    this.doc.setProperties({
      title: 'Manual TomaTurno',
      author: 'INER',
      subject: 'Documentación del Sistema',
      keywords: 'manual,usuario,tomaturno',
      creator: 'TomaTurno v1.0'
    });

    this.currentY = this.margins.top;
    return this;
  }

  // Add new page if needed
  checkPageBreak(requiredSpace = 20) {
    if (this.currentY + requiredSpace > this.pageHeight - this.margins.bottom) {
      this.addPage();
    }
  }

  // Add new page
  addPage() {
    this.doc.addPage();
    this.currentY = this.margins.top;
    this.addPageHeader();
    this.addPageFooter();
  }

  // Add page header
  addPageHeader() {
    if (this.doc.getNumberOfPages() === 1) return; // Skip header on first page

    this.doc.setFontSize(PDF_CONFIG.fonts.small);
    this.doc.setTextColor(PDF_CONFIG.colors.lightText);
    this.doc.text('Manual de Usuario - TomaTurno INER', this.margins.left, 15);

    // Add header line
    this.doc.setDrawColor(PDF_CONFIG.colors.primary);
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margins.left, 18, this.pageWidth - this.margins.right, 18);

    this.currentY = 25;
  }

  // Add page footer
  addPageFooter() {
    const pageNumber = this.doc.getNumberOfPages();

    // Footer line
    this.doc.setDrawColor(PDF_CONFIG.colors.primary);
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margins.left, this.pageHeight - 15, this.pageWidth - this.margins.right, this.pageHeight - 15);

    // Page number
    this.doc.setFontSize(PDF_CONFIG.fonts.small);
    this.doc.setTextColor(PDF_CONFIG.colors.lightText);
    this.doc.text(
      `Página ${pageNumber}`,
      this.pageWidth / 2,
      this.pageHeight - 10,
      { align: 'center' }
    );

    // Footer text
    this.doc.text(
      'Instituto Nacional de Enfermedades Respiratorias',
      this.margins.left,
      this.pageHeight - 10
    );

    this.doc.text(
      new Date().toLocaleDateString('es-ES'),
      this.pageWidth - this.margins.right,
      this.pageHeight - 10,
      { align: 'right' }
    );
  }

  // Generate cover page
  generateCoverPage(userRole, userName) {
    // INER Logo placeholder (you would load actual logo)
    this.doc.setFillColor(PDF_CONFIG.colors.primary);
    this.doc.rect(this.pageWidth / 2 - 25, 40, 50, 30, 'F');

    this.doc.setFontSize(PDF_CONFIG.fonts.small);
    this.doc.setTextColor('white');
    this.doc.text('INER', this.pageWidth / 2, 58, { align: 'center' });

    // Title
    this.doc.setFontSize(24);
    this.doc.setTextColor(PDF_CONFIG.colors.primary);
    this.doc.text('Manual de Usuario', this.pageWidth / 2, 90, { align: 'center' });

    this.doc.setFontSize(20);
    this.doc.setTextColor(PDF_CONFIG.colors.secondary);
    this.doc.text('Sistema TomaTurno', this.pageWidth / 2, 105, { align: 'center' });

    // Role-specific subtitle
    const roleNames = {
      admin: 'Manual del Administrador',
      flebotomista: 'Manual del Flebotomista',
      usuario: 'Manual del Usuario'
    };

    this.doc.setFontSize(PDF_CONFIG.fonts.heading);
    this.doc.setTextColor(PDF_CONFIG.colors.accent);
    this.doc.text(roleNames[userRole] || 'Manual General', this.pageWidth / 2, 120, { align: 'center' });

    // Version and date
    this.doc.setFontSize(PDF_CONFIG.fonts.body);
    this.doc.setTextColor(PDF_CONFIG.colors.text);
    this.doc.text('Versión 1.0.0', this.pageWidth / 2, 140, { align: 'center' });
    this.doc.text(new Date().toLocaleDateString('es-ES'), this.pageWidth / 2, 150, { align: 'center' });

    // Generated for
    if (userName) {
      this.doc.text(`Generado para: ${userName}`, this.pageWidth / 2, 170, { align: 'center' });
    }

    // Institution info
    this.doc.setFontSize(PDF_CONFIG.fonts.small);
    this.doc.setTextColor(PDF_CONFIG.colors.lightText);
    this.doc.text(
      'Instituto Nacional de Enfermedades Respiratorias',
      this.pageWidth / 2,
      this.pageHeight - 40,
      { align: 'center' }
    );

    this.addPage();
  }

  // Generate table of contents
  generateTableOfContents() {
    this.doc.setFontSize(PDF_CONFIG.fonts.title);
    this.doc.setTextColor(PDF_CONFIG.colors.primary);
    this.doc.text('Tabla de Contenidos', this.margins.left, this.currentY);
    this.currentY += 15;

    // Add TOC entries
    this.toc.forEach((entry, index) => {
      this.checkPageBreak(8);

      this.doc.setFontSize(PDF_CONFIG.fonts.body);
      this.doc.setTextColor(PDF_CONFIG.colors.text);

      // Add dots between title and page number
      const titleWidth = this.doc.getTextWidth(entry.title);
      const pageNumText = entry.page.toString();
      const pageNumWidth = this.doc.getTextWidth(pageNumText);
      const dotsWidth = this.contentWidth - titleWidth - pageNumWidth - 5;
      const dotsCount = Math.floor(dotsWidth / 2);
      const dots = '.'.repeat(Math.max(0, dotsCount));

      this.doc.text(entry.title, this.margins.left + (entry.level * 5), this.currentY);
      this.doc.text(dots, this.margins.left + (entry.level * 5) + titleWidth + 2, this.currentY);
      this.doc.text(pageNumText, this.pageWidth - this.margins.right, this.currentY, { align: 'right' });

      this.currentY += 6;
    });

    this.addPage();
  }

  // Add title to TOC
  addToTOC(title, level = 0) {
    this.toc.push({
      title,
      level,
      page: this.doc.getNumberOfPages()
    });
  }

  // Add module content
  addModule(module) {
    this.checkPageBreak(30);

    // Module title
    this.doc.setFontSize(PDF_CONFIG.fonts.title);
    this.doc.setTextColor(PDF_CONFIG.colors.primary);
    this.doc.text(module.title, this.margins.left, this.currentY);
    this.addToTOC(module.title, 0);
    this.currentY += 10;

    // Module description
    if (module.description) {
      this.doc.setFontSize(PDF_CONFIG.fonts.body);
      this.doc.setTextColor(PDF_CONFIG.colors.text);
      const descLines = this.doc.splitTextToSize(module.description, this.contentWidth);
      this.doc.text(descLines, this.margins.left, this.currentY);
      this.currentY += descLines.length * 5 + 5;
    }

    // Module metadata
    this.addModuleMetadata(module);

    // Sections
    if (module.sections) {
      module.sections.forEach(section => {
        this.addSection(section);
      });
    }

    // FAQs
    if (module.faqs && module.faqs.length > 0) {
      this.addFAQs(module.faqs);
    }

    // Exercises
    if (module.exercises && module.exercises.length > 0) {
      this.addExercises(module.exercises);
    }
  }

  // Add module metadata
  addModuleMetadata(module) {
    this.checkPageBreak(20);

    // Create metadata table
    const metadata = [
      ['Tiempo estimado', module.estimatedTime || 'No especificado'],
      ['Dificultad', module.difficulty || 'No especificado'],
      ['Categoría', module.category || 'General']
    ];

    if (module.tags && module.tags.length > 0) {
      metadata.push(['Etiquetas', module.tags.join(', ')]);
    }

    this.doc.autoTable({
      startY: this.currentY,
      head: [['Propiedad', 'Valor']],
      body: metadata,
      theme: 'grid',
      styles: {
        fontSize: PDF_CONFIG.fonts.small,
        cellPadding: 2
      },
      headStyles: {
        fillColor: PDF_CONFIG.colors.primary,
        textColor: 'white'
      },
      margin: { left: this.margins.left, right: this.margins.right }
    });

    this.currentY = this.doc.lastAutoTable.finalY + 10;
  }

  // Add section
  addSection(section) {
    this.checkPageBreak(20);

    // Section title
    this.doc.setFontSize(PDF_CONFIG.fonts.heading);
    this.doc.setTextColor(PDF_CONFIG.colors.secondary);
    this.doc.text(section.title, this.margins.left, this.currentY);
    this.addToTOC(section.title, 1);
    this.currentY += 8;

    // Section content
    if (section.content.text) {
      this.addMarkdownText(section.content.text);
    }

    // Code examples
    if (section.content.codeExamples) {
      section.content.codeExamples.forEach(example => {
        this.addCodeExample(example);
      });
    }

    // Tips
    if (section.content.tips && section.content.tips.length > 0) {
      this.addTips(section.content.tips);
    }

    // Warnings
    if (section.content.warnings && section.content.warnings.length > 0) {
      this.addWarnings(section.content.warnings);
    }
  }

  // Add markdown-style text
  addMarkdownText(text) {
    const lines = text.split('\n');

    lines.forEach(line => {
      this.checkPageBreak(8);

      // Headers
      if (line.startsWith('### ')) {
        this.doc.setFontSize(PDF_CONFIG.fonts.subheading);
        this.doc.setTextColor(PDF_CONFIG.colors.secondary);
        this.doc.text(line.substring(4), this.margins.left, this.currentY);
        this.currentY += 8;
      } else if (line.startsWith('## ')) {
        this.doc.setFontSize(PDF_CONFIG.fonts.heading);
        this.doc.setTextColor(PDF_CONFIG.colors.secondary);
        this.doc.text(line.substring(3), this.margins.left, this.currentY);
        this.currentY += 10;
      } else if (line.startsWith('# ')) {
        this.doc.setFontSize(PDF_CONFIG.fonts.title);
        this.doc.setTextColor(PDF_CONFIG.colors.primary);
        this.doc.text(line.substring(2), this.margins.left, this.currentY);
        this.currentY += 12;
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        // Bullet points
        this.doc.setFontSize(PDF_CONFIG.fonts.body);
        this.doc.setTextColor(PDF_CONFIG.colors.text);
        this.doc.text('•', this.margins.left + 5, this.currentY);
        const textLines = this.doc.splitTextToSize(line.substring(2), this.contentWidth - 10);
        this.doc.text(textLines, this.margins.left + 10, this.currentY);
        this.currentY += textLines.length * 5;
      } else if (line.trim()) {
        // Regular paragraph
        this.doc.setFontSize(PDF_CONFIG.fonts.body);
        this.doc.setTextColor(PDF_CONFIG.colors.text);
        const textLines = this.doc.splitTextToSize(line, this.contentWidth);
        this.doc.text(textLines, this.margins.left, this.currentY);
        this.currentY += textLines.length * 5;
      }

      if (line.trim()) {
        this.currentY += 2; // Add some spacing
      }
    });

    this.currentY += 5;
  }

  // Add code example
  addCodeExample(example) {
    this.checkPageBreak(30);

    // Code example title
    this.doc.setFontSize(PDF_CONFIG.fonts.subheading);
    this.doc.setTextColor(PDF_CONFIG.colors.secondary);
    this.doc.text(`Ejemplo: ${example.title}`, this.margins.left, this.currentY);
    this.currentY += 8;

    // Code block
    this.doc.setFillColor(245, 245, 245); // Light gray background
    const codeHeight = example.code.split('\n').length * 4 + 8;
    this.doc.rect(this.margins.left, this.currentY - 2, this.contentWidth, codeHeight, 'F');

    this.doc.setFontSize(PDF_CONFIG.fonts.small);
    this.doc.setTextColor(PDF_CONFIG.colors.text);
    this.doc.setFont('courier'); // Monospace font for code

    const codeLines = example.code.split('\n');
    codeLines.forEach((line, index) => {
      this.doc.text(line, this.margins.left + 3, this.currentY + (index * 4) + 3);
    });

    this.doc.setFont('helvetica'); // Reset to default font
    this.currentY += codeHeight + 5;
  }

  // Add tips section
  addTips(tips) {
    this.checkPageBreak(tips.length * 8 + 10);

    this.doc.setFontSize(PDF_CONFIG.fonts.subheading);
    this.doc.setTextColor(PDF_CONFIG.colors.accent);
    this.doc.text('💡 Consejos útiles:', this.margins.left, this.currentY);
    this.currentY += 8;

    tips.forEach(tip => {
      this.doc.setFontSize(PDF_CONFIG.fonts.body);
      this.doc.setTextColor(PDF_CONFIG.colors.text);
      this.doc.text('•', this.margins.left + 5, this.currentY);
      const tipLines = this.doc.splitTextToSize(tip, this.contentWidth - 10);
      this.doc.text(tipLines, this.margins.left + 10, this.currentY);
      this.currentY += tipLines.length * 5 + 2;
    });

    this.currentY += 5;
  }

  // Add warnings section
  addWarnings(warnings) {
    this.checkPageBreak(warnings.length * 8 + 10);

    this.doc.setFontSize(PDF_CONFIG.fonts.subheading);
    this.doc.setTextColor('#E53E3E'); // Red color for warnings
    this.doc.text('⚠️ Advertencias importantes:', this.margins.left, this.currentY);
    this.currentY += 8;

    warnings.forEach(warning => {
      this.doc.setFontSize(PDF_CONFIG.fonts.body);
      this.doc.setTextColor(PDF_CONFIG.colors.text);
      this.doc.text('•', this.margins.left + 5, this.currentY);
      const warningLines = this.doc.splitTextToSize(warning, this.contentWidth - 10);
      this.doc.text(warningLines, this.margins.left + 10, this.currentY);
      this.currentY += warningLines.length * 5 + 2;
    });

    this.currentY += 5;
  }

  // Add FAQs section
  addFAQs(faqs) {
    this.checkPageBreak(20);

    this.doc.setFontSize(PDF_CONFIG.fonts.heading);
    this.doc.setTextColor(PDF_CONFIG.colors.primary);
    this.doc.text('Preguntas Frecuentes', this.margins.left, this.currentY);
    this.addToTOC('Preguntas Frecuentes', 1);
    this.currentY += 10;

    faqs.forEach((faq, index) => {
      this.checkPageBreak(25);

      // Question
      this.doc.setFontSize(PDF_CONFIG.fonts.subheading);
      this.doc.setTextColor(PDF_CONFIG.colors.secondary);
      const questionText = `${index + 1}. ${faq.question}`;
      const questionLines = this.doc.splitTextToSize(questionText, this.contentWidth);
      this.doc.text(questionLines, this.margins.left, this.currentY);
      this.currentY += questionLines.length * 5 + 3;

      // Answer
      this.doc.setFontSize(PDF_CONFIG.fonts.body);
      this.doc.setTextColor(PDF_CONFIG.colors.text);
      const answerLines = this.doc.splitTextToSize(faq.answer, this.contentWidth);
      this.doc.text(answerLines, this.margins.left, this.currentY);
      this.currentY += answerLines.length * 5 + 8;
    });
  }

  // Add exercises section
  addExercises(exercises) {
    this.checkPageBreak(20);

    this.doc.setFontSize(PDF_CONFIG.fonts.heading);
    this.doc.setTextColor(PDF_CONFIG.colors.primary);
    this.doc.text('Ejercicios Prácticos', this.margins.left, this.currentY);
    this.addToTOC('Ejercicios Prácticos', 1);
    this.currentY += 10;

    exercises.forEach((exercise, index) => {
      this.checkPageBreak(30);

      // Exercise title
      this.doc.setFontSize(PDF_CONFIG.fonts.subheading);
      this.doc.setTextColor(PDF_CONFIG.colors.secondary);
      this.doc.text(`Ejercicio ${index + 1}: ${exercise.title}`, this.margins.left, this.currentY);
      this.currentY += 8;

      // Exercise objective
      if (exercise.objective) {
        this.doc.setFontSize(PDF_CONFIG.fonts.body);
        this.doc.setTextColor(PDF_CONFIG.colors.text);
        this.doc.text('Objetivo:', this.margins.left, this.currentY);
        this.currentY += 5;

        const objectiveLines = this.doc.splitTextToSize(exercise.objective, this.contentWidth - 10);
        this.doc.text(objectiveLines, this.margins.left + 10, this.currentY);
        this.currentY += objectiveLines.length * 5 + 5;
      }

      // Exercise steps
      if (exercise.steps) {
        this.doc.text('Pasos:', this.margins.left, this.currentY);
        this.currentY += 5;

        exercise.steps.forEach((step, stepIndex) => {
          this.checkPageBreak(8);
          const stepText = `${stepIndex + 1}. ${step}`;
          const stepLines = this.doc.splitTextToSize(stepText, this.contentWidth - 10);
          this.doc.text(stepLines, this.margins.left + 10, this.currentY);
          this.currentY += stepLines.length * 5 + 2;
        });
      }

      this.currentY += 8;
    });
  }

  // Add appendices
  addAppendices(content) {
    this.addPage();

    this.doc.setFontSize(PDF_CONFIG.fonts.title);
    this.doc.setTextColor(PDF_CONFIG.colors.primary);
    this.doc.text('Apéndices', this.margins.left, this.currentY);
    this.addToTOC('Apéndices', 0);
    this.currentY += 15;

    // Glossary
    if (content.common.glossary && content.common.glossary.length > 0) {
      this.addGlossary(content.common.glossary);
    }

    // Keyboard shortcuts
    if (content.common.shortcuts && content.common.shortcuts.length > 0) {
      this.addKeyboardShortcuts(content.common.shortcuts);
    }

    // Error codes
    if (content.common.errorCodes && content.common.errorCodes.length > 0) {
      this.addErrorCodes(content.common.errorCodes);
    }

    // Support information
    if (content.common.supportInfo) {
      this.addSupportInfo(content.common.supportInfo);
    }
  }

  // Add glossary
  addGlossary(glossary) {
    this.checkPageBreak(20);

    this.doc.setFontSize(PDF_CONFIG.fonts.heading);
    this.doc.setTextColor(PDF_CONFIG.colors.secondary);
    this.doc.text('Glosario de Términos', this.margins.left, this.currentY);
    this.addToTOC('Glosario de Términos', 1);
    this.currentY += 10;

    const glossaryData = glossary.map(item => [item.term, item.definition]);

    this.doc.autoTable({
      startY: this.currentY,
      head: [['Término', 'Definición']],
      body: glossaryData,
      theme: 'striped',
      styles: {
        fontSize: PDF_CONFIG.fonts.body,
        cellPadding: 3
      },
      headStyles: {
        fillColor: PDF_CONFIG.colors.primary,
        textColor: 'white'
      },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 130 }
      },
      margin: { left: this.margins.left, right: this.margins.right }
    });

    this.currentY = this.doc.lastAutoTable.finalY + 10;
  }

  // Add keyboard shortcuts
  addKeyboardShortcuts(shortcuts) {
    this.checkPageBreak(20);

    this.doc.setFontSize(PDF_CONFIG.fonts.heading);
    this.doc.setTextColor(PDF_CONFIG.colors.secondary);
    this.doc.text('Atajos de Teclado', this.margins.left, this.currentY);
    this.addToTOC('Atajos de Teclado', 1);
    this.currentY += 10;

    const shortcutData = shortcuts.map(shortcut => [
      shortcut.key,
      shortcut.action,
      shortcut.context || 'Global'
    ]);

    this.doc.autoTable({
      startY: this.currentY,
      head: [['Tecla', 'Acción', 'Contexto']],
      body: shortcutData,
      theme: 'striped',
      styles: {
        fontSize: PDF_CONFIG.fonts.body,
        cellPadding: 3
      },
      headStyles: {
        fillColor: PDF_CONFIG.colors.primary,
        textColor: 'white'
      },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 80 },
        2: { cellWidth: 60 }
      },
      margin: { left: this.margins.left, right: this.margins.right }
    });

    this.currentY = this.doc.lastAutoTable.finalY + 10;
  }

  // Add error codes
  addErrorCodes(errorCodes) {
    this.checkPageBreak(20);

    this.doc.setFontSize(PDF_CONFIG.fonts.heading);
    this.doc.setTextColor(PDF_CONFIG.colors.secondary);
    this.doc.text('Códigos de Error', this.margins.left, this.currentY);
    this.addToTOC('Códigos de Error', 1);
    this.currentY += 10;

    const errorData = errorCodes.map(error => [
      error.code,
      error.message,
      error.solution
    ]);

    this.doc.autoTable({
      startY: this.currentY,
      head: [['Código', 'Mensaje', 'Solución']],
      body: errorData,
      theme: 'striped',
      styles: {
        fontSize: PDF_CONFIG.fonts.small,
        cellPadding: 3
      },
      headStyles: {
        fillColor: PDF_CONFIG.colors.primary,
        textColor: 'white'
      },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 70 },
        2: { cellWidth: 85 }
      },
      margin: { left: this.margins.left, right: this.margins.right }
    });

    this.currentY = this.doc.lastAutoTable.finalY + 10;
  }

  // Add support information
  addSupportInfo(supportInfo) {
    this.checkPageBreak(30);

    this.doc.setFontSize(PDF_CONFIG.fonts.heading);
    this.doc.setTextColor(PDF_CONFIG.colors.secondary);
    this.doc.text('Información de Contacto', this.margins.left, this.currentY);
    this.addToTOC('Información de Contacto', 1);
    this.currentY += 10;

    const contactData = [
      ['Email de soporte', supportInfo.email || 'No disponible'],
      ['Teléfono', supportInfo.phone || 'No disponible'],
      ['Horario de atención', supportInfo.hours || 'No especificado'],
      ['Teléfono de emergencia', supportInfo.emergency || 'No disponible'],
      ['Tiempo de respuesta', supportInfo.responseTime || 'No especificado']
    ];

    this.doc.autoTable({
      startY: this.currentY,
      head: [['Tipo de Contacto', 'Información']],
      body: contactData,
      theme: 'grid',
      styles: {
        fontSize: PDF_CONFIG.fonts.body,
        cellPadding: 3
      },
      headStyles: {
        fillColor: PDF_CONFIG.colors.primary,
        textColor: 'white'
      },
      margin: { left: this.margins.left, right: this.margins.right }
    });

    this.currentY = this.doc.lastAutoTable.finalY + 10;
  }

  // Generate and return PDF
  generate() {
    // Add final page footer to all pages
    const totalPages = this.doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      this.doc.setPage(i);
      if (i > 1) { // Skip first page (cover)
        this.addPageFooter();
      }
    }

    return this.doc;
  }

  // Get PDF as blob
  getBlob() {
    return this.generate().output('blob');
  }

  // Download PDF
  download(filename = 'manual-tomaturno.pdf') {
    this.generate().save(filename);
  }

  // Get PDF as data URL
  getDataUrl() {
    return this.generate().output('datauristring');
  }
}

// Main function to generate documentation PDF
export async function generateDocumentationPDF(content, userRole, userName, options = {}) {
  const generator = new DocumentationPDFGenerator();
  generator.init();

  // Generate cover page
  generator.generateCoverPage(userRole, userName);

  // Generate table of contents placeholder (will be filled after content)
  const tocPageNumber = generator.doc.getNumberOfPages() + 1;

  // Add content based on role
  const roleContent = content[userRole] || content.usuario;

  if (roleContent.modules) {
    roleContent.modules
      .sort((a, b) => a.order - b.order)
      .forEach(module => {
        generator.addModule(module);
      });
  }

  // Add appendices
  generator.addAppendices(content);

  // Insert table of contents at the designated page
  const totalPages = generator.doc.getNumberOfPages();
  generator.doc.insertPage(tocPageNumber);
  generator.doc.setPage(tocPageNumber);
  generator.currentY = generator.margins.top;
  generator.generateTableOfContents();

  return generator;
}

// Export individual functions
export { DocumentationPDFGenerator, PDF_CONFIG };