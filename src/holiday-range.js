/**
 * Query selected traditional observances over a bounded Gregorian civil-date
 * interval. This remains an untimed civil calendar API; no location, sunset,
 * weekday clock or time zone is inferred.
 *
 * Results come from the canonical yearly holiday source, preserving distinct
 * observances that share a day and regional/localized festival details.
 */
import {absoluteToHebrew, gregorianToAbsolute} from './calendar-core.js';
import {getJewishHolidays} from './holidays.js';

const ALLOWED_TYPES = new Set(['yom_tov', 'chol_hamoed', 'fast', 'observance']);
const MAX_RANGE_DAYS = 5 * 366;

/**
 * Get traditional holidays whose civil date is between two Gregorian dates,
 * including both endpoints. Crossing a Hebrew year boundary is supported.
 *
 * The selected year must be wholly representable in Gregorian years 1–9999,
 * as required by getJewishHolidays. A request spanning at most 1830 civil
 * days is supported; larger ranges throw rather than generating unbounded
 * yearly lists. This returns all matching events, not only unique dates.
 *
 * @param {{year:number, month:number, day:number}} start Gregorian start date.
 * @param {{year:number, month:number, day:number}} end Gregorian end date.
 * @param {{region:'israel'|'diaspora', locale?:'en'|'he', types?:string[]}} options
 *   Required region, optional locale, optional nonempty array of allowed
 *   event types: yom_tov, chol_hamoed, fast, observance.
 * @returns {Array<object>} Chronological event objects matching getJewishHolidays.
 * @throws {TypeError|RangeError} Invalid input or unsupported range.
 */
export function getJewishHolidaysInRange(start, end, options) {
  // Validate both real Gregorian dates before checking ordering or options.
  const firstDay = gregorianToAbsolute(start);
  const lastDay = gregorianToAbsolute(end);
  if (firstDay > lastDay) {
    throw new RangeError('start Gregorian date must not be after end');
  }
  if (lastDay - firstDay + 1 > MAX_RANGE_DAYS) {
    throw new RangeError('range must be at most 1830 inclusive civil days');
  }

  if (options === null || typeof options !== 'object' || Array.isArray(options)) {
    throw new TypeError('options must be an object containing region');
  }
  const {region, locale = 'en', types} = options;
  if (region !== 'israel' && region !== 'diaspora') {
    throw new RangeError('region must be israel or diaspora');
  }
  if (locale !== 'en' && locale !== 'he') {
    throw new RangeError('locale must be en or he');
  }

  let allowed = null;
  if (types !== undefined) {
    if (!Array.isArray(types) || types.length === 0
        || types.some(type => typeof type !== 'string' || !ALLOWED_TYPES.has(type))
        || new Set(types).size !== types.length) {
      throw new RangeError(
        'types must be a nonempty array of distinct yom_tov, chol_hamoed, fast, observance'
      );
    }
    allowed = new Set(types);
  }

  const firstYear = absoluteToHebrew(firstDay).year;
  const lastYear = absoluteToHebrew(lastDay).year;
  const matches = [];

  // Annual events are already sorted by civil day. Hebrew years advance in
  // the same absolute-day order; no locale-dependent sorting is needed.
  for (let year = firstYear; year <= lastYear; year += 1) {
    for (const event of getJewishHolidays(year, {region, locale})) {
      if (event.absoluteDay >= firstDay && event.absoluteDay <= lastDay
          && (allowed === null || allowed.has(event.type))) {
        matches.push(event);
      }
    }
  }
  return matches;
}
