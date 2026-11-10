const STOCK_DATABASE = [
  { name: 'Apple Inc. (AAPL)', sector: 'Technology', peRatio: 28.5, pbRatio: 42.1 },
  { name: 'Microsoft Corp. (MSFT)', sector: "Technology", peRatio: 34.2, pbRatio: 12.4 },
  { name: 'Alphabet Inc. (GOOGL)', sector: 'Technology', peRatio: 24.1, pbRatio: 6.8 },
  { name: 'Intel Corp. (INTC)', sector: "Technology", peRatio: 18.5, pbRatio: 1.2 },
  { name: 'Cisco Systems (CSCO)', sector: 'Technology', peRatio: 15.2, pbRatio: 3.8 },

  { name: 'JPMorgan Chase (JPM)', sector: 'Finance', peRatio: 11.8, pbRatio: 1.7 },
  { name: 'Bank of America (BAC)', sector: "Finance", peRatio: 12.5, pbRatio: 1.1 },
  { name: 'Goldman Sachs (GS)', sector: 'Finance', peRatio: 14.2, pbRatio: 1.4 },
  { name: 'Wells Fargo (WFC)', sector: "Finance", peRatio: 11.2, pbRatio: 1.2 },

  { name: 'Johnson & Johnson (JNJ)', sector: 'Healthcare', peRatio: 16.5, pbRatio: 5.1 },
  { name: 'Pfizer Inc. (PFE)', sector: "Healthcare", peRatio: 14.8, pbRatio: 1.9 },
  { name: 'UnitedHealth Group (UNH)', sector: 'Healthcare', peRatio: 22.4, pbRatio: 5.6 },
  { name: 'AbbVie Inc. (ABBV)', sector: "Healthcare", peRatio: 15.9, pbRatio: 14.2 },

  { name: 'Procter & Gamble (PG)', sector: 'Consumer', peRatio: 25.8, pbRatio: 7.6 },
  { name: 'Coca-Cola Co. (KO)', sector: "Consumer", peRatio: 23.4, pbRatio: 10.2 },
  { name: 'Walmart Inc. (WMT)', sector: 'Consumer', peRatio: 28.1, pbRatio: 5.8 },
  { name: 'PepsiCo Inc. (PEP)', sector: "Consumer", peRatio: 24.0, pbRatio: 11.5 },

  { name: 'Exxon Mobil (XOM)', sector: 'Energy', peRatio: 13.6, pbRatio: 2.1 },
  { name: 'Chevron Corp. (CVX)', sector: "Energy", peRatio: 14.1, pbRatio: 1.8 },
  { name: 'General Motors (GM)', sector: 'Automobile', peRatio: 5.8, pbRatio: 0.8 },
  { name: 'Caterpillar Inc. (CAT)', sector: "Industrial", peRatio: 16.4, pbRatio: 8.5 }
];

const findSimilarStocks = (input) => {
  const targetPe = Number(input.peRatio) || 20;
  const targetPb = Number(input.pbRatio) || 3;
  const targetSector = (input.sector || '').trim().toLowerCase();
  const currentName = (input.stockName || '').trim().toLowerCase();

  const candidates = STOCK_DATABASE.filter(
    (stock) => !stock.name.toLowerCase().includes(currentName)
  );

  let pool = candidates.filter(
    (stock) => targetSector && stock.sector.toLowerCase().includes(targetSector)
  );

  if (pool.length === 0) {
    pool = candidates;
  }

  const scored = pool.map((stock) => {
    const peDiff = Math.abs(stock.peRatio - targetPe);
    const pbDiff = Math.abs(stock.pbRatio - targetPb);
    const distance = (peDiff * 0.7) + (pbDiff * 0.3);

    return { ...stock, distance };
  });

  scored.sort((a, b) => a.distance - b.distance);

  return scored.slice(0, 3).map((stock) => {
    let reason = `Also in ${stock.sector} sector with similar valuation (P/E of ${stock.peRatio} and P/B of ${stock.pbRatio}).`;
    if (targetSector && stock.sector.toLowerCase().includes(targetSector)) {
      reason = `Competitor in the ${stock.sector} sector with close P/E ratio (${stock.peRatio}).`;
    }

    return {
      name: stock.name,
      sector: stock.sector,
      peRatio: stock.peRatio,
      pbRatio: stock.pbRatio,
      reason
    };
  });
};

module.exports = { findSimilarStocks };
