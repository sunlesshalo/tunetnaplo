// Pattern analysis for symptom data
// Identifies correlations and triggers

/**
 * Analyze patterns in symptom entries
 * @param {Array} entries - All symptom entries
 * @param {Array} symptoms - All symptoms
 * @returns {Object} Analysis results with patterns
 */
export function analyzePatterns(entries, symptoms) {
  if (!entries || entries.length < 5) {
    return {
      hasEnoughData: false,
      message: 'Legalább 5 bejegyzés szükséges a mintázatok elemzéséhez.'
    };
  }

  const patterns = {
    hasEnoughData: true,
    weatherPatterns: analyzeWeatherPatterns(entries),
    timePatterns: analyzeTimePatterns(entries),
    contextPatterns: analyzeContextPatterns(entries),
    symptomFrequency: analyzeSymptomFrequency(entries, symptoms),
    severityTrends: analyzeSeverityTrends(entries, symptoms),
    commonTriggers: findCommonTriggers(entries)
  };

  return patterns;
}

/**
 * Analyze weather-related patterns
 */
function analyzeWeatherPatterns(entries) {
  const entriesWithWeather = entries.filter(e => e.environment?.weather?.condition);

  if (entriesWithWeather.length < 3) {
    return { hasData: false };
  }

  const weatherGroups = {};
  entriesWithWeather.forEach(entry => {
    const condition = entry.environment.weather.condition;
    if (!weatherGroups[condition]) {
      weatherGroups[condition] = [];
    }
    weatherGroups[condition].push(entry.intensity);
  });

  const weatherStats = Object.entries(weatherGroups).map(([condition, intensities]) => ({
    condition,
    count: intensities.length,
    avgIntensity: (intensities.reduce((a, b) => a + b, 0) / intensities.length).toFixed(1)
  })).sort((a, b) => b.avgIntensity - a.avgIntensity);

  return {
    hasData: true,
    stats: weatherStats,
    insight: weatherStats.length > 0
      ? `${weatherStats[0].condition} időjárásban magasabb az átlagos intenzitás (${weatherStats[0].avgIntensity})`
      : null
  };
}

/**
 * Analyze time-of-day patterns
 */
function analyzeTimePatterns(entries) {
  const timeGroups = {
    reggel: [], // 6-12
    délután: [], // 12-18
    este: [], // 18-22
    éjszaka: [] // 22-6
  };

  entries.forEach(entry => {
    if (!entry.environment?.timeOfDay) return;

    const hour = entry.environment.timeOfDay;
    let period;
    if (hour >= 6 && hour < 12) period = 'reggel';
    else if (hour >= 12 && hour < 18) period = 'délután';
    else if (hour >= 18 && hour < 22) period = 'este';
    else period = 'éjszaka';

    timeGroups[period].push(entry.intensity);
  });

  const timeStats = Object.entries(timeGroups)
    .filter(([_, intensities]) => intensities.length > 0)
    .map(([period, intensities]) => ({
      period,
      count: intensities.length,
      avgIntensity: (intensities.reduce((a, b) => a + b, 0) / intensities.length).toFixed(1)
    }))
    .sort((a, b) => b.avgIntensity - a.avgIntensity);

  return {
    hasData: timeStats.length > 0,
    stats: timeStats,
    insight: timeStats.length > 0
      ? `${timeStats[0].period} a legintenzívebb időszak (átlag: ${timeStats[0].avgIntensity})`
      : null
  };
}

/**
 * Analyze context patterns (mood, energy, activity)
 */
function analyzeContextPatterns(entries) {
  const contextTypes = ['mood', 'energy', 'activity', 'food', 'medication'];
  const correlations = [];

  contextTypes.forEach(type => {
    const groups = {};
    entries.forEach(entry => {
      const value = entry.context?.[type];
      if (!value) return;

      if (!groups[value]) groups[value] = [];
      groups[value].push(entry.intensity);
    });

    const stats = Object.entries(groups)
      .map(([value, intensities]) => ({
        type,
        value,
        count: intensities.length,
        avgIntensity: (intensities.reduce((a, b) => a + b, 0) / intensities.length).toFixed(1)
      }))
      .filter(s => s.count >= 2) // At least 2 occurrences
      .sort((a, b) => b.avgIntensity - a.avgIntensity);

    if (stats.length > 0) {
      correlations.push({
        type,
        topCorrelation: stats[0]
      });
    }
  });

  return {
    hasData: correlations.length > 0,
    correlations,
    insight: correlations.length > 0
      ? `${correlations[0].topCorrelation.value} (${correlations[0].type}) esetén magasabb az intenzitás`
      : null
  };
}

/**
 * Analyze symptom frequency
 */
