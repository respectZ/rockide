import * as vscode from "vscode";

let _legend: vscode.SemanticTokensLegend | undefined;
export const legend = (function () {
  if (_legend) {
    return _legend;
  }
  const tokenTypesLegend = [
    "comment",
    "string",
    "keyword",
    "number",
    "regexp",
    "operator",
    "namespace",
    "type",
    "struct",
    "class",
    "interface",
    "enum",
    "typeParameter",
    "function",
    "method",
    "decorator",
    "macro",
    "variable",
    "parameter",
    "property",
    "label",
  ];
  const tokenModifiersLegend = [
    "declaration",
    "documentation",
    "readonly",
    "static",
    "abstract",
    "deprecated",
    "modification",
    "async",
  ];

  _legend = new vscode.SemanticTokensLegend(tokenTypesLegend, tokenModifiersLegend);
  return _legend;
})();

type MoLangPattern = {
  name: string;
  match: RegExp;
  includes?: RegExp;
};

const patterns: MoLangPattern[] = [
  {
    name: "class",
    match: /(?<="identifier":\s*")([a-zA-Z_]*)/g,
  },
  {
    name: "function",
    match: /(?<="identifier":\s*"[a-zA-Z_]*:)([a-zA-Z_]*)(?=")/g,
  },
  {
    name: "keyword",
    match: /\b\d+\.\d+\.\d+\b/g,
  },
  {
    name: "keyword",
    match: /this/g,
  },
  {
    name: "property",
    match: /(@s|@e|@p|@r|@a|@initiator)/g,
  },
  {
    name: "keyword",
    match: /(?<=(@s|@e|@p|@r|@a|@initiator) )[\w\d.:/]+/g,
  },
  {
    name: "operator",
    match: /[!*+\-<>=?;]/g,
    includes: /(q|query|[Mm]ath|c|[Cc]ontext|t|[Tt]emp|v|[Vv]ariable)\./g,
  },
  {
    name: "operator",
    match: /(&&|\|\|)/g,
  },
  {
    name: "class",
    match: /(?<![\w.])([aA]rray|[Gg]eometry|[Tt]exture|[Mm]aterial|q|query|v|variable|t|temp|c|context|[Mm]ath)\./g,
  },
  {
    name: "function",
    match:
      /(?<=((?<![\w.])([aA]rray|[Gg]eometry|[Tt]exture|[Mm]aterial|q|query|v|variable|t|temp|c|context|[Mm]ath))\.)\w+(\.\w+)?/g,
  },
  {
    name: "macro",
    match: /'[^']*'/g,
  },
  {
    name: "number",
    match: /\b\d+(\.\d+)?(f)?\b/g,
  },
];

export class SemanticMolang implements vscode.DocumentSemanticTokensProvider {
  provideDocumentSemanticTokens(document: vscode.TextDocument): vscode.ProviderResult<vscode.SemanticTokens> {
    const tokens = this._parseText(document);
    return tokens;
  }

  private _parseText(document: vscode.TextDocument) {
    console.time("parse");
    const text = document.getText();
    const tokens = new vscode.SemanticTokensBuilder(legend);

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.match.exec(text)) !== null) {
        if (match[0] !== "") {
          const start = match.index;
          const end = start + match[0].length;

          const startPos = document.positionAt(start);
          const endPos = document.positionAt(end);

          const range = new vscode.Range(startPos, endPos);
          tokens.push(range, pattern.name);
        }
      }
    }
    console.timeEnd("parse");
    return tokens.build();
  }
}
