// Universal Admin Input Styles
// Use these across ALL admin pages to ensure text visibility

export const BRAND = {
    primary: '#8A75BA',
    primaryHover: '#7A66A8',
    primaryLight: '#EDE9F6',
    success: '#6EBCC3',
    successLight: '#E6F5F7',
    warning: '#ED6771',
    warningLight: '#FCE6E8',
    text: '#131313',
    textSecondary: '#6B6B6B',
    textMuted: '#9AA0A6',
    bg: '#F8F9FA',
    card: '#FFFFFF',
    border: '#E5E7EB',
};

// Universal input style - use this for ALL input fields
export const INPUT_STYLE = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '10px',
    border: `1px solid ${BRAND.border}`,
    fontSize: '14px',
    fontWeight: '500',
    outline: 'none',
    fontFamily: 'Inter, system-ui, sans-serif',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    // CRITICAL: These ensure text is visible
    color: BRAND.text,
    backgroundColor: BRAND.card,
};

// Universal textarea style
export const TEXTAREA_STYLE = {
    ...INPUT_STYLE,
    minHeight: '100px',
    resize: 'vertical',
    lineHeight: '1.6',
};

// Universal select style
export const SELECT_STYLE = {
    ...INPUT_STYLE,
    cursor: 'pointer',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
    backgroundSize: '18px',
    paddingRight: '40px',
};

// Focus state - merge with above styles
export const FOCUS_STYLE = {
    borderColor: BRAND.primary,
    boxShadow: `0 0 0 3px ${BRAND.primaryLight}`,
};

// Disabled state
export const DISABLED_STYLE = {
    opacity: 0.6,
    cursor: 'not-allowed',
    backgroundColor: BRAND.bg,
};

// Small input variant
export const INPUT_SMALL = {
    ...INPUT_STYLE,
    padding: '8px 12px',
    fontSize: '13px',
};

// Search input variant (with icon spacing)
export const SEARCH_INPUT_STYLE = {
    ...INPUT_STYLE,
    paddingLeft: '44px', // Space for search icon
};

// Number input (for duration, marks, etc)
export const NUMBER_INPUT_STYLE = {
    ...INPUT_STYLE,
    textAlign: 'left',
};

export default {
    BRAND,
    INPUT_STYLE,
    TEXTAREA_STYLE,
    SELECT_STYLE,
    FOCUS_STYLE,
    DISABLED_STYLE,
    INPUT_SMALL,
    SEARCH_INPUT_STYLE,
    NUMBER_INPUT_STYLE,
};
