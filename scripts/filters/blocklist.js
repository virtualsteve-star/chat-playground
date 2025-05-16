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
            // Load blocklists with cache-busting
            const timestamp = new Date().getTime();
            const sexResponse = await fetch(`../filters/sex_blocklist.txt?t=${timestamp}`);
            const violenceResponse = await fetch(`../filters/violence_blocklist.txt?t=${timestamp}`);
            const codeResponse = await fetch(`../filters/code_blocklist.txt?t=${timestamp}`);
            
            const sexText = await sexResponse.text();
            const violenceText = await violenceResponse.text();
            const codeText = await codeResponse.text();
            
            // Parse blocklists, skipping comments and empty lines
            this.blocklists.sex = sexText.split('\n')
                .filter(line => line.trim() && !line.startsWith('#'))
                .map(term => term.toLowerCase().trim());
            
            this.blocklists.violence = violenceText.split('\n')
                .filter(line => line.trim() && !line.startsWith('#'))
                .map(term => term.toLowerCase().trim());

            this.blocklists.code = codeText.split('\n')
                .filter(line => line.trim() && !line.startsWith('#'))
                .map(term => term.toLowerCase().trim());
            
            this.initialized = true;
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