const mongoose = require('mongoose');

const stockAnalysisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  stockName: {
    type: String,
    required: true,
    trim: true
  },
  sector: {
    type: String,
    default: "General"
  },
  ownershipStatus: {
    type: String,
    enum: ['Planning to Buy', 'Currently Own'],
    default: 'Planning to Buy'
  },
  metrics: {
    peRatio: { type: Number, required: true },
    pbRatio: { type: Number, required: true },
    industryPe: { type: Number, default: null },
    faceValue: { type: Number, default: null },
    eps: { type: Number, default: null },
    marketCap: { type: Number, default: null },
    roe: { type: Number, default: null },
    debtToEquity: { type: Number, default: null },
    currentPrice: { type: Number, default: null },
    bookValue: { type: Number, default: null },
    dividendYield: { type: Number, default: null }
  },
  technicalIndicators: {
    sma20: { type: Number, default: null },
    sma50: { type: Number, default: null },
    rsi: { type: Number, default: null },
    macd: { type: Number, default: null },
    trend: { type: String, default: 'Neutral' }
  },
  ocrOutput: {
    rawText: { type: String, default: '' },
    extractedValues: { type: [Number], default: [] }
  },
  recommendation: {
    type: String,
    enum: ['BUY', 'HOLD', 'AVOID', 'INSUFFICIENT DATA'],
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  confidenceScore: {
    type: Number,
    default: 80
  },
  explanation: {
    summary: { type: String, required: true },
    strengths: { type: [String], default: [] },
    weaknesses: { type: [String], default: [] }
  },
  similarStocks: [
    {
      name: { type: String, required: true },
      sector: { type: String, default: '' },
      peRatio: { type: Number, default: null },
      pbRatio: { type: Number, default: null },
      reason: { type: String, default: '' }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('StockAnalysis', stockAnalysisSchema);
