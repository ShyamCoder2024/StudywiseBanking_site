import './Input.css';

// Generate unique ID for form fields without explicit name
let inputIdCounter = 0;
const generateId = (prefix = 'input') => `${prefix}-${++inputIdCounter}`;

export function Input({
    label,
    type = 'text',
    name,
    id,
    value,
    onChange,
    placeholder,
    error,
    helper,
    required = false,
    disabled = false,
    autoComplete,
    className = '',
    ...props
}) {
    // Generate fallback id if not provided
    const inputId = id || name || generateId('input');
    const inputName = name || inputId;

    // Auto-determine autocomplete based on type/name if not provided
    const getAutoComplete = () => {
        if (autoComplete) return autoComplete;
        if (type === 'email') return 'email';
        if (type === 'password') return 'current-password';
        if (type === 'tel') return 'tel';
        if (inputName?.includes('firstName')) return 'given-name';
        if (inputName?.includes('lastName')) return 'family-name';
        if (inputName?.includes('name')) return 'name';
        if (inputName?.includes('city')) return 'address-level2';
        if (inputName?.includes('age')) return 'off';
        return 'off';
    };

    const inputClasses = [
        'form-input',
        error && 'error',
        className
    ].filter(Boolean).join(' ');

    return (
        <div className="form-group">
            {label && (
                <label htmlFor={inputId} className="form-label">
                    {label}
                    {required && <span className="text-warning"> *</span>}
                </label>
            )}
            <input
                type={type}
                id={inputId}
                name={inputName}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
                required={required}
                autoComplete={getAutoComplete()}
                className={inputClasses}
                {...props}
            />
            {error && <p className="form-error">{error}</p>}
            {helper && !error && <p className="form-helper">{helper}</p>}
        </div>
    );
}

export function Textarea({
    label,
    name,
    value,
    onChange,
    placeholder,
    error,
    helper,
    required = false,
    disabled = false,
    rows = 4,
    className = '',
    ...props
}) {
    const textareaClasses = [
        'form-input',
        'form-textarea',
        error && 'error',
        className
    ].filter(Boolean).join(' ');

    return (
        <div className="form-group">
            {label && (
                <label htmlFor={name} className="form-label">
                    {label}
                    {required && <span className="text-warning"> *</span>}
                </label>
            )}
            <textarea
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
                required={required}
                rows={rows}
                className={textareaClasses}
                {...props}
            />
            {error && <p className="form-error">{error}</p>}
            {helper && !error && <p className="form-helper">{helper}</p>}
        </div>
    );
}

export function Select({
    label,
    name,
    value,
    onChange,
    options = [],
    placeholder = 'Select...',
    error,
    required = false,
    disabled = false,
    className = '',
    ...props
}) {
    const selectClasses = [
        'form-input',
        'form-select',
        error && 'error',
        className
    ].filter(Boolean).join(' ');

    return (
        <div className="form-group">
            {label && (
                <label htmlFor={name} className="form-label">
                    {label}
                    {required && <span className="text-warning"> *</span>}
                </label>
            )}
            <select
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                disabled={disabled}
                required={required}
                className={selectClasses}
                {...props}
            >
                <option value="">{placeholder}</option>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {error && <p className="form-error">{error}</p>}
        </div>
    );
}

export function RadioGroup({
    label,
    name,
    value,
    onChange,
    options = [],
    error,
    required = false,
    className = '',
}) {
    return (
        <div className={`form-group ${className}`}>
            {label && (
                <label className="form-label">
                    {label}
                    {required && <span className="text-warning"> *</span>}
                </label>
            )}
            <div className="form-radio-group">
                {options.map((option) => (
                    <label key={option.value} className="form-radio">
                        <input
                            type="radio"
                            name={name}
                            value={option.value}
                            checked={value === option.value}
                            onChange={onChange}
                        />
                        <span>{option.label}</span>
                    </label>
                ))}
            </div>
            {error && <p className="form-error">{error}</p>}
        </div>
    );
}

export default Input;
