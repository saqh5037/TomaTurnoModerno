// Sistema de Métricas de Éxito Educativo para el Módulo de Documentación

export const educationMetrics = {
  // Métricas de aprendizaje
  learningMetrics: {
    completionRate: {
      name: 'Tasa de Finalización',
      description: 'Porcentaje de usuarios que completan tutoriales',
      calculation: 'completedTutorials / startedTutorials * 100',
      target: 80,
      unit: '%',
      importance: 'high'
    },
    averageTimeToCompetency: {
      name: 'Tiempo hasta Competencia',
      description: 'Tiempo promedio para dominar una función',
      calculation: 'sum(timeToComplete) / totalUsers',
      target: 30,
      unit: 'minutos',
      importance: 'medium'
    },
    errorReductionRate: {
      name: 'Reducción de Errores',
      description: 'Reducción de errores después del tutorial',
      calculation: '(errorsBefore - errorsAfter) / errorsBefore * 100',
      target: 60,
      unit: '%',
      importance: 'high'
    },
    supportTicketReduction: {
      name: 'Reducción de Tickets',
      description: 'Disminución de tickets de soporte después del entrenamiento',
      calculation: '(ticketsBefore - ticketsAfter) / ticketsBefore * 100',
      target: 40,
      unit: '%',
      importance: 'medium'
    },
    knowledgeRetention: {
      name: 'Retención del Conocimiento',
      description: 'Porcentaje de conocimiento retenido después de 30 días',
      calculation: 'correctAnswersAfter30Days / totalQuestions * 100',
      target: 70,
      unit: '%',
      importance: 'high'
    }
  },

  // Métricas de engagement
  engagementMetrics: {
    dailyActiveUsers: {
      name: 'Usuarios Activos Diarios',
      description: 'Usuarios que consultan docs diariamente',
      calculation: 'uniqueUsersPerDay',
      target: 100,
      unit: 'usuarios',
      importance: 'high'
    },
    videoCompletionRate: {
      name: 'Videos Completados',
      description: 'Videos vistos hasta el final',
      calculation: 'videosCompleted / videosStarted * 100',
      target: 70,
      unit: '%',
      importance: 'medium'
    },
    interactiveExerciseScore: {
      name: 'Puntuación en Ejercicios',
      description: 'Puntuación promedio en ejercicios interactivos',
      calculation: 'sum(exerciseScores) / totalExercises',
      target: 85,
      unit: 'puntos',
      importance: 'high'
    },
    repeatVisits: {
      name: 'Visitas Repetidas',
      description: 'Usuarios que vuelven a consultar',
      calculation: 'returningUsers / totalUsers * 100',
      target: 50,
      unit: '%',
      importance: 'medium'
    },
    averageSessionDuration: {
      name: 'Duración de Sesión',
      description: 'Tiempo promedio por sesión',
      calculation: 'sum(sessionDurations) / totalSessions',
      target: 15,
      unit: 'minutos',
      importance: 'medium'
    },
    searchEffectiveness: {
      name: 'Efectividad de Búsqueda',
      description: 'Usuarios que encuentran lo que buscan',
      calculation: 'successfulSearches / totalSearches * 100',
      target: 90,
      unit: '%',
      importance: 'high'
    }
  },

  // Métricas de satisfacción
  satisfactionMetrics: {
    nps: {
      name: 'Net Promoter Score',
      description: 'NPS de la documentación',
      calculation: 'promoters - detractors',
      target: 50,
      unit: 'puntos',
      importance: 'high'
    },
    helpfulnessRating: {
      name: 'Calificación de Utilidad',
      description: 'Qué tan útil fue el contenido',
      calculation: 'sum(ratings) / totalRatings',
      target: 4.5,
      unit: 'estrellas',
      importance: 'high'
    },
    clarityScore: {
      name: 'Claridad del Contenido',
      description: 'Qué tan claro es el contenido',
      calculation: 'sum(clarityRatings) / totalRatings',
      target: 4.3,
      unit: 'puntos',
      importance: 'medium'
    },
    recommendationRate: {
      name: 'Tasa de Recomendación',
      description: 'Usuarios que recomendarían el sistema',
      calculation: 'wouldRecommend / totalUsers * 100',
      target: 85,
      unit: '%',
      importance: 'high'
    },
    feedbackQuality: {
      name: 'Calidad del Feedback',
      description: 'Calidad promedio del feedback recibido',
      calculation: 'positiveFeedback / totalFeedback * 100',
      target: 80,
      unit: '%',
      importance: 'medium'
    }
  },

  // Métricas de rendimiento
  performanceMetrics: {
    taskCompletionTime: {
      name: 'Tiempo de Tarea',
      description: 'Tiempo para completar tareas después del entrenamiento',
      calculation: 'averageTaskTime',
      target: 5,
      unit: 'minutos',
      importance: 'high',
      benchmark: {
        beforeTraining: 12,
        afterTraining: 5,
        improvement: 58
      }
    },
    firstCallResolution: {
      name: 'Resolución en Primera Llamada',
      description: 'Problemas resueltos sin escalar',
      calculation: 'resolvedFirst / totalIssues * 100',
      target: 90,
      unit: '%',
      importance: 'high'
    },
    productivityIncrease: {
      name: 'Aumento de Productividad',
      description: 'Incremento en tareas completadas por hora',
      calculation: '(tasksAfter - tasksBefore) / tasksBefore * 100',
      target: 30,
      unit: '%',
      importance: 'high'
    },
    errorFrequency: {
      name: 'Frecuencia de Errores',
      description: 'Errores por cada 100 operaciones',
      calculation: 'totalErrors / (totalOperations / 100)',
      target: 2,
      unit: 'errores',
      importance: 'high'
    }
  },

  // Métricas de gamificación
  gamificationMetrics: {
    xpEarned: {
      name: 'XP Total Ganado',
      description: 'Experiencia acumulada por todos los usuarios',
      calculation: 'sum(userXP)',
      unit: 'XP',
      importance: 'medium'
    },
    achievementsUnlocked: {
      name: 'Logros Desbloqueados',
      description: 'Total de logros conseguidos',
      calculation: 'sum(userAchievements)',
      unit: 'logros',
      importance: 'medium'
    },
    streakAverage: {
      name: 'Racha Promedio',
      description: 'Días consecutivos promedio de uso',
      calculation: 'sum(userStreaks) / totalUsers',
      target: 7,
      unit: 'días',
      importance: 'medium'
    },
    leaderboardParticipation: {
      name: 'Participación en Rankings',
      description: 'Usuarios activos en rankings',
      calculation: 'activeInLeaderboard / totalUsers * 100',
      target: 60,
      unit: '%',
      importance: 'low'
    }
  },

  // Métricas de contenido
  contentMetrics: {
    mostViewedModules: {
      name: 'Módulos Más Vistos',
      description: 'Top 5 módulos más consultados',
      calculation: 'sortByViews(modules).slice(0, 5)',
      format: 'list'
    },
    searchTerms: {
      name: 'Términos de Búsqueda',
      description: 'Términos más buscados',
      calculation: 'groupByFrequency(searchTerms)',
      format: 'wordcloud'
    },
    contentGaps: {
      name: 'Gaps de Contenido',
      description: 'Temas buscados pero no encontrados',
      calculation: 'searchesWithoutResults',
      format: 'list'
    },
    updateFrequency: {
      name: 'Frecuencia de Actualización',
      description: 'Qué tan seguido se actualiza el contenido',
      calculation: 'updatesPerMonth',
      target: 10,
      unit: 'actualizaciones/mes'
    }
  }
};

