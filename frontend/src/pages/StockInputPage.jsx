import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../axios';

const SECTORS = [
  'General', 'Technology', 'Finance',
  'Healthcare', 'Consumer', 'Energy',
  'Automobile', 'Industrial'
];

const StockInputPage = () => {
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

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
        setError('Only JPG, JPEG, and PNG files are allowed.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file size must be less than 5MB.');
        return;
      }
      setError('');
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.stockName.trim()) {
      setError('Please enter a stock name.');
      return;
    }

    if (formData.peRatio === '' || isNaN(Number(formData.peRatio))) {
      setError('Please enter a valid P/E Ratio.');
      return;
    }

    if (formData.pbRatio === '' || isNaN(Number(formData.pbRatio))) {
      setError('Please enter a valid P/B Ratio.');
      return;
    }

    try {
      setLoading(true);

      const submitData =new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== '') {
          submitData.append(key, formData[key]);
        }
      });

      if (imageFile) {
        submitData.append('image', imageFile);
      }

      const res = await api.post('/stocks/analyze', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      navigate(`/results/${res.data._id}`, {
        state: { analysis: res.data, previewUrl: imagePreview }
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Error analyzing stock. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-card" style={{ maxWidth: '800px' }}>
      <h2 style={{ color: '#0f172a', marginBottom: '0.25rem' }}>Stock Analysis Form</h2>
      <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
        Enter fundamental ratios and stock details to run the ML recommendation model.
      </p>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group" style={{ marginBottom: '1.5rem', background: '#f8fafc', padding: '0.85rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
          <label style={{ marginBottom: '0.4rem', color: '#1e293b' }}>Your Investment Intent</label>
          <div className="ownership-toggle">
            <label className="ownership-option">
              <input
                type="radio"
                name="ownershipStatus"
                value="Planning to Buy"
                checked={formData.ownershipStatus === 'Planning to Buy'}
                onChange={handleChange}
              />
              Planning to Buy (New Investment)
            </label>
            <label className="ownership-option">
              <input
                type="radio"
                name="ownershipStatus"
                value="Currently Own"
                checked={formData.ownershipStatus === 'Currently Own'}
                onChange={handleChange}
              />
              Currently Own (Portfolio Review)
            </label>
          </div>
        </div>

        <div className="section-title">Essential Fundamental Parameters</div>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="stockName">
              Stock Name / Symbol <span className="required">*</span>
            </label>
            <input
              id="stockName"
              name="stockName"
              type="text"
              placeholder="e.g. Apple Inc. (AAPL)"
              value={formData.stockName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="sector">Sector / Industry</label>
            <select id="sector" name="sector" value={formData.sector} onChange={handleChange}>
              {SECTORS.map((sec) => (
                <option key={sec} value={sec}>{sec}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="peRatio">
              P/E Ratio <span className="required">*</span>
            </label>
            <input
              id="peRatio"
              name="peRatio"
              type="number"
              step="any"
              placeholder="e.g. 24.5"
              value={formData.peRatio}
              onChange={handleChange}
              required
            />
            <span className="hint">Negative value denotes net loss</span>
          </div>

          <div className="form-group">
            <label htmlFor="pbRatio">
              P/B Ratio <span className="required">*</span>
            </label>
            <input
              id="pbRatio"
              name="pbRatio"
              type="number"
              step="any"
              placeholder="e.g. 3.2"
              value={formData.pbRatio}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="industryPe">Industry P/E Ratio</label>
            <input
              id="industryPe"
              name="industryPe"
              type="number"
              step="any"
              placeholder="e.g. 22.0"
              value={formData.industryPe}
              onChange={handleChange}
            />
            <span className="hint">For comparative sector valuation</span>
          </div>

          <div className="form-group">
            <label htmlFor="marketCap">Market Capitalization ($B)</label>
            <input
              id="marketCap"
              name="marketCap"
              type="number"
              step="any"
              placeholder="e.g. 2800"
              value={formData.marketCap}
              onChange={handleChange}
            />
          </div>
        </div>

        <hr className="section-divider" />

        <div className="section-title">Other Fundamental & Balance Sheet Metrics (Optional)</div>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="roe">Return on Equity - ROE (%)</label>
            <input
              id="roe"
              name="roe"
              type="number"
              step="any"
              placeholder="e.g. 18.5"
              value={formData.roe}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="debtToEquity">Debt-to-Equity Ratio</label>
            <input
              id="debtToEquity"
              name="debtToEquity"
              type="number"
              step="any"
              placeholder="e.g. 0.8"
              value={formData.debtToEquity}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="eps">Earnings Per Share - EPS ($)</label>
            <input
              id="eps"
              name="eps"
              type="number"
              step="any"
              placeholder="e.g. 6.45"
              value={formData.eps}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="faceValue">Face Value ($)</label>
            <input
              id="faceValue"
              name="faceValue"
              type="number"
              step="any"
              placeholder="e.g. 10.0"
              value={formData.faceValue}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="bookValue">Book Value per Share ($)</label>
            <input
              id="bookValue"
              name="bookValue"
              type="number"
              step="any"
              placeholder="e.g. 35.50"
              value={formData.bookValue}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="currentPrice">Current Price ($)</label>
            <input
              id="currentPrice"
              name="currentPrice"
              type="number"
              step="any"
              placeholder="e.g. 185.50"
              value={formData.currentPrice}
              onChange={handleChange}
            />
            <span className="hint">Used to calculate technical indicators</span>
          </div>

          <div className="form-group">
            <label htmlFor="dividendYield">Dividend Yield (%)</label>
            <input
              id="dividendYield"
              name="dividendYield"
              type="number"
              step="any"
              placeholder="e.g. 2.1"
              value={formData.dividendYield}
              onChange={handleChange}
            />
          </div>
        </div>

        <hr className="section-divider" />

        <div className="section-title">Stock Graph / Chart Upload & OCR (Optional)</div>
        <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
          Upload a stock graph / chart screenshot (PNG or JPG). Tesseract OCR will read data points and labels.
        </p>

        {!imagePreview ? (
          <div className="upload-dropzone">
            <label htmlFor="chartUpload" style={{ cursor: 'pointer', display: 'block' }}>
              <div style={{ fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                Click to choose stock graph / chart image
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                PNG, JPG or JPEG up to 5MB
              </div>
            </label>
            <input
              id="chartUpload"
              type="file"
              accept="image/png, image/jpeg, image/jpg"
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />
          </div>
        ) : (
          <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
            <div className="image-preview-wrapper">
              <img src={imagePreview} alt="Stock graph preview" className="image-preview" />
              <button
                type="button"
                className="remove-img-btn"
                onClick={handleRemoveImage}
              >
                Remove
              </button>
            </div>
          </div>
        )}

        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%', padding: '0.8rem', fontSize: '1rem' }}
          disabled={loading}
        >
          {loading ? 'Analyzing with ML Model & Technical Indicators...' : 'Analyze Stock (Buy / Hold / Avoid)'}
        </button>
      </form>
    </div>
  );
};

export default StockInputPage;
