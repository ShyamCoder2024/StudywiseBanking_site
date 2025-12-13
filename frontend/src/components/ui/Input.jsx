import './Input.css';

export function Input({
    label,
    type = 'text',
    name,
    value,
    onChange,
    placeholder,
    error,
    helper,
    required = false,
    disabled = false,
    className = '',
    ...props
}) {
    const inputClasses = [
        'form-input',
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
            <input
                type={type}
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
                required={required}
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
