/**
 * Integer, timezone-independent Gregorian and fixed Hebrew calendar arithmetic.
 *
 * Absolute day (Rata Die) 1 is Gregorian 0001-01-01 in the proleptic
 * Gregorian calendar. Hebrew dates use month numbering Nisan=1 ...
 * Elul=6, Tishrei=7 ... Adar/Adar I=12, Adar II=13 (leap years only).
 * All civil dates here refer to whole days, not sunset or local time.
 *
 * Hebrew molad/postponement rules follow the integer arithmetic described
 * by Dershowitz and Reingold, Calendrical Calculations. The Hebrew epoch
 * is absolute day -1373427.
 */
const HEBREW_EPOCH = -1373427;
const MAX_GREGORIAN_YEAR = 9999;
// Covers every proleptic Gregorian year through 9999 and ancient Hebrew years.
const MAX_HEBREW_YEAR = 20000;
const MIN_HEBREW_ABSOLUTE = HEBREW_EPOCH;

function requireInteger(value, label, minimum, maximum) {
  if (!Number.isSafeInteger(value) || value < minimum || value > maximum) {
    throw new RangeError(label + ' must be an integer between ' + minimum + ' and ' + maximum);
  }
}

function checkGregorianYear(year) {
  requireInteger(year, 'Gregorian year', 1, MAX_GREGORIAN_YEAR);
}

function checkHebrewYear(year) {
  requireInteger(year, 'Hebrew year', 1, MAX_HEBREW_YEAR);
}

/**
 * Whether the specified proleptic Gregorian calendar year has February 29.
 * @param {number} year Gregorian year in [1, 9999].
 * @returns {boolean} True if leap.
 */