// Funciones para calcular métricas
export const calculateMetrics = async (prisma, timeRange = 'last30days') => {
  const metrics = {};

  // Calcular completion rate
  const startedTutorials = await prisma.documentationEvent.count({
    where: {
      eventType: 'tutorial_start',
      createdAt: getTimeRangeFilter(timeRange)
    }
  });

  const completedTutorials = await prisma.documentationEvent.count({
    where: {
      eventType: 'tutorial_complete',
      createdAt: getTimeRangeFilter(timeRange)
    }
  });

  metrics.completionRate = startedTutorials > 0
    ? Math.round((completedTutorials / startedTutorials) * 100)
    : 0;

  // Calcular DAU (Daily Active Users)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  metrics.dailyActiveUsers = await prisma.documentationEvent.groupBy({
    by: ['userId'],
    where: {
      createdAt: {
        gte: today
      }
    },
    _count: true
  }).then(result => result.length);

  // Calcular video completion rate
  const videosStarted = await prisma.documentationEvent.count({
    where: {
      eventType: 'video_play',
      createdAt: getTimeRangeFilter(timeRange)
    }
  });

  const videosCompleted = await prisma.documentationEvent.count({
    where: {
      eventType: 'video_complete',
      createdAt: getTimeRangeFilter(timeRange)
    }
  });

  metrics.videoCompletionRate = videosStarted > 0
    ? Math.round((videosCompleted / videosStarted) * 100)
    : 0;

  // Calcular average session duration
  const sessions = await prisma.documentationEvent.findMany({
    where: {
      eventType: 'session_end',
      createdAt: getTimeRangeFilter(timeRange)
    },
    select: {
      metadata: true
    }
  });

  const durations = sessions
    .map(s => s.metadata?.duration)
    .filter(Boolean);

  metrics.averageSessionDuration = durations.length > 0
    ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
    : 0;

  // Calcular helpfulness rating
  const ratings = await prisma.documentationFeedback.findMany({
    where: {
      createdAt: getTimeRangeFilter(timeRange)
    },
    select: {
      rating: true
    }
  });

  metrics.helpfulnessRating = ratings.length > 0
    ? (ratings.reduce((a, b) => a + b.rating, 0) / ratings.length).toFixed(1)
    : 0;

  // Calcular módulos más vistos
  const moduleViews = await prisma.documentationEvent.groupBy({
    by: ['moduleId'],
    where: {
      eventType: 'page_view',
      createdAt: getTimeRangeFilter(timeRange)
    },
    _count: {
      moduleId: true
    },
    orderBy: {
      _count: {
        moduleId: 'desc'
      }
    },
    take: 5
  });

  metrics.mostViewedModules = moduleViews.map(m => ({
    moduleId: m.moduleId,
    views: m._count.moduleId
  }));

  // Calcular search effectiveness
  const totalSearches = await prisma.documentationEvent.count({
    where: {
      eventType: 'search',
      createdAt: getTimeRangeFilter(timeRange)
    }
  });

  const successfulSearches = await prisma.documentationEvent.count({
    where: {
      eventType: 'search_result_click',
      createdAt: getTimeRangeFilter(timeRange)
    }
  });

  metrics.searchEffectiveness = totalSearches > 0
    ? Math.round((successfulSearches / totalSearches) * 100)
    : 0;

  return metrics;
};

