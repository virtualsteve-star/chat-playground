/**
 * Code Output Filter (Heuristic, Local)
 * Detects likely code output (Python, SQL, etc.) using regex-based heuristics.
 */

class CodeOutputFilter {
    constructor() {
        this.rules = [
            // Markdown code block (Python/SQL/any)
            { pattern: /```(?:python|sql)?[\s\S]*?```/gi, weight: 10, description: 'Markdown code block (Python/SQL/any)' },
            // Python patterns (anchored, multiline)
            { pattern: /^\s*def\s+\w+\s*\(.*\):/gm, weight: 3, description: 'Python function definition' },
            { pattern: /^\s*class\s+\w+\s*\(?.*\)?:/gm, weight: 2, description: 'Python class definition' },
            { pattern: /^\s*import\s+\w+/gm, weight: 2, description: 'Python import statement' },
            { pattern: /^\s*if __name__\s*==\s*['\"]__main__['\"]:/gm, weight: 2, description: 'Python main guard' },
            { pattern: /^\s*print\s*\(.*\)/gm, weight: 2, description: 'Python print statement' },
            { pattern: /^\s*except\s+\w*:/gm, weight: 2, description: 'Python except block' },
            { pattern: /^\s*with open\(.+\):/gm, weight: 2, description: 'Python file open' },
            { pattern: /^\s*cursor\.execute\(/gm, weight: 2, description: 'Python DB cursor execute' },
            { pattern: /^\s*sqlite3\.connect\(/gm, weight: 2, description: 'Python sqlite3 connect' },
            // SQL patterns
            { pattern: /SELECT\s+.+\s+FROM\s+.+/gi, weight: 3, description: 'SQL SELECT statement' },
            { pattern: /INSERT\s+INTO\s+.+/gi, weight: 2, description: 'SQL INSERT statement' },
            { pattern: /UPDATE\s+.+\s+SET\s+.+/gi, weight: 2, description: 'SQL UPDATE statement' },
            { pattern: /DELETE\s+FROM\s+.+/gi, weight: 2, description: 'SQL DELETE statement' },
            { pattern: /CREATE\s+TABLE\s+.+/gi, weight: 2, description: 'SQL CREATE TABLE' },
            { pattern: /DROP\s+TABLE\s+.+/gi, weight: 2, description: 'SQL DROP TABLE' },
            { pattern: /ALTER\s+TABLE\s+.+/gi, weight: 2, description: 'SQL ALTER TABLE' },
            { pattern: /WHERE\s+.+/gi, weight: 1, description: 'SQL WHERE clause' },
            // C/C++
            { pattern: /#include\s+<\w+\.h>/g, weight: 2, description: 'C/C++ include statement' },
            // Generic indented code line (4+ spaces or tab at start, then code-like chars)
            { pattern: /^(\s{4,}|\t)[^#\n]+[:(]/gm, weight: 2, description: 'Generic indented code line' },
            // Markdown code block (any language)
            { pattern: /```[a-zA-Z0-9]*[\s\S]*?```/g, weight: 10, description: 'Markdown code block (any language)' },
        ];
        this.threshold = 20; // percent
        this.initialized = true;
    }

    async initialize() {
        this.initialized = true;
    }

    checkMessage(message) {
        if (!this.initialized) {
            throw new Error('Code output filter not initialized');
        }
        const { score, matchedRules, matchDetails } = this.calculateScoreWithMatches(message);
        return {
            blocked: score >= this.threshold,
            score,
            threshold: this.threshold,
            matchedRules,
            matchDetails
        };
    }

    calculateScoreWithMatches(message) {
        const maxPossibleScore = this.rules.reduce((sum, rule) => sum + rule.weight * 2, 0); // *2 for possible multiple matches
        let matchedRules = [];
        let matchDetails = [];
        let actualScore = 0;
        for (const rule of this.rules) {
            let matches = [];
            let regex = rule.pattern;
            // Reset lastIndex for global regexes
            if (regex.global) regex.lastIndex = 0;
            let match;
            while ((match = regex.exec(message)) !== null) {
                matches.push(match[0]);
                actualScore += rule.weight;
            }
            if (matches.length > 0) {
                matchedRules.push(rule);
                matchDetails.push({ description: rule.description, matches });
            }
        }
        return {
            score: Math.round((actualScore / maxPossibleScore) * 100),
            matchedRules,
            matchDetails
        };
    }

    getRejectionMessage(result) {
        let reason = '';
        if (result.matchedRules && result.matchedRules.length > 0) {
            reason = result.matchedRules.map(r => `- ${r.description}`).join('\n');
        } else {
            reason = 'Heuristic rules detected likely code output.';
        }
        return `I'm sorry, but I cannot process requests containing code output.\n(detection score: ${result.score}%)\nReason:\n${reason}`;
    }
}

window.CodeOutputFilter = CodeOutputFilter; 