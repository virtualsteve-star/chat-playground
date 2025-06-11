/**
 * Blocklist Filter Implementation
 * Processes messages against configured blocklists
 */

class BlocklistFilter {
    constructor() {
        this.blocklists = {
            sex: [],
            violence: [],
            code: []
        };
        this.initialized = false;
    }

    async initialize() {
        try {
            // Node.js or browser?
            const isNode = typeof window === 'undefined' || typeof window.location === 'undefined';
            if (isNode) {
                // Node.js: use fs to load files
                const fs = require('fs');
                const path = require('path');
                const base = path.join(__dirname, '../filters/');
                const sexText = fs.readFileSync(path.join(base, 'sex_blocklist.txt'), 'utf8');
                const violenceText = fs.readFileSync(path.join(base, 'violence_blocklist.txt'), 'utf8');
                this.blocklists.sex = sexText.split('\n')
                    .filter(line => line.trim() && !line.startsWith('#'))
                    .map(term => term.toLowerCase().trim());
                this.blocklists.violence = violenceText.split('\n')
                    .filter(line => line.trim() && !line.startsWith('#'))
                    .map(term => term.toLowerCase().trim());
                this.initialized = true;
            } else {
                // Browser: use fetch
                const timestamp = new Date().getTime();
                const base = window.location.pathname.includes('/tests/') ? '../' : '';
                const sexResponse = await fetch(base + 'scripts/filters/sex_blocklist.txt?t=' + timestamp);
                const violenceResponse = await fetch(base + 'scripts/filters/violence_blocklist.txt?t=' + timestamp);
                const sexText = await sexResponse.text();
                const violenceText = await violenceResponse.text();
                this.blocklists.sex = sexText.split('\n')
                    .filter(line => line.trim() && !line.startsWith('#'))
                    .map(term => term.toLowerCase().trim());
                this.blocklists.violence = violenceText.split('\n')
                    .filter(line => line.trim() && !line.startsWith('#'))
                    .map(term => term.toLowerCase().trim());
                this.initialized = true;
            }
        } catch (error) {
            console.error('Error initializing blocklist filter:', error);
            throw error;
        }
    }

    checkMessage(message) {
        if (!this.initialized) {
            throw new Error('Blocklist filter not initialized');
        }

        const lowerMessage = message.toLowerCase();
        
        // Check each blocklist
        for (const [listName, terms] of Object.entries(this.blocklists)) {
            for (const term of terms) {
                if (lowerMessage.includes(term)) {
                    return {
                        blocked: true,
                        list: listName,
                        term: term
                    };
                }
            }
        }
        
        return { blocked: false };
    }

    getRejectionMessage(blockedResult) {
        const listNames = {
            sex: 'sexual content',
            violence: 'violent content',
            code: 'code content'
        };
        
        return `I'm sorry, but I cannot process requests containing ${listNames[blockedResult.list]}. ` +
               `This is to ensure a safe and appropriate environment for all users.`;
    }

    checkMessageWithSelection(message, selectedFilters) {
        if (!this.initialized) {
            throw new Error('Blocklist filter not initialized');
        }
        if (!selectedFilters || selectedFilters.length === 0) {
            return { blocked: false };
        }
        const lowerMessage = message.toLowerCase();
        for (const listName of selectedFilters) {
            const terms = this.blocklists[listName] || [];
            for (const term of terms) {
                if (lowerMessage.includes(term)) {
                    return {
                        blocked: true,
                        list: listName,
                        term: term
                    };
                }
            }
        }
        return { blocked: false };
    }
}

// Export the filter
window.BlocklistFilter = BlocklistFilter;

// Node.js/CommonJS export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BlocklistFilter };
} 