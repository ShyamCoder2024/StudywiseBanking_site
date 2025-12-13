import './Button.css';

export function Button({
    children,
    variant = 'primary',
    size = 'md',
    block = false,
    disabled = false,
    loading = false,
    type = 'button',
    onClick,
    className = '',
    ...props
}) {
    const classes = [
        'btn',
        `btn-${variant}`,
        size !== 'md' && `btn-${size}`,
        block && 'btn-block',
        className
    ].filter(Boolean).join(' ');

    return (
        <button
            type={type}
            className={classes}
            disabled={disabled || loading}
            onClick={onClick}
            {...props}
        >
            {loading ? (
                <>
                    <span className="spinner spinner-sm"></span>
                    <span>Loading...</span>
                </>
            ) : (
                children
            )}
        </button>
    );
}

export default Button;
