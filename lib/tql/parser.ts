// =====================================================================
// CHAPTER 4: TQL PARSER
// TradeIQ Query Language Parser (AST Builder)
// =====================================================================

import { Token, TokenType, KEYWORDS, OPERATORS } from './lexer';

// =====================================================================
// AST NODE DEFINITIONS
// =====================================================================

export interface ASTNode {
  type: string;
  start: number;
  end: number;
  line?: number;
  column?: number;
}

export interface ProgramNode extends ASTNode {
  type: 'Program';
  meta: MetaNode;
  settings: SettingsNode;
  indicators: IndicatorsNode;
  rules: RulesNode;
  risk: RiskNode;
}

export interface MetaNode extends ASTNode {
  type: 'Meta';
  name?: string;
  description?: string;
  author?: string;
}

export interface SettingsNode extends ASTNode {
  type: 'Settings';
  symbol?: string;
  timeframe?: string;
  position_mode?: string;
  allow_reentry?: boolean;
  max_open_positions?: number;
  initial_balance?: number;
  execution_mode?: string;
}

export interface IndicatorsNode extends ASTNode {
  type: 'Indicators';
  indicators: IndicatorDefNode[];
}

export interface IndicatorDefNode extends ASTNode {
  type: 'IndicatorDef';
  id: string;
  call: IndicatorCallNode;
}

export interface IndicatorCallNode extends ASTNode {
  type: 'IndicatorCall';
  indicatorId: string;
  params: Record<string, ValueNode>;
}

export interface RulesNode extends ASTNode {
  type: 'Rules';
  entry: EntryRuleNode[];
  exit: ExitRuleNode[];
  filters: ConditionNode[];
}

export interface EntryRuleNode extends ASTNode {
  type: 'EntryRule';
  condition: ConditionNode;
  action: EntryActionNode;
}

export interface ExitRuleNode extends ASTNode {
  type: 'ExitRule';
  condition: ConditionNode;
  action: ExitActionNode;
}

export interface ConditionNode extends ASTNode {
  type: 'Condition';
  condition: ComparisonNode | CrossNode;
}

export interface ComparisonNode extends ASTNode {
  type: 'Comparison';
  left: ValueNode;
  operator: string;
  right: ValueNode;
}

export interface CrossNode extends ASTNode {
  type: 'Cross';
  left: ValueNode;
  direction: 'crosses_above' | 'crosses_below';
  right: ValueNode;
}

export interface ValueNode extends ASTNode {
  type: 'Value';
  value: any;
  valueType?: 'identifier' | 'number' | 'string' | 'boolean' | 'indicator';
}

export interface EntryActionNode extends ASTNode {
  type: 'EntryAction';
  direction: 'long' | 'short';
  size?: number;
  sizeMode?: 'percent' | 'fixed';
}

export interface ExitActionNode extends ASTNode {
  type: 'ExitAction';
  direction: 'long' | 'short' | 'any';
}

export interface RiskNode extends ASTNode {
  type: 'Risk';
  stop_loss?: number;
  take_profit?: number;
  position_size?: number;
  max_risk_per_trade?: number;
  trailing_stop?: number;
  max_daily_loss?: number;
  max_daily_trades?: number;
}

export interface ParseError {
  message: string;
  line: number;
  column: number;
  suggestion?: string;
}

export class TQLParser {
  private tokens: Token[];
  private position: number = 0;
  private errors: ParseError[] = [];

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  parse(): { ast: ProgramNode | null; errors: ParseError[] } {
    this.position = 0;
    this.errors = [];
    this.skipWhitespace();

    try {
      const ast = this.parseProgram();
      return { ast, errors: this.errors };
    } catch (error: any) {
      this.errors.push({
        message: error.message || 'Parse error',
        line: this.currentToken()?.line || 1,
        column: this.currentToken()?.column || 1,
      });
      return { ast: null, errors: this.errors };
    }
  }

  private parseProgram(): ProgramNode {
    const start = this.currentToken()?.start || 0;

    const meta = this.parseMeta();
    const settings = this.parseSettings();
    const indicators = this.parseIndicators();
    const rules = this.parseRules();
    const risk = this.parseRisk();

    this.expect(TokenType.EOF);

    return {
      type: 'Program',
      meta,
      settings,
      indicators,
      rules,
      risk,
      start,
      end: this.previousToken()?.end || start,
    };
  }

