import React, { useState, useEffect } from 'react';
import { MeetingAnalytics, MeetingAnalyticsEngine } from '../../video/MeetingAnalytics';

interface AnalyticsDashboardProps {
  analyticsEngine: MeetingAnalyticsEngine;
  isVisible: boolean;
  onToggleVisibility: () => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  analyticsEngine,
  isVisible,
  onToggleVisibility
}) => {
  const [analytics, setAnalytics] = useState<MeetingAnalytics | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'compression' | 'network' | 'participants' | 'insights'>('overview');
  const [isLive, setIsLive] = useState(false);

  // Update analytics data periodically
  useEffect(() => {
    const updateAnalytics = () => {
      const currentAnalytics = analyticsEngine.getCurrentAnalytics();
      setAnalytics(currentAnalytics);
      setIsLive(currentAnalytics !== null);
    };

    updateAnalytics();
    const interval = setInterval(updateAnalytics, 2000);

    return () => clearInterval(interval);
  }, [analyticsEngine]);

  // Listen for analytics events
  useEffect(() => {
    const handleAnalyticsCompleted = (completedAnalytics: MeetingAnalytics) => {
      setAnalytics(completedAnalytics);
      setIsLive(false);
    };

    analyticsEngine.on('analytics-completed', handleAnalyticsCompleted);
    return () => analyticsEngine.off('analytics-completed', handleAnalyticsCompleted);
  }, [analyticsEngine]);

  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m ${seconds % 60}s`;
  };

  const formatBytes = (bytes: number): string => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  const getQualityColor = (score: number): string => {
    if (score >= 90) return '#10b981';
    if (score >= 75) return '#f59e0b';
    if (score >= 60) return '#f97316';
    return '#ef4444';
  };

  if (!isVisible) {
    return (
      <div className="analytics-toggle">
        <button className="analytics-toggle-btn" onClick={onToggleVisibility} title="Meeting Analytics">
          📊
          {isLive && <div className="live-indicator"></div>}
        </button>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="analytics-dashboard">
        <div className="dashboard-header">
          <h3>Meeting Analytics</h3>
          <button className="close-btn" onClick={onToggleVisibility}>✕</button>
        </div>
        <div className="no-data">
          <span>📊</span>
          <p>No meeting data available</p>
          <small>Analytics will appear when a meeting is active</small>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-dashboard">
      <div className="dashboard-header">
        <div className="header-title">
          <h3>Meeting Analytics</h3>
          {isLive && (
            <div className="live-badge">
              <div className="live-dot"></div>
              <span>LIVE</span>
            </div>
          )}
        </div>
        <button className="close-btn" onClick={onToggleVisibility}>✕</button>
      </div>

      <div className="dashboard-tabs">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab-btn ${activeTab === 'compression' ? 'active' : ''}`}
          onClick={() => setActiveTab('compression')}
        >
          Compression
        </button>
        <button
          className={`tab-btn ${activeTab === 'network' ? 'active' : ''}`}
          onClick={() => setActiveTab('network')}
        >
          Network
        </button>
        <button
          className={`tab-btn ${activeTab === 'participants' ? 'active' : ''}`}
          onClick={() => setActiveTab('participants')}
        >
          Participants
        </button>
        <button
          className={`tab-btn ${activeTab === 'insights' ? 'active' : ''}`}
          onClick={() => setActiveTab('insights')}
        >
          Insights
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'overview' && (
          <div className="overview-section">
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-icon">⏱️</div>
                <div className="metric-info">
                  <span className="metric-label">Duration</span>
                  <span className="metric-value">{formatDuration(analytics.meeting.duration)}</span>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon">👥</div>
                <div className="metric-info">
                  <span className="metric-label">Participants</span>
                  <span className="metric-value">{analytics.meeting.totalParticipants}</span>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon">🗜️</div>
                <div className="metric-info">
                  <span className="metric-label">Compression</span>
                  <span className="metric-value">{analytics.compression.overallCompressionRatio.toFixed(1)}x</span>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon">💾</div>
                <div className="metric-info">
                  <span className="metric-label">Data Saved</span>
                  <span className="metric-value">{formatBytes(analytics.compression.dataSaved)}</span>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon">📡</div>
                <div className="metric-info">
                  <span className="metric-label">Avg Latency</span>
                  <span className="metric-value">{analytics.network.averageLatency.toFixed(0)}ms</span>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon">⭐</div>
                <div className="metric-info">
                  <span className="metric-label">Quality Score</span>
                  <span 
                    className="metric-value"
                    style={{ color: getQualityColor(analytics.quality.overallQualityScore) }}
                  >
                    {analytics.quality.overallQualityScore.toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>

            {analytics.chat && (
              <div className="chat-summary">
                <h4>Chat Activity</h4>
                <div className="chat-stats">
                  <div className="chat-stat">
                    <span className="stat-label">Messages:</span>
                    <span className="stat-value">{analytics.chat.totalMessages}</span>
                  </div>
                  <div className="chat-stat">
                    <span className="stat-label">Compression:</span>
                    <span className="stat-value">{analytics.chat.overallCompressionRatio.toFixed(1)}x</span>
                  </div>
                  <div className="chat-stat">
                    <span className="stat-label">Rate:</span>
                    <span className="stat-value">{analytics.chat.messagesPerMinute.toFixed(1)}/min</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'compression' && (
          <div className="compression-section">
            <div className="section-header">
              <h4>Compression Performance</h4>
              <div className="efficiency-score">
                <span>Efficiency: </span>
                <span className="score">{analytics.compression.compressionEfficiency.toFixed(0)}%</span>
              </div>
            </div>

            <div className="compression-metrics">
              <div className="compression-card">
                <h5>Overall Statistics</h5>
                <div className="compression-stats">
                  <div className="stat-row">
                    <span>Total Processed:</span>
                    <span>{formatBytes(analytics.compression.totalDataProcessed)}</span>
                  </div>
                  <div className="stat-row">
                    <span>Total Compressed:</span>
                    <span>{formatBytes(analytics.compression.totalCompressedData)}</span>
                  </div>
                  <div className="stat-row">
                    <span>Compression Ratio:</span>
                    <span className="highlight">{analytics.compression.overallCompressionRatio.toFixed(2)}x</span>
                  </div>
                  <div className="stat-row">
                    <span>Data Saved:</span>
                    <span className="highlight">{analytics.compression.dataSavedPercentage.toFixed(1)}%</span>
                  </div>
                  <div className="stat-row">
                    <span>Avg Processing Time:</span>
                    <span>{analytics.compression.averageCompressionTime.toFixed(1)}ms</span>
                  </div>
                </div>
              </div>

              <div className="compression-card">
                <h5>Quantum Compression</h5>
                <div className="quantum-stats">
                  <div className="quantum-param">
                    <span>Bit Depth:</span>
                    <div className="param-bar">
                      <div 
                        className="param-fill"
                        style={{ width: `${(analytics.compression.quantumStats.averageQuantumBitDepth / 16) * 100}%` }}
                      ></div>
                    </div>
                    <span>{analytics.compression.quantumStats.averageQuantumBitDepth.toFixed(1)}</span>
                  </div>
                  <div className="quantum-param">
                    <span>Entanglement:</span>
                    <div className="param-bar">
                      <div 
                        className="param-fill"
                        style={{ width: `${(analytics.compression.quantumStats.averageEntanglementLevel / 8) * 100}%` }}
                      ></div>
                    </div>
                    <span>{analytics.compression.quantumStats.averageEntanglementLevel.toFixed(1)}</span>
                  </div>
                  <div className="quantum-param">
                    <span>Superposition:</span>
                    <div className="param-bar">
                      <div 
                        className="param-fill"
                        style={{ width: `${(analytics.compression.quantumStats.averageSuperpositionComplexity / 10) * 100}%` }}
                      ></div>
                    </div>
                    <span>{analytics.compression.quantumStats.averageSuperpositionComplexity.toFixed(1)}</span>
                  </div>
                  <div className="quantum-efficiency">
                    <span>Quantum Efficiency Score:</span>
                    <span className="efficiency-value">
                      {analytics.compression.quantumStats.quantumEfficiencyScore.toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'network' && (
          <div className="network-section">
            <div className="section-header">
              <h4>Network Performance</h4>
              <div className="stability-score">
                <span>Stability: </span>
                <span 
                  className="score"
                  style={{ color: getQualityColor(analytics.network.networkStabilityScore) }}
                >
                  {analytics.network.networkStabilityScore.toFixed(0)}%
                </span>
              </div>
            </div>

            <div className="network-metrics">
              <div className="network-card">
                <h5>Bandwidth Usage</h5>
                <div className="bandwidth-stats">
                  <div className="stat-row">
                    <span>Avg per Participant:</span>
                    <span>{analytics.network.averageBandwidthPerParticipant.toFixed(1)} Mbps</span>
                  </div>
                  <div className="stat-row">
                    <span>Peak Usage:</span>
                    <span>{analytics.network.peakBandwidth.toFixed(1)} Mbps</span>
                  </div>
                  <div className="stat-row">
                    <span>Bandwidth Saved:</span>
                    <span className="highlight">{analytics.network.bandwidthSaved.toFixed(1)} Mbps</span>
                  </div>
                </div>
              </div>

              <div className="network-card">
                <h5>Connection Quality</h5>
                <div className="quality-distribution">
                  {Object.entries(analytics.network.qualityDistribution).map(([quality, count]) => (
                    <div key={quality} className="quality-item">
                      <span className="quality-label">{quality}:</span>
                      <div className="quality-bar">
                        <div 
                          className={`quality-fill quality-${quality}`}
                          style={{ width: `${(count / analytics.meeting.totalParticipants) * 100}%` }}
                        ></div>
                      </div>
                      <span className="quality-count">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="network-card">
                <h5>Performance Metrics</h5>
                <div className="performance-stats">
                  <div className="stat-row">
                    <span>Average Latency:</span>
                    <span>{analytics.network.averageLatency.toFixed(0)}ms</span>
                  </div>
                  <div className="stat-row">
                    <span>Packet Loss:</span>
                    <span style={{ color: analytics.network.packetLossPercentage > 3 ? '#ef4444' : '#10b981' }}>
                      {analytics.network.packetLossPercentage.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'participants' && (
          <div className="participants-section">
            <h4>Participant Analytics</h4>
            <div className="participants-list">
              {analytics.participants.map(participant => (
                <div key={participant.participantId} className="participant-card">
                  <div className="participant-header">
                    <span className="participant-name">{participant.participantName}</span>
                    <span className="participant-duration">{formatDuration(participant.duration)}</span>
                  </div>
                  
                  <div className="participant-stats">
                    <div className="stat-group">
                      <span className="stat-label">Speaking Time:</span>
                      <span className="stat-value">{participant.speakingPercentage.toFixed(1)}%</span>
                    </div>
                    <div className="stat-group">
                      <span className="stat-label">Video Quality:</span>
                      <span className={`quality-badge quality-${participant.averageVideoQuality}`}>
                        {participant.averageVideoQuality}
                      </span>
                    </div>
                    <div className="stat-group">
                      <span className="stat-label">Data Usage:</span>
                      <span className="stat-value">{formatBytes(participant.dataUsage.total)}</span>
                    </div>
                    <div className="stat-group">
                      <span className="stat-label">Compression:</span>
                      <span className="stat-value">{participant.compressionStats.averageRatio.toFixed(1)}x</span>
                    </div>
                    <div className="stat-group">
                      <span className="stat-label">Connection:</span>
                      <span 
                        className="stat-value"
                        style={{ color: getQualityColor(participant.connectionQuality.average) }}
                      >
                        {participant.connectionQuality.average.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="insights-section">
            <div className="insights-container">
              <div className="insights-card">
                <h4>📊 Key Insights</h4>
                <div className="insights-list">
                  {analytics.insights.length > 0 ? (
                    analytics.insights.map((insight, index) => (
                      <div key={index} className="insight-item">
                        <span className="insight-icon">💡</span>
                        <span className="insight-text">{insight}</span>
                      </div>
                    ))
                  ) : (
                    <div className="no-insights">
                      <span>🔍</span>
                      <p>No insights available yet</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="recommendations-card">
                <h4>🎯 Recommendations</h4>
                <div className="recommendations-list">
                  {analytics.recommendations.length > 0 ? (
                    analytics.recommendations.map((recommendation, index) => (
                      <div key={index} className="recommendation-item">
                        <span className="recommendation-icon">🚀</span>
                        <span className="recommendation-text">{recommendation}</span>
                      </div>
                    ))
                  ) : (
                    <div className="no-recommendations">
                      <span>✅</span>
                      <p>Everything looks optimal!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {analytics.recording && (
              <div className="recording-analytics">
                <h4>📹 Recording Analytics</h4>
                <div className="recording-stats">
                  <div className="stat-row">
                    <span>Recording Duration:</span>
                    <span>{formatDuration(analytics.recording.totalRecordingTime)}</span>
                  </div>
                  <div className="stat-row">
                    <span>Compression Ratio:</span>
                    <span className="highlight">{analytics.recording.recordingCompressionRatio.toFixed(1)}x</span>
                  </div>
                  <div className="stat-row">
                    <span>Storage Saved:</span>
                    <span className="highlight">{formatBytes(analytics.recording.recordingDataSaved)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        .analytics-toggle {
          position: fixed;
          bottom: 14rem;
          right: 2rem;
          z-index: 999;
        }

        .analytics-toggle-btn {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border: none;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          font-size: 1.2rem;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
          transition: all 0.3s ease;
          position: relative;
        }

        .analytics-toggle-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(102, 126, 234, 0.4);
        }

        .live-indicator {
          position: absolute;
          top: -2px;
          right: -2px;
          width: 12px;
          height: 12px;
          background: #ff4757;
          border-radius: 50%;
          animation: pulse 1.5s infinite;
        }

        .analytics-dashboard {
          position: fixed;
          top: 2rem;
          right: 2rem;
          width: 500px;
          max-height: calc(100vh - 4rem);
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
          display: flex;
          flex-direction: column;
          z-index: 1000;
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border-radius: 16px 16px 0 0;
        }

        .header-title {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .header-title h3 {
          margin: 0;
          font-size: 1.1rem;
        }

        .live-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 71, 87, 0.2);
          border: 1px solid #ff4757;
          border-radius: 12px;
          padding: 0.25rem 0.75rem;
          font-size: 0.8rem;
          font-weight: 600;
          color: #ff4757;
        }

        .live-dot {
          width: 8px;
          height: 8px;
          background: #ff4757;
          border-radius: 50%;
          animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        .close-btn {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: none;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .dashboard-tabs {
          display: flex;
          background: rgba(0, 0, 0, 0.05);
          overflow-x: auto;
        }

        .tab-btn {
          background: none;
          border: none;
          padding: 0.75rem 1rem;
          cursor: pointer;
          font-weight: 500;
          color: #666;
          transition: all 0.2s ease;
          white-space: nowrap;
          font-size: 0.9rem;
        }

        .tab-btn.active {
          background: white;
          color: #333;
          border-bottom: 2px solid #667eea;
        }

        .dashboard-content {
          flex: 1;
          overflow-y: auto;
          padding: 1rem;
        }

        .no-data {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 300px;
          text-align: center;
          color: #666;
        }

        .no-data span {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .metric-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: rgba(102, 126, 234, 0.1);
          border-radius: 12px;
          padding: 1rem;
        }

        .metric-icon {
          font-size: 1.5rem;
        }

        .metric-info {
          display: flex;
          flex-direction: column;
        }

        .metric-label {
          font-size: 0.8rem;
          color: #666;
          margin-bottom: 0.25rem;
        }

        .metric-value {
          font-size: 1.2rem;
          font-weight: 600;
          color: #333;
        }

        .chat-summary {
          background: rgba(255, 255, 255, 0.5);
          border-radius: 12px;
          padding: 1rem;
        }

        .chat-summary h4 {
          margin: 0 0 1rem 0;
          color: #333;
        }

        .chat-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
        }

        .chat-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .section-header h4 {
          margin: 0;
          color: #333;
        }

        .efficiency-score,
        .stability-score {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
        }

        .score {
          color: #667eea;
        }

        .compression-metrics,
        .network-metrics {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .compression-card,
        .network-card {
          background: rgba(255, 255, 255, 0.5);
          border-radius: 12px;
          padding: 1rem;
        }

        .compression-card h5,
        .network-card h5 {
          margin: 0 0 1rem 0;
          color: #333;
          font-size: 1rem;
        }

        .compression-stats,
        .bandwidth-stats,
        .performance-stats {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .stat-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 0;
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        }

        .stat-row:last-child {
          border-bottom: none;
        }

        .highlight {
          color: #667eea;
          font-weight: 600;
        }

        .quantum-stats {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .quantum-param {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .quantum-param span:first-child {
          min-width: 100px;
          font-size: 0.9rem;
        }

        .param-bar {
          flex: 1;
          height: 8px;
          background: rgba(0, 0, 0, 0.1);
          border-radius: 4px;
          overflow: hidden;
        }

        .param-fill {
          height: 100%;
          background: linear-gradient(90deg, #667eea, #764ba2);
          transition: width 0.3s ease;
        }

        .quantum-efficiency {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 1rem;
          border-top: 1px solid rgba(0, 0, 0, 0.1);
          font-weight: 600;
        }

        .efficiency-value {
          color: #667eea;
          font-size: 1.1rem;
        }

        .quality-distribution {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .quality-item {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .quality-label {
          min-width: 80px;
          font-size: 0.9rem;
          text-transform: capitalize;
        }

        .quality-bar {
          flex: 1;
          height: 8px;
          background: rgba(0, 0, 0, 0.1);
          border-radius: 4px;
          overflow: hidden;
        }

        .quality-fill {
          height: 100%;
          transition: width 0.3s ease;
        }

        .quality-excellent { background: #10b981; }
        .quality-good { background: #f59e0b; }
        .quality-fair { background: #f97316; }
        .quality-poor { background: #ef4444; }

        .quality-count {
          min-width: 30px;
          text-align: right;
          font-weight: 600;
        }

        .participants-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .participant-card {
          background: rgba(255, 255, 255, 0.5);
          border-radius: 12px;
          padding: 1rem;
        }

        .participant-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .participant-name {
          font-weight: 600;
          color: #333;
        }

        .participant-duration {
          color: #666;
          font-size: 0.9rem;
        }

        .participant-stats {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
        }

        .stat-group {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .stat-label {
          font-size: 0.8rem;
          color: #666;
        }

        .stat-value {
          font-weight: 600;
          color: #333;
        }

        .quality-badge {
          padding: 0.25rem 0.5rem;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .quality-low { background: #fef3c7; color: #d97706; }
        .quality-medium { background: #dbeafe; color: #2563eb; }
        .quality-high { background: #d1fae5; color: #059669; }

        .insights-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .insights-card,
        .recommendations-card {
          background: rgba(255, 255, 255, 0.5);
          border-radius: 12px;
          padding: 1rem;
        }

        .insights-card h4,
        .recommendations-card h4 {
          margin: 0 0 1rem 0;
          color: #333;
        }

        .insights-list,
        .recommendations-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .insight-item,
        .recommendation-item {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 0.75rem;
          background: rgba(102, 126, 234, 0.1);
          border-radius: 8px;
        }

        .insight-icon,
        .recommendation-icon {
          font-size: 1rem;
          margin-top: 0.1rem;
        }

        .insight-text,
        .recommendation-text {
          flex: 1;
          font-size: 0.9rem;
          line-height: 1.4;
          color: #333;
        }

        .no-insights,
        .no-recommendations {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 2rem;
          color: #666;
        }

        .no-insights span,
        .no-recommendations span {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }

        .recording-analytics {
          background: rgba(255, 255, 255, 0.5);
          border-radius: 12px;
          padding: 1rem;
          margin-top: 1.5rem;
        }

        .recording-analytics h4 {
          margin: 0 0 1rem 0;
          color: #333;
        }

        .recording-stats {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        @media (max-width: 768px) {
          .analytics-dashboard {
            width: calc(100vw - 2rem);
            right: 1rem;
            left: 1rem;
          }

          .metrics-grid {
            grid-template-columns: 1fr;
          }

          .participant-stats {
            grid-template-columns: 1fr;
          }

          .chat-stats {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};