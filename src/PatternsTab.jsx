import React, { useMemo } from 'react';
import { analyzePatterns } from './patternAnalysis';

export default function PatternsTab({ entries, symptoms }) {
  const analysis = useMemo(() => {
    return analyzePatterns(entries, symptoms);
  }, [entries, symptoms]);

  if (!analysis.hasEnoughData) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-lg font-semibold mb-2">Nincs elég adat</h3>
        <p className="text-sm text-slate-600">{analysis.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6">
      <div>
        <h2 className="text-xl font-bold mb-2">📊 Mintázatok és összefüggések</h2>
        <p className="text-sm text-slate-600">
          Automatikus elemzés {entries.length} bejegyzés alapján
        </p>
      </div>

      {/* Severity Trends */}
      {analysis.severityTrends?.hasData && (
        <PatternCard
          icon="📈"
          title="Intenzitás változása"
          insight={analysis.severityTrends.insight}
        >
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-white rounded-lg p-3">
              <div className="text-slate-500 text-xs">Korábbi időszak</div>
              <div className="text-2xl font-bold text-sky-600">
                {analysis.severityTrends.firstPeriodAvg}
              </div>
            </div>
            <div className="bg-white rounded-lg p-3">
              <div className="text-slate-500 text-xs">Későbbi időszak</div>
              <div className="text-2xl font-bold text-sky-600">
                {analysis.severityTrends.secondPeriodAvg}
              </div>
            </div>
          </div>
        </PatternCard>
      )}

      {/* Symptom Frequency */}
      {analysis.symptomFrequency?.hasData && (
        <PatternCard
          icon="🔝"
          title="Leggyakoribb tünetek"
          insight={analysis.symptomFrequency.insight}
        >
          <div className="space-y-2">
            {analysis.symptomFrequency.stats.slice(0, 5).map((stat, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-white rounded-lg p-3"
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{stat.emoji}</span>
                  <div>
                    <div className="font-medium">{stat.symptom}</div>
                    <div className="text-xs text-slate-500">
                      {stat.count}× • Átlag intenzitás: {stat.avgIntensity}
                    </div>
                  </div>
                </div>
                <div className="text-sm font-semibold text-sky-600">
                  {stat.percentage}%
                </div>
              </div>
            ))}
          </div>
        </PatternCard>
      )}

      {/* Time Patterns */}
      {analysis.timePatterns?.hasData && (
        <PatternCard
          icon="🕐"
          title="Napszak szerinti mintázat"
          insight={analysis.timePatterns.insight}
        >
          <div className="grid grid-cols-2 gap-2">
            {analysis.timePatterns.stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-lg p-3">
                <div className="text-xs text-slate-500 capitalize">{stat.period}</div>
                <div className="text-lg font-bold text-sky-600">
                  {stat.avgIntensity}
                </div>
                <div className="text-xs text-slate-500">{stat.count} bejegyzés</div>
              </div>
            ))}
          </div>
        </PatternCard>
      )}

      {/* Weather Patterns */}
      {analysis.weatherPatterns?.hasData && (
        <PatternCard
          icon="🌤️"
          title="Időjárási összefüggések"
          insight={analysis.weatherPatterns.insight}
        >
          <div className="space-y-2">
            {analysis.weatherPatterns.stats.map((stat, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-white rounded-lg p-3"
              >
                <div className="capitalize">{stat.condition}</div>
                <div className="text-right">
                  <div className="font-semibold text-sky-600">
                    {stat.avgIntensity}
                  </div>
                  <div className="text-xs text-slate-500">{stat.count}×</div>
                </div>
              </div>
            ))}
          </div>
        </PatternCard>
      )}

      {/* Context Correlations */}
      {analysis.contextPatterns?.hasData && (
        <PatternCard
          icon="🔗"
          title="Kontextus összefüggések"
          insight={analysis.contextPatterns.insight}
        >
          <div className="space-y-2">
            {analysis.contextPatterns.correlations.map((corr, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-white rounded-lg p-3"
              >
                <div>
                  <div className="font-medium capitalize">{corr.topCorrelation.value}</div>
                  <div className="text-xs text-slate-500 capitalize">{corr.type}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-sky-600">
                    {corr.topCorrelation.avgIntensity}
                  </div>
                  <div className="text-xs text-slate-500">
                    {corr.topCorrelation.count}×
                  </div>
                </div>
              </div>
            ))}
          </div>
        </PatternCard>
      )}

      {/* Common Triggers */}
      {analysis.commonTriggers?.hasData && (
        <PatternCard
          icon="⚠️"
          title="Potenciális kiváltók"
          insight={analysis.commonTriggers.insight}
        >
          <div className="space-y-2">
            {analysis.commonTriggers.triggers.map((trigger, index) => (
              <div
                key={index}
                className="bg-white rounded-lg p-3"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium">{trigger.name}</span>
                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                    {trigger.type}
                  </span>
                </div>
                <div className="text-xs text-slate-500">{trigger.impact}</div>
              </div>
            ))}
          </div>
        </PatternCard>
      )}

      {/* Summary Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex gap-3">
          <div className="text-2xl">💡</div>
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">Megjegyzés</h4>
            <p className="text-sm text-blue-800">
              Ezek az összefüggések statisztikai mintázatok, nem diagnózisok.
              A mintázatok segíthetnek azonosítani a lehetséges kiváltókat, de
              mindig konzultálj orvossal az eredményekről.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PatternCard({ icon, title, insight, children }) {
  return (
    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
      <div className="flex items-start gap-3 mb-3">
        <span className="text-3xl">{icon}</span>
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{title}</h3>
          {insight && (
            <p className="text-sm text-slate-600 mt-1">{insight}</p>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}