  private parseMeta(): MetaNode {
    const start = this.currentToken()?.start || 0;
    this.expectKeyword('meta');
    this.expect(TokenType.LBRACE);

    const meta: MetaNode = {
      type: 'Meta',
      start,
      end: start,
    };

    while (!this.check(TokenType.RBRACE) && !this.isEOF()) {
      const key = this.expectIdentifier();
      this.expect(TokenType.COLON);
      const value = this.expectString();

      if (key === 'name') meta.name = value;
      else if (key === 'description') meta.description = value;
      else if (key === 'author') meta.author = value;
    }

    this.expect(TokenType.RBRACE);
    meta.end = this.previousToken()?.end || start;
    return meta;
  }

  private parseSettings(): SettingsNode {
    const start = this.currentToken()?.start || 0;
    this.expectKeyword('settings');
    this.expect(TokenType.LBRACE);

    const settings: SettingsNode = {
      type: 'Settings',
      start,
      end: start,
    };

    while (!this.check(TokenType.RBRACE) && !this.isEOF()) {
      const key = this.expectIdentifier();
      this.expect(TokenType.COLON);
      const value = this.parseValue();

      if (key === 'symbol') settings.symbol = value.value as string;
      else if (key === 'timeframe') settings.timeframe = value.value as string;
      else if (key === 'position_mode') settings.position_mode = value.value as string;
      else if (key === 'allow_reentry') settings.allow_reentry = value.value as boolean;
      else if (key === 'max_open_positions') settings.max_open_positions = value.value as number;
      else if (key === 'initial_balance') settings.initial_balance = value.value as number;
      else if (key === 'execution_mode') settings.execution_mode = value.value as string;
    }

    this.expect(TokenType.RBRACE);
    settings.end = this.previousToken()?.end || start;
    return settings;
  }

  private parseIndicators(): IndicatorsNode {
    const start = this.currentToken()?.start || 0;
    this.expectKeyword('indicators');
    this.expect(TokenType.LBRACE);

    const indicators: IndicatorDefNode[] = [];

    while (!this.check(TokenType.RBRACE) && !this.isEOF()) {
      const id = this.expectIdentifier();
      this.expect(TokenType.COLON);
      this.expect(TokenType.OPERATOR, '=');
      const call = this.parseIndicatorCall();
      indicators.push({
        type: 'IndicatorDef',
        id,
        call,
        start: this.previousToken()?.start || start,
        end: this.previousToken()?.end || start,
      });
    }

    this.expect(TokenType.RBRACE);

    return {
      type: 'Indicators',
      indicators,
      start,
      end: this.previousToken()?.end || start,
    };
  }

  private parseIndicatorCall(): IndicatorCallNode {
    const start = this.currentToken()?.start || 0;
    const indicatorId = this.expectIdentifier();
    this.expect(TokenType.LPAREN);

    const params: Record<string, ValueNode> = {};

    if (!this.check(TokenType.RPAREN)) {
      do {
        const paramName = this.expectIdentifier();
        this.expect(TokenType.COLON);
        const paramValue = this.parseValue();
        params[paramName] = paramValue;
      } while (this.match(TokenType.COMMA));
    }

    this.expect(TokenType.RPAREN);

    return {
      type: 'IndicatorCall',
      indicatorId,
      params,
      start,
      end: this.previousToken()?.end || start,
    };
  }

  private parseRules(): RulesNode {
    const start = this.currentToken()?.start || 0;
    this.expectKeyword('rules');
    this.expect(TokenType.LBRACE);

    const entry: EntryRuleNode[] = [];
    const exit: ExitRuleNode[] = [];
    const filters: ConditionNode[] = [];

    while (!this.check(TokenType.RBRACE) && !this.isEOF()) {
      if (this.checkKeyword('entry')) {
        this.expectKeyword('entry');
        this.expect(TokenType.LBRACE);
        while (!this.check(TokenType.RBRACE) && !this.isEOF()) {
          entry.push(this.parseEntryRule());
        }
        this.expect(TokenType.RBRACE);
      } else if (this.checkKeyword('exit')) {
        this.expectKeyword('exit');
        this.expect(TokenType.LBRACE);
        while (!this.check(TokenType.RBRACE) && !this.isEOF()) {
          exit.push(this.parseExitRule());
        }
        this.expect(TokenType.RBRACE);
      } else if (this.checkKeyword('filters')) {
        this.expectKeyword('filters');
        this.expect(TokenType.LBRACE);
        while (!this.check(TokenType.RBRACE) && !this.isEOF()) {
          filters.push(this.parseCondition());
        }
        this.expect(TokenType.RBRACE);
      } else {
        this.advance();
      }
    }

    this.expect(TokenType.RBRACE);

    return {
      type: 'Rules',
      entry,
      exit,
      filters,
      start,
      end: this.previousToken()?.end || start,
    };
  }

