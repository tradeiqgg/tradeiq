import { NextRequest, NextResponse } from 'next/server';

// Fetch historical candlestick data for charts
// For stocks: Finnhub
// For crypto: CoinGecko or Binance

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY || 'demo';
const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const symbol = searchParams.get('symbol');
  const type = searchParams.get('type'); // 'stocks' or 'crypto'
  const resolution = searchParams.get('resolution') || 'D'; // D, W, M
  const from = searchParams.get('from'); // Unix timestamp
  const to = searchParams.get('to'); // Unix timestamp

  if (!symbol || !type) {
    return NextResponse.json({ error: 'Symbol and type are required' }, { status: 400 });
  }

  try {
    if (type === 'stocks') {
      // Use Finnhub for stock data
      const now = Math.floor(Date.now() / 1000);
      const days = resolution === 'D' ? 30 : resolution === 'W' ? 90 : 180;
      const fromTime = from ? parseInt(from) : now - (days * 24 * 60 * 60);
      const toTime = to ? parseInt(to) : now;

      const response = await fetch(
        `https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=${resolution}&from=${fromTime}&to=${toTime}&token=${FINNHUB_API_KEY}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch stock chart data');
      }

      const data = await response.json();

      if (data.s !== 'ok') {
        throw new Error('Invalid stock data');
      }

      // Convert to format expected by lightweight-charts
      const candles = data.t.map((time: number, i: number) => ({
        time: time,
        open: data.o[i],
        high: data.h[i],
        low: data.l[i],
        close: data.c[i],
        volume: data.v[i],
      }));

      return NextResponse.json({ data: candles });
    } else if (type === 'crypto') {
      // Use CoinGecko for crypto data
      const symbolUpper = symbol.toUpperCase();
      const coinId = getCoinGeckoId(symbolUpper);
      const days = resolution === 'D' ? 30 : resolution === 'W' ? 90 : 180;

      const response = await fetch(
        `${COINGECKO_API_URL}/coins/${coinId}/ohlc?vs_currency=usd&days=${days}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch crypto chart data');
      }

      const data = await response.json();

      // CoinGecko returns [timestamp, open, high, low, close]
      const candles = data.map((item: number[]) => ({
        time: Math.floor(item[0] / 1000), // Convert ms to seconds
        open: item[1],
        high: item[2],
        low: item[3],
        close: item[4],
        volume: 0, // CoinGecko doesn't provide volume in OHLC endpoint
      }));

      return NextResponse.json({ data: candles });
    } else {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Error fetching chart data:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch chart data' },
      { status: 500 }
    );
  }
}

function getCoinGeckoId(symbol: string): string {
  const SYMBOL_TO_ID: Record<string, string> = {
    BTC: 'bitcoin',
    ETH: 'ethereum',
    SOL: 'solana',
    BNB: 'binancecoin',
    ADA: 'cardano',
    XRP: 'ripple',
    DOGE: 'dogecoin',
    DOT: 'polkadot',
    MATIC: 'matic-network',
    AVAX: 'avalanche-2',
    ATOM: 'cosmos',
    LINK: 'chainlink',
    UNI: 'uniswap',
    LTC: 'litecoin',
    BCH: 'bitcoin-cash',
    XLM: 'stellar',
    EOS: 'eos',
    TRX: 'tron',
    XMR: 'monero',
  };

  return SYMBOL_TO_ID[symbol] || symbol.toLowerCase();
}

