import { NextResponse } from "next/server";
import { generateDocumentationPDF } from "../../../../../lib/docs/pdfGenerator";
import { documentationContent } from "../../../../../lib/docs/content";

export async function POST(req) {
  try {
    const { userRole, userName, moduleIds, format = 'pdf' } = await req.json();

    // Validate required parameters
    if (!userRole) {
      return NextResponse.json(
        { success: false, error: 'userRole is required' },
        { status: 400 }
      );
    }

    // Filter content if specific modules are requested
    let content = documentationContent;
    if (moduleIds && Array.isArray(moduleIds) && moduleIds.length > 0) {
      const roleContent = content[userRole] || content.usuario;
      const filteredModules = roleContent.modules?.filter(module =>
        moduleIds.includes(module.id)
      ) || [];

      content = {
        ...content,
        [userRole]: {
          ...roleContent,
          modules: filteredModules
        }
      };
    }

    // Generate PDF
    const generator = await generateDocumentationPDF(content, userRole, userName);

    if (format === 'blob') {
      // Return as blob for client-side handling
      const pdfBlob = generator.getBlob();

      return new NextResponse(pdfBlob, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="manual-${userRole}-${Date.now()}.pdf"`
        }
      });
    } else if (format === 'dataurl') {
      // Return as data URL
      const dataUrl = generator.getDataUrl();

      return NextResponse.json({
        success: true,
        dataUrl,
        filename: `manual-${userRole}-${Date.now()}.pdf`
      });
    } else {
      // Default: return as downloadable PDF
      const pdfBuffer = generator.generate().output('arraybuffer');

      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="manual-${userRole}-${Date.now()}.pdf"`,
          'Content-Length': pdfBuffer.byteLength.toString()
        }
      });
    }

  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate PDF', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userRole = searchParams.get('userRole');
    const userName = searchParams.get('userName');
    const moduleIds = searchParams.get('moduleIds')?.split(',').filter(Boolean);

    if (!userRole) {
      return NextResponse.json(
        { success: false, error: 'userRole parameter is required' },
        { status: 400 }
      );
    }

    // Filter content if specific modules are requested
    let content = documentationContent;
    if (moduleIds && moduleIds.length > 0) {
      const roleContent = content[userRole] || content.usuario;
      const filteredModules = roleContent.modules?.filter(module =>
        moduleIds.includes(module.id)
      ) || [];

      content = {
        ...content,
        [userRole]: {
          ...roleContent,
          modules: filteredModules
        }
      };
    }

    // Generate PDF
    const generator = await generateDocumentationPDF(content, userRole, userName);
    const pdfBuffer = generator.generate().output('arraybuffer');

    // Set filename based on content
    const moduleText = moduleIds && moduleIds.length > 0
      ? `-${moduleIds.join('-')}`
      : '';
    const filename = `manual-${userRole}${moduleText}-${new Date().toISOString().split('T')[0]}.pdf`;

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.byteLength.toString(),
        'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
      }
    });

  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate PDF', details: error.message },
      { status: 500 }
    );
  }
}