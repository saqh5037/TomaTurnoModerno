const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const sampleModules = [
  {
    moduleId: 'dashboard',
    title: 'Dashboard Administrativo',
    description: 'Aprende a usar el dashboard para monitorear el sistema',
    category: 'admin',
    content: {
      overview: 'El dashboard es el centro de control principal del sistema TomaTurno.',
      sections: [
        {
          id: 'overview',
          title: 'Vista General',
          description: 'Introducción al dashboard administrativo'
        }
      ],
      features: [
        'Métricas en tiempo real',
        'Reportes automáticos',
        'Gestión de usuarios'
      ]
    },
    order: 1,
    isActive: true,
    views: 0
  },
  {
    moduleId: 'users',
    title: 'Gestión de Usuarios',
    description: 'Administra usuarios y asigna permisos en el sistema',
    category: 'admin',
    content: {
      overview: 'Gestiona todos los aspectos relacionados con usuarios del sistema.',
      sections: [
        {
          id: 'creation',
          title: 'Crear Usuarios',
          description: 'Cómo crear nuevos usuarios'
        },
        {
          id: 'permissions',
          title: 'Asignar Permisos',
          description: 'Configuración de roles y permisos'
        }
      ],
      features: [
        'Creación de usuarios',
        'Asignación de roles',
        'Reseteo de contraseñas'
      ]
    },
    order: 2,
    isActive: true,
    views: 0
  },
  {
    moduleId: 'attention-panel',
    title: 'Panel de Atención',
    description: 'Guía para flebotomistas sobre el uso del panel de atención',
    category: 'flebotomista',
    content: {
      overview: 'El panel de atención es la herramienta principal para flebotomistas.',
      sections: [
        {
          id: 'cubicle-selection',
          title: 'Selección de Cubículo',
          description: 'Cómo seleccionar y configurar tu cubículo'
        },
        {
          id: 'patient-calling',
          title: 'Llamado de Pacientes',
          description: 'Proceso para llamar y atender pacientes'
        }
      ],
      features: [
        'Selección de cubículo',
        'Llamado de pacientes',
        'Gestión de turnos'
      ]
    },
    order: 1,
    isActive: true,
    views: 0
  },
  {
    moduleId: 'queue-viewing',
    title: 'Visualización de Turnos',
    description: 'Cómo interpretar la información de la cola de turnos',
    category: 'usuario',
    content: {
      overview: 'Aprende a entender la información mostrada en la pantalla de turnos.',
      sections: [
        {
          id: 'status-understanding',
          title: 'Estados de Turnos',
          description: 'Qué significa cada estado y color'
        },
        {
          id: 'waiting-time',
          title: 'Tiempo de Espera',
          description: 'Cómo calcular tu tiempo estimado'
        }
      ],
      features: [
        'Estados de turnos',
        'Tiempo estimado',
        'Información de cubículos'
      ]
    },
    order: 1,
    isActive: true,
    views: 0
  }
];

const sampleFeedback = [
  {
    moduleId: 'dashboard',
    rating: 5,
    comment: 'Excelente explicación del dashboard, muy clara y completa.',
    isHelpful: true,
    category: 'praise',
    status: 'reviewed'
  },
  {
    moduleId: 'users',
    rating: 4,
    comment: 'Sería útil tener más ejemplos de configuración de permisos.',
    isHelpful: true,
    category: 'suggestion',
    status: 'pending'
  },
  {
    moduleId: 'attention-panel',
    rating: 5,
    comment: 'Perfecto para nuevos flebotomistas, muy detallado.',
    isHelpful: true,
    category: 'praise',
    status: 'reviewed'
  }
];

const sampleFAQVotes = [
  {
    faqId: 'export-data-faq',
    isHelpful: true
  },
  {
    faqId: 'user-permissions-faq',
    isHelpful: true
  },
  {
    faqId: 'patient-no-show-faq',
    isHelpful: true
  }
];