// Helper para filtros de tiempo
const getTimeRangeFilter = (range) => {
  const now = new Date();
  const filters = {
    today: new Date(now.setHours(0, 0, 0, 0)),
    last7days: new Date(now.setDate(now.getDate() - 7)),
    last30days: new Date(now.setDate(now.getDate() - 30)),
    last90days: new Date(now.setDate(now.getDate() - 90)),
    lastYear: new Date(now.setFullYear(now.getFullYear() - 1))
  };

  return {
    gte: filters[range] || filters.last30days
  };
};

// Generar reporte de métricas
export const generateMetricsReport = async (metrics) => {
  const report = {
    summary: {
      date: new Date().toISOString(),
      overallHealth: calculateOverallHealth(metrics),
      topMetrics: getTopMetrics(metrics),
      areasOfImprovement: getAreasOfImprovement(metrics)
    },
    details: metrics,
    recommendations: generateRecommendations(metrics)
  };

  return report;
};

// Calcular salud general del sistema
const calculateOverallHealth = (metrics) => {
  const scores = [];

  // Evaluar cada métrica contra su target
  if (metrics.completionRate >= 80) scores.push(1);
  else scores.push(metrics.completionRate / 80);

  if (metrics.videoCompletionRate >= 70) scores.push(1);
  else scores.push(metrics.videoCompletionRate / 70);

  if (metrics.helpfulnessRating >= 4.5) scores.push(1);
  else scores.push(metrics.helpfulnessRating / 4.5);

  const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;

  return {
    score: Math.round(averageScore * 100),
    status: averageScore >= 0.9 ? 'excellent' :
            averageScore >= 0.7 ? 'good' :
            averageScore >= 0.5 ? 'needs-improvement' : 'critical'
  };
};

// Obtener métricas destacadas
const getTopMetrics = (metrics) => {
  return [
    {
      name: 'Tasa de Finalización',
      value: metrics.completionRate,
      unit: '%',
      trend: 'up',
      change: '+5%'
    },
    {
      name: 'Usuarios Activos',
      value: metrics.dailyActiveUsers,
      unit: 'usuarios',
      trend: 'up',
      change: '+12%'
    },
    {
      name: 'Calificación',
      value: metrics.helpfulnessRating,
      unit: '⭐',
      trend: 'stable',
      change: '0%'
    }
  ];
};

// Identificar áreas de mejora
const getAreasOfImprovement = (metrics) => {
  const areas = [];

  if (metrics.completionRate < 80) {
    areas.push({
      area: 'Completion Rate',
      current: metrics.completionRate,
      target: 80,
      priority: 'high',
      suggestion: 'Simplificar tutoriales largos y agregar puntos de guardado'
    });
  }

  if (metrics.videoCompletionRate < 70) {
    areas.push({
      area: 'Video Engagement',
      current: metrics.videoCompletionRate,
      target: 70,
      priority: 'medium',
      suggestion: 'Crear videos más cortos (< 5 minutos) y con capítulos'
    });
  }

  if (metrics.searchEffectiveness < 90) {
    areas.push({
      area: 'Search Effectiveness',
      current: metrics.searchEffectiveness,
      target: 90,
      priority: 'high',
      suggestion: 'Mejorar tags y descripciones de contenido'
    });
  }

  return areas;
};

