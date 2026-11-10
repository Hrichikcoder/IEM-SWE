import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../axios';

const HistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await api.get('/stocks/history');
      setHistory(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch analysis history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (id, stockName) => {
    if (!window.confirm(`Are you sure you want to delete the analysis for "${stockName}"?`)) {
      return;
    }

    try {
      await api.delete(`/stocks/${id}`);
      setHistory((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete record.");
    }
  };

  const getBadgeClass = (rec) => {
    switch (rec) {
      case 'BUY':
        return 'badge-buy';
      case 'HOLD':
        return 'badge-hold';
      case 'AVOID':
        return 'badge-avoid';
      default:
        return 'badge-insufficient';
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <p style={{ color: '#64748b' }}>Loading your previous stock analyses...</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ color: '#0f172a' }}>Analysis History</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Review and manage all your past fundamental and technical stock evaluations.
          </p>
        </div>
        <Link to="/analyze" className="btn btn-primary">
          + New Analysis
        </Link>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {history.length === 0 ? (
        <div className="form-card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
          <h3 style={{ color: '#0f172a', marginBottom: '0.5rem' }}>No records found</h3>
          <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
            You haven't run any stock valuations yet.
          </p>
          <Link to="/analyze" className="btn btn-primary">
            Analyze Your First Stock
          </Link>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="history-table">
            <thead>
              <tr>
                <th>Stock</th>
                <th>Sector</th>
                <th>Intent</th>
                <th>Valuation (P/E & P/B)</th>
                <th>Confidence</th>
                <th>Recommendation</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <tr key={item._id}>
                  <td>
                    <strong>{item.stockName}</strong>
                  </td>
                  <td>{item.sector || 'General'}</td>
                  <td>
                    <span style={{ fontSize: '0.8rem', color: '#0284c7' }}>
                      {item.ownershipStatus || 'Planning to Buy'}
                    </span>
                  </td>
                  <td>
                    P/E: {item.metrics?.peRatio} | P/B: {item.metrics?.pbRatio}
                  </td>
                  <td>
                    <strong>{item.confidenceScore || item.score}%</strong>
                  </td>
                  <td>
                    <span className={`table-badge ${getBadgeClass(item.recommendation)}`}>
                      {item.recommendation}
                    </span>
                  </td>
                  <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => navigate(`/results/${item._id}`, { state: { analysis: item } })}
                        className="btn btn-secondary"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDelete(item._id, item.stockName)}
                        className="btn btn-danger"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
