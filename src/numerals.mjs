/**
 * Hebrew numerals in traditional additive alphabetic notation.
 *
 * Uses geresh (U+05F3) for single letters and gershayim (U+05F4)
 * before the last letter in multi-letter groups, with ט״ו and ט״ז.
 */
const GERESH = '׳';
const GERSHAYIM = '״';
const UNITS = ['', 'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט'];
const TENS = ['', 'י', 'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ'];
const HUNDREDS = ['', 'ק', 'ר', 'ש'];

function assertNumber(value, name) {
  if (!Number.isSafeInteger(value) || value < 1 || value > 999_999) {
    throw new RangeError(`${name} must be a positive safe integer between 1 and 999999`);
  }
}

function decorate(letters) {
  if (letters.length === 1) return letters + GERESH;
  return letters.slice(0, -1) + GERSHAYIM + letters.slice(-1);
}

function formatGroup(value) {
  if (!Number.isInteger(value) || value < 1 || value > 999) {
    throw new RangeError('Hebrew numeral group must be an integer from 1 to 999');
  }
  let remaining = value;
  let letters = '';
  while (remaining >= 400) {
    letters += 'ת';
    remaining -= 400;
  }
  const hundreds = Math.floor(remaining / 100);
  letters += HUNDREDS[hundreds];
  remaining %= 100;
  if (remaining === 15) {
    letters += 'טו';
  } else if (remaining === 16) {
    letters += 'טז';
  } else {
    letters += TENS[Math.floor(remaining / 10)];
    letters += UNITS[remaining % 10];
  }
  return decorate(letters);
}

/**
 * Formats a positive integer using Hebrew numerals, including thousands.
 * Thousands use a geresh with no whitespace before the remaining group:
 * 5787 -> ה׳תשפ״ז; 5000 -> ה׳.
 *
 * @param {number} number Integer from 1 to 999999.
 * @returns {string} Number written with Hebrew letters and punctuation.
 * @throws {RangeError} On an invalid or out-of-range value.
 */
export function formatHebrewNumber(number) {
  assertNumber(number, 'number');
  const thousands = Math.floor(number / 1000);
  const remainder = number % 1000;
  if (thousands === 0) return formatGroup(remainder);
  const prefix = formatGroup(thousands);
  return remainder === 0 ? prefix : prefix + formatGroup(remainder);
}

/**
 * Formats a Hebrew year in customary abbreviated notation.
 * Years 5001–5999 omit the millennium (5787 -> תשפ״ז).
 * Exact millennial years and other years remain in full notation.
 *
 * @param {number} year Positive integer from 1 to 999999.
 * @returns {string} Hebrew calendar year written with Hebrew numerals.
 * @throws {RangeError} On an invalid or out-of-range value.
 */
export function formatHebrewYear(year) {
  assertNumber(year, 'year');
  return year > 5000 && year < 6000
    ? formatGroup(year - 5000)
    : formatHebrewNumber(year);
}
