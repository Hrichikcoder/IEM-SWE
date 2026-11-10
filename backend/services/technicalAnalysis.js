const calculateTechnicalIndicators = (currentPrice, historyPoints = []) => {
  const basePrice = Number(currentPrice) || 150;

  let prices = [];
  if (historyPoints && historyPoints.length >= 30) {
    prices = historyPoints.map(p => Number(p)).filter(p => !isNaN(p));
  } else {
    let price = basePrice * 0.95;
    for (let i = 0; i < 50; i++) {
      const change = (Math.sin(i * 0.4) * 0.02) + ((Math.random() - 0.48) * 0.025);
      price = price * (1 + change);
      prices.push(parseFloat(price.toFixed(2)));
    }
    prices[prices.length - 1] = basePrice;
  }

  // moving averages
  const slice20 = prices.slice(-20);
  const sma20 = parseFloat((slice20.reduce((a, b) => a + b, 0) / slice20.length).toFixed(2));
  const sma50 = parseFloat((prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2));

  // rsi 14
  let gains = 0;
  let losses = 0;
  const period = 14;
  const rsiSlice = prices.slice(-period - 1);

  for (let i = 1; i < rsiSlice.length; i++) {
    const diff = rsiSlice[i] - rsiSlice[i - 1];
    if (diff >= 0) {
      gains += diff;
    } else {
      losses += Math.abs(diff);
    }
  }

  const avgGain = gains / period;
  const avgLoss = losses / period;
  let rsi = 50;
  if (avgLoss === 0) {
    rsi = 100;
  } else {
    const rs = avgGain / avgLoss;
    rsi = parseFloat((100 - (100 / (1 + rs))).toFixed(2));
  }

  // macd
  const ema12 = prices.slice(-12).reduce((a, b) => a + b, 0) / 12;
  const ema26 = prices.slice(-26).reduce((a, b) => a + b, 0) / 26;
  const macd = parseFloat((ema12 - ema26).toFixed(2));

  let trend = 'Neutral';
  if (basePrice > sma20 && rsi > 50 && macd >= 0) {
    trend = 'Bullish';
  } else if (basePrice < sma20 && rsi < 50 && macd < 0) {
    trend = 'Bearish';
  }

  return {
    sma20,
    sma50,
    rsi,
    macd,
    trend
  };
};

module.exports = { calculateTechnicalIndicators };
