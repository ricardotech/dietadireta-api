// Database Query Utilities for DietaBox Analysis
// This file contains queries to analyze the current state of the database
// and understand the data structure for implementing new features

const databaseQueries = {
  // User analysis queries
  userAnalysis: {
    // Count users by objective
    usersByObjective: `
      SELECT objetivo, COUNT(*) as total 
      FROM user_data 
      GROUP BY objetivo
      ORDER BY total DESC;
    `,
    
    // Average user metrics
    averageMetrics: `
      SELECT 
        AVG(peso) as avg_weight,
        AVG(altura) as avg_height,
        AVG(idade) as avg_age,
        AVG(caloriasDiarias) as avg_calories
      FROM user_data;
    `,
    
    // Activity level distribution
    activityDistribution: `
      SELECT nivelAtividade, COUNT(*) as total
      FROM user_data
      GROUP BY nivelAtividade
      ORDER BY total DESC;
    `,
    
    // Training plan distribution
    trainingPlanDistribution: `
      SELECT planoTreino, COUNT(*) as total
      FROM user_data
      GROUP BY planoTreino
      ORDER BY total DESC;
    `,
    
    // Gender distribution
    genderDistribution: `
      SELECT genero, COUNT(*) as total
      FROM user_data
      GROUP BY genero;
    `
  },

  // Diet analysis queries
  dietAnalysis: {
    // Total diets generated
    totalDiets: `
      SELECT COUNT(*) as total_diets,
             COUNT(DISTINCT userId) as unique_users
      FROM diets;
    `,
    
    // Diet regeneration statistics
    regenerationStats: `
      SELECT 
        AVG(regenerationCount) as avg_regenerations,
        MAX(regenerationCount) as max_regenerations,
        COUNT(CASE WHEN isRegenerated = true THEN 1 END) as regenerated_diets
      FROM diets;
    `,
    
    // Order status distribution
    orderStatusDistribution: `
      SELECT orderStatus, COUNT(*) as total
      FROM diets
      GROUP BY orderStatus
      ORDER BY total DESC;
    `
  },

  // Meal preferences analysis
  mealPreferencesAnalysis: {
    // Most common breakfast items
    breakfastPreferences: `
      SELECT unnest(cafeDaManha) as item, COUNT(*) as frequency
      FROM user_data
      WHERE cafeDaManha IS NOT NULL AND array_length(cafeDaManha, 1) > 0
      GROUP BY item
      ORDER BY frequency DESC
      LIMIT 20;
    `,
    
    // Most common lunch items
    lunchPreferences: `
      SELECT unnest(almoco) as item, COUNT(*) as frequency
      FROM user_data
      WHERE almoco IS NOT NULL AND array_length(almoco, 1) > 0
      GROUP BY item
      ORDER BY frequency DESC
      LIMIT 20;
    `,
    
    // Most common dinner items
    dinnerPreferences: `
      SELECT unnest(janta) as item, COUNT(*) as frequency
      FROM user_data
      WHERE janta IS NOT NULL AND array_length(janta, 1) > 0
      GROUP BY item
      ORDER BY frequency DESC
      LIMIT 20;
    `,
    
    // Empty meal preferences count
    emptyPreferences: `
      SELECT 
        COUNT(CASE WHEN array_length(cafeDaManha, 1) = 0 OR cafeDaManha IS NULL THEN 1 END) as empty_breakfast,
        COUNT(CASE WHEN array_length(almoco, 1) = 0 OR almoco IS NULL THEN 1 END) as empty_lunch,
        COUNT(CASE WHEN array_length(janta, 1) = 0 OR janta IS NULL THEN 1 END) as empty_dinner
      FROM user_data;
    `
  },

  // Feature implementation queries
  newFeatureQueries: {
    // Check if training frequency field exists (for new feature)
    checkTrainingFrequency: `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'user_data' 
      AND column_name = 'frequenciaTreino';
    `,
    
    // Check if health conditions field exists (for new feature)
    checkHealthConditions: `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'user_data' 
      AND column_name IN ('doencasAlimentares', 'condicoesEspeciais');
    `,
    
    // Check calories-only diet mode
    checkCaloriesOnlyMode: `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'user_data' 
      AND column_name = 'modoApenasCaloricas';
    `
  }
};

// Helper function to execute queries (requires TypeORM DataSource)
async function executeQuery(dataSource, query) {
  try {
    const result = await dataSource.query(query);
    return result;
  } catch (error) {
    console.error('Query execution error:', error);
    throw error;
  }
}

// Analysis report generator
async function generateAnalysisReport(dataSource) {
  const report = {
    timestamp: new Date().toISOString(),
    userMetrics: {},
    dietMetrics: {},
    mealPreferences: {},
    newFeatureReadiness: {}
  };

  // Execute user analysis
  report.userMetrics.objectiveDistribution = await executeQuery(dataSource, databaseQueries.userAnalysis.usersByObjective);
  report.userMetrics.averages = await executeQuery(dataSource, databaseQueries.userAnalysis.averageMetrics);
  report.userMetrics.activityLevels = await executeQuery(dataSource, databaseQueries.userAnalysis.activityDistribution);
  report.userMetrics.trainingPlans = await executeQuery(dataSource, databaseQueries.userAnalysis.trainingPlanDistribution);

  // Execute diet analysis
  report.dietMetrics.totals = await executeQuery(dataSource, databaseQueries.dietAnalysis.totalDiets);
  report.dietMetrics.regeneration = await executeQuery(dataSource, databaseQueries.dietAnalysis.regenerationStats);

  // Check new feature readiness
  report.newFeatureReadiness.trainingFrequency = await executeQuery(dataSource, databaseQueries.newFeatureQueries.checkTrainingFrequency);
  report.newFeatureReadiness.healthConditions = await executeQuery(dataSource, databaseQueries.newFeatureQueries.checkHealthConditions);
  report.newFeatureReadiness.caloriesOnlyMode = await executeQuery(dataSource, databaseQueries.newFeatureQueries.checkCaloriesOnlyMode);

  return report;
}

module.exports = {
  databaseQueries,
  executeQuery,
  generateAnalysisReport
};