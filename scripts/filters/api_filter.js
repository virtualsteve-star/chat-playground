/**
 * Generic API Filter Base Class
 * Provides a base structure for API-based filters.
 */

class APIFilter {
    constructor(name) {
        this.name = name;
    }

    async check(message, options = {}) {
        throw new Error('Method check() must be implemented by subclass');
    }
}

// Export the filter
window.APIFilter = APIFilter;

// Node.js/CommonJS export
if (typeof module !== 'undefined' && module.exports) {
    console.log('Exporting APIFilter from api_filter.js:', APIFilter);
    module.exports = { APIFilter };
} 