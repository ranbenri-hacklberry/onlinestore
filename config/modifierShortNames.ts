/**
 * Mapping of short names for modifiers - for display in KDS and cart.
 * Full names are stored in the database, here only abbreviations for display.
 */

// Mods that shouldn't be displayed (default)
export const HIDDEN_MODS = [
    'רגיל',
    'חלב רגיל',
    'ללא חלב',
];

// Mapping full name -> short name
export const SHORT_NAMES: Record<string, string> = {
    // Drink base
    'חצי חלב חצי מים': 'חצי-חצי',
    'על בסיס מים': 'בסיס מים',

    // Serving
    'מפורק ': 'מפורק',  // There is a space at the end in DB

    // Milk type
    'שיבולת שועל': 'שיבולת',

    // Caffeine
    'נטול קפאין': 'נטול',

    // Foam
    'בלי קצף': '✕קצף',
    'הרבה קצף': 'קצף',
    'מעט קצף': 'קצף',

    // Milk on side
    'חלב חם בצד': 'חם בצד',
    'חלב סויה בצד': 'סויה בצד',
    'חלב קר בצד': 'קר בצד',
    'חלב שיבולת בצד': 'שיבולת בצד',
    'ללא חלב': 'ללא חלב',
};

// Colors and arrows according to mod type (key = full name from DB)
export const MOD_COLORS: Record<string, string> = {
    // Foam
    'הרבה קצף': 'mod-color-foam-up',
    'מעט קצף': 'mod-color-foam-down',
    'בלי קצף': 'mod-color-foam-none',

    // Alternative milk
    'סויה': 'bg-amber-100 text-amber-800 border-amber-200',
    'שיבולת שועל': 'bg-amber-100 text-amber-800 border-amber-200',

    // Decaf
    'נטול קפאין': 'bg-purple-100 text-purple-700 border-purple-200',

    // Strong/Weak
    'חזק': 'bg-orange-100 text-orange-700 border-orange-200',
    'חלש': 'bg-green-100 text-green-700 border-green-200',

    // Temperature
    'רותח': 'bg-red-100 text-red-600 border-red-200',
    'פושר': 'bg-blue-100 text-blue-600 border-blue-200',
};

/**
 * Get short name for a mod
 */
export const getShortName = (fullName: string): string | null => {
    if (!fullName) return null;
    const trimmed = fullName.trim();

    // Check if should hide
    if (HIDDEN_MODS.includes(trimmed)) return null;

    // Return short name if exists, otherwise original name
    return SHORT_NAMES[fullName] || SHORT_NAMES[trimmed] || trimmed;
};

/**
 * Get color for a mod
 */
export const getModColorClass = (fullName: string, displayName: string): string => {
    if (!fullName) return 'bg-slate-100 text-slate-700 border-slate-200';
    const trimmed = fullName.trim();
    return MOD_COLORS[fullName] || MOD_COLORS[trimmed] || MOD_COLORS[displayName] || 'bg-slate-100 text-slate-700 border-slate-200';
};
