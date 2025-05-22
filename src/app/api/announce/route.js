export async function POST(req) {
  try {
    const { patientName, cubicle } = await req.json();

    if (!patientName || !cubicle) {
      return new Response(JSON.stringify({ error: "Parámetros incompletos" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const message = `Paciente ${patientName}, favor de pasar al cubículo ${cubicle}`;

    return new Response(JSON.stringify({ message }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Error al procesar la solicitud" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
