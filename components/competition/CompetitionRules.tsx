// =====================================================================
// CHAPTER 9: Competition Rules
// =====================================================================

'use client';

import React from 'react';

export function CompetitionRules() {
  return (
    <div className="competition-rules p-6">
      <h2 className="text-2xl font-bold mb-6">Competition Rules</h2>

      <div className="space-y-6">
        <section>
          <h3 className="text-lg font-semibold mb-3">General Rules</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-300">
            <li>All strategies must pass validation before submission</li>
            <li>Strategies are hashed and stored immutably</li>
            <li>All backtests use deterministic, pre-loaded candle data</li>
            <li>No AI assistance allowed in free competitions</li>
            <li>One submission per user per competition</li>
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-3">Scoring</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-300">
            <li>Score = (PnL% × 40%) + (Win Rate × 20%) + (Profit Factor × 10%) - (Drawdown × 15%) + (Stability × 20%) + Consistency Bonus</li>
            <li>Higher scores rank higher on leaderboard</li>
            <li>Ties broken by: PnL → Drawdown → Submission Time</li>
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-3">Prize Distribution</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-300">
            <li>1st Place: 60% of prize pool</li>
            <li>2nd Place: 25% of prize pool</li>
            <li>3rd Place: 10% of prize pool</li>
            <li>House/Staking: 5% of prize pool</li>
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-3">Anti-Cheat</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-300">
            <li>All strategies are hashed (SHA256) before submission</li>
            <li>Top submissions are replayed server-side for verification</li>
            <li>Cheating results in immediate disqualification</li>
            <li>All backtests use fixed parameters (slippage, commission, etc.)</li>
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-3">Competition Types</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Daily Competition</h4>
              <p className="text-gray-400 text-sm">24-hour challenge, 5m timeframe, rotating symbols</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Weekly Competition</h4>
              <p className="text-gray-400 text-sm">7-day backtest, 15m or 1h timeframe, larger prize pool</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Monthly Competition</h4>
              <p className="text-gray-400 text-sm">30-day backtest, 4h timeframe, largest prize pool</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

