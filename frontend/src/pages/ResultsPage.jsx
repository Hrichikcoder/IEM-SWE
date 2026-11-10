import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import api from '../axios';

const ResultsPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [analysis, setAnalysis] = useState(location.state?.analysis || null);
  const [previewUrl] = useState(location.state?.previewUrl || null);
  const [loading, setLoading] = useState(!analysis);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!analysis && id) {
      const fetchAnalysis = async () => {
        try {
          const res =await api.get(`/stocks/${id}`);
          setAnalysis(res.data);
        } catch (err) {
          setError(err.response?.data?.message || 'Failed to load analysis record.');
        } finally {
          setLoading(false);
        }
      };

      fetchAnalysis();
    }
  }, [id, analysis]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Loading stock valuation results...</p>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="form-card" style={{ textAlign: 'center' }}>
        <div className="alert alert-danger">{error || 'Record not found.'}</div>
        <Link to="/analyze" className="btn btn-primary">
          Analyze a Stock
        </Link>
      </div>
    );
  }

  const {
    stockName, sector, ownershipStatus,
    metrics, technicalIndicators, recommendation,
    score, confidenceScore, explanation,
    similarStocks, ocrOutput, createdAt
  } = analysis;

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

  return (
    <div>
      <div className="results-header">
        <div className="stock-title">
          <h2>{stockName}</h2>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.35rem', flexWrap: 'wrap' }}>
            <span className="sector-tag">{sector || "General"}</span>
            <span className="sector-tag" style={{ background: '#e0f2fe', color: '#0369a1' }}>
              Intent: {ownershipStatus || 'Planning to Buy'}
            </span>
          </div>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.35rem' }}>
            Analyzed on: {new Date(createdAt || Date.now()).toLocaleDateString()}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
              Confidence Score
            </div>
            <div className="score-display">{confidenceScore || score}%</div>
          </div>
          <div className={`recommendation-badge ${getBadgeClass(recommendation)}`}>
            {recommendation}
          </div>
        </div>
      </div>

      {technicalIndicators && (
        <div className="analysis-card">
          <h3>Technical Indicators (Historical Price Analysis)</h3>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>
            Calculated from historical prices to gauge technical momentum and trend:
          </p>
          <div className="metrics-grid" style={{ marginBottom: '0.25rem' }}>
            <div className="metric-card">
              <div className="metric-label">SMA (20 Day)</div>
              <div className="metric-value">${technicalIndicators.sma20 || 'N/A'}</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">SMA (50 Day)</div>
              <div className="metric-value">${technicalIndicators.sma50 || 'N/A'}</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">RSI (14 Period)</div>
              <div className="metric-value">{technicalIndicators.rsi || '50'}</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">MACD</div>
              <div className="metric-value">{technicalIndicators.macd || '0'}</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Technical Trend</div>
              <div className="metric-value" style={{ color: technicalIndicators.trend === 'Bullish' ? '#15803d' : technicalIndicators.trend === 'Bearish' ? '#b91c1c' : '#a16207' }}>
                {technicalIndicators.trend || 'Neutral'}
              </div>
            </div>
          </div>
        </div>
      )}

      {(previewUrl || (ocrOutput && ocrOutput.rawText)) && (
        <div className="analysis-card">
          <h3>Uploaded Chart & OCR Result</h3>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
            {previewUrl && (
              <div>
                <img
                  src={previewUrl}
                  alt="Stock chart"
                  style={{ maxHeight: '180px', borderRadius: '6px', border: '1px solid #e2e8f0' }}
                />
              </div>
            )}
            <div style={{ flex: 1, minWidth: '260px' }}>
              <div style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '0.5rem' }}>
                <strong>Extracted Text from Chart:</strong>
              </div>
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  fontFamily: 'monospace',
                  fontSize: '0.8rem',
                  maxHeight: '120px',
                  overflowY: 'auto',
                  color: '#334155'
                }}
              >
                {ocrOutput?.rawText ? ocrOutput.rawText : 'No text recognized.'}
              </div>
              {ocrOutput?.extractedValues?.length > 0 && (
                <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#64748b' }}>
                  Extracted Numbers: {ocrOutput.extractedValues.join(', ')}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <h3 style={{ marginBottom: '0.75rem', color: '#0f172a' }}>Fundamental Financial Parameters</h3>
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-label">P/E Ratio</div>
          <div className="metric-value">{metrics.peRatio}</div>
        </div>

        <div className="metric-card">
          <div className="metric-label">P/B Ratio</div>
          <div className="metric-value">{metrics.pbRatio}</div>
        </div>

        {metrics.industryPe !== null && (
          <div className="metric-card">
            <div className="metric-label">Industry P/E</div>
            <div className="metric-value">{metrics.industryPe}</div>
          </div>
        )}

        {metrics.marketCap !== null && (
          <div className="metric-card">
            <div className="metric-label">Market Cap</div>
            <div className="metric-value">${metrics.marketCap}B</div>
          </div>
        )}

        {metrics.roe !== null && (
          <div className="metric-card">
            <div className="metric-label">ROE</div>
            <div className="metric-value">{metrics.roe}%</div>
          </div>
        )}

        {metrics.debtToEquity !== null && (
          <div className="metric-card">
            <div className="metric-label">Debt / Equity</div>
            <div className="metric-value">{metrics.debtToEquity}</div>
          </div>
        )}

        {metrics.eps !== null && (
          <div className="metric-card">
            <div className="metric-label">EPS</div>
            <div className="metric-value">${metrics.eps}</div>
          </div>
        )}

        {metrics.bookValue !== null && (
          <div className="metric-card">
            <div className="metric-label">Book Value</div>
            <div className="metric-value">${metrics.bookValue}</div>
          </div>
        )}

        {metrics.faceValue !== null && (
          <div className="metric-card">
            <div className="metric-label">Face Value</div>
            <div className="metric-value">${metrics.faceValue}</div>
          </div>
        )}

        {metrics.currentPrice !== null && (
          <div className="metric-card">
            <div className="metric-label">Current Price</div>
            <div className="metric-value">${metrics.currentPrice}</div>
          </div>
        )}

        {metrics.dividendYield !== null && (
          <div className="metric-card">
            <div className="metric-label">Dividend Yield</div>
            <div className="metric-value">{metrics.dividendYield}%</div>
          </div>
        )}
      </div>

      <div className="analysis-card">
        <h3>Model Recommendation Reasoning</h3>
        <p style={{ color: '#334155', fontSize: '0.95rem', lineHeight: '1.6' }}>
          {explanation?.summary}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginTop: '1.25rem' }}>
          <div>
            <div style={{ fontWeight: 600, color: '#166534', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              Contributing Strengths:
            </div>
            {explanation?.strengths?.length > 0 ? (
              <ul className="factors-list">
                {explanation.strengths.map((item, idx) => (
                  <li key={idx} className="strength-item">
                    <span>+</span> <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ fontSize: '0.85rem', color: '#64748b' }}>No major strengths noted.</p>
            )}
          </div>

          <div>
            <div style={{ fontWeight: 600, color: '#991b1b', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              Contributing Risks / Factors:
            </div>
            {explanation?.weaknesses?.length > 0 ? (
              <ul className="factors-list">
                {explanation.weaknesses.map((item, idx) => (
                  <li key={idx} className="weakness-item">
                    <span>-</span> <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ fontSize: '0.85rem', color: '#64748b' }}>No major risks noted.</p>
            )}
          </div>
        </div>
      </div>

      {similarStocks?.length > 0 && (
        <div className="analysis-card">
          <h3>Similar Stocks in the {sector || 'Same'} Sector</h3>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Peer stocks matching industry classification and fundamental valuation ratios:
          </p>
          <div className="similar-grid">
            {similarStocks.map((peer, idx) => (
              <div key={idx} className="similar-card">
                <h4>{peer.name}</h4>
                <div className="similar-meta">
                  Sector: {peer.sector} | P/E: {peer.peRatio} | P/B: {peer.pbRatio}
                </div>
                <div className="similar-reason">{peer.reason}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', flexWrap: 'wrap' }}>
        <button onClick={() => navigate('/analyze')} className="btn btn-primary">
          Analyze Another Stock
        </button>
        <Link to="/history" className="btn btn-secondary">
          View History
        </Link>
        <Link to="/" className="btn btn-secondary">
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default ResultsPage;
