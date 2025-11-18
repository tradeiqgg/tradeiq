import { NextRequest, NextResponse } from 'next/server';

// CoinGecko API for crypto data
// Free tier: 10-50 calls/minute
// No API key needed for free tier
const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3';

// Map common symbols to CoinGecko IDs
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
  AAVE: 'aave',
  MKR: 'maker',
  COMP: 'compound-governance-token',
  YFI: 'yearn-finance',
  SNX: 'havven',
  SUSHI: 'sushi',
  CRV: 'curve-dao-token',
  ALGO: 'algorand',
  NEAR: 'near',
  FTM: 'fantom',
  SAND: 'the-sandbox',
  MANA: 'decentraland',
  AXS: 'axie-infinity',
  GALA: 'gala',
  ENJ: 'enjincoin',
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const symbol = searchParams.get('symbol');

  if (!symbol) {
    return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
  }

  try {
    const symbolUpper = symbol.toUpperCase();
    const coinId = SYMBOL_TO_ID[symbolUpper] || symbolLower(symbolUpper);

    // Fetch coin data
    const response = await fetch(
      `${COINGECKO_API_URL}/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true`
    );

    if (!response.ok) {
      // If direct lookup fails, try to search for the coin
      const searchResponse = await fetch(
        `${COINGECKO_API_URL}/search?query=${symbolUpper}`
      );
      
      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        if (searchData.coins && searchData.coins.length > 0) {
          const firstCoin = searchData.coins[0];
          const actualCoinId = firstCoin.id;
          
          const retryResponse = await fetch(
            `${COINGECKO_API_URL}/simple/price?ids=${actualCoinId}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true`
          );
          
          if (retryResponse.ok) {
            const data = await retryResponse.json();
            const coinData = data[actualCoinId];
            
            return NextResponse.json({
              symbol: symbolUpper,
              price: coinData.usd,
              change: (coinData.usd * coinData.usd_24h_change) / 100,
              changePercent: coinData.usd_24h_change || 0,
              volume: coinData.usd_24h_vol || 0,
              marketCap: coinData.usd_market_cap || 0,
            });
          }
        }
      }
      
      throw new Error('Coin not found');
    }

    const data = await response.json();
    const coinData = data[coinId];

    if (!coinData) {
      throw new Error('Coin data not found');
    }

    return NextResponse.json({
      symbol: symbolUpper,
      price: coinData.usd,
      change: (coinData.usd * coinData.usd_24h_change) / 100,
      changePercent: coinData.usd_24h_change || 0,
      volume: coinData.usd_24h_vol || 0,
      marketCap: coinData.usd_market_cap || 0,
    });
  } catch (error: any) {
    console.error('Error fetching crypto data:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch crypto data' },
      { status: 500 }
    );
  }
}

// Helper to convert symbol to lowercase for CoinGecko
function symbolLower(symbol: string): string {
  return symbol.toLowerCase();
}

