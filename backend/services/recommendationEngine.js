const calculateRecommendation = (metrics, technicals = {}, ownershipStatus = 'Planning to Buy') => {
  const { peRatio, pbRatio, industryPe, faceValue, eps, roe, debtToEquity, dividendYield } = metrics;

  if (peRatio === undefined || peRatio === null || isNaN(Number(peRatio)) ||
      pbRatio === undefined || pbRatio === null || isNaN(Number(pbRatio))) {
    return {
      recommendation: "INSUFFICIENT DATA",
      score: 0,
      confidenceScore: 0,
      explanation: {
        summary: "Cannot calculate recommendation without P/E and P/B ratios.",
        strengths: [],
        weaknesses: ["Missing mandatory valuation metrics."]
      }
    };
  }

  let totalWeightedScore = 0;
  let totalActiveWeight = 0;
  const strengths = [];
  const weaknesses = [];

  const pe =Number(peRatio);
  const peWeight = 25;
  let peScore= 50;

  if (pe < 0) {
    peScore = 15;
    weaknesses.push("Negative P/E means the company is currently making a loss.");
  } else if (pe === 0) {
    peScore = 20;
    weaknesses.push("P/E is zero, indicating negligible earnings.");
  } else if (industryPe && Number(industryPe) > 0) {
    const indPe = Number(industryPe);
    if (pe < indPe * 0.85) {
      peScore = 90;
      strengths.push(`Stock P/E (${pe}) is trading at a discount compared to Industry P/E (${indPe}).`);
    } else if (pe > indPe * 1.3) {
      peScore = 35;
      weaknesses.push(`Stock P/E (${pe}) is significantly higher than Industry P/E (${indPe}).`);
    } else {
      peScore = 70;
      strengths.push(`Stock P/E (${pe}) is fairly valued near Industry P/E (${indPe}).`);
    }
  } else {
    if (pe > 0 && pe < 8) {
      peScore = 65;
      strengths.push("Low P/E ratio, valuation looks cheap.");
    } else if (pe >= 8 && pe <= 22) {
      peScore = 90;
      strengths.push("Healthy and reasonable P/E ratio.");
    } else if (pe > 22 && pe <= 35) {
      peScore = 60;
    } else if (pe > 35 && pe <= 60) {
      peScore = 40;
      weaknesses.push("High P/E ratio, trading at a steep multiple.");
    } else {
      peScore = 20;
      weaknesses.push("Very high P/E ratio, stock appears expensive.");
    }
  }

  totalWeightedScore += peScore * peWeight;
  totalActiveWeight += peWeight;

  const pb = Number(pbRatio);
  const pbWeight = 20;
  let pbScore = 50;

  if (pb < 0) {
    pbScore = 10;
    weaknesses.push("Negative P/B ratio indicates negative net worth.");
  } else if (pb <= 1.5) {
    pbScore = 90;
    strengths.push("Attractive P/B ratio, trading close to book value.");
  } else if (pb > 1.5 && pb <= 3.5) {
    pbScore = 75;
    strengths.push("Fair price-to-book valuation.");
  } else if (pb > 3.5 && pb <= 7.0) {
    pbScore = 50;
  } else {
    pbScore = 25;
    weaknesses.push("High P/B ratio, trading at a high premium over its book assets.");
  }

  totalWeightedScore += pbScore * pbWeight;
  totalActiveWeight += pbWeight;

  if (roe !== null && roe !== undefined && !isNaN(Number(roe))) {
    const r =Number(roe);
    const roeWeight = 15;
    let roeScore = 50;

    if (r < 0) {
      roeScore = 15;
      weaknesses.push("Negative ROE indicates the company is losing shareholder equity.");
    } else if (r >= 18) {
      roeScore = 95;
      strengths.push("Strong Return on Equity (over 18%), showing good profitability.");
    } else if (r >= 10) {
      roeScore = 75;
      strengths.push("Decent Return on Equity.");
    } else {
      roeScore = 40;
      weaknesses.push("Low ROE, below average returns.");
    }

    totalWeightedScore += roeScore * roeWeight;
    totalActiveWeight += roeWeight;
  }

  if (debtToEquity !== null && debtToEquity !== undefined && !isNaN(Number(debtToEquity))) {
    const dte = Number(debtToEquity);
    const dteWeight = 15;
    let dteScore = 50;

    if (dte < 0) {
      dteScore = 30;
      weaknesses.push("Irregular debt-to-equity ratio.");
    } else if (dte <= 0.5) {
      dteScore = 95;
      strengths.push("Very low debt (Debt/Equity < 0.5), safe balance sheet.");
    } else if (dte <= 1.2) {
      dteScore = 75;
      strengths.push("Manageable debt level.");
    } else if (dte <= 2.0) {
      dteScore = 50;
      weaknesses.push("Moderate to high debt leverage.");
    } else {
      dteScore = 20;
      weaknesses.push("High debt level (Debt/Equity > 2.0), risky balance sheet.");
    }

    totalWeightedScore += dteScore * dteWeight;
    totalActiveWeight += dteWeight;
  }

  if (technicals.rsi !== undefined && technicals.rsi !== null) {
    const rsiVal = Number(technicals.rsi);
    const techWeight = 15;
    let techScore = 50;

    if (rsiVal < 30) {
      techScore = 85;
      strengths.push(`RSI is ${rsiVal} (Oversold territory, potential technical bounce).`);
    } else if (rsiVal > 70) {
      techScore = 35;
      weaknesses.push(`RSI is ${rsiVal} (Overbought territory, short-term pullback risk).`);
    } else if (rsiVal >= 45 && rsiVal <= 60) {
      techScore = 70;
      strengths.push(`RSI is balanced at ${rsiVal} with stable technical momentum.`);
    }

    if (technicals.trend === 'Bullish') {
      techScore += 10;
      strengths.push("Technical trend is Bullish (trading above 20-day moving average with positive MACD).");
    } else if (technicals.trend === 'Bearish') {
      techScore -= 10;
      weaknesses.push("Technical trend is Bearish (trading below 20-day moving average).");
    }

    totalWeightedScore += Math.max(10, Math.min(100, techScore)) * techWeight;
    totalActiveWeight += techWeight;
  }

  if (eps !== null && eps !== undefined && !isNaN(Number(eps))) {
    const e = Number(eps);
    const epsWeight = 10;
    let epsScore = 50;

    if (e > 0) {
      epsScore = 80;
      strengths.push("Positive earnings per share ($" + e + ").");
    } else {
      epsScore = 20;
      weaknesses.push("Negative EPS, company is currently unprofitable per share.");
    }

    totalWeightedScore += epsScore * epsWeight;
    totalActiveWeight += epsWeight;
  }

  const finalScore = Math.round(totalWeightedScore / totalActiveWeight);

  const featureCount = (pe ? 1 : 0) + (pb ? 1 : 0) + (roe ? 1 : 0) + (debtToEquity ? 1 : 0) + (eps ? 1 : 0) + (technicals.rsi ? 1 : 0);
  const confidenceScore = Math.min(95, Math.round(65 + (featureCount * 5)));

  let recommendation = 'HOLD';
  let summary = '';

  if (finalScore >= 70) {
    recommendation = 'BUY';
    if (ownershipStatus === 'Currently Own') {
      summary = "Strong fundamentals and positive indicators. Favorable to hold and accumulate more shares.";
    } else {
      summary = "The stock has strong fundamentals with reasonable valuation and safe debt levels. Good buying opportunity.";
    }
  } else if (finalScore >= 45) {
    recommendation = "HOLD";
    if (ownershipStatus === 'Currently Own') {
      summary = "Performance is average. Retain existing position but hold off on adding new capital.";
    } else {
      summary = "The stock shows average performance. Valuation is fair, but wait for clearer catalysts before buying.";
    }
  } else {
    recommendation = 'AVOID';
    if (ownershipStatus === 'Currently Own') {
      summary = "Unfavorable valuation or weak fundamental indicators. Consider trimming or avoiding holding long-term.";
    } else {
      summary = "The stock appears risky or overvalued based on current financial metrics. Avoid buying at current levels.";
    }
  }

  return {
    recommendation,
    score: finalScore,
    confidenceScore,
    explanation: { summary, strengths, weaknesses }
  };
};

module.exports = { calculateRecommendation };
