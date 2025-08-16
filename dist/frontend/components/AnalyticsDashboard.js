"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsDashboard = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const AnalyticsDashboard = ({ analyticsEngine, isVisible, onToggleVisibility }) => {
    const [analytics, setAnalytics] = (0, react_1.useState)(null);
    const [activeTab, setActiveTab] = (0, react_1.useState)('overview');
    const [isLive, setIsLive] = (0, react_1.useState)(false);
    // Update analytics data periodically
    (0, react_1.useEffect)(() => {
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
    (0, react_1.useEffect)(() => {
        const handleAnalyticsCompleted = (completedAnalytics) => {
            setAnalytics(completedAnalytics);
            setIsLive(false);
        };
        analyticsEngine.on('analytics-completed', handleAnalyticsCompleted);
        return () => analyticsEngine.off('analytics-completed', handleAnalyticsCompleted);
    }, [analyticsEngine]);
    const formatDuration = (ms) => {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        if (hours > 0) {
            return `${hours}h ${minutes % 60}m`;
        }
        return `${minutes}m ${seconds % 60}s`;
    };
    const formatBytes = (bytes) => {
        const units = ['B', 'KB', 'MB', 'GB'];
        let size = bytes;
        let unitIndex = 0;
        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }
        return `${size.toFixed(1)} ${units[unitIndex]}`;
    };
    const getQualityColor = (score) => {
        if (score >= 90)
            return '#10b981';
        if (score >= 75)
            return '#f59e0b';
        if (score >= 60)
            return '#f97316';
        return '#ef4444';
    };
    if (!isVisible) {
        return ((0, jsx_runtime_1.jsx)("div", { className: "analytics-toggle", children: (0, jsx_runtime_1.jsxs)("button", { className: "analytics-toggle-btn", onClick: onToggleVisibility, title: "Meeting Analytics", children: ["\uD83D\uDCCA", isLive && (0, jsx_runtime_1.jsx)("div", { className: "live-indicator" })] }) }));
    }
    if (!analytics) {
        return ((0, jsx_runtime_1.jsxs)("div", { className: "analytics-dashboard", children: [(0, jsx_runtime_1.jsxs)("div", { className: "dashboard-header", children: [(0, jsx_runtime_1.jsx)("h3", { children: "Meeting Analytics" }), (0, jsx_runtime_1.jsx)("button", { className: "close-btn", onClick: onToggleVisibility, children: "\u2715" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "no-data", children: [(0, jsx_runtime_1.jsx)("span", { children: "\uD83D\uDCCA" }), (0, jsx_runtime_1.jsx)("p", { children: "No meeting data available" }), (0, jsx_runtime_1.jsx)("small", { children: "Analytics will appear when a meeting is active" })] })] }));
    }
    return ((0, jsx_runtime_1.jsxs)("div", { className: "analytics-dashboard", children: [(0, jsx_runtime_1.jsxs)("div", { className: "dashboard-header", children: [(0, jsx_runtime_1.jsxs)("div", { className: "header-title", children: [(0, jsx_runtime_1.jsx)("h3", { children: "Meeting Analytics" }), isLive && ((0, jsx_runtime_1.jsxs)("div", { className: "live-badge", children: [(0, jsx_runtime_1.jsx)("div", { className: "live-dot" }), (0, jsx_runtime_1.jsx)("span", { children: "LIVE" })] }))] }), (0, jsx_runtime_1.jsx)("button", { className: "close-btn", onClick: onToggleVisibility, children: "\u2715" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "dashboard-tabs", children: [(0, jsx_runtime_1.jsx)("button", { className: `tab-btn ${activeTab === 'overview' ? 'active' : ''}`, onClick: () => setActiveTab('overview'), children: "Overview" }), (0, jsx_runtime_1.jsx)("button", { className: `tab-btn ${activeTab === 'compression' ? 'active' : ''}`, onClick: () => setActiveTab('compression'), children: "Compression" }), (0, jsx_runtime_1.jsx)("button", { className: `tab-btn ${activeTab === 'network' ? 'active' : ''}`, onClick: () => setActiveTab('network'), children: "Network" }), (0, jsx_runtime_1.jsx)("button", { className: `tab-btn ${activeTab === 'participants' ? 'active' : ''}`, onClick: () => setActiveTab('participants'), children: "Participants" }), (0, jsx_runtime_1.jsx)("button", { className: `tab-btn ${activeTab === 'insights' ? 'active' : ''}`, onClick: () => setActiveTab('insights'), children: "Insights" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "dashboard-content", children: [activeTab === 'overview' && ((0, jsx_runtime_1.jsxs)("div", { className: "overview-section", children: [(0, jsx_runtime_1.jsxs)("div", { className: "metrics-grid", children: [(0, jsx_runtime_1.jsxs)("div", { className: "metric-card", children: [(0, jsx_runtime_1.jsx)("div", { className: "metric-icon", children: "\u23F1\uFE0F" }), (0, jsx_runtime_1.jsxs)("div", { className: "metric-info", children: [(0, jsx_runtime_1.jsx)("span", { className: "metric-label", children: "Duration" }), (0, jsx_runtime_1.jsx)("span", { className: "metric-value", children: formatDuration(analytics.meeting.duration) })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "metric-card", children: [(0, jsx_runtime_1.jsx)("div", { className: "metric-icon", children: "\uD83D\uDC65" }), (0, jsx_runtime_1.jsxs)("div", { className: "metric-info", children: [(0, jsx_runtime_1.jsx)("span", { className: "metric-label", children: "Participants" }), (0, jsx_runtime_1.jsx)("span", { className: "metric-value", children: analytics.meeting.totalParticipants })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "metric-card", children: [(0, jsx_runtime_1.jsx)("div", { className: "metric-icon", children: "\uD83D\uDDDC\uFE0F" }), (0, jsx_runtime_1.jsxs)("div", { className: "metric-info", children: [(0, jsx_runtime_1.jsx)("span", { className: "metric-label", children: "Compression" }), (0, jsx_runtime_1.jsxs)("span", { className: "metric-value", children: [analytics.compression.overallCompressionRatio.toFixed(1), "x"] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "metric-card", children: [(0, jsx_runtime_1.jsx)("div", { className: "metric-icon", children: "\uD83D\uDCBE" }), (0, jsx_runtime_1.jsxs)("div", { className: "metric-info", children: [(0, jsx_runtime_1.jsx)("span", { className: "metric-label", children: "Data Saved" }), (0, jsx_runtime_1.jsx)("span", { className: "metric-value", children: formatBytes(analytics.compression.dataSaved) })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "metric-card", children: [(0, jsx_runtime_1.jsx)("div", { className: "metric-icon", children: "\uD83D\uDCE1" }), (0, jsx_runtime_1.jsxs)("div", { className: "metric-info", children: [(0, jsx_runtime_1.jsx)("span", { className: "metric-label", children: "Avg Latency" }), (0, jsx_runtime_1.jsxs)("span", { className: "metric-value", children: [analytics.network.averageLatency.toFixed(0), "ms"] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "metric-card", children: [(0, jsx_runtime_1.jsx)("div", { className: "metric-icon", children: "\u2B50" }), (0, jsx_runtime_1.jsxs)("div", { className: "metric-info", children: [(0, jsx_runtime_1.jsx)("span", { className: "metric-label", children: "Quality Score" }), (0, jsx_runtime_1.jsxs)("span", { className: "metric-value", style: { color: getQualityColor(analytics.quality.overallQualityScore) }, children: [analytics.quality.overallQualityScore.toFixed(0), "%"] })] })] })] }), analytics.chat && ((0, jsx_runtime_1.jsxs)("div", { className: "chat-summary", children: [(0, jsx_runtime_1.jsx)("h4", { children: "Chat Activity" }), (0, jsx_runtime_1.jsxs)("div", { className: "chat-stats", children: [(0, jsx_runtime_1.jsxs)("div", { className: "chat-stat", children: [(0, jsx_runtime_1.jsx)("span", { className: "stat-label", children: "Messages:" }), (0, jsx_runtime_1.jsx)("span", { className: "stat-value", children: analytics.chat.totalMessages })] }), (0, jsx_runtime_1.jsxs)("div", { className: "chat-stat", children: [(0, jsx_runtime_1.jsx)("span", { className: "stat-label", children: "Compression:" }), (0, jsx_runtime_1.jsxs)("span", { className: "stat-value", children: [analytics.chat.overallCompressionRatio.toFixed(1), "x"] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "chat-stat", children: [(0, jsx_runtime_1.jsx)("span", { className: "stat-label", children: "Rate:" }), (0, jsx_runtime_1.jsxs)("span", { className: "stat-value", children: [analytics.chat.messagesPerMinute.toFixed(1), "/min"] })] })] })] }))] })), activeTab === 'compression' && ((0, jsx_runtime_1.jsxs)("div", { className: "compression-section", children: [(0, jsx_runtime_1.jsxs)("div", { className: "section-header", children: [(0, jsx_runtime_1.jsx)("h4", { children: "Compression Performance" }), (0, jsx_runtime_1.jsxs)("div", { className: "efficiency-score", children: [(0, jsx_runtime_1.jsx)("span", { children: "Efficiency: " }), (0, jsx_runtime_1.jsxs)("span", { className: "score", children: [analytics.compression.compressionEfficiency.toFixed(0), "%"] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "compression-metrics", children: [(0, jsx_runtime_1.jsxs)("div", { className: "compression-card", children: [(0, jsx_runtime_1.jsx)("h5", { children: "Overall Statistics" }), (0, jsx_runtime_1.jsxs)("div", { className: "compression-stats", children: [(0, jsx_runtime_1.jsxs)("div", { className: "stat-row", children: [(0, jsx_runtime_1.jsx)("span", { children: "Total Processed:" }), (0, jsx_runtime_1.jsx)("span", { children: formatBytes(analytics.compression.totalDataProcessed) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "stat-row", children: [(0, jsx_runtime_1.jsx)("span", { children: "Total Compressed:" }), (0, jsx_runtime_1.jsx)("span", { children: formatBytes(analytics.compression.totalCompressedData) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "stat-row", children: [(0, jsx_runtime_1.jsx)("span", { children: "Compression Ratio:" }), (0, jsx_runtime_1.jsxs)("span", { className: "highlight", children: [analytics.compression.overallCompressionRatio.toFixed(2), "x"] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "stat-row", children: [(0, jsx_runtime_1.jsx)("span", { children: "Data Saved:" }), (0, jsx_runtime_1.jsxs)("span", { className: "highlight", children: [analytics.compression.dataSavedPercentage.toFixed(1), "%"] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "stat-row", children: [(0, jsx_runtime_1.jsx)("span", { children: "Avg Processing Time:" }), (0, jsx_runtime_1.jsxs)("span", { children: [analytics.compression.averageCompressionTime.toFixed(1), "ms"] })] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "compression-card", children: [(0, jsx_runtime_1.jsx)("h5", { children: "Quantum Compression" }), (0, jsx_runtime_1.jsxs)("div", { className: "quantum-stats", children: [(0, jsx_runtime_1.jsxs)("div", { className: "quantum-param", children: [(0, jsx_runtime_1.jsx)("span", { children: "Bit Depth:" }), (0, jsx_runtime_1.jsx)("div", { className: "param-bar", children: (0, jsx_runtime_1.jsx)("div", { className: "param-fill", style: { width: `${(analytics.compression.quantumStats.averageQuantumBitDepth / 16) * 100}%` } }) }), (0, jsx_runtime_1.jsx)("span", { children: analytics.compression.quantumStats.averageQuantumBitDepth.toFixed(1) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "quantum-param", children: [(0, jsx_runtime_1.jsx)("span", { children: "Entanglement:" }), (0, jsx_runtime_1.jsx)("div", { className: "param-bar", children: (0, jsx_runtime_1.jsx)("div", { className: "param-fill", style: { width: `${(analytics.compression.quantumStats.averageEntanglementLevel / 8) * 100}%` } }) }), (0, jsx_runtime_1.jsx)("span", { children: analytics.compression.quantumStats.averageEntanglementLevel.toFixed(1) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "quantum-param", children: [(0, jsx_runtime_1.jsx)("span", { children: "Superposition:" }), (0, jsx_runtime_1.jsx)("div", { className: "param-bar", children: (0, jsx_runtime_1.jsx)("div", { className: "param-fill", style: { width: `${(analytics.compression.quantumStats.averageSuperpositionComplexity / 10) * 100}%` } }) }), (0, jsx_runtime_1.jsx)("span", { children: analytics.compression.quantumStats.averageSuperpositionComplexity.toFixed(1) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "quantum-efficiency", children: [(0, jsx_runtime_1.jsx)("span", { children: "Quantum Efficiency Score:" }), (0, jsx_runtime_1.jsxs)("span", { className: "efficiency-value", children: [analytics.compression.quantumStats.quantumEfficiencyScore.toFixed(0), "%"] })] })] })] })] })] })), activeTab === 'network' && ((0, jsx_runtime_1.jsxs)("div", { className: "network-section", children: [(0, jsx_runtime_1.jsxs)("div", { className: "section-header", children: [(0, jsx_runtime_1.jsx)("h4", { children: "Network Performance" }), (0, jsx_runtime_1.jsxs)("div", { className: "stability-score", children: [(0, jsx_runtime_1.jsx)("span", { children: "Stability: " }), (0, jsx_runtime_1.jsxs)("span", { className: "score", style: { color: getQualityColor(analytics.network.networkStabilityScore) }, children: [analytics.network.networkStabilityScore.toFixed(0), "%"] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "network-metrics", children: [(0, jsx_runtime_1.jsxs)("div", { className: "network-card", children: [(0, jsx_runtime_1.jsx)("h5", { children: "Bandwidth Usage" }), (0, jsx_runtime_1.jsxs)("div", { className: "bandwidth-stats", children: [(0, jsx_runtime_1.jsxs)("div", { className: "stat-row", children: [(0, jsx_runtime_1.jsx)("span", { children: "Avg per Participant:" }), (0, jsx_runtime_1.jsxs)("span", { children: [analytics.network.averageBandwidthPerParticipant.toFixed(1), " Mbps"] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "stat-row", children: [(0, jsx_runtime_1.jsx)("span", { children: "Peak Usage:" }), (0, jsx_runtime_1.jsxs)("span", { children: [analytics.network.peakBandwidth.toFixed(1), " Mbps"] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "stat-row", children: [(0, jsx_runtime_1.jsx)("span", { children: "Bandwidth Saved:" }), (0, jsx_runtime_1.jsxs)("span", { className: "highlight", children: [analytics.network.bandwidthSaved.toFixed(1), " Mbps"] })] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "network-card", children: [(0, jsx_runtime_1.jsx)("h5", { children: "Connection Quality" }), (0, jsx_runtime_1.jsx)("div", { className: "quality-distribution", children: Object.entries(analytics.network.qualityDistribution).map(([quality, count]) => ((0, jsx_runtime_1.jsxs)("div", { className: "quality-item", children: [(0, jsx_runtime_1.jsxs)("span", { className: "quality-label", children: [quality, ":"] }), (0, jsx_runtime_1.jsx)("div", { className: "quality-bar", children: (0, jsx_runtime_1.jsx)("div", { className: `quality-fill quality-${quality}`, style: { width: `${(count / analytics.meeting.totalParticipants) * 100}%` } }) }), (0, jsx_runtime_1.jsx)("span", { className: "quality-count", children: count })] }, quality))) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "network-card", children: [(0, jsx_runtime_1.jsx)("h5", { children: "Performance Metrics" }), (0, jsx_runtime_1.jsxs)("div", { className: "performance-stats", children: [(0, jsx_runtime_1.jsxs)("div", { className: "stat-row", children: [(0, jsx_runtime_1.jsx)("span", { children: "Average Latency:" }), (0, jsx_runtime_1.jsxs)("span", { children: [analytics.network.averageLatency.toFixed(0), "ms"] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "stat-row", children: [(0, jsx_runtime_1.jsx)("span", { children: "Packet Loss:" }), (0, jsx_runtime_1.jsxs)("span", { style: { color: analytics.network.packetLossPercentage > 3 ? '#ef4444' : '#10b981' }, children: [analytics.network.packetLossPercentage.toFixed(2), "%"] })] })] })] })] })] })), activeTab === 'participants' && ((0, jsx_runtime_1.jsxs)("div", { className: "participants-section", children: [(0, jsx_runtime_1.jsx)("h4", { children: "Participant Analytics" }), (0, jsx_runtime_1.jsx)("div", { className: "participants-list", children: analytics.participants.map(participant => ((0, jsx_runtime_1.jsxs)("div", { className: "participant-card", children: [(0, jsx_runtime_1.jsxs)("div", { className: "participant-header", children: [(0, jsx_runtime_1.jsx)("span", { className: "participant-name", children: participant.participantName }), (0, jsx_runtime_1.jsx)("span", { className: "participant-duration", children: formatDuration(participant.duration) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "participant-stats", children: [(0, jsx_runtime_1.jsxs)("div", { className: "stat-group", children: [(0, jsx_runtime_1.jsx)("span", { className: "stat-label", children: "Speaking Time:" }), (0, jsx_runtime_1.jsxs)("span", { className: "stat-value", children: [participant.speakingPercentage.toFixed(1), "%"] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "stat-group", children: [(0, jsx_runtime_1.jsx)("span", { className: "stat-label", children: "Video Quality:" }), (0, jsx_runtime_1.jsx)("span", { className: `quality-badge quality-${participant.averageVideoQuality}`, children: participant.averageVideoQuality })] }), (0, jsx_runtime_1.jsxs)("div", { className: "stat-group", children: [(0, jsx_runtime_1.jsx)("span", { className: "stat-label", children: "Data Usage:" }), (0, jsx_runtime_1.jsx)("span", { className: "stat-value", children: formatBytes(participant.dataUsage.total) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "stat-group", children: [(0, jsx_runtime_1.jsx)("span", { className: "stat-label", children: "Compression:" }), (0, jsx_runtime_1.jsxs)("span", { className: "stat-value", children: [participant.compressionStats.averageRatio.toFixed(1), "x"] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "stat-group", children: [(0, jsx_runtime_1.jsx)("span", { className: "stat-label", children: "Connection:" }), (0, jsx_runtime_1.jsxs)("span", { className: "stat-value", style: { color: getQualityColor(participant.connectionQuality.average) }, children: [participant.connectionQuality.average.toFixed(0), "%"] })] })] })] }, participant.participantId))) })] })), activeTab === 'insights' && ((0, jsx_runtime_1.jsxs)("div", { className: "insights-section", children: [(0, jsx_runtime_1.jsxs)("div", { className: "insights-container", children: [(0, jsx_runtime_1.jsxs)("div", { className: "insights-card", children: [(0, jsx_runtime_1.jsx)("h4", { children: "\uD83D\uDCCA Key Insights" }), (0, jsx_runtime_1.jsx)("div", { className: "insights-list", children: analytics.insights.length > 0 ? (analytics.insights.map((insight, index) => ((0, jsx_runtime_1.jsxs)("div", { className: "insight-item", children: [(0, jsx_runtime_1.jsx)("span", { className: "insight-icon", children: "\uD83D\uDCA1" }), (0, jsx_runtime_1.jsx)("span", { className: "insight-text", children: insight })] }, index)))) : ((0, jsx_runtime_1.jsxs)("div", { className: "no-insights", children: [(0, jsx_runtime_1.jsx)("span", { children: "\uD83D\uDD0D" }), (0, jsx_runtime_1.jsx)("p", { children: "No insights available yet" })] })) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "recommendations-card", children: [(0, jsx_runtime_1.jsx)("h4", { children: "\uD83C\uDFAF Recommendations" }), (0, jsx_runtime_1.jsx)("div", { className: "recommendations-list", children: analytics.recommendations.length > 0 ? (analytics.recommendations.map((recommendation, index) => ((0, jsx_runtime_1.jsxs)("div", { className: "recommendation-item", children: [(0, jsx_runtime_1.jsx)("span", { className: "recommendation-icon", children: "\uD83D\uDE80" }), (0, jsx_runtime_1.jsx)("span", { className: "recommendation-text", children: recommendation })] }, index)))) : ((0, jsx_runtime_1.jsxs)("div", { className: "no-recommendations", children: [(0, jsx_runtime_1.jsx)("span", { children: "\u2705" }), (0, jsx_runtime_1.jsx)("p", { children: "Everything looks optimal!" })] })) })] })] }), analytics.recording && ((0, jsx_runtime_1.jsxs)("div", { className: "recording-analytics", children: [(0, jsx_runtime_1.jsx)("h4", { children: "\uD83D\uDCF9 Recording Analytics" }), (0, jsx_runtime_1.jsxs)("div", { className: "recording-stats", children: [(0, jsx_runtime_1.jsxs)("div", { className: "stat-row", children: [(0, jsx_runtime_1.jsx)("span", { children: "Recording Duration:" }), (0, jsx_runtime_1.jsx)("span", { children: formatDuration(analytics.recording.totalRecordingTime) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "stat-row", children: [(0, jsx_runtime_1.jsx)("span", { children: "Compression Ratio:" }), (0, jsx_runtime_1.jsxs)("span", { className: "highlight", children: [analytics.recording.recordingCompressionRatio.toFixed(1), "x"] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "stat-row", children: [(0, jsx_runtime_1.jsx)("span", { children: "Storage Saved:" }), (0, jsx_runtime_1.jsx)("span", { className: "highlight", children: formatBytes(analytics.recording.recordingDataSaved) })] })] })] }))] }))] }), (0, jsx_runtime_1.jsx)("style", { children: `
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
      ` })] }));
};
exports.AnalyticsDashboard = AnalyticsDashboard;
//# sourceMappingURL=AnalyticsDashboard.js.map