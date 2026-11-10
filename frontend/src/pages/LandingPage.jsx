import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import api from '../axios';

const SECTORS = [
  'General', 'Technology', 'Finance',
  'Healthcare', 'Consumer', 'Energy',
  'Automobile', 'Industrial'
];

const LandingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    stockName: '',
    sector: 'Technology',
    ownershipStatus: 'Planning to Buy',
    peRatio: '',
    pbRatio: '',
    industryPe: '',
    faceValue: '',
    eps: '',
    marketCap: '',
    roe: '',
    debtToEquity: '',
    currentPrice: '',
    bookValue: '',
    dividendYield: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    if (!formData.stockName.trim() || !formData.peRatio || !formData.pbRatio) {
      setError('Please provide Stock Name, P/E Ratio, and P/B Ratio.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const submitData = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== '') {
          submitData.append(key, formData[key]);
        }
      });

      const res = await api.post('/stocks/analyze', submitData);
      navigate(`/results/${res.data._id}`, { state: { analysis: res.data } });
    } catch (err) {
      setError(err.response?.data?.message || 'Error analyzing stock. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <section className="hero">
        <h1>Stock Analysis & Recommendation System</h1>
        <p>
          Evaluate stocks using fundamental parameters and technical indicators. Get a
          data-driven <strong>Buy</strong>, <strong>Hold</strong>, or <strong>Avoid</strong> recommendation
          along with similar stock suggestions.
        </p>
      </section>

      <div className="form-card" style={{ maxWidth: '850px', marginTop: '0.5rem' }}>
        <h2 style={{ color: '#0f172a', marginBottom: '0.25rem' }}>Analyze a Stock</h2>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
          Enter fundamental parameters below for automated valuation analysis:
        </p>

        {error && <div className="alert alert-danger">{error}</div>}

        {!user && (
          <div className="alert alert-success" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Sign in to save analysis records to your personal history.</span>
            <Link to="/login" className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}>
              Sign In
            </Link>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '1.25rem', background: '#f8fafc', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <label style={{ marginBottom: '0.35rem', color: '#1e293b' }}>Select Your Intent:</label>
            <div className="ownership-toggle">
              <label className="ownership-option">
                <input
                  type="radio"
                  name="ownershipStatus"
                  value="Planning to Buy"
                  checked={formData.ownershipStatus === 'Planning to Buy'}
                  onChange={handleChange}
                />
                Planning to Buy
              </label>
              <label className="ownership-option">
                <input
                  type="radio"
                  name="ownershipStatus"
                  value="Currently Own"
                  checked={formData.ownershipStatus === 'Currently Own'}
                  onChange={handleChange}
                />
                Currently Own
              </label>
            </div>
          </div>

          <div className="section-title">Required Fundamental Parameters</div>
          <div className="form-grid">
            <div className="form-group">
              <label>Stock Name / Symbol <span className="required">*</span></label>
              <input
                name="stockName"
                type="text"
                placeholder="e.g. Apple Inc. (AAPL)"
                value={formData.stockName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Sector / Industry</label>
              <select name="sector" value={formData.sector} onChange={handleChange}>
                {SECTORS.map((sec) => (
                  <option key={sec} value={sec}>{sec}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>P/E Ratio <span className="required">*</span></label>
              <input
                name="peRatio"
                type="number"
                step="any"
                placeholder="e.g. 24.5"
                value={formData.peRatio}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>P/B Ratio <span className="required">*</span></label>
              <input
                name="pbRatio"
                type="number"
                step="any"
                placeholder="e.g. 3.2"
                value={formData.pbRatio}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <hr className="section-divider" />

          <div className="section-title">Additional Financial Parameters (Optional)</div>
          <div className="form-grid">
            <div className="form-group">
              <label>Industry P/E Ratio</label>
              <input
                name="industryPe"
                type="number"
                step="any"
                placeholder="e.g. 22.0"
                value={formData.industryPe}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Market Capitalization ($B)</label>
              <input
                name="marketCap"
                type="number"
                step="any"
                placeholder="e.g. 2800"
                value={formData.marketCap}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Return on Equity - ROE (%)</label>
              <input
                name="roe"
                type="number"
                step="any"
                placeholder="e.g. 18.5"
                value={formData.roe}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Debt-to-Equity Ratio</label>
              <input
                name="debtToEquity"
                type="number"
                step="any"
                placeholder="e.g. 0.8"
                value={formData.debtToEquity}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Earnings Per Share - EPS ($)</label>
              <input
                name="eps"
                type="number"
                step="any"
                placeholder="e.g. 6.45"
                value={formData.eps}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Book Value per Share ($)</label>
              <input
                name="bookValue"
                type="number"
                step="any"
                placeholder="e.g. 35.50"
                value={formData.bookValue}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Face Value ($)</label>
              <input
                name="faceValue"
                type="number"
                step="any"
                placeholder="e.g. 10.0"
                value={formData.faceValue}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Current Market Price ($)</label>
              <input
                name="currentPrice"
                type="number"
                step="any"
                placeholder="e.g. 185.50"
                value={formData.currentPrice}
                onChange={handleChange}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1rem', padding: '0.8rem', fontSize: '1rem' }}
            disabled={loading}
          >
            {loading ? 'Analyzing...' : user ? 'Run Analysis (Buy / Hold / Avoid)' : 'Login to Analyze Stock'}
          </button>
        </form>
      </div>

      <section className="features-grid">
        <div className="feature-box">
          <h3>ML-Powered Valuation Model</h3>
          <p>
            Combines fundamental valuation metrics with moving averages and technical momentum to generate
            actionable Buy, Hold, or Avoid recommendations.
          </p>
        </div>

        <div className="feature-box">
          <h3>Technical Indicators</h3>
          <p>
            Calculates 20-day & 50-day Simple Moving Averages (SMA), RSI (Relative Strength Index), and MACD
            indicators automatically.
          </p>
        </div>

        <div className="feature-box">
          <h3>Similar Stock Suggestions</h3>
          <p>
            Finds peer companies in the same sector with comparable fundamental metrics.
          </p>
        </div>

        <div className="feature-box">
          <h3>OCR Chart Parser</h3>
          <p>
            Upload stock chart screenshots to automatically extract text and numerical points via Tesseract OCR.
          </p>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
