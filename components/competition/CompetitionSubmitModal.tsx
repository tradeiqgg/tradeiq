// =====================================================================
// CHAPTER 9: Competition Submission Modal
// =====================================================================

'use client';

import React, { useState } from 'react';
import type { Competition } from '@/lib/competition/types';
import { useIDEEngine } from '../ide/core/IDEEngine';
import { submitToCompetition } from '@/lib/competition';

interface CompetitionSubmitModalProps {
  competition: Competition;
  onClose: () => void;
}

export function CompetitionSubmitModal({ competition, onClose }: CompetitionSubmitModalProps) {
  const engine = useIDEEngine();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!engine.compiledJSON) {
      setError('No strategy compiled. Please compile your strategy first.');
      return;
    }

    if (!engine.compileResult?.valid) {
      setError('Strategy is invalid. Please fix errors before submitting.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // TODO: Get current user ID
      const userId = 'current-user-id';
      const result = await submitToCompetition(engine.compiledJSON as any, competition.id, userId);

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setError(result.errors?.join(', ') || 'Submission failed');
      }
    } catch (err: any) {
      setError(err.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="competition-submit-modal fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-2xl w-full mx-4">
        <h2 className="text-2xl font-bold mb-4">Submit Strategy to Competition</h2>

        {/* Competition Info */}
        <div className="mb-6 p-4 bg-gray-900 rounded">
          <h3 className="font-semibold mb-2">{competition.name}</h3>
          <div className="text-sm text-gray-400 space-y-1">
            <p>Symbol: {competition.symbol}</p>
            <p>Timeframe: {competition.timeframe}</p>
            <p>Entry Fee: {competition.entryFee} SOL</p>
            <p>Prize Pool: {competition.prizePool} SOL</p>
          </div>
        </div>

        {/* Validation Status */}
        <div className="mb-6">
          {engine.compileResult?.valid ? (
            <div className="text-green-400 flex items-center gap-2">
              <span>✓</span>
              <span>Strategy is valid and ready to submit</span>
            </div>
          ) : (
            <div className="text-red-400 flex items-center gap-2">
              <span>✗</span>
              <span>
                Strategy has {engine.diagnostics.filter((d) => d.type === 'error').length} errors
              </span>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 bg-red-900/20 border border-red-500 text-red-400 rounded">
            {error}
          </div>
        )}

        {/* Success Display */}
        {success && (
          <div className="mb-4 p-3 bg-green-900/20 border border-green-500 text-green-400 rounded">
            Strategy submitted successfully!
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !engine.compileResult?.valid}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded font-medium"
          >
            {submitting ? 'Submitting...' : `Submit (${competition.entryFee} SOL)`}
          </button>
        </div>
      </div>
    </div>
  );
}

