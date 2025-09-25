import prisma from '@/lib/prisma';

// GET - Obtener un cubículo específico
export const GET = async (req, context) => {
  const { id } = await context.params;

  try {
    const cubicle = await prisma.cubicle.findUnique({
      where: { id: parseInt(id) },
      include: {
        turnRequests: {
          where: {
            status: { in: ['Pending', 'InProgress'] }
          },
          select: { id: true, status: true, patientName: true }
        }
      }
    });

    if (!cubicle) {
      return new Response(
        JSON.stringify({ error: 'Cubículo no encontrado' }),
        { status: 404 }
      );
    }

    // Agregar contador de pacientes activos
    const pacientesEnCola = cubicle.turnRequests.length;

    return new Response(
      JSON.stringify({ ...cubicle, pacientesEnCola }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error al obtener cubículo:', error);
    return new Response(
      JSON.stringify({ error: 'Error al obtener el cubículo' }),
      { status: 500 }
    );
  }
};

// PUT - Modificar un cubículo por ID
export const PUT = async (req, context) => {
  const { id } = await context.params;
  const body = await req.json();
  const { name, isSpecial, isActive } = body;

  try {
    // Verificar que existe
    const existingCubicle = await prisma.cubicle.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingCubicle) {
      return new Response(
        JSON.stringify({ error: 'Cubículo no encontrado' }),
        { status: 404 }
      );
    }

    // Si se intenta desactivar, validar que no haya pacientes
    if (isActive === false) {
      const activeTurns = await prisma.turnRequest.count({
        where: {
          cubicleId: parseInt(id),
          status: { in: ['Pending', 'InProgress'] }
        }
      });

      if (activeTurns > 0) {
        return new Response(
          JSON.stringify({
            error: 'No se puede desactivar el cubículo',
            details: `Hay ${activeTurns} paciente(s) en cola o siendo atendido(s)`,
            pacientesActivos: activeTurns
          }),
          { status: 400 }
        );
      }
    }

    // Actualizar
    const updatedCubicle = await prisma.cubicle.update({
      where: { id: parseInt(id) },
      data: {
        ...(name !== undefined && { name }),
        ...(isSpecial !== undefined && { isSpecial }),
        ...(isActive !== undefined && { isActive }),
        type: isSpecial ? 'SPECIAL' : 'GENERAL'
      }
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Cubículo actualizado exitosamente',
        data: updatedCubicle
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error al modificar el cubículo:', error);
    return new Response(
      JSON.stringify({ error: 'Error al modificar el cubículo' }),
      { status: 500 }
    );
  }
};

// PATCH - Toggle estado activo/inactivo
export const PATCH = async (req, context) => {
  const { id } = await context.params;
  const body = await req.json();
  const { isActive } = body;

  try {
    // Verificar que existe el cubículo
    const cubicle = await prisma.cubicle.findUnique({
      where: { id: parseInt(id) },
      include: {
        turnRequests: {
          where: {
            status: { in: ['Pending', 'InProgress'] }
          }
        }
      }
    });

    if (!cubicle) {
      return new Response(
        JSON.stringify({ error: 'Cubículo no encontrado' }),
        { status: 404 }
      );
    }

    // Validar antes de desactivar
    if (!isActive && cubicle.turnRequests.length > 0) {
      return new Response(
        JSON.stringify({
          error: 'No se puede desactivar el cubículo',
          details: `Hay ${cubicle.turnRequests.length} paciente(s) en cola o siendo atendido(s)`,
          pacientesEnCola: cubicle.turnRequests.length
        }),
        { status: 400 }
      );
    }

    // Actualizar estado
    const updatedCubicle = await prisma.cubicle.update({
      where: { id: parseInt(id) },
      data: { isActive }
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: `Cubículo ${isActive ? 'activado' : 'desactivado'} exitosamente`,
        data: updatedCubicle
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error al cambiar estado del cubículo:', error);
    return new Response(
      JSON.stringify({ error: 'Error al cambiar el estado del cubículo' }),
      { status: 500 }
    );
  }
};

// DELETE - Eliminar un cubículo con validaciones
export const DELETE = async (req, context) => {
  const { id } = await context.params;

  try {
    // Verificar que existe y obtener información relacionada
    const cubicle = await prisma.cubicle.findUnique({
      where: { id: parseInt(id) },
      include: {
        turnRequests: {
          select: { id: true, status: true }
        }
      }
    });

    if (!cubicle) {
      return new Response(
        JSON.stringify({ error: 'Cubículo no encontrado' }),
        { status: 404 }
      );
    }

    // Validación 1: No eliminar si hay pacientes activos
    const activeTurns = cubicle.turnRequests.filter(
      turn => ['Pending', 'InProgress'].includes(turn.status)
    );

    if (activeTurns.length > 0) {
      return new Response(
        JSON.stringify({
          error: 'No se puede eliminar el cubículo',
          details: `Hay ${activeTurns.length} paciente(s) en cola o siendo atendido(s)`,
          pacientesActivos: activeTurns.length
        }),
        { status: 400 }
      );
    }

    // Validación 2: Verificar registros históricos
    const historicalTurns = await prisma.turnRequest.count({
      where: { cubicleId: parseInt(id) }
    });

    if (historicalTurns > 10) {  // Permitir eliminar si hay menos de 10 registros históricos
      return new Response(
        JSON.stringify({
          error: 'No se puede eliminar el cubículo',
          details: `Existen ${historicalTurns} registros históricos asociados`,
          registrosHistoricos: historicalTurns,
          sugerencia: 'Considere desactivar el cubículo en lugar de eliminarlo'
        }),
        { status: 400 }
      );
    }

    // Si pasa todas las validaciones, proceder con la eliminación
    await prisma.cubicle.delete({
      where: { id: parseInt(id) }
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Cubículo eliminado exitosamente'
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error al eliminar el cubículo:', error);
    return new Response(
      JSON.stringify({ error: 'Error al eliminar el cubículo' }),
      { status: 500 }
    );
  }
};