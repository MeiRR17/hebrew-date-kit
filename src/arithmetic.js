/**
 * Civil-day arithmetic for Hebrew calendar dates.
 *
 * Hebrew month numbering: Nisan=1 ... Elul=6, Tishrei=7, Adar II=13
 * in leap years. All calculations are on integer Rata Die days: no Date
 * objects, time zones, local times, or sunset interpretation.
 */
import { absoluteToHebrew, hebrewToAbsolute } from './calendar-core.js';

/**
 * Shift a validated Hebrew date by a signed number of civil days.
 * The output is a new {year, month, day} record (Nisan=1), with the
 * Gregorian-independent Hebrew year range 1..20000 enforced by the core.
 * A zero shift still creates a new object; input objects are not mutated.
 *
 * @param {{year:number,month:number,day:number}} date Hebrew civil date.
 * @param {number} days Safe signed integer number of civil days; 0 permitted.
 * @returns {{year:number,month:number,day:number}} Shifted Hebrew date.
 * @throws {TypeError|RangeError} Invalid input or date outside supported years.
 */
export function addHebrewDays(date, days) {
  const start = hebrewToAbsolute(date);
  if (!Number.isSafeInteger(days)) {
    throw new RangeError('days must be a safe signed integer');
  }
  const target = start + days;
  if (!Number.isSafeInteger(target)) {
    throw new RangeError('resulting absolute day is outside the safe integer range');
  }
  return absoluteToHebrew(target);
}

/**
 * Count signed civil days from start to end (end minus start).
 * The result is zero for the same date, positive if end is later,
 * and negative if end is earlier. Both dates are validated.
 *
 * @param {{year:number,month:number,day:number}} start Hebrew civil date.
 * @param {{year:number,month:number,day:number}} end Hebrew civil date.
 * @returns {number} Signed integer number of days (end - start).
 * @throws {TypeError|RangeError} Invalid date.
 */
export function daysBetweenHebrewDates(start, end) {
  return hebrewToAbsolute(end) - hebrewToAbsolute(start);
}

/**
 * Return the weekday for a validated Hebrew civil date.
 * Convention: Sunday=0, Monday=1, ... Saturday/Shabbat=6.
 * Rata Die day 1 was Monday. Normalize negative absolute days so
 * dates in ancient Hebrew years still produce weekday indices 0..6.
 *
 * @param {{year:number,month:number,day:number}} date Hebrew civil date.
 * @returns {number} Weekday, integer 0 (Sunday) to 6 (Saturday).
 * @throws {TypeError|RangeError} Invalid date.
 */
export function getHebrewWeekday(date) {
  const absolute = hebrewToAbsolute(date);
  return ((absolute % 7) + 7) % 7;
}
