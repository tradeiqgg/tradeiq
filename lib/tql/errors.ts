// =====================================================================
// CHAPTER 5: TQL Error Codes
// =====================================================================

export enum TQErrorCode {
  // Schema
  MISSING_SECTION = "MISSING_SECTION",
  INVALID_SECTION = "INVALID_SECTION",

  // Indicators
  UNKNOWN_INDICATOR = "UNKNOWN_INDICATOR",
  INVALID_INDICATOR_PARAMS = "INVALID_INDICATOR_PARAMS",
  DUPLICATE_INDICATOR_NAME = "DUPLICATE_INDICATOR_NAME",
  INDICATOR_NOT_USED = "INDICATOR_NOT_USED",
  INDICATOR_UNDEFINED = "INDICATOR_UNDEFINED",

  // Rules
  NO_ENTRY_RULES = "NO_ENTRY_RULES",
  NO_EXIT_RULES = "NO_EXIT_RULES",
  EMPTY_RULE = "EMPTY_RULE",
  INVALID_CONDITION = "INVALID_CONDITION",
  INVALID_ACTION = "INVALID_ACTION",
  MISSING_CONDITION = "MISSING_CONDITION",
  MISSING_ACTION = "MISSING_ACTION",

  // TQL parser
  SYNTAX_ERROR = "SYNTAX_ERROR",
  UNEXPECTED_TOKEN = "UNEXPECTED_TOKEN",

  // Blocks
  INVALID_BLOCK_STRUCTURE = "INVALID_BLOCK_STRUCTURE",
  INVALID_BLOCK_PARAMS = "INVALID_BLOCK_PARAMS",
  BLOCK_NOT_IN_REGISTRY = "BLOCK_NOT_IN_REGISTRY",

  // Risk
  MISSING_RISK = "MISSING_RISK",
  INVALID_RISK = "INVALID_RISK",
  MISSING_STOP_LOSS = "MISSING_STOP_LOSS",
  INVALID_RISK_VALUE = "INVALID_RISK_VALUE",

  // Conversion
  JSON_TO_TQL_FAILED = "JSON_TO_TQL_FAILED",
  TQL_TO_JSON_FAILED = "TQL_TO_JSON_FAILED",
  BLOCK_TO_JSON_FAILED = "BLOCK_TO_JSON_FAILED",

  // Semantic
  LOGICAL_CONFLICT = "LOGICAL_CONFLICT",
  CONTRADICTORY_RULES = "CONTRADICTORY_RULES",
  USES_UNDEFINED_VARIABLE = "USES_UNDEFINED_VARIABLE",
  INCOMPATIBLE_TYPES = "INCOMPATIBLE_TYPES",
  UNREACHABLE_CODE = "UNREACHABLE_CODE",

  // Safety
  UNBOUNDED_RISK = "UNBOUNDED_RISK",
  POTENTIAL_INFINITE_LOOP = "POTENTIAL_INFINITE_LOOP",
  POSITION_SIZE_TOO_LARGE = "POSITION_SIZE_TOO_LARGE",
}

export const ERROR_MESSAGES: Record<TQErrorCode, string> = {
  [TQErrorCode.MISSING_SECTION]: "Required section is missing",
  [TQErrorCode.INVALID_SECTION]: "Section has invalid structure",
  [TQErrorCode.UNKNOWN_INDICATOR]: "Unknown indicator",
  [TQErrorCode.INVALID_INDICATOR_PARAMS]: "Invalid indicator parameters",
  [TQErrorCode.DUPLICATE_INDICATOR_NAME]: "Duplicate indicator name",
  [TQErrorCode.INDICATOR_NOT_USED]: "Indicator is defined but never used",
  [TQErrorCode.INDICATOR_UNDEFINED]: "Indicator is used but not defined",
  [TQErrorCode.NO_ENTRY_RULES]: "No entry rules defined",
  [TQErrorCode.NO_EXIT_RULES]: "No exit rules defined",
  [TQErrorCode.EMPTY_RULE]: "Rule has no conditions or actions",
  [TQErrorCode.INVALID_CONDITION]: "Invalid condition",
  [TQErrorCode.INVALID_ACTION]: "Invalid action",
  [TQErrorCode.MISSING_CONDITION]: "Rule is missing a condition",
  [TQErrorCode.MISSING_ACTION]: "Rule is missing an action",
  [TQErrorCode.SYNTAX_ERROR]: "Syntax error",
  [TQErrorCode.UNEXPECTED_TOKEN]: "Unexpected token",
  [TQErrorCode.INVALID_BLOCK_STRUCTURE]: "Invalid block structure",
  [TQErrorCode.INVALID_BLOCK_PARAMS]: "Invalid block parameters",
  [TQErrorCode.BLOCK_NOT_IN_REGISTRY]: "Block not found in registry",
  [TQErrorCode.MISSING_RISK]: "Risk management section is missing",
  [TQErrorCode.INVALID_RISK]: "Invalid risk configuration",
  [TQErrorCode.MISSING_STOP_LOSS]: "Stop loss or trailing stop must be defined",
  [TQErrorCode.INVALID_RISK_VALUE]: "Invalid risk value",
  [TQErrorCode.JSON_TO_TQL_FAILED]: "Failed to convert JSON to TQL",
  [TQErrorCode.TQL_TO_JSON_FAILED]: "Failed to convert TQL to JSON",
  [TQErrorCode.BLOCK_TO_JSON_FAILED]: "Failed to convert blocks to JSON",
  [TQErrorCode.LOGICAL_CONFLICT]: "Logical conflict detected",
  [TQErrorCode.CONTRADICTORY_RULES]: "Contradictory rules detected",
  [TQErrorCode.USES_UNDEFINED_VARIABLE]: "Uses undefined variable",
  [TQErrorCode.INCOMPATIBLE_TYPES]: "Incompatible types in comparison",
  [TQErrorCode.UNREACHABLE_CODE]: "Unreachable code detected",
  [TQErrorCode.UNBOUNDED_RISK]: "Unbounded risk detected",
  [TQErrorCode.POTENTIAL_INFINITE_LOOP]: "Potential infinite loop detected",
  [TQErrorCode.POSITION_SIZE_TOO_LARGE]: "Position size exceeds 100%",
};

