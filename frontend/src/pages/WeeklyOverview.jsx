import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  Award, 
  ChevronLeft, 
  ChevronRight, 
  Calendar 
} from 'lucide-react';
import { AnalyticsAPI } from '../services/api';
import './WeeklyOverview.css';

export default function WeeklyOverview({ onToast }) {
  const getTodayStr = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const [referenceDate, setReferenceDate] = useState(getTodayStr());
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadWeeklyData = async (date) => {
    try {
      setLoading(true);
      const data = await AnalyticsAPI.getWeekly(date);
      setAnalytics(data);
    } catch (err) {
      if (onToast) onToast('Failed to load weekly statistics', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWeeklyData(referenceDate);
  }, [referenceDate]);

  const handleWeekStep = (days) => {
    const [y, m, d] = referenceDate.split('-');
    const dt = new Date(y, m - 1, d);
    dt.setDate(dt.getDate() + days);
    const yyyy = dt.getFullYear();
    const mm = String(dt.getMonth() + 1).padStart(2, '0');
    const dd = String(dt.getDate()).padStart(2, '0');
    setReferenceDate(`${yyyy}-${mm}-${dd}`);
  };

  // Modern soft palette colors for categories pie chart
  const CATEGORY_COLORS = {
    Study: '#3498db',
    College: '#9b59b6',
    Project: '#0F9D8A',
    Personal: '#e67e22',
    Health: '#2ecc71',
    Other: '#7f8c8d',
  };

  return (
    <div className="weekly-page">
      <div className="page-header">
        <div className="page-header-titles">
          <h1 className="page-title">Weekly Overview</h1>
          <p className="page-subtitle">A restful look back at your rhythm, focus, and energy.</p>
        </div>

        {/* Week navigation */}
        <div className="page-header-actions">
          <div className="week-nav card">
            <button
              className="btn-icon"
              onClick={() => handleWeekStep(-7)}
              title="Previous Week"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="week-range-text">
              <Calendar size={15} className="cal-icon" />
              <span>
                {analytics ? `${analytics.start_date} to ${analytics.end_date}` : 'Loading...'}
              </span>
            </div>
            <button
              className="btn-icon"
              onClick={() => handleWeekStep(7)}
              title="Next Week"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner-teal" />
          <p>Analyzing your weekly rhythm...</p>
        </div>
      ) : !analytics ? null : (
        <>
          {/* Key Metric Highlights */}
          <div className="metrics-grid">
            <div className="card metric-card">
              <div className="metric-icon-wrap" style={{ backgroundColor: 'var(--primary-teal-light)', color: 'var(--primary-teal)' }}>
                <CheckCircle size={22} />
              </div>
              <div className="metric-info">
                <span className="metric-label">Completed Tasks</span>
                <h3 className="metric-value">
                  {analytics.total_completed} <span className="metric-sub">/ {analytics.total_planned}</span>
                </h3>
              </div>
            </div>

            <div className="card metric-card">
              <div className="metric-icon-wrap" style={{ backgroundColor: 'var(--secondary-sage)', color: 'var(--primary-teal)' }}>
                <TrendingUp size={22} />
              </div>
              <div className="metric-info">
                <span className="metric-label">Weekly Completion Rate</span>
                <h3 className="metric-value">{analytics.weekly_completion_rate}%</h3>
              </div>
            </div>

            <div className="card metric-card">
              <div className="metric-icon-wrap" style={{ backgroundColor: '#fff3cd', color: '#c98200' }}>
                <Clock size={22} />
              </div>
              <div className="metric-info">
                <span className="metric-label">Planned Focus Time</span>
                <h3 className="metric-value">{analytics.total_planned_hours} hrs</h3>
              </div>
            </div>

            <div className="card metric-card">
              <div className="metric-icon-wrap" style={{ backgroundColor: '#f4ecf7', color: '#9b59b6' }}>
                <Award size={22} />
              </div>
              <div className="metric-info">
                <span className="metric-label">Most Productive Day</span>
                <h3 className="metric-value">{analytics.most_productive_day}</h3>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="charts-grid">
            {/* Daily Planned vs Completed Chart */}
            <div className="card chart-card">
              <div className="chart-header">
                <h3 className="chart-title">Tasks Planned vs. Completed</h3>
                <span className="chart-subtitle">Day by day comparison for the week</span>
              </div>
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={analytics.daily_stats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="day_name" stroke="#7B8982" fontSize={12} tickLine={false} />
                    <YAxis stroke="#7B8982" fontSize={12} tickLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '10px',
                        border: '1px solid #E7EDE8',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                      }}
                    />
                    <Bar dataKey="planned" name="Planned" fill="#DDEDE3" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="completed" name="Completed" fill="#0F9D8A" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Category Breakdown Chart */}
            <div className="card chart-card">
              <div className="chart-header">
                <h3 className="chart-title">Focus by Category</h3>
                <span className="chart-subtitle">Distribution of all tasks this week</span>
              </div>
              <div className="chart-wrapper pie-wrapper">
                {analytics.category_distribution.length === 0 ? (
                  <div className="no-chart-data">
                    <p>No tasks recorded for this week yet.</p>
                  </div>
                ) : (
                  <div className="pie-container">
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie
                          data={analytics.category_distribution}
                          dataKey="count"
                          nameKey="category"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          innerRadius={46}
                          paddingAngle={3}
                        >
                          {analytics.category_distribution.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={CATEGORY_COLORS[entry.category] || '#7f8c8d'}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#FFFFFF',
                            borderRadius: '10px',
                            border: '1px solid #E7EDE8',
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>

                    <div className="category-legend">
                      {analytics.category_distribution.map((cat) => (
                        <div key={cat.category} className="legend-item">
                          <span
                            className="legend-dot"
                            style={{ backgroundColor: CATEGORY_COLORS[cat.category] || '#7f8c8d' }}
                          />
                          <span className="legend-label">{cat.category}</span>
                          <span className="legend-count">({cat.count})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
