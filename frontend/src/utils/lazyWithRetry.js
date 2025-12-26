// Lazy import retry utility for handling Vercel/build deployment issues
// Prevents "Failed to fetch dynamically imported module" errors

export function lazyWithRetry(componentImport) {
    return componentImport()
        .then((module) => {
            // Clear any previous retry flag on success
            try {
                window.sessionStorage.setItem('retry-lazy-refreshed', 'false');
            } catch (e) {
                // sessionStorage might not be available
            }
            return module;
        })
        .catch((error) => {
            let hasRefreshed = false;
            try {
                hasRefreshed = JSON.parse(
                    window.sessionStorage.getItem('retry-lazy-refreshed') || 'false'
                );
            } catch (e) {
                // sessionStorage might not be available
            }

            if (!hasRefreshed) {
                // First failure: mark that we've tried and reload
                try {
                    window.sessionStorage.setItem('retry-lazy-refreshed', 'true');
                } catch (e) {
                    // sessionStorage might not be available
                }
                // Return a promise that never resolves (page will reload)
                return new Promise(() => {
                    window.location.reload();
                });
            }

            // Second failure after reload: give up and reject
            try {
                window.sessionStorage.setItem('retry-lazy-refreshed', 'false');
            } catch (e) {
                // sessionStorage might not be available
            }
            throw error;
        });
}

export default lazyWithRetry;
