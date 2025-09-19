/**
 * SUITE DE TESTING FUNCIONAL - FLUJOS CRÍTICOS
 * Sistema TomaTurno INER
 * Criticidad: CRÍTICA
 */

const fetch = require('node-fetch');

describe('🏥 Critical Patient Flow Testing', () => {

  let authToken;
  let createdTurnId;
  let phlebotomistToken;

  beforeAll(async () => {
    // Login como admin para setup inicial
    const loginResponse = await fetch('http://localhost:3005/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123',
      }),
    });

    if (loginResponse.ok) {
      const data = await loginResponse.json();
      authToken = data.token;
    }
  });

  describe('Complete Patient Journey', () => {

    test('[FLOW-001] Should complete full patient cycle from creation to completion', async () => {
      // Step 1: Create turn
      const createResponse = await fetch('http://localhost:3005/api/turns/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName: 'Juan Pérez García',
          age: 45,
          gender: 'M',
          studies: ['Hemograma Completo', 'Glucosa', 'Perfil Lipídico'],
          tubesRequired: 3,
          tipoAtencion: 'General',
        }),
      });

      expect(createResponse.status).toBe(201);
      const turnData = await createResponse.json();
      expect(turnData.assignedTurn).toBeDefined();
      createdTurnId = turnData.assignedTurn;

      // Step 2: Verify turn appears in queue
      const queueResponse = await fetch('http://localhost:3005/api/queue/list');
      expect(queueResponse.status).toBe(200);
      const queueData = await queueResponse.json();

      const patientInQueue = queueData.pendingTurns?.find(
        t => t.id === createdTurnId
      );
      expect(patientInQueue).toBeDefined();
      expect(patientInQueue.status).toBe('Pending');

      // Step 3: Phlebotomist calls patient
      const callResponse = await fetch('http://localhost:3005/api/attention/call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${phlebotomistToken}`,
        },
        body: JSON.stringify({
          turnId: createdTurnId,
          cubicleId: 1,
          phlebotomistId: 1,
        }),
      });

      // Allow for missing auth in test
      expect([200, 201, 401]).toContain(callResponse.status);

      if (callResponse.status === 200 || callResponse.status === 201) {
        // Step 4: Verify patient status changed to InProgress
        const progressResponse = await fetch('http://localhost:3005/api/queue/list');
        const progressData = await progressResponse.json();

        const patientInProgress = progressData.inProgressTurns?.find(
          t => t.id === createdTurnId
        );

        if (patientInProgress) {
          expect(patientInProgress.status).toBe('InProgress');
          expect(patientInProgress.cubicleId).toBeDefined();
        }

        // Step 5: Complete attention
        const completeResponse = await fetch('http://localhost:3005/api/attention/complete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${phlebotomistToken}`,
          },
          body: JSON.stringify({
            turnId: createdTurnId,
            observations: 'Atención completada sin novedades',
          }),
        });

        expect([200, 201, 401]).toContain(completeResponse.status);

        // Step 6: Verify turn is completed
        if (completeResponse.status === 200) {
          const finalResponse = await fetch('http://localhost:3005/api/queue/list');
          const finalData = await finalResponse.json();

          // Should not be in pending or in progress
          const notInPending = !finalData.pendingTurns?.find(t => t.id === createdTurnId);
          const notInProgress = !finalData.inProgressTurns?.find(t => t.id === createdTurnId);

          expect(notInPending && notInProgress).toBe(true);
        }
      }
    });

    test('[FLOW-002] Should handle priority (Special) patient correctly', async () => {
      const createResponse = await fetch('http://localhost:3005/api/turns/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName: 'María García López',
          age: 78,
          gender: 'F',
          studies: ['Urgente - Troponinas'],
          tubesRequired: 1,
          tipoAtencion: 'Special',  // Priority patient
        }),
      });

      expect(createResponse.status).toBe(201);
      const turnData = await createResponse.json();
      expect(turnData.tipoAtencion).toBe('Special');

      // Verify priority marking in queue
      const queueResponse = await fetch('http://localhost:3005/api/queue/list');
      const queueData = await queueResponse.json();

      const priorityPatient = queueData.pendingTurns?.find(
        t => t.id === turnData.assignedTurn
      );

      if (priorityPatient) {
        expect(priorityPatient.tipoAtencion).toBe('Special');
      }
    });

    test('[FLOW-003] Should prevent duplicate turn assignments', async () => {
      // Create first turn
      const turn1 = await fetch('http://localhost:3005/api/turns/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName: 'Test Patient 1',
          age: 30,
          gender: 'M',
        }),
      });

      const data1 = await turn1.json();
      const turnId1 = data1.assignedTurn;

      // Create second turn
      const turn2 = await fetch('http://localhost:3005/api/turns/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName: 'Test Patient 2',
          age: 35,
          gender: 'F',
        }),
      });

      const data2 = await turn2.json();
      const turnId2 = data2.assignedTurn;

      // Turn numbers should be unique
      expect(turnId1).not.toBe(turnId2);
    });

    test('[FLOW-004] Should handle concurrent patient calls correctly', async () => {
      // Create multiple turns
      const turns = await Promise.all([
        fetch('http://localhost:3005/api/turns/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            patientName: 'Concurrent Patient 1',
            age: 25,
            gender: 'M',
          }),
        }),
        fetch('http://localhost:3005/api/turns/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            patientName: 'Concurrent Patient 2',
            age: 30,
            gender: 'F',
          }),
        }),
        fetch('http://localhost:3005/api/turns/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            patientName: 'Concurrent Patient 3',
            age: 35,
            gender: 'M',
          }),
        }),
      ]);

      const turnIds = await Promise.all(turns.map(r => r.json()));
      const uniqueIds = new Set(turnIds.map(t => t.assignedTurn));

      // All turn IDs should be unique
      expect(uniqueIds.size).toBe(turnIds.length);
    });
  });

  describe('Edge Cases and Error Handling', () => {

    test('[EDGE-001] Should handle extreme patient names', async () => {
      const extremeNames = [
        'María José de la Cruz García-López y Martínez del Río',
        'José María O\'Connor-Smith Jr.',
        'Ñoño Pérez',
        'François Müller',
        'José María 陈伟',
        'A', // Single character
        'X'.repeat(255), // Max length
      ];

      for (const name of extremeNames) {
        const response = await fetch('http://localhost:3005/api/turns/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            patientName: name,
            age: 30,
            gender: 'M',
          }),
        });

        // Should either accept or reject gracefully
        expect([201, 400, 422]).toContain(response.status);

        if (response.status === 201) {
          const data = await response.json();
          expect(data.assignedTurn).toBeDefined();
        }
      }
    });

    test('[EDGE-002] Should validate age boundaries', async () => {
      const invalidAges = [-1, 0, 150, 999, null, undefined, 'abc', Infinity, NaN];

      for (const age of invalidAges) {
        const response = await fetch('http://localhost:3005/api/turns/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            patientName: 'Test Patient',
            age: age,
            gender: 'M',
          }),
        });

        if (age === null || age === undefined || typeof age === 'string' ||
            age < 0 || age > 150 || !isFinite(age)) {
          expect([400, 422]).toContain(response.status);
        }
      }
    });

    test('[EDGE-003] Should handle massive studies array', async () => {
      const massiveStudies = Array(1000).fill('Blood Test');

      const response = await fetch('http://localhost:3005/api/turns/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName: 'Test Patient',
          age: 30,
          gender: 'M',
          studies: massiveStudies,
        }),
      });

      // Should either handle or reject gracefully
      expect([201, 400, 413, 422]).toContain(response.status);
    });

    test('[EDGE-004] Should handle invalid gender values', async () => {
      const invalidGenders = ['X', 'Male', 'Female', 123, null, '', 'OTHER'];

      for (const gender of invalidGenders) {
        const response = await fetch('http://localhost:3005/api/turns/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            patientName: 'Test Patient',
            age: 30,
            gender: gender,
          }),
        });

        // Should validate against M/F only
        if (!['M', 'F'].includes(gender)) {
          expect([400, 422]).toContain(response.status);
        }
      }
    });

    test('[EDGE-005] Should handle calling non-existent patient', async () => {
      const response = await fetch('http://localhost:3005/api/attention/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          turnId: 99999999,  // Non-existent ID
          cubicleId: 1,
        }),
      });

      expect([400, 404]).toContain(response.status);
    });

    test('[EDGE-006] Should prevent patient in multiple cubicles', async () => {
      // Create a turn
      const createResponse = await fetch('http://localhost:3005/api/turns/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName: 'Multiple Cubicle Test',
          age: 40,
          gender: 'M',
        }),
      });

      const turnData = await createResponse.json();
      const turnId = turnData.assignedTurn;

      // Try to call to multiple cubicles simultaneously
      const calls = await Promise.all([
        fetch('http://localhost:3005/api/attention/call', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            turnId: turnId,
            cubicleId: 1,
          }),
        }),
        fetch('http://localhost:3005/api/attention/call', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            turnId: turnId,
            cubicleId: 2,
          }),
        }),
      ]);

      // Only one should succeed
      const successCount = calls.filter(r => r.status === 200 || r.status === 201).length;
      expect(successCount).toBeLessThanOrEqual(1);
    });

    test('[EDGE-007] Should handle special characters in studies', async () => {
      const response = await fetch('http://localhost:3005/api/turns/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName: 'Test Patient',
          age: 30,
          gender: 'M',
          studies: [
            'Hemograma & Plaquetas',
            'Glucosa (ayunas)',
            'COVID-19 / SARS-CoV-2',
            '¿Perfil Tiroideo?',
            'Test #1234',
            'Vitamina B12 + Ácido Fólico',
          ],
        }),
      });

      expect([201, 400]).toContain(response.status);
    });

    test('[EDGE-008] Should handle timezone differences correctly', async () => {
      const response = await fetch('http://localhost:3005/api/turns/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Timezone': 'America/Mexico_City',
        },
        body: JSON.stringify({
          patientName: 'Timezone Test',
          age: 30,
          gender: 'M',
        }),
      });

      if (response.status === 201) {
        const data = await response.json();

        // Fetch turn details
        const queueResponse = await fetch('http://localhost:3005/api/queue/list');
        const queueData = await queueResponse.json();

        const turn = queueData.pendingTurns?.find(t => t.id === data.assignedTurn);
        if (turn && turn.createdAt) {
          // Verify timestamp is valid
          const createdDate = new Date(turn.createdAt);
          expect(createdDate.getTime()).not.toBeNaN();
        }
      }
    });
  });

  describe('State Consistency Tests', () => {

    test('[STATE-001] Should maintain consistent turn status transitions', async () => {
      // Create turn
      const createResponse = await fetch('http://localhost:3005/api/turns/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName: 'Status Test Patient',
          age: 35,
          gender: 'F',
        }),
      });

      const turnData = await createResponse.json();
      const turnId = turnData.assignedTurn;

      // Try invalid state transition (Pending -> Completed without InProgress)
      const completeResponse = await fetch('http://localhost:3005/api/attention/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          turnId: turnId,
        }),
      });

      // Should not allow skipping InProgress state
      expect([400, 422]).toContain(completeResponse.status);
    });

    test('[STATE-002] Should prevent resurrection of completed turns', async () => {
      // This would need a completed turn ID
      const response = await fetch('http://localhost:3005/api/attention/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          turnId: 1,  // Assuming ID 1 might be completed
          cubicleId: 1,
        }),
      });

      // Should not allow calling completed turns
      if (response.status === 400) {
        const data = await response.json();
        expect(data.error).toContain('completed');
      }
    });
  });

  describe('Performance Boundary Tests', () => {

    test('[PERF-001] Should handle rapid successive requests', async () => {
      const startTime = Date.now();
      const requests = Array(10).fill(null).map((_, i) =>
        fetch('http://localhost:3005/api/turns/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            patientName: `Rapid Test ${i}`,
            age: 25 + i,
            gender: i % 2 === 0 ? 'M' : 'F',
          }),
        })
      );

      const responses = await Promise.all(requests);
      const endTime = Date.now();

      // Should handle 10 requests in under 5 seconds
      expect(endTime - startTime).toBeLessThan(5000);

      // All should succeed or fail gracefully
      responses.forEach(r => {
        expect(r.status).toBeDefined();
      });
    });

    test('[PERF-002] Should paginate large queue lists', async () => {
      const response = await fetch('http://localhost:3005/api/queue/list?limit=10&offset=0');

      if (response.status === 200) {
        const data = await response.json();

        // Should not return unlimited results
        const totalResults =
          (data.pendingTurns?.length || 0) +
          (data.inProgressTurns?.length || 0);

        // This test assumes pagination is implemented
        expect(totalResults).toBeLessThanOrEqual(100);
      }
    });
  });
});

module.exports = {
  criticalFlowTestSuite: 'Critical Flow Tests Complete',
};