export function isGregorianLeapYear(year) {
  checkGregorianYear(year);
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

/**
 * Number of civil days in a Gregorian month.
 * @param {number} year Gregorian year in [1, 9999].
 * @param {number} month Month numbered 1 through 12.
 * @returns {number} Month length in days.
 */
export function gregorianMonthLength(year, month) {
  checkGregorianYear(year);
  requireInteger(month, 'Gregorian month', 1, 12);
  if (month === 2) return isGregorianLeapYear(year) ? 29 : 28;
  return [4, 6, 9, 11].includes(month) ? 30 : 31;
}

/**
 * Convert a validated Gregorian civil date to an absolute day number.
 * @param {{year:number,month:number,day:number}} date Proleptic Gregorian date.
 * @returns {number} Absolute day, with 0001-01-01 = 1.
 */
export function gregorianToAbsolute(date) {
  if (date === null || typeof date !== 'object' || Array.isArray(date)) {
    throw new TypeError('Gregorian date must be a date object');
  }
  const {year, month, day} = date;
  checkGregorianYear(year);
  requireInteger(month, 'Gregorian month', 1, 12);
  requireInteger(day, 'Gregorian day', 1, gregorianMonthLength(year, month));
  const years = year - 1;
  const yearDays = 365 * years + Math.floor(years / 4)
    - Math.floor(years / 100) + Math.floor(years / 400);
  const precedingMonths = Math.floor((367 * month - 362) / 12)
    + (month <= 2 ? 0 : isGregorianLeapYear(year) ? -1 : -2);
  return yearDays + precedingMonths + day;
}

/**
 * Convert an absolute day number to a Gregorian civil date.
 * @param {number} absoluteDay Absolute integer day in the years 1..9999 CE.
 * @returns {{year:number,month:number,day:number}} Gregorian date.
 */
export function absoluteToGregorian(absoluteDay) {
  requireInteger(absoluteDay, 'Absolute Gregorian day', 1,
    gregorianToAbsolute({year: MAX_GREGORIAN_YEAR, month: 12, day: 31}));
  let lo = 1;
  let hi = MAX_GREGORIAN_YEAR;
  while (lo < hi) {
    const mid = Math.floor((lo + hi + 1) / 2);
    if (gregorianToAbsolute({year: mid, month: 1, day: 1}) <= absoluteDay) {
      lo = mid;
    } else {
      hi = mid - 1;
    }
  }
  const year = lo;
  let month = 1;
  while (month < 12 &&
         gregorianToAbsolute({year, month: month + 1, day: 1}) <= absoluteDay) {
    month += 1;
  }
  return {year, month, day: 1 + absoluteDay - gregorianToAbsolute({year, month, day: 1})};
}

/**
 * True if a Hebrew year has a second Adar (13 total lunar months).
 * @param {number} year Hebrew year in [1, 20000].
 * @returns {boolean} Whether the year is leap.
 */
export function isHebrewLeapYear(year) {
  checkHebrewYear(year);
  return (7 * year + 1) % 19 < 7;
}

/**
 * Number of Hebrew months in a year (12 or 13).
 * @param {number} year Hebrew year in [1, 20000].
 * @returns {number} 12 or 13.
 */
export function hebrewMonthsInYear(year) {
  return isHebrewLeapYear(year) ? 13 : 12;
}

// First molad/postponement stage (molad zaken and Lo ADU Rosh).
function delayOne(year) {
  const months = Math.floor((235 * year - 234) / 19);
  const parts = 12084 + 13753 * months;
  let day = 29 * months + Math.floor(parts / 25920);
  if ((3 * (day + 1)) % 7 < 3) day += 1;
  return day;
}

// GaTaRaD / BeTUtaKPaT year-length adjustment.
function delayTwo(year) {
  const previous = delayOne(year - 1);
  const current = delayOne(year);
  const next = delayOne(year + 1);
  if (next - current === 356) return 2;
  if (current - previous === 382) return 1;
  return 0;
}

/**
 * Absolute civil day of 1 Tishrei in a Hebrew year, after postponements.
 * @param {number} year Hebrew year in [1, 20000].
 * @returns {number} Absolute day; can be negative for ancient Hebrew years.
 */
export function roshHashanahAbsolute(year) {
  checkHebrewYear(year);
  return HEBREW_EPOCH + delayOne(year) + delayTwo(year);
}

/**
 * Number of days in a Hebrew calendar year: 353–355 or 383–385.
 * @param {number} year Hebrew year in [1, 20000].
 * @returns {number} Calendar year length.
 */
export function hebrewYearLength(year) {
  checkHebrewYear(year);
  // The next year's molad may be calculated internally beyond MAX_HEBREW_YEAR.
  return HEBREW_EPOCH + delayOne(year + 1) + delayTwo(year + 1)
    - roshHashanahAbsolute(year);
}

/**
 * Whether Cheshvan has 30 days in the given Hebrew year.
 * @param {number} year Hebrew year in [1, 20000].
 * @returns {boolean} True in complete years.
 */
export function isLongCheshvan(year) {
  return hebrewYearLength(year) % 10 === 5;
}

/**
 * Whether Kislev has 29 days in the given Hebrew year.
 * @param {number} year Hebrew year in [1, 20000].
 * @returns {boolean} True in deficient years.
 */
export function isShortKislev(year) {
  return hebrewYearLength(year) % 10 === 3;
}

/**
 * Number of civil days in a Hebrew month, using Nisan=1 numbering.
 * @param {number} year Hebrew year in [1, 20000].
 * @param {number} month Nisan=1 through Adar II=13 (only in leap years).
 * @returns {number} 29 or 30.
 */
export function hebrewMonthLength(year, month) {
  const last = hebrewMonthsInYear(year);
  requireInteger(month, 'Hebrew month', 1, last);
  if ([2, 4, 6, 10, 13].includes(month) ||
      (month === 12 && last === 12) ||
      (month === 8 && !isLongCheshvan(year)) ||
      (month === 9 && isShortKislev(year))) {
    return 29;
  }
  return 30;
}

/**
 * Convert a validated Hebrew date to absolute day (Rata Die).
 * @param {{year:number,month:number,day:number}} date Hebrew date, Nisan=1.
 * @returns {number} Absolute day; 1 Tishrei uses the calculated new year.
 */
export function hebrewToAbsolute(date) {
  if (date === null || typeof date !== 'object' || Array.isArray(date)) {
    throw new TypeError('Hebrew date must be a date object');
  }
  const {year, month, day} = date;
  const last = hebrewMonthsInYear(year);
  requireInteger(month, 'Hebrew month', 1, last);
  requireInteger(day, 'Hebrew day', 1, hebrewMonthLength(year, month));
  let absoluteDay = roshHashanahAbsolute(year) + day - 1;
  if (month < 7) {
    for (let m = 7; m <= last; m += 1) absoluteDay += hebrewMonthLength(year, m);
    for (let m = 1; m < month; m += 1) absoluteDay += hebrewMonthLength(year, m);
  } else {
    for (let m = 7; m < month; m += 1) absoluteDay += hebrewMonthLength(year, m);
  }
  return absoluteDay;
}

/**
 * Convert an absolute civil day to a Hebrew date with Nisan=1 numbering.
 * @param {number} absoluteDay Integer at/after 1 Tishrei year 1 and before year 20001.
 * @returns {{year:number,month:number,day:number}} Hebrew calendar date.
 */
export function absoluteToHebrew(absoluteDay) {
  const end = HEBREW_EPOCH + delayOne(MAX_HEBREW_YEAR + 1) + delayTwo(MAX_HEBREW_YEAR + 1) - 1;
  requireInteger(absoluteDay, 'Absolute Hebrew day', MIN_HEBREW_ABSOLUTE, end);
  let lo = 1;
  let hi = MAX_HEBREW_YEAR;
  while (lo < hi) {
    const mid = Math.floor((lo + hi + 1) / 2);
    if (roshHashanahAbsolute(mid) <= absoluteDay) lo = mid;
    else hi = mid - 1;
  }
  const year = lo;
  const last = hebrewMonthsInYear(year);
  let firstDay = roshHashanahAbsolute(year);
  for (const month of [...Array.from({length: last - 6}, (_, i) => i + 7),
                       ...Array.from({length: 6}, (_, i) => i + 1)]) {
    const length = hebrewMonthLength(year, month);
    if (absoluteDay < firstDay + length) {
      return {year, month, day: absoluteDay - firstDay + 1};
    }
    firstDay += length;
  }
  throw new RangeError('Absolute day did not map to a Hebrew month');
}