async function seedDocumentationData() {
  console.log('🌱 Iniciando población de datos de documentación...');

  try {
    // Clear existing documentation data
    console.log('🧹 Limpiando datos existentes...');

    await prisma.fAQVote.deleteMany();
    await prisma.documentationFeedback.deleteMany();
    await prisma.documentationBookmark.deleteMany();
    await prisma.documentationEvent.deleteMany();
    await prisma.documentationModule.deleteMany();

    console.log('✅ Datos existentes eliminados');

    // Seed modules
    console.log('📚 Creando módulos de documentación...');

    for (const moduleData of sampleModules) {
      await prisma.documentationModule.create({
        data: moduleData
      });
      console.log(`  ✅ Módulo creado: ${moduleData.title}`);
    }

    // Seed feedback
    console.log('💬 Creando comentarios de muestra...');

    for (const feedback of sampleFeedback) {
      await prisma.documentationFeedback.create({
        data: feedback
      });
    }
    console.log(`  ✅ ${sampleFeedback.length} comentarios creados`);

    // Seed FAQ votes
    console.log('👍 Creando votos de FAQ...');

    for (const vote of sampleFAQVotes) {
      await prisma.fAQVote.create({
        data: vote
      });
    }
    console.log(`  ✅ ${sampleFAQVotes.length} votos creados`);

    // Create sample analytics events
    console.log('📊 Creando eventos de analytics de muestra...');

    const eventTypes = [
      'page_view',
      'search',
      'video_play',
      'pdf_download',
      'bookmark_add',
      'exercise_complete'
    ];

    const userRoles = ['admin', 'flebotomista', 'usuario'];
    const moduleIds = sampleModules.map(m => m.moduleId);

    // Generate 100 sample events
    for (let i = 0; i < 100; i++) {
      const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      const userRole = userRoles[Math.floor(Math.random() * userRoles.length)];
      const moduleId = moduleIds[Math.floor(Math.random() * moduleIds.length)];

      // Create timestamp within last 30 days
      const timestamp = new Date();
      timestamp.setDate(timestamp.getDate() - Math.floor(Math.random() * 30));

      await prisma.documentationEvent.create({
        data: {
          eventType,
          moduleId,
          userRole,
          metadata: {
            sessionId: `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            source: 'web'
          },
          sessionId: `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          ipAddress: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
          userAgent: 'Mozilla/5.0 (Sample User Agent)',
          timestamp
        }
      });

      if (i % 20 === 0) {
        console.log(`  📈 ${i + 1}/100 eventos creados...`);
      }
    }

    console.log('  ✅ 100 eventos de analytics creados');

    // Update module view counts based on page_view events
    console.log('👀 Actualizando contadores de vistas...');

    for (const module of sampleModules) {
      const viewCount = await prisma.documentationEvent.count({
        where: {
          moduleId: module.moduleId,
          eventType: 'page_view'
        }
      });

      await prisma.documentationModule.update({
        where: { moduleId: module.moduleId },
        data: { views: viewCount }
      });

      console.log(`  👁️  Módulo "${module.title}": ${viewCount} vistas`);
    }

    // Generate summary statistics
    console.log('\n📊 RESUMEN DE DATOS CREADOS:');

    const moduleCount = await prisma.documentationModule.count();
    const eventCount = await prisma.documentationEvent.count();
    const feedbackCount = await prisma.documentationFeedback.count();
    const voteCount = await prisma.fAQVote.count();

    console.log(`📚 Módulos de documentación: ${moduleCount}`);
    console.log(`📊 Eventos de analytics: ${eventCount}`);
    console.log(`💬 Comentarios: ${feedbackCount}`);
    console.log(`👍 Votos de FAQ: ${voteCount}`);

    // Show analytics by event type
    console.log('\n📈 EVENTOS POR TIPO:');

    const eventsByType = await prisma.documentationEvent.groupBy({
      by: ['eventType'],
      _count: {
        eventType: true
      },
      orderBy: {
        _count: {
          eventType: 'desc'
        }
      }
    });

    eventsByType.forEach(event => {
      console.log(`  ${event.eventType}: ${event._count.eventType} eventos`);
    });

    // Show events by user role
    console.log('\n👥 EVENTOS POR ROL:');

    const eventsByRole = await prisma.documentationEvent.groupBy({
      by: ['userRole'],
      _count: {
        userRole: true
      },
      orderBy: {
        _count: {
          userRole: 'desc'
        }
      }
    });

    eventsByRole.forEach(event => {
      const role = event.userRole || 'Sin rol';
      console.log(`  ${role}: ${event._count.userRole} eventos`);
    });

    console.log('\n✅ Población de datos de documentación completada exitosamente!');
    console.log('\n🚀 Puedes acceder a la documentación en: http://localhost:3005/docs');

  } catch (error) {
    console.error('❌ Error al popular datos de documentación:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  seedDocumentationData()
    .then(() => {
      console.log('🎉 Script completado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error en el script:', error);
      process.exit(1);
    });
}

module.exports = { seedDocumentationData };