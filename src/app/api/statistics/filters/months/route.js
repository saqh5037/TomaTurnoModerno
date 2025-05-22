export async function GET() {
  const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
  ];

  return new Response(JSON.stringify(months), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
