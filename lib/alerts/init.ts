// =====================================================================
// CHAPTER 12: Initialize Alert System
// =====================================================================

import { initializeAlertEngine } from './alertEngine';
import { initializeRiskEventMonitoring } from './riskEvents';
import { initializeCrossStrategyRouting } from './crossSignals';

/**
 * Initialize all alert system components
 * Call this once when the app starts
 */
export function initializeAlertSystem(): void {
  initializeAlertEngine();
  initializeRiskEventMonitoring();
  initializeCrossStrategyRouting();
  
  console.log('[AlertSystem] Initialized');
}

