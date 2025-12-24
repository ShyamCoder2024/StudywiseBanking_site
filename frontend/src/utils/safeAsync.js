// Universal Error Handler for Student Pages
// Prevents "setState on unmounted component" errors

export const createSafeAsyncHandler = () => {
    let isMounted = true;

    const safeSetState = (setter) => {
        return (...args) => {
            if (isMounted) {
                setter(...args);
            }
        };
    };

    const cleanup = () => {
        isMounted = false;
    };

    return { safeSetState, cleanup };
};

// Safe API caller with proper error handling
export const safeApiCall = async (apiFunction, onSuccess, onError) => {
    try {
        const response = await apiFunction();
        if (onSuccess) onSuccess(response);
        return { success: true, data: response };
    } catch (error) {
        console.error('API Error:', error);
        if (onError) onError(error);
        return { success: false, error };
    }
};

// Batch API calls with individual error handling
export const batchApiCalls = async (calls) => {
    const results = await Promise.allSettled(calls.map(call =>
        call.apiFunction().then(
            data => ({ success: true, data, name: call.name }),
            error => ({ success: false, error, name: call.name })
        )
    ));

    results.forEach(result => {
        if (result.status === 'fulfilled' && result.value.success) {
            const call = calls.find(c => c.name === result.value.name);
            if (call && call.onSuccess) {
                call.onSuccess(result.value.data);
            }
        } else if (result.status === 'fulfilled' && !result.value.success) {
            const call = calls.find(c => c.name === result.value.name);
            if (call && call.onError) {
                call.onError(result.value.error);
            }
        }
    });

    return results;
};

export default {
    createSafeAsyncHandler,
    safeApiCall,
    batchApiCalls
};