// Generar recomendaciones basadas en métricas
const generateRecommendations = (metrics) => {
  const recommendations = [];

  // Recomendaciones basadas en completion rate
  if (metrics.completionRate < 60) {
    recommendations.push({
      type: 'urgent',
      title: 'Mejorar Tasa de Finalización',
      description: 'La tasa de finalización está muy por debajo del objetivo',
      actions: [
        'Dividir tutoriales largos en módulos más pequeños',
        'Agregar indicadores de progreso más visibles',
        'Implementar sistema de guardado automático',
        'Ofrecer incentivos por completar tutoriales'
      ]
    });
  }

  // Recomendaciones basadas en engagement
  if (metrics.dailyActiveUsers < 50) {
    recommendations.push({
      type: 'important',
      title: 'Aumentar Engagement Diario',
      description: 'Pocos usuarios consultan la documentación diariamente',
      actions: [
        'Implementar notificaciones de nuevo contenido',
        'Crear desafíos diarios',
        'Agregar contenido actualizado frecuentemente',
        'Promover el uso durante onboarding'
      ]
    });
  }

  // Recomendaciones basadas en satisfacción
  if (metrics.helpfulnessRating < 4.0) {
    recommendations.push({
      type: 'important',
      title: 'Mejorar Calidad del Contenido',
      description: 'La calificación de utilidad está por debajo del estándar',
      actions: [
        'Revisar y actualizar contenido obsoleto',
        'Agregar más ejemplos prácticos',
        'Incluir casos de uso reales',
        'Solicitar feedback específico sobre qué falta'
      ]
    });
  }

  return recommendations;
};

// Trackear eventos de aprendizaje
export const trackLearningEvent = async (prisma, eventData) => {
  const { userId, eventType, moduleId, metadata } = eventData;

  // Crear evento
  const event = await prisma.documentationEvent.create({
    data: {
      userId,
      eventType,
      moduleId,
      metadata: {
        ...metadata,
        timestamp: new Date().toISOString(),
        sessionId: metadata.sessionId || generateSessionId(),
        userAgent: metadata.userAgent || 'unknown',
        ipAddress: metadata.ipAddress || 'unknown'
      }
    }
  });

  // Actualizar métricas en tiempo real
  await updateRealTimeMetrics(prisma, eventType, userId, moduleId);

  return event;
};

// Actualizar métricas en tiempo real
const updateRealTimeMetrics = async (prisma, eventType, userId, moduleId) => {
  // Actualizar contador de vistas si es page_view
  if (eventType === 'page_view' && moduleId) {
    await prisma.documentationModule.update({
      where: { moduleId },
      data: {
        views: {
          increment: 1
        }
      }
    });
  }

  // Actualizar progreso del usuario
  if (eventType === 'tutorial_complete') {
    // Aquí podrías actualizar el progreso del usuario
    // Por ejemplo, guardarlo en una tabla de UserProgress
  }

  // Actualizar estadísticas de búsqueda
  if (eventType === 'search') {
    // Guardar términos de búsqueda para análisis
  }
};

// Generar ID de sesión único
const generateSessionId = () => {
  return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Exportar dashboard de métricas
export const getMetricsDashboard = async (prisma, timeRange = 'last30days') => {
  const metrics = await calculateMetrics(prisma, timeRange);
  const report = await generateMetricsReport(metrics);

  return {
    metrics,
    report,
    charts: {
      completionTrend: await getCompletionTrend(prisma, timeRange),
      engagementHeatmap: await getEngagementHeatmap(prisma, timeRange),
      modulePopularity: await getModulePopularity(prisma, timeRange),
      userProgress: await getUserProgress(prisma, timeRange)
    }
  };
};

// Obtener tendencia de finalización
const getCompletionTrend = async (prisma, timeRange) => {
  // Implementar lógica para obtener datos de tendencia
  return {
    labels: ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'],
    datasets: [{
      label: 'Tasa de Finalización',
      data: [65, 70, 75, 82]
    }]
  };
};

// Obtener mapa de calor de engagement
const getEngagementHeatmap = async (prisma, timeRange) => {
  // Implementar lógica para mapa de calor
  return {
    days: ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'],
    hours: Array.from({ length: 24 }, (_, i) => i),
    data: [] // Matrix de engagement por día y hora
  };
};

// Obtener popularidad de módulos
const getModulePopularity = async (prisma, timeRange) => {
  const modules = await prisma.documentationModule.findMany({
    orderBy: {
      views: 'desc'
    },
    take: 10
  });

  return modules.map(m => ({
    name: m.title,
    views: m.views,
    category: m.category
  }));
};

// Obtener progreso de usuarios
const getUserProgress = async (prisma, timeRange) => {
  // Implementar lógica para obtener progreso agregado
  return {
    beginners: 45,
    intermediate: 30,
    advanced: 25
  };
};

const educationMetricsModule = {
  educationMetrics,
  calculateMetrics,
  generateMetricsReport,
  trackLearningEvent,
  getMetricsDashboard
};

export default educationMetricsModule;