  private parseEntryRule(): EntryRuleNode {
    const start = this.currentToken()?.start || 0;
    this.expectKeyword('when');
    const condition = this.parseCondition();
    this.expectKeyword('then');
    const action = this.parseEntryAction();

    return {
      type: 'EntryRule',
      condition,
      action,
      start,
      end: this.previousToken()?.end || start,
    };
  }

  private parseExitRule(): ExitRuleNode {
    const start = this.currentToken()?.start || 0;
    this.expectKeyword('when');
    const condition = this.parseCondition();
    this.expectKeyword('then');
    const action = this.parseExitAction();

    return {
      type: 'ExitRule',
      condition,
      action,
      start,
      end: this.previousToken()?.end || start,
    };
  }

  private parseCondition(): ConditionNode {
    const start = this.currentToken()?.start || 0;
    const left = this.parseValue();

    // Check for cross operator
    if (this.checkKeyword('crosses_above') || this.checkKeyword('crosses_below')) {
      const direction = this.expectKeyword('crosses_above') || this.expectKeyword('crosses_below');
      const right = this.parseValue();

      return {
        type: 'Condition',
        condition: {
          type: 'Cross',
          left,
          direction: direction as 'crosses_above' | 'crosses_below',
          right,
          start,
          end: this.previousToken()?.end || start,
        },
        start,
        end: this.previousToken()?.end || start,
      };
    }

    // Otherwise it's a comparison
    const operator = this.expect(TokenType.OPERATOR).value;
    const right = this.parseValue();

    return {
      type: 'Condition',
      condition: {
        type: 'Comparison',
        left,
        operator: OPERATORS[operator as keyof typeof OPERATORS] || operator,
        right,
        start,
        end: this.previousToken()?.end || start,
      },
      start,
      end: this.previousToken()?.end || start,
    };
  }

  private parseEntryAction(): EntryActionNode {
    const start = this.currentToken()?.start || 0;
    this.expectKeyword('enter');
    
    let direction: 'long' | 'short' = 'long';
    if (this.checkKeyword('long')) {
      this.expectKeyword('long');
      direction = 'long';
    } else if (this.checkKeyword('short')) {
      this.expectKeyword('short');
      direction = 'short';
    }

    let size: number | undefined;
    let sizeMode: 'percent' | 'fixed' | undefined;

    if (this.checkKeyword('size')) {
      this.expectKeyword('size');
      this.expect(TokenType.COLON);
      const sizeValue = this.expect(TokenType.NUMBER);
      size = parseFloat(sizeValue.value);
      if (this.match(TokenType.PERCENT)) {
        sizeMode = 'percent';
      } else {
        sizeMode = 'fixed';
      }
    }

    return {
      type: 'EntryAction',
      direction,
      size,
      sizeMode,
      start,
      end: this.previousToken()?.end || start,
    };
  }

  private parseExitAction(): ExitActionNode {
    const start = this.currentToken()?.start || 0;
    this.expectKeyword('exit');
    
    let direction: 'long' | 'short' | 'any' = 'any';
    if (this.checkKeyword('long')) {
      this.expectKeyword('long');
      direction = 'long';
    } else if (this.checkKeyword('short')) {
      this.expectKeyword('short');
      direction = 'short';
    } else if (this.checkKeyword('any')) {
      this.expectKeyword('any');
      direction = 'any';
    }

    return {
      type: 'ExitAction',
      direction,
      start,
      end: this.previousToken()?.end || start,
    };
  }

