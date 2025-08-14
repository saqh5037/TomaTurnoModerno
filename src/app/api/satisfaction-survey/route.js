// src/app/api/satisfaction-survey/route.js
import prisma from '../../../../lib/prisma.js';

export async function POST(req) {
  try {
    const body = await req.json();
    const { rating, comments } = body;

    // Validar que el rating sea válido
    const validRatings = ['HAPPY', 'NEUTRAL', 'SAD'];
    if (!rating || !validRatings.includes(rating)) {
      return new Response(
        JSON.stringify({ 
          error: "Rating inválido. Debe ser uno de: HAPPY, NEUTRAL, SAD" 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Obtener información del request
    const userAgent = req.headers.get('user-agent') || null;
    const ipAddress = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     null;

    // Guardar la encuesta
    const survey = await prisma.satisfactionSurvey.create({
      data: {
        rating,
        comments: comments || null,
        userAgent,
        ipAddress
      }
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "¡Gracias por tu feedback!", 
        id: survey.id 
      }),
      { 
        status: 201, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error("Error al guardar encuesta de satisfacción:", error);
    return new Response(
      JSON.stringify({ 
        error: "Error interno del servidor" 
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const period = url.searchParams.get('period') || '7'; // días por defecto

    // Calcular fecha de inicio
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Obtener estadísticas
    const surveys = await prisma.satisfactionSurvey.findMany({
      where: {
        createdAt: {
          gte: startDate
        }
      },
      select: {
        rating: true,
        createdAt: true
      }
    });

    // Contar por rating
    const stats = surveys.reduce((acc, survey) => {
      acc[survey.rating] = (acc[survey.rating] || 0) + 1;
      return acc;
    }, { HAPPY: 0, NEUTRAL: 0, SAD: 0 });

    // Calcular total y porcentajes
    const total = surveys.length;
    const percentages = {
      HAPPY: total > 0 ? Math.round((stats.HAPPY / total) * 100) : 0,
      NEUTRAL: total > 0 ? Math.round((stats.NEUTRAL / total) * 100) : 0,
      SAD: total > 0 ? Math.round((stats.SAD / total) * 100) : 0
    };

    return new Response(
      JSON.stringify({
        total,
        stats,
        percentages,
        period: parseInt(period)
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error("Error al obtener estadísticas de satisfacción:", error);
    return new Response(
      JSON.stringify({ 
        error: "Error interno del servidor" 
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}