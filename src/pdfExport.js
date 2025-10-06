import jsPDF from 'jspdf';
import { analyzePatterns } from './patternAnalysis';

/**
 * Generate a professional medical PDF report for doctors
 * @param {Array} entries - All symptom entries
 * @param {Array} symptoms - All symptoms
 * @param {string} patientName - Patient name (optional)
 */
export function generateMedicalPDF(entries, symptoms, patientName = 'Páciens') {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let y = 20;

  // Helper to add new page if needed
  const checkPage = (needed = 10) => {
    if (y + needed > pageHeight - 20) {
      doc.addPage();
      y = 20;
      return true;
    }
    return false;
  };

  // Title
  doc.setFontSize(20);
  doc.setFont(undefined, 'bold');
  doc.text('Tünetnapló - Orvosi Jelentés', pageWidth / 2, y, { align: 'center' });
  y += 15;

  // Report metadata
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text(`Páciens: ${patientName}`, 20, y);
  y += 6;
  doc.text(`Jelentés dátuma: ${new Date().toLocaleDateString('hu-HU')}`, 20, y);
  y += 6;
  doc.text(`Elemzett időszak: ${entries.length > 0 ? `${entries[entries.length - 1].date} - ${entries[0].date}` : 'N/A'}`, 20, y);
  y += 6;
  doc.text(`Összes bejegyzés: ${entries.length}`, 20, y);
  y += 12;

  // Draw separator line
  doc.setDrawColor(200, 200, 200);
  doc.line(20, y, pageWidth - 20, y);
  y += 10;

  // SECTION 1: Executive Summary
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('1. Összefoglaló', 20, y);
  y += 8;

  const analysis = analyzePatterns(entries, symptoms);

  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');

  if (analysis.hasEnoughData) {
    // Most frequent symptom
    if (analysis.symptomFrequency?.mostFrequent) {
      const mf = analysis.symptomFrequency.mostFrequent;
      doc.text(`• Leggyakoribb tünet: ${mf.symptom} (${mf.count}x, ${mf.percentage}%)`, 25, y);
      y += 6;
    }

    // Severity trend
    if (analysis.severityTrends?.insight) {
      doc.text(`• ${analysis.severityTrends.insight}`, 25, y);
      y += 6;
    }

    // Time pattern
    if (analysis.timePatterns?.insight) {
      doc.text(`• ${analysis.timePatterns.insight}`, 25, y);
      y += 6;
    }

    // Triggers
    if (analysis.commonTriggers?.insight) {
      doc.text(`• ${analysis.commonTriggers.insight}`, 25, y);
      y += 6;
    }
  } else {
    doc.text('Nincs elegendő adat a mintázatok elemzéséhez (minimum 5 bejegyzés szükséges).', 25, y);
    y += 6;
  }

  y += 8;
  checkPage();

  // SECTION 2: Symptom Frequency
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('2. Tünetek gyakorisága', 20, y);
  y += 8;

  if (analysis.symptomFrequency?.stats) {
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');

    const stats = analysis.symptomFrequency.stats.slice(0, 10);
    stats.forEach(stat => {
      checkPage();
      doc.text(`${stat.symptom}: ${stat.count}x (${stat.percentage}%, átlag intenzitás: ${stat.avgIntensity})`, 25, y);
      y += 5;
    });
  }

  y += 8;
  checkPage(30);

  // SECTION 3: Detailed Entry Log
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('3. Részletes naplóbejegyzések', 20, y);
  y += 10;

  doc.setFontSize(8);

  entries.forEach((entry, index) => {
    checkPage(20);

    const symptom = symptoms.find(s => s.id === (entry.symptom_id || entry.symptomId));
    const date = new Date(entry.timestamp);

    doc.setFont(undefined, 'bold');
    doc.text(`${date.toLocaleDateString('hu-HU')} ${date.toLocaleTimeString('hu-HU', {hour: '2-digit', minute: '2-digit'})}`, 25, y);
    doc.setFont(undefined, 'normal');
    y += 5;

    doc.text(`Tünet: ${symptom?.name || 'Ismeretlen'}`, 25, y);
    y += 4;
    doc.text(`Intenzitás: ${entry.intensity}/10`, 25, y);
    y += 4;

    if (entry.duration) {
      const duration = entry.duration < 60 ? `${entry.duration} perc` : `${Math.floor(entry.duration/60)} óra ${entry.duration%60} perc`;
      doc.text(`Időtartam: ${duration}`, 25, y);
      y += 4;
    }

    if (entry.note) {
      const noteLines = doc.splitTextToSize(`Jegyzet: ${entry.note}`, pageWidth - 50);
      doc.text(noteLines, 25, y);
      y += noteLines.length * 4;
    }

    // Context
    const context = entry.context || {};
    const contextItems = [];
    if (context.mood) contextItems.push(`Hangulat: ${context.mood}`);
    if (context.energy) contextItems.push(`Energia: ${context.energy}`);
    if (context.activity) contextItems.push(`Tevékenység: ${context.activity}`);
    if (context.food) contextItems.push(`Étel: ${context.food}`);
    if (context.medication) contextItems.push(`Gyógyszer: ${context.medication}`);

    if (contextItems.length > 0) {
      const contextText = contextItems.join(', ');
      const contextLines = doc.splitTextToSize(`Kontextus: ${contextText}`, pageWidth - 50);
      doc.text(contextLines, 25, y);
      y += contextLines.length * 4;
    }

    // Environment
    const env = entry.environment || {};
    const weather = env.weather || {};
    const envItems = [];
    if (env.timeOfDay !== undefined) envItems.push(`${env.timeOfDay}h`);
    if (weather.temp) envItems.push(`${weather.temp}°C`);
    if (weather.condition) envItems.push(weather.condition);
    if (weather.pressure) envItems.push(`${weather.pressure} hPa`);
    if (weather.city) envItems.push(weather.city);

    if (envItems.length > 0) {
      doc.text(`Környezet: ${envItems.join(', ')}`, 25, y);
      y += 4;
    }

    y += 3;
    doc.setDrawColor(230, 230, 230);
    doc.line(25, y, pageWidth - 25, y);
    y += 5;
  });

  checkPage(30);

  // SECTION 4: Pattern Analysis (if enough data)
  if (analysis.hasEnoughData) {
    y += 5;
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('4. Mintázatelemzés', 20, y);
    y += 10;

    doc.setFontSize(9);

    // Time patterns
    if (analysis.timePatterns?.stats) {
      doc.setFont(undefined, 'bold');
      doc.text('Napszak szerinti intenzitás:', 25, y);
      y += 5;
      doc.setFont(undefined, 'normal');

      analysis.timePatterns.stats.forEach(stat => {
        checkPage();
        doc.text(`${stat.period}: ${stat.avgIntensity} (${stat.count} bejegyzés)`, 30, y);
        y += 4;
      });
      y += 4;
    }

    // Weather patterns
    if (analysis.weatherPatterns?.stats) {
      checkPage(15);
      doc.setFont(undefined, 'bold');
      doc.text('Időjárási összefüggések:', 25, y);
      y += 5;
      doc.setFont(undefined, 'normal');

      analysis.weatherPatterns.stats.forEach(stat => {
        checkPage();
        doc.text(`${stat.condition}: átlag ${stat.avgIntensity} (${stat.count}x)`, 30, y);
        y += 4;
      });
      y += 4;
    }

    // Context correlations
    if (analysis.contextPatterns?.correlations) {
      checkPage(15);
      doc.setFont(undefined, 'bold');
      doc.text('Kontextus összefüggések:', 25, y);
      y += 5;
      doc.setFont(undefined, 'normal');

      analysis.contextPatterns.correlations.forEach(corr => {
        checkPage();
        doc.text(`${corr.type}: ${corr.topCorrelation.value} (átlag: ${corr.topCorrelation.avgIntensity})`, 30, y);
        y += 4;
      });
      y += 4;
    }

    // Triggers
    if (analysis.commonTriggers?.triggers) {
      checkPage(15);
      doc.setFont(undefined, 'bold');
      doc.text('Potenciális kiváltók:', 25, y);
      y += 5;
      doc.setFont(undefined, 'normal');

      analysis.commonTriggers.triggers.forEach(trigger => {
        checkPage();
        doc.text(`${trigger.name} (${trigger.type}): ${trigger.impact}`, 30, y);
        y += 4;
      });
    }
  }

  // Footer on last page
  doc.setFontSize(8);
  doc.setTextColor(100);
  doc.text('Ez az automatikusan generált jelentés diagnosztikai célokat szolgál. Konzultáljon orvossal az eredményekről.',
    pageWidth / 2, pageHeight - 10, { align: 'center' });

  // Save PDF
  doc.save(`tunetnaplo_orvosi_jelentes_${new Date().toISOString().split('T')[0]}.pdf`);
}
