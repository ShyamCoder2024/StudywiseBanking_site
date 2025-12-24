// Lazy import retry utility for handling Vercel/build deployment issues
// Prevents "Failed to fetch dynamically imported module" errors

export function lazyWithRetry(componentImport) {
    return new Promise((resolve, reject) => {
        const hasRefreshed = JSON.parse(
            window.sessionStorage.getItem('retry-lazy-refreshed') || 'false'
        );

        componentImport()
            .then((module) => {
                window.sessionStorage.setItem('retry-lazy-refreshed', 'false');
                resolve(module);
            })
            .catch((error) => {
                if (!hasRefreshed) {
                    // First failure: mark that we've tried and reload
                    window.sessionStorage.setItem('retry-lazy-refreshed', 'true');
                    console.warn('Lazy import failed, attempting page reload...', error);
                    return window.location.reload();
                }

                // Second failure after reload: give up and reject
                window.sessionStorage.setItem('retry-lazy-refreshed', 'false');
                console.error('Lazy import failed after reload:', error);
                reject(error);
            });
    });
}

export default lazyWithRetry;
