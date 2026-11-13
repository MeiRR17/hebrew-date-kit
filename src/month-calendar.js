/**
 * Structured Hebrew month grids for calendar user interfaces.
 *
 * The output consists of 4–6 complete seven-cell weeks. Days outside
 * the requested Hebrew month are null (not adjacent-month placeholders).
 * All date calculations are timezone-free integer calendar arithmetic.
 */
import {
  absoluteToGregorian, hebrewMonthLength, hebrewToAbsolute,
} from './calendar-core.js';
import { getHebrewMonthName } from './format.js';
import { getJewishHolidays } from './holidays.js';

/**
 * Build a Hebrew month grid with corresponding Gregorian dates and holiday
 * overlays, suitable for rendering a calendar or exporting structured data.
 *
 * Hebrew months are numbered Nisan=1 through Elul=6, Tishrei=7 ... Adar=12,
 * and Adar II=13 in leap years. Weekdays use Sunday=0 through Saturday=6.
 * "region" must be "israel" or "diaspora"; "locale" is "en" (default) or
 * "he", and "weekStartsOn" is a weekday number 0..6 (default Sunday=0).
 *
 * The result has {year,month,monthName,region,locale,weekStartsOn,daysInMonth,
 * weeks}. Each week is a seven-cell array of either null or
 * {hebrewDate,gregorianDate,weekday,holidays}. Each holiday is a compact
 * {id,name,type,dayOfFestival?} object; distinct observances that share a
 * civil day are all retained in their original chronological event order.
 *
 * Like getJewishHolidays, the entire Hebrew year must be representable
 * in Gregorian years 1–9999. No local-sunset or time-of-day interpretation.
 *
 * @param {number} year Hebrew calendar year.
 * @param {number} month Month using Nisan=1 numbering.
 * @param {{region:'israel'|'diaspora',locale?:'en'|'he',weekStartsOn?:number}} options Grid settings.
 * @returns {{year:number,month:number,monthName:string,region:string,locale:string,weekStartsOn:number,daysInMonth:number,weeks:Array<Array<object|null>>}} Month grid.
 * @throws {TypeError|RangeError} Invalid year/month/options or unsupported year range.
 */
export function getHebrewMonthCalendar(year, month, options) {
  if (options === null || typeof options !== 'object' || Array.isArray(options)) {
    throw new TypeError('options must be an object with region');
  }
  const { region, locale = 'en', weekStartsOn = 0 } = options;
  if (region !== 'israel' && region !== 'diaspora') {
    throw new RangeError('region must be israel or diaspora');
  }
  if (locale !== 'en' && locale !== 'he') {
    throw new RangeError('locale must be en or he');
  }
  if (!Number.isSafeInteger(weekStartsOn) || weekStartsOn < 0 || weekStartsOn > 6) {
    throw new RangeError('weekStartsOn must be a weekday integer from 0 to 6');
  }

  const daysInMonth = hebrewMonthLength(year, month);
  const firstAbsolute = hebrewToAbsolute({ year, month, day: 1 });
  // The holiday API validates that the entire Hebrew year is in the
  // supported proleptic Gregorian range (years 1–9999).
  const events = getJewishHolidays(year, {region, locale});
  const byDay = new Map();
  for (const {absoluteDay, id, name, type, dayOfFestival} of events) {
    if (absoluteDay < firstAbsolute || absoluteDay >= firstAbsolute + daysInMonth) continue;
    if (!byDay.has(absoluteDay)) byDay.set(absoluteDay, []);
    const holiday = {id, name, type};
    if (dayOfFestival !== undefined) holiday.dayOfFestival = dayOfFestival;
    byDay.get(absoluteDay).push(holiday);
  }

  // Gregorian absolute day 1 is Monday; modulo 7 yields Sunday=0.
  const weekdayOfFirst = ((firstAbsolute % 7) + 7) % 7;
  const leading = (weekdayOfFirst - weekStartsOn + 7) % 7;
  const cells = Math.ceil((leading + daysInMonth) / 7) * 7;
  const weeks = [];

  for (let index = 0; index < cells; index += 7) {
    const week = [];
    for (let column = 0; column < 7; column += 1) {
      const position = index + column;
      const day = position - leading + 1;
      if (day < 1 || day > daysInMonth) {
        week.push(null);
        continue;
      }
      const absolute = firstAbsolute + day - 1;
      week.push({
        hebrewDate: {year, month, day},
        gregorianDate: absoluteToGregorian(absolute),
        weekday: (weekStartsOn + column) % 7,
        holidays: byDay.get(absolute) ?? [],
      });
    }
    weeks.push(week);
  }

  return {
    year, month,
    monthName: getHebrewMonthName(year, month, {locale}),
    region, locale, weekStartsOn, daysInMonth, weeks,
  };
}
