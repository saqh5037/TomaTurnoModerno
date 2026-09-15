/**
 * Arma el `data` de prisma.auditLog.create respetando el modelo AuditLog:
 * entityId es Int opcional y la información adicional va en oldValue/newValue
 * (Json). El modelo no tiene campo `details`.
 */

// Los ids de Prisma son enteros positivos; cualquier otro valor se registra como null.
export function toAuditEntityId(value) {
  const id = typeof value === 'string' && value.trim() !== '' ? Number(value) : value;
  return Number.isInteger(id) && id > 0 ? id : null;
}

export function buildAuditLogData({ userId, action, entity, entityId, oldValue, newValue, ipAddress }) {
  const data = {
    userId,
    action,
    entity,
    entityId: toAuditEntityId(entityId)
  };

  if (oldValue !== undefined) data.oldValue = oldValue;
  if (newValue !== undefined) data.newValue = newValue;
  if (ipAddress !== undefined) data.ipAddress = ipAddress;

  return data;
}