function analyzeSymptomFrequency(entries, symptoms) {
  const frequency = {};

  entries.forEach(entry => {
    const symptomId = entry.symptom_id || entry.symptomId;
    if (!frequency[symptomId]) {
      frequency[symptomId] = { count: 0, totalIntensity: 0 };
    }
    frequency[symptomId].count++;
    frequency[symptomId].totalIntensity += entry.intensity;
  });

  const frequencyStats = Object.entries(frequency).map(([symptomId, data]) => {
    const symptom = symptoms.find(s => s.id === symptomId);
    return {
      symptom: symptom?.name || 'Ismeretlen',
      emoji: symptom?.emoji || '❓',
      count: data.count,
      avgIntensity: (data.totalIntensity / data.count).toFixed(1),
      percentage: ((data.count / entries.length) * 100).toFixed(0)
    };
  }).sort((a, b) => b.count - a.count);

  return {
    hasData: frequencyStats.length > 0,
    stats: frequencyStats,
    mostFrequent: frequencyStats[0],
    insight: frequencyStats.length > 0
      ? `${frequencyStats[0].emoji} ${frequencyStats[0].symptom} a leggyakoribb (${frequencyStats[0].percentage}%)`
      : null
  };
}

/**
 * Analyze severity trends over time
 */
function analyzeSeverityTrends(entries, symptoms) {
  if (entries.length < 7) {
    return { hasData: false, message: 'Legalább 7 bejegyzés szükséges a trend elemzéshez' };
  }

  // Sort by date
  const sorted = [...entries].sort((a, b) =>
    new Date(a.timestamp) - new Date(b.timestamp)
  );

  // Split into first half and second half
  const midpoint = Math.floor(sorted.length / 2);
  const firstHalf = sorted.slice(0, midpoint);
  const secondHalf = sorted.slice(midpoint);

  const firstAvg = firstHalf.reduce((sum, e) => sum + e.intensity, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, e) => sum + e.intensity, 0) / secondHalf.length;

  const trend = secondAvg - firstAvg;
  const trendPercent = ((trend / firstAvg) * 100).toFixed(0);

  let trendText;
  if (Math.abs(trend) < 0.5) {
    trendText = 'stabil';
  } else if (trend > 0) {
    trendText = `növekvő (+${trendPercent}%)`;
  } else {
    trendText = `csökkenő (${trendPercent}%)`;
  }

  return {
    hasData: true,
    trend,
    trendText,
    firstPeriodAvg: firstAvg.toFixed(1),
    secondPeriodAvg: secondAvg.toFixed(1),
    insight: `A tünetek intenzitása ${trendText}`
  };
}

/**
 * Find common triggers
 */
function findCommonTriggers(entries) {
  const triggers = [];

  // Food triggers
  const foodEntries = entries.filter(e => e.context?.food);
  if (foodEntries.length >= 3) {
    const foodGroups = {};
    foodEntries.forEach(e => {
      const food = e.context.food.toLowerCase();
      if (!foodGroups[food]) foodGroups[food] = [];
      foodGroups[food].push(e.intensity);
    });

    const topFood = Object.entries(foodGroups)
      .filter(([_, intensities]) => intensities.length >= 2)
      .map(([food, intensities]) => ({
        trigger: food,
        count: intensities.length,
        avgIntensity: (intensities.reduce((a, b) => a + b, 0) / intensities.length).toFixed(1)
      }))
      .sort((a, b) => b.avgIntensity - a.avgIntensity)[0];

    if (topFood) {
      triggers.push({
        type: 'Étel',
        name: topFood.trigger,
        impact: `Átlagos intenzitás: ${topFood.avgIntensity}`
      });
    }
  }

  // Activity triggers
  const activityEntries = entries.filter(e => e.context?.activity);
  if (activityEntries.length >= 3) {
    const activityGroups = {};
    activityEntries.forEach(e => {
      const activity = e.context.activity;
      if (!activityGroups[activity]) activityGroups[activity] = [];
      activityGroups[activity].push(e.intensity);
    });

    const topActivity = Object.entries(activityGroups)
      .filter(([_, intensities]) => intensities.length >= 2)
      .map(([activity, intensities]) => ({
        trigger: activity,
        count: intensities.length,
        avgIntensity: (intensities.reduce((a, b) => a + b, 0) / intensities.length).toFixed(1)
      }))
      .sort((a, b) => b.avgIntensity - a.avgIntensity)[0];

    if (topActivity) {
      triggers.push({
        type: 'Tevékenység',
        name: topActivity.trigger,
        impact: `Átlagos intenzitás: ${topActivity.avgIntensity}`
      });
    }
  }

  return {
    hasData: triggers.length > 0,
    triggers,
    insight: triggers.length > 0
      ? `Potenciális kiváltó: ${triggers[0].name} (${triggers[0].type})`
      : null
  };
}
