import React, { useState, useEffect } from 'react';
import { getInsights, generateInsights, getBudgetRecommendations, getGoalPredictions } from '../api/api';

const AIInsights = () => {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('insights');

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    try {
      const response = await getInsights();
      setInsights(response.insights || []);
    } catch (error) {
      console.error('Error loading insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateInsight = async (type) => {
    setGenerating(true);
    try {
      await generateInsights(type);
      await loadInsights();
    } catch (error) {
      console.error('Error generating insight:', error);
    } finally {
      setGenerating(false);
    }
  };

  const handleGetRecommendations = async () => {
    setGenerating(true);
    try {
      const response = await getBudgetRecommendations();
      // You could display this in a modal or alert
      console.log('Budget recommendations:', response);
    } catch (error) {
      console.error('Error getting recommendations:', error);
    } finally {
      setGenerating(false);
    }
  };

  const handleGetPredictions = async () => {
    setGenerating(true);
    try {
      const response = await getGoalPredictions();
      // You could display this in a modal or alert
      console.log('Goal predictions:', response);
    } catch (error) {
      console.error('Error getting predictions:', error);
    } finally {
      setGenerating(false);
    }
  };

  const getInsightIcon = (type) => {
    switch (type) {
      case 'spending_pattern': return '📊';
      case 'budget_alert': return '⚠️';
      case 'goal_progress': return '🎯';
      default: return '💡';
    }
  };

  const getInsightColor = (type) => {
    switch (type) {
      case 'spending_pattern': return 'border-blue-500 bg-blue-50';
      case 'budget_alert': return 'border-red-500 bg-red-50';
      case 'goal_progress': return 'border-green-500 bg-green-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-32">Loading insights...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">🤖 AI Insights</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => handleGenerateInsight('spending_pattern')}
            disabled={generating}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {generating ? 'Generating...' : '📊 Spending Analysis'}
          </button>
          <button
            onClick={() => handleGenerateInsight('budget_alert')}
            disabled={generating}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
          >
            {generating ? 'Generating...' : '⚠️ Budget Alert'}
          </button>
          <button
            onClick={() => handleGenerateInsight('goal_progress')}
            disabled={generating}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {generating ? 'Generating...' : '🎯 Goal Progress'}
          </button>
        </div>
      </div>

      {/* AI Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 Smart Recommendations</h3>
          <p className="text-gray-600 mb-4">
            Get AI-powered budget recommendations based on your spending patterns.
          </p>
          <button
            onClick={handleGetRecommendations}
            disabled={generating}
            className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
          >
            {generating ? 'Analyzing...' : 'Get Budget Recommendations'}
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🔮 Goal Predictions</h3>
          <p className="text-gray-600 mb-4">
            AI analyzes your goals and income to predict achievement likelihood.
          </p>
          <button
            onClick={handleGetPredictions}
            disabled={generating}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {generating ? 'Analyzing...' : 'Get Goal Predictions'}
          </button>
        </div>
      </div>

      {/* Insights List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent AI Insights</h3>
        
        {insights.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No AI insights generated yet</p>
            <p className="text-sm text-gray-400">
              Click the buttons above to generate personalized financial insights
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {insights.map((insight) => (
              <div
                key={insight.id}
                className={`border-l-4 p-4 rounded-r-lg ${getInsightColor(insight.type)}`}
              >
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">{getInsightIcon(insight.type)}</span>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-medium text-gray-900 capitalize">
                        {insight.type?.replace('_', ' ')}
                      </h4>
                      <span className="text-xs text-gray-500">
                        {new Date(insight.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700">{insight.summary}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIInsights;
