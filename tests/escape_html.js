// AppSec Best Practice: Escape user-controlled data to prevent XSS (Snyk CWE-79)
// Shared by all test harnesses
function escapeHTML(str) {
    return String(str).replace(/[&<>"']/g, function(m) {
        return ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        })[m];
    });
} 