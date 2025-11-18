import { NextRequest, NextResponse } from 'next/server';

// Finnhub API for stock data
// Free tier: 60 calls/minute
// Get API key from: https://finnhub.io/register
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY || 'demo';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const symbol = searchParams.get('symbol');

  if (!symbol) {
    return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
  }

  try {
    // Fetch quote (current price)
    const quoteResponse = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );
    
    if (!quoteResponse.ok) {
      const errorText = await quoteResponse.text();
      console.error('Finnhub API error:', quoteResponse.status, errorText);
      throw new Error(`Failed to fetch quote: ${quoteResponse.status}`);
    }

    const quote = await quoteResponse.json();

    // Check if quote data is valid (Finnhub returns {c: 0, ...} for invalid symbols)
    if (!quote || quote.c === 0 || quote.c === null || quote.c === undefined) {
      throw new Error(`Invalid symbol or no data available for ${symbol}`);
    }

    // Fetch company profile for market cap (optional, don't fail if this fails)
    let marketCap = 0;
    try {
      const profileResponse = await fetch(
        `https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${FINNHUB_API_KEY}`,
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      );
      
      if (profileResponse.ok) {
        const profile = await profileResponse.json();
        marketCap = profile.marketCapitalization || 0;
      }
    } catch (profileError) {
      // Profile fetch is optional, continue without it
      console.warn('Failed to fetch profile, continuing without market cap:', profileError);
    }

    // Calculate change and change percent
    const currentPrice = quote.c || 0;
    const previousClose = quote.pc || currentPrice;
    const change = currentPrice - previousClose;
    const changePercent = previousClose !== 0 ? (change / previousClose) * 100 : 0;

    return NextResponse.json({
      symbol: symbol.toUpperCase(),
      price: currentPrice,
      change: change,
      changePercent: changePercent,
      volume: quote.v || 0,
      marketCap: marketCap,
      high: quote.h || currentPrice,
      low: quote.l || currentPrice,
      open: quote.o || currentPrice,
      previousClose: previousClose,
    });
  } catch (error: any) {
    console.error('Error fetching stock data:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to fetch stock data',
        details: FINNHUB_API_KEY === 'demo' ? 'Using demo API key. Set FINNHUB_API_KEY in .env.local for full access.' : undefined
      },
      { status: 500 }
    );
  }
}

