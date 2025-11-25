// =====================================================================
// CHAPTER 9: Anti-Cheat Engine
// =====================================================================

import type { TQJSSchema } from '@/lib/tql/schema';
import { validateStrategy } from '@/lib/tql/validator';
import { compileJSONToTQL } from '@/lib/tql/compiler';

/**
 * Generate SHA256 hash of normalized strategy JSON
 */
export async function hashStrategy(strategy: TQJSSchema): Promise<string> {
  // Normalize strategy (remove runtime fields, sort keys)
  const normalized = normalizeStrategy(strategy);
  const jsonString = JSON.stringify(normalized);

  // Use Web Crypto API for SHA256
  const encoder = new TextEncoder();
  const data = encoder.encode(jsonString); // Uint8Array
  
  // FIX: crypto.subtle.digest must receive an ArrayBuffer, not Uint8Array<ArrayBufferLike>
  const hashBuffer = await crypto.subtle.digest('SHA-256', data.buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

  return hashHex;
}

/**
 * Normalize strategy for hashing (deterministic)
 */
function normalizeStrategy(strategy: TQJSSchema): Partial<TQJSSchema> {
  // Remove runtime fields
  const normalized = {
    meta: strategy.meta,
    settings: strategy.settings,
    indicators: [...strategy.indicators].sort((a, b) => a.id.localeCompare(b.id)),
    rules: {
      entry: strategy.rules.entry,
      exit: strategy.rules.exit,
      filters: strategy.rules.filters,
    },
    risk: strategy.risk,
    version: strategy.version,
  };

  return normalized;
}

/**
 * Validate strategy before competition entry
 */
export async function validateCompetitionEntry(
  strategy: TQJSSchema
): Promise<{
  valid: boolean;
  errors: string[];
  hash: string | null;
}> {
  const errors: string[] = [];

  // Step 1: Run full validation
  const validation = validateStrategy({ json: strategy });
  if (!validation.valid) {
    errors.push(...validation.errors.map((e) => e.message));
  }

  // Step 2: Check for illegal patterns
  const illegalPatterns = detectIllegalPatterns(strategy);
  errors.push(...illegalPatterns);

  // Step 3: Generate hash
  let hash: string | null = null;
  if (errors.length === 0) {
    try {
      hash = await hashStrategy(strategy);
    } catch (error: any) {
      errors.push(`Failed to generate strategy hash: ${error.message}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    hash,
  };
}

/**
 * Detect illegal patterns that might indicate cheating
 */
function detectIllegalPatterns(strategy: TQJSSchema): string[] {
  const errors: string[] = [];

  // Check for impossible conditions
  // Check for overfitting patterns
  // Check for degenerate strategies

  // Example: Strategy with no exit rules is suspicious
  if (strategy.rules.exit.length === 0) {
    errors.push('Strategy must have at least one exit rule');
  }

  // Example: Position size > 100% is invalid
  if (strategy.risk.position_size_percent > 100) {
    errors.push('Position size cannot exceed 100%');
  }

  // Example: Stop loss > 50% is suspicious
  if (
    strategy.risk.stop_loss_percent &&
    strategy.risk.stop_loss_percent > 50
  ) {
    errors.push('Stop loss exceeds 50% - this is unusually high');
  }

  return errors;
}

/**
 * Verify replay matches original submission
 */
export async function verifyReplay(
  originalHash: string,
  replayedStrategy: TQJSSchema,
  originalScore: number,
  replayedScore: number,
  tolerance: number = 0.01
): Promise<{
  valid: boolean;
  hashMatches: boolean;
  scoreMatches: boolean;
  deviation: number;
}> {
  // Verify hash matches
  const replayedHash = await hashStrategy(replayedStrategy);
  const hashMatches = replayedHash === originalHash;

  // Verify score matches within tolerance
  const deviation = Math.abs(originalScore - replayedScore);
  const scoreMatches = deviation <= tolerance;

  return {
    valid: hashMatches && scoreMatches,
    hashMatches,
    scoreMatches,
    deviation,
  };
}

