const Tesseract = require('tesseract.js');

const extractTextFromImage = async (imageBuffer) => {
  if (!imageBuffer) {
    return { rawText: '', extractedValues: [], labels: [] };
  }

  try {
    const { data: { text } } = await Tesseract.recognize(imageBuffer, 'eng');
    const rawText = text ? text.trim() : '';

    const numberMatches = rawText.match(/-?\d+(?:\.\d+)?/g) || [];
    const extractedValues = numberMatches
      .map((val) => parseFloat(val))
      .filter((num) => !isNaN(num) && isFinite(num));

    const commonLabels = ['open', 'high', 'low', 'close', 'volume', 'pe', 'eps', 'price', 'avg'];
    const lowerText = rawText.toLowerCase();
    const foundLabels = commonLabels.filter((label) => lowerText.includes(label));

    return {
      rawText,
      extractedValues: extractedValues.slice(0, 30),
      labels: foundLabels
    };
  } catch (error) {
    console.error("OCR warning:", error.message);
    return {
      rawText: '',
      extractedValues: [],
      labels: [],
      error: 'OCR failed'
    };
  }
};

module.exports = { extractTextFromImage };
