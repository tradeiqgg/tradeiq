// =====================================================================
// CHAPTER 4: TQL LEXER
// TradeIQ Query Language Tokenizer
// =====================================================================

export enum TokenType {
  // Literals
  IDENTIFIER = 'IDENTIFIER',
  NUMBER = 'NUMBER',
  STRING = 'STRING',
  BOOLEAN = 'BOOLEAN',
  PERCENT = 'PERCENT',

  // Operators
  OPERATOR = 'OPERATOR',

  // Punctuation
  LBRACE = 'LBRACE',      // {
  RBRACE = 'RBRACE',      // }
  LPAREN = 'LPAREN',      // (
  RPAREN = 'RPAREN',      // )
  COLON = 'COLON',        // :
  COMMA = 'COMMA',        // ,

  // Keywords
  KEYWORD = 'KEYWORD',

  // Special
  NEWLINE = 'NEWLINE',
  EOF = 'EOF',
  WHITESPACE = 'WHITESPACE',
}

export const KEYWORDS = {
  meta: 'meta',
  settings: 'settings',
  indicators: 'indicators',
  rules: 'rules',
  entry: 'entry',
  exit: 'exit',
  filters: 'filters',
  risk: 'risk',
  when: 'when',
  then: 'then',
  enter: 'enter',
  long: 'long',
  short: 'short',
  true: 'true',
  false: 'false',
  crosses_above: 'crosses_above',
  crosses_below: 'crosses_below',
} as const;

export const OPERATORS = {
  '<': 'lt',
  '>': 'gt',
  '<=': 'lte',
  '>=': 'gte',
  '==': 'eq',
  '!=': 'neq',
} as const;

export interface Token {
  type: TokenType;
  value: string;
  line: number;
  column: number;
  start: number;
  end: number;
}

export interface LexerError {
  message: string;
  line: number;
  column: number;
}

export class TQLLexer {
  private input: string;
  private position: number = 0;
  private line: number = 1;
  private column: number = 1;
  private tokens: Token[] = [];
  private errors: LexerError[] = [];

  constructor(input: string) {
    this.input = input;
  }

  tokenize(): { tokens: Token[]; errors: LexerError[] } {
    this.tokens = [];
    this.errors = [];
    this.position = 0;
    this.line = 1;
    this.column = 1;

    while (!this.isEOF()) {
      const startPos = this.position;
      const startLine = this.line;
      const startCol = this.column;

      this.skipWhitespace();

      if (this.isEOF()) break;

      const char = this.peek();

      // Handle different token types
      if (char === '{') {
        this.addToken(TokenType.LBRACE, '{', startPos, startLine, startCol);
        this.advance();
      } else if (char === '}') {
        this.addToken(TokenType.RBRACE, '}', startPos, startLine, startCol);
        this.advance();
      } else if (char === '(') {
        this.addToken(TokenType.LPAREN, '(', startPos, startLine, startCol);
        this.advance();
      } else if (char === ')') {
        this.addToken(TokenType.RPAREN, ')', startPos, startLine, startCol);
        this.advance();
      } else if (char === ':') {
        this.addToken(TokenType.COLON, ':', startPos, startLine, startCol);
        this.advance();
      } else if (char === ',') {
        this.addToken(TokenType.COMMA, ',', startPos, startLine, startCol);
        this.advance();
      } else if (char === '%') {
        this.addToken(TokenType.PERCENT, '%', startPos, startLine, startCol);
        this.advance();
      } else if (char === '"' || char === "'") {
        this.tokenizeString(char);
      } else if (this.isDigit(char)) {
        this.tokenizeNumber();
      } else if (this.isOperatorStart(char)) {
        this.tokenizeOperator();
      } else if (this.isIdentifierStart(char)) {
        this.tokenizeIdentifier();
      } else if (char === '\n') {
        this.addToken(TokenType.NEWLINE, '\n', startPos, startLine, startCol);
        this.advance();
        this.line++;
        this.column = 1;
      } else {
        this.errors.push({
          message: `Unexpected character: ${char}`,
          line: this.line,
          column: this.column,
        });
        this.advance();
      }
    }

    // Add EOF token
    this.addToken(TokenType.EOF, '', this.position, this.line, this.column);

    return { tokens: this.tokens, errors: this.errors };
  }

  private tokenizeString(quote: string): void {
    const startPos = this.position;
    const startLine = this.line;
    const startCol = this.column;

    this.advance(); // Skip opening quote

    let value = '';
    while (!this.isEOF() && this.peek() !== quote) {
      if (this.peek() === '\\') {
        this.advance();
        const escaped = this.peek();
        if (escaped === 'n') value += '\n';
        else if (escaped === 't') value += '\t';
        else if (escaped === '\\') value += '\\';
        else if (escaped === quote) value += quote;
        else value += escaped;
        this.advance();
      } else {
        value += this.peek();
        this.advance();
      }
    }

    if (this.isEOF()) {
      this.errors.push({
        message: 'Unterminated string',
        line: startLine,
        column: startCol,
      });
    } else {
      this.advance(); // Skip closing quote
      this.addToken(TokenType.STRING, value, startPos, startLine, startCol);
    }
  }

  private tokenizeNumber(): void {
    const startPos = this.position;
    const startLine = this.line;
    const startCol = this.column;

    let value = '';
    while (!this.isEOF() && (this.isDigit(this.peek()) || this.peek() === '.')) {
      value += this.peek();
      this.advance();
    }

    this.addToken(TokenType.NUMBER, value, startPos, startLine, startCol);
  }

  private tokenizeOperator(): void {
    const startPos = this.position;
    const startLine = this.line;
    const startCol = this.column;

    const char = this.peek();
    let value = char;
    this.advance();

    // Handle two-character operators
    if ((char === '<' || char === '>' || char === '!' || char === '=') && this.peek() === '=') {
      value += this.peek();
      this.advance();
    }

    this.addToken(TokenType.OPERATOR, value, startPos, startLine, startCol);
  }

  private tokenizeIdentifier(): void {
    const startPos = this.position;
    const startLine = this.line;
    const startCol = this.column;

    let value = '';
    while (!this.isEOF() && (this.isIdentifierChar(this.peek()))) {
      value += this.peek();
      this.advance();
    }

    // Check if it's a keyword
    if (value in KEYWORDS || value === 'crosses_above' || value === 'crosses_below') {
      this.addToken(TokenType.KEYWORD, value, startPos, startLine, startCol);
    } else {
      this.addToken(TokenType.IDENTIFIER, value, startPos, startLine, startCol);
    }
  }

  private skipWhitespace(): void {
    while (!this.isEOF() && /\s/.test(this.peek()) && this.peek() !== '\n') {
      this.advance();
    }
  }

  private peek(): string {
    return this.input[this.position] || '';
  }

  private advance(): void {
    if (!this.isEOF()) {
      this.position++;
      this.column++;
    }
  }

  private isEOF(): boolean {
    return this.position >= this.input.length;
  }

  private isDigit(char: string): boolean {
    return /[0-9]/.test(char);
  }

  private isIdentifierStart(char: string): boolean {
    return /[a-zA-Z_]/.test(char);
  }

  private isIdentifierChar(char: string): boolean {
    return /[a-zA-Z0-9_]/.test(char);
  }

  private isOperatorStart(char: string): boolean {
    return ['<', '>', '=', '!'].includes(char);
  }

  private addToken(
    type: TokenType,
    value: string,
    start: number,
    line: number,
    column: number
  ): void {
    this.tokens.push({
      type,
      value,
      line,
      column,
      start,
      end: this.position,
    });
  }
}

