import React, { useState } from 'react';
import { generateReport } from '../api/api';

const ReportGenerator = () => {
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState('');

  const handleGenerateReport = async () => {
    setGenerating(true);
    setMessage('');
    
    try {
      const blob = await generateReport();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `financial-report-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setMessage('Report generated and downloaded successfully!');
    } catch (error) {
      console.error('Error generating report:', error);
      setMessage('Failed to generate report. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">📄 Financial Reports</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900">Monthly Financial Summary</h4>
            <p className="text-sm text-gray-600">
              AI-generated PDF report with spending analysis and insights
            </p>
          </div>
          <button
            onClick={handleGenerateReport}
            disabled={generating}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {generating ? 'Generating...' : 'Generate PDF'}
          </button>
        </div>

        {message && (
          <div className={`p-3 rounded-md ${
            message.includes('success') 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {message}
          </div>
        )}

        <div className="text-sm text-gray-600">
          <p>📊 Report includes:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Spending summary and trends</li>
            <li>Budget performance analysis</li>
            <li>Goal progress tracking</li>
            <li>AI-generated financial insights</li>
            <li>Category-wise spending breakdown</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ReportGenerator;
