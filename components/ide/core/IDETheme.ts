// =====================================================================
// CHAPTER 6: IDE Theme Definitions
// =====================================================================

export const IDE_THEME = {
  // Terminal theme
  terminal: {
    background: '#1e1e1e',
    foreground: '#d4d4d4',
    cursor: '#aeafad',
    selection: '#264f78',
    black: '#000000',
    red: '#cd3131',
    green: '#0dbc79',
    yellow: '#e5e510',
    blue: '#2472c8',
    magenta: '#bc3fbc',
    cyan: '#11a8cd',
    white: '#e5e5e5',
    brightBlack: '#666666',
    brightRed: '#f14c4c',
    brightGreen: '#23d18b',
    brightYellow: '#f5f543',
    brightBlue: '#3b8eea',
    brightMagenta: '#d670d6',
    brightCyan: '#29b8db',
    brightWhite: '#e5e5e5',
  },

  // TQL syntax highlighting
  tql: {
    keyword: '#569cd6',
    string: '#ce9178',
    number: '#b5cea8',
    operator: '#d4d4d4',
    identifier: '#4ec9b0',
    comment: '#6a9955',
    function: '#dcdcaa',
    type: '#4ec9b0',
  },

  // Diagnostics colors
  diagnostics: {
    error: '#f44336',
    warning: '#ff9800',
    info: '#2196f3',
    squiggle: {
      error: '#f44336',
      warning: '#ff9800',
      info: '#2196f3',
    },
  },

  // Block editor colors
  blocks: {
    indicator: '#4FD0FF',
    value: '#FFD84F',
    logic: '#FF6B6B',
    math: '#A890FF',
    rule: '#4FFF85',
    entry: '#4FFF85',
    exit: '#FF628C',
    filter: '#C7FF4F',
    risk: '#FF9F4F',
    meta: '#808080',
  },
};

/**
 * Monaco Editor theme for TQL
 */
export const MONACO_TQL_THEME = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'keyword', foreground: IDE_THEME.tql.keyword },
    { token: 'string', foreground: IDE_THEME.tql.string },
    { token: 'number', foreground: IDE_THEME.tql.number },
    { token: 'operator', foreground: IDE_THEME.tql.operator },
    { token: 'identifier', foreground: IDE_THEME.tql.identifier },
    { token: 'comment', foreground: IDE_THEME.tql.comment, fontStyle: 'italic' },
    { token: 'function', foreground: IDE_THEME.tql.function },
  ],
  colors: {
    'editor.background': '#1e1e1e',
    'editor.foreground': '#d4d4d4',
    'editorLineNumber.foreground': '#858585',
    'editor.selectionBackground': '#264f78',
    'editorCursor.foreground': '#aeafad',
  },
};