  private parseRisk(): RiskNode {
    const start = this.currentToken()?.start || 0;
    this.expectKeyword('risk');
    this.expect(TokenType.LBRACE);

    const risk: RiskNode = {
      type: 'Risk',
      start,
      end: start,
    };

    while (!this.check(TokenType.RBRACE) && !this.isEOF()) {
      const key = this.expectIdentifier();
      this.expect(TokenType.COLON);
      const valueToken = this.expect(TokenType.NUMBER);
      const value = parseFloat(valueToken.value);
      this.expect(TokenType.PERCENT);

      if (key === 'stop_loss') risk.stop_loss = value;
      else if (key === 'take_profit') risk.take_profit = value;
      else if (key === 'position_size') risk.position_size = value;
      else if (key === 'max_risk_per_trade') risk.max_risk_per_trade = value;
      else if (key === 'trailing_stop') risk.trailing_stop = value;
      else if (key === 'max_daily_loss') risk.max_daily_loss = value;
      else if (key === 'max_daily_trades') risk.max_daily_trades = value;
    }

    this.expect(TokenType.RBRACE);
    risk.end = this.previousToken()?.end || start;
    return risk;
  }

  private parseValue(): ValueNode {
    const start = this.currentToken()?.start || 0;
    const token = this.currentToken();

    if (token.type === TokenType.NUMBER) {
      this.advance();
      return {
        type: 'Value',
        value: parseFloat(token.value),
        valueType: 'number',
        start,
        end: this.previousToken()?.end || start,
      };
    } else if (token.type === TokenType.STRING) {
      this.advance();
      return {
        type: 'Value',
        value: token.value,
        valueType: 'string',
        start,
        end: this.previousToken()?.end || start,
      };
    } else if (token.type === TokenType.BOOLEAN || (token.type === TokenType.KEYWORD && (token.value === 'true' || token.value === 'false'))) {
      this.advance();
      return {
        type: 'Value',
        value: token.value === 'true',
        valueType: 'boolean',
        start,
        end: this.previousToken()?.end || start,
      };
    } else if (token.type === TokenType.IDENTIFIER) {
      const id = token.value;
      this.advance();
      // Check if it's an indicator call
      if (this.check(TokenType.LPAREN)) {
        const call = this.parseIndicatorCall();
        return {
          type: 'Value',
          value: { indicator: call.indicatorId, params: call.params },
          valueType: 'indicator',
          start,
          end: this.previousToken()?.end || start,
        };
      }
      return {
        type: 'Value',
        value: id,
        valueType: 'identifier',
        start,
        end: this.previousToken()?.end || start,
      };
    }

    throw new Error(`Unexpected token type: ${token.type}`);
  }

  // Helper methods
  private currentToken(): Token {
    return this.tokens[this.position] || this.tokens[this.tokens.length - 1];
  }

  private previousToken(): Token {
    return this.tokens[this.position - 1] || this.tokens[0];
  }

  private advance(): Token {
    if (!this.isEOF()) this.position++;
    this.skipWhitespace();
    return this.previousToken();
  }

  private skipWhitespace(): void {
    while (!this.isEOF() && (this.currentToken().type === TokenType.NEWLINE || this.currentToken().type === TokenType.WHITESPACE)) {
      this.position++;
    }
  }

  private isEOF(): boolean {
    return this.position >= this.tokens.length;
  }

  private check(type: TokenType, value?: string): boolean {
    if (this.isEOF()) return false;
    const token = this.currentToken();
    return token.type === type && (value === undefined || token.value === value);
  }

  private checkKeyword(keyword: string): boolean {
    if (this.isEOF()) return false;
    const token = this.currentToken();
    return token.type === TokenType.KEYWORD && token.value === keyword;
  }

  private match(type: TokenType, value?: string): boolean {
    if (this.check(type, value)) {
      this.advance();
      return true;
    }
    return false;
  }

  private expect(type: TokenType, value?: string): Token {
    if (this.check(type, value)) {
      return this.advance();
    }
    const token = this.currentToken();
    throw new Error(`Expected ${type}${value ? ` with value ${value}` : ''}, got ${token.type} at line ${token.line}, column ${token.column}`);
  }

  private expectKeyword(keyword: string): string | null {
    if (this.checkKeyword(keyword)) {
      this.advance();
      return keyword;
    }
    return null;
  }

  private expectIdentifier(): string {
    const token = this.expect(TokenType.IDENTIFIER);
    return token.value;
  }

  private expectString(): string {
    const token = this.expect(TokenType.STRING);
    return token.value;
  }
}

