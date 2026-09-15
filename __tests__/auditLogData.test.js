/**
 * Regresión: /api/auth/refresh respondía 500 porque prisma.auditLog.create
 * recibía entityId como texto ('new' / String(id)) y un campo `details` que
 * no existe en el modelo AuditLog. Las rutas de perfil tenían la misma forma
 * y perdían sus registros de auditoría en silencio.
 */
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';
import prismaClient from '@prisma/client';
import { buildAuditLogData, toAuditEntityId } from '../lib/auditLogData.js';

const { Prisma } = prismaClient;
const ROOT = join(process.cwd());
const API_DIR = join(ROOT, 'src', 'app', 'api');

const auditLogScalarFields = () => {
  const model = Prisma.dmmf.datamodel.models.find((m) => m.name === 'AuditLog');
  return new Map(model.fields.filter((f) => f.kind !== 'object').map((f) => [f.name, f]));
};

const listRouteFiles = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return listRouteFiles(full);
    return /\.(js|ts)$/.test(name) ? [full] : [];
  });

describe('toAuditEntityId', () => {
  test('conserva enteros positivos y convierte texto numérico', () => {
    expect(toAuditEntityId(12)).toBe(12);
    expect(toAuditEntityId('12')).toBe(12);
  });

  test('devuelve null para valores que no son un id válido', () => {
    expect(toAuditEntityId('new')).toBeNull();
    expect(toAuditEntityId(undefined)).toBeNull();
    expect(toAuditEntityId(null)).toBeNull();
    expect(toAuditEntityId(0)).toBeNull();
    expect(toAuditEntityId('12abc')).toBeNull();
  });
});

describe('buildAuditLogData', () => {
  const fields = auditLogScalarFields();

  test('solo usa campos que existen en el modelo AuditLog', () => {
    const data = buildAuditLogData({
      userId: 5,
      action: 'REFRESH_TOKEN',
      entity: 'Session',
      entityId: 'new',
      newValue: { oldTokenExp: 1, newTokenExp: 2 },
      ipAddress: 'unknown'
    });

    for (const key of Object.keys(data)) {
      expect(fields.has(key)).toBe(true);
    }
    expect(data).not.toHaveProperty('details');
  });

  test('entityId siempre es Int o null, como exige el schema', () => {
    expect(fields.get('entityId').type).toBe('Int');
    expect(buildAuditLogData({ userId: 1, action: 'A', entity: 'User', entityId: '7' }).entityId).toBe(7);
    expect(buildAuditLogData({ userId: 1, action: 'A', entity: 'User', entityId: 'new' }).entityId).toBeNull();
  });

  test('conserva la información adicional en newValue/oldValue', () => {
    const data = buildAuditLogData({
      userId: 1,
      action: 'UPDATE_PROFILE',
      entity: 'User',
      entityId: 1,
      oldValue: { name: 'Antes' },
      newValue: { updatedFields: { name: true } }
    });
    expect(data.oldValue).toEqual({ name: 'Antes' });
    expect(data.newValue).toEqual({ updatedFields: { name: true } });
    expect(data).not.toHaveProperty('ipAddress');
  });
});

describe('llamadas a prisma.auditLog.create en las rutas API', () => {
  test('ninguna usa campos inexistentes ni entityId como texto', () => {
    const offenders = [];

    for (const file of listRouteFiles(API_DIR)) {
      const source = readFileSync(file, 'utf8').replace(/^\s*\/\/.*$/gm, '');
      let index = source.indexOf('auditLog.create(');
      while (index !== -1) {
        const call = source.slice(index, index + 800);
        const end = call.indexOf('});');
        const block = end === -1 ? call : call.slice(0, end);
        if (/\bdetails\s*:/.test(block) || /entityId\s*:\s*(String\(|['"`])/.test(block)) {
          const line = source.slice(0, index).split('\n').length;
          offenders.push(`${relative(ROOT, file)}:${line}`);
        }
        index = source.indexOf('auditLog.create(', index + 1);
      }
    }

    expect(offenders).toEqual([]);
  });
});
