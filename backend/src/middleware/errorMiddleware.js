// Standard Error Response Format per EHD
export class AppError extends Error {
    constructor(message, statusCode, errorCode = 'UNKNOWN_ERROR') {
        super(message);
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.isOperational = true;
        this.referenceId = `ERR-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

        Error.captureStackTrace(this, this.constructor);
    }
}

// Specific Error Classes
export class ValidationError extends AppError {
    constructor(message) {
        super(message, 400, 'VALIDATION_ERROR');
    }
}

export class AuthError extends AppError {
    constructor(message = 'Invalid credentials') {
        super(message, 401, 'AUTH_ERROR');
    }
}

export class ForbiddenError extends AppError {
    constructor(message = 'Access forbidden') {
        super(message, 403, 'FORBIDDEN');
    }
}

export class NotFoundError extends AppError {
    constructor(resource = 'Resource') {
        super(`${resource} not found`, 404, 'NOT_FOUND');
    }
}

export class ConflictError extends AppError {
    constructor(message = 'Resource already exists') {
        super(message, 409, 'CONFLICT');
    }
}

export class AIServiceError extends AppError {
    constructor(message = 'AI service temporarily unavailable') {
        super(message, 502, 'AI_SERVICE_ERROR');
    }
}

// Not Found Handler
export const notFoundHandler = (req, res, next) => {
    next(new NotFoundError('Route'));
};

// Global Error Handler (per EHD specifications)
export const errorHandler = (err, req, res, next) => {
    // Log error internally
    console.error('Error:', {
        referenceId: err.referenceId || 'N/A',
        errorCode: err.errorCode,
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        path: req.path,
        method: req.method,
        userId: req.user?._id,
        timestamp: new Date().toISOString(),
    });

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map((e) => e.message);
        return res.status(400).json({
            success: false,
            error: {
                code: 'VALIDATION_ERROR',
                message: messages.join(', '),
                referenceId: `ERR-${Date.now()}`,
            },
        });
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        return res.status(409).json({
            success: false,
            error: {
                code: 'DUPLICATE_ERROR',
                message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`,
                referenceId: `ERR-${Date.now()}`,
            },
        });
    }

    // Mongoose cast error (invalid ObjectId)
    if (err.name === 'CastError') {
        return res.status(400).json({
            success: false,
            error: {
                code: 'INVALID_ID',
                message: 'Invalid resource ID format',
                referenceId: `ERR-${Date.now()}`,
            },
        });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            error: {
                code: 'INVALID_TOKEN',
                message: 'Invalid authentication token',
                referenceId: `ERR-${Date.now()}`,
            },
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            error: {
                code: 'TOKEN_EXPIRED',
                message: 'Authentication token has expired',
                referenceId: `ERR-${Date.now()}`,
            },
        });
    }

    // Operational errors (our custom errors)
    if (err.isOperational) {
        return res.status(err.statusCode).json({
            success: false,
            error: {
                code: err.errorCode,
                message: err.message,
                referenceId: err.referenceId,
            },
        });
    }

    // Unknown errors - don't expose details
    res.status(500).json({
        success: false,
        error: {
            code: 'INTERNAL_ERROR',
            message: 'An unexpected error occurred. Please try again later.',
            referenceId: `ERR-${Date.now()}`,
        },
    });
};

export default { AppError, errorHandler, notFoundHandler };
