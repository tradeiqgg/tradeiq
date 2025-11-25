// =====================================================================
// CHAPTER 9: Competition Engine - Main Exports
// =====================================================================

export * from './types';
export * from './engine';
export * from './scoring';
export * from './antiCheat';
export * from './deterministicRunner';
export * from './leaderboard';

// Main entry points
export { submitToCompetition, getCompetitionLeaderboard, getActiveCompetitions } from './engine';
export { calculateCompetitionScore, compareScores } from './scoring';
export { hashStrategy, validateCompetitionEntry, verifyReplay } from './antiCheat';
export { buildLeaderboard, getUserRank } from './leaderboard';

