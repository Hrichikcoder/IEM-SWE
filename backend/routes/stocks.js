const express = require('express');
const multer = require('multer');
const authMiddleware = require('../middleware/auth');
const StockAnalysis = require('../models/StockAnalysis');
const { calculateRecommendation } = require('../services/recommendationEngine');
const { extractTextFromImage } = require('../services/ocrService');
const { findSimilarStocks } = require('../services/similarStocks');
const { calculateTechnicalIndicators } = require('../services/technicalAnalysis');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error("Only JPG, JPEG, and PNG image files are allowed"), false);
    }
  }
});

// analyze stock
router.post('/analyze', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const {
      stockName,
      sector,
      ownershipStatus,
      peRatio,
      pbRatio,
      industryPe,
      faceValue,
      eps,
      marketCap,
      roe,
      debtToEquity,
      currentPrice,
      bookValue,
      dividendYield
    } = req.body;

    if (!stockName || peRatio === undefined || pbRatio === undefined) {
      return res.status(400).json({
        message: 'Stock name, P/E ratio, and P/B ratio are mandatory.'
      });
    }

    const parsedMetrics = {
      peRatio: parseFloat(peRatio),
      pbRatio: parseFloat(pbRatio),
      industryPe: industryPe !== undefined && industryPe !== '' ? parseFloat(industryPe) : null,
      faceValue: faceValue !== undefined && faceValue !== '' ? parseFloat(faceValue) : null,
      eps: eps !== undefined && eps !== '' ? parseFloat(eps) : null,
      marketCap: marketCap !== undefined && marketCap !== '' ? parseFloat(marketCap) : null,
      roe: roe !== undefined && roe !== '' ? parseFloat(roe) : null,
      debtToEquity: debtToEquity !== undefined && debtToEquity !== '' ? parseFloat(debtToEquity) : null,
      currentPrice: currentPrice !== undefined && currentPrice !== '' ? parseFloat(currentPrice) : null,
      bookValue: bookValue !== undefined && bookValue !== '' ? parseFloat(bookValue) : null,
      dividendYield: dividendYield !== undefined && dividendYield !== '' ? parseFloat(dividendYield) : null
    };

    let ocrResult = { rawText: '', extractedValues: [] };
    if (req.file) {
      ocrResult = await extractTextFromImage(req.file.buffer);
    }

    const technicals = calculateTechnicalIndicators(parsedMetrics.currentPrice, ocrResult.extractedValues);
    const status = ownershipStatus === 'Currently Own' ? 'Currently Own' : 'Planning to Buy';
    const analysis =calculateRecommendation(parsedMetrics, technicals, status);

    const similarStocks = findSimilarStocks({
      stockName,
      sector: sector || "General",
      peRatio: parsedMetrics.peRatio,
      pbRatio: parsedMetrics.pbRatio
    });

    const record = new StockAnalysis({
      userId: req.user.userId,
      stockName: stockName.trim(),
      sector: sector ? sector.trim() : "General",
      ownershipStatus: status,
      metrics: parsedMetrics,
      technicalIndicators: technicals,
      ocrOutput: {
        rawText: ocrResult.rawText || '',
        extractedValues: ocrResult.extractedValues || []
      },
      recommendation: analysis.recommendation,
      score: analysis.score,
      confidenceScore: analysis.confidenceScore,
      explanation: analysis.explanation,
      similarStocks
    });

    const savedRecord = await record.save();
    res.status(201).json(savedRecord);
  } catch (error) {
    console.error("Error analyzing stock:", error);
    res.status(500).json({ message: 'Internal server error analyzing stock', error: error.message });
  }
});

// get history
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const history = await StockAnalysis.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving analysis history', error: error.message });
  }
});

// get single analysis by id
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const record = await StockAnalysis.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!record) {
      return res.status(404).json({ message: 'Stock analysis record not found' });
    }

    res.json(record);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving analysis record', error: error.message });
  }
});

// delete record
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const deleted = await StockAnalysis.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!deleted) {
      return res.status(404).json({ message: 'Stock analysis record not found' });
    }

    res.json({ message: 'Analysis deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting analysis', error: error.message });
  }
});

module.exports = router;
