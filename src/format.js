/**
 * Hebrew calendar month names and human-readable dates.
 *
 * Hebrew month numbering is Nisan=1, Iyar=2 ... Elul=6, Tishrei=7,
 * Adar/Adar I=12 and (only in leap years) Adar II=13.
 * This module formats plain civil dates, not local times or sunset-based days.
 */
import { hebrewMonthsInYear, hebrewToAbsolute } from './calendar-core.js';
import { formatHebrewNumber, formatHebrewYear } from './numerals.mjs';

const MONTHS = Object.freeze({
  he: Object.freeze(['', 'ניסן', 'אייר', 'סיוון', 'תמוז', 'אב', 'אלול', 'תשרי',
    'חשוון', 'כסלו', 'טבת', 'שבט', 'אדר']),
  en: Object.freeze(['', 'Nisan', 'Iyar', 'Sivan', 'Tammuz', 'Av', 'Elul',
    'Tishrei', 'Cheshvan', 'Kislev', 'Tevet', 'Shevat', 'Adar']),
});

function language(options, fallback) {
  if (options === null || typeof options !== 'object' || Array.isArray(options)) {
    throw new TypeError('options must be an object');
  }
  const { locale = fallback } = options;
  if (locale !== 'en' && locale !== 'he') {
    throw new RangeError("locale must be 'en' or 'he'");
  }
  return locale;
}

function name(year, month, locale) {
  const months = hebrewMonthsInYear(year); // also validates year
  if (!Number.isSafeInteger(month) || month < 1 || month > months) {
    throw new RangeError('month must be a valid Hebrew month in this year');
  }
  if (months === 13 && month === 12) return locale === 'he' ? 'אדר א׳' : 'Adar I';
  if (months === 13 && month === 13) return locale === 'he' ? 'אדר ב׳' : 'Adar II';
  return MONTHS[locale][month];
}

/**
 * Return the name of a Hebrew calendar month, respecting leap-year Adar I/II.
 * The default locale is 'en'; specify {locale:'he'} for Hebrew names.
 * @param {number} year Hebrew year (1..20000).
 * @param {number} month Nisan=1 through Elul=6, Tishrei=7 ... Adar/Adar I=12, Adar II=13.
 * @param {{locale?:'en'|'he'}} [options={}] Optional display language.
 * @returns {string} The month name.
 * @throws {TypeError|RangeError} Invalid year, month or options.
 */
export function getHebrewMonthName(year, month, options = {}) {
  return name(year, month, language(options, 'en'));
}

/**
 * Format a validated Hebrew civil date as Hebrew or English text.
 * By default returns Hebrew, e.g. 'י״ד באדר ב׳ תשפ״ד'.
 * English locale returns '14 Adar II 5784'. The date's calendar fields
 * must exist (including Adar II only in leap years); input is not modified.
 * No timezone or local sunset logic is applied.
 * @param {{year:number,month:number,day:number}} date Hebrew date (Nisan=1).
 * @param {{locale?:'he'|'en'}} [options={}] Optional display language.
 * @returns {string} Formatted date.
 * @throws {TypeError|RangeError} Invalid Hebrew date or options.
 */
export function formatHebrewDate(date, options = {}) {
  const locale = language(options, 'he');
  hebrewToAbsolute(date); // validates all fields and month-day lengths
  const { year, month, day } = date;
  const monthName = name(year, month, locale);
  if (locale === 'en') return day + ' ' + monthName + ' ' + year;
  return formatHebrewNumber(day) + ' ב' + monthName + ' ' + formatHebrewYear(year);
}
