/**
 * Public entry point for hebrew-date-kit.
 *
 * All Gregorian and Hebrew dates are plain {year, month, day} records, not
 * JavaScript Date instances or timestamps. Calculations use civil days and
 * do not adjust the Hebrew date at local sunset.
 */

/**
 * Convert a proleptic Gregorian civil date (January=1) to a Hebrew civil date
 * (Nisan=1, Tishrei=7, Adar II=13 in leap years).
 * @see {@link ./dates.js}
 */
export { toHebrew } from './dates.js';

/**
 * Convert a Hebrew civil date (Nisan=1) to a Gregorian civil date (January=1).
 * @see {@link ./dates.js}
 */
export { toGregorian } from './dates.js';

/**
 * List traditional Jewish holidays and observances for a Hebrew year, with an
 * explicit region of 'israel' or 'diaspora'; entries include both date systems.
 * @see {@link ./holidays.js}
 */
export { getJewishHolidays } from './holidays.js';

/**
 * Format a positive integer as a Hebrew numeral with geresh/gershayim.
 * @see {@link ./numerals.mjs}
 */
export { formatHebrewNumber } from './numerals.mjs';

/**
 * Format a Hebrew year with traditional omission of the fifth millennium,
 * for example 5787 becomes תשפ״ז.
 * @see {@link ./numerals.mjs}
 */
export { formatHebrewYear } from './numerals.mjs';
