/**
 * Calendar-date-only conversions between proleptic Gregorian and Hebrew dates.
 *
 * No JavaScript Date objects, timestamps, time zones or sunset assumptions:
 * both functions operate on whole civil calendar days using the common
 * absolute-day epoch (Gregorian 0001-01-01 = day 1).
 *
 * Hebrew months are Nisan=1 through Elul=6, Tishrei=7 ... Adar/Adar I=12;
 * Adar II is month 13 and only exists in leap years.
 */
import {
  absoluteToGregorian,
  absoluteToHebrew,
  gregorianToAbsolute,
  hebrewToAbsolute,
} from './calendar-core.js';

/**
 * Convert a Gregorian civil date into the corresponding Hebrew civil date.
 *
 * Both arguments and return values use numeric `{year, month, day}` fields.
 * For Gregorian dates, `month` is January=1 through December=12. Input is
 * validated by the calendar core; invalid dates throw TypeError/RangeError.
 * This function does not apply local time, UTC offsets, or sunset rules.
 *
 * @param {{year:number,month:number,day:number}} date Gregorian date in years 1..9999.
 * @returns {{year:number,month:number,day:number}} Hebrew date (Nisan=1).
 */
export function toHebrew(date) {
  return absoluteToHebrew(gregorianToAbsolute(date));
}

/**
 * Convert a Hebrew civil date into the corresponding Gregorian civil date.
 *
 * Hebrew month numbering is Nisan=1, Iyar=2, ... Elul=6, Tishrei=7,
 * Cheshvan=8, Kislev=9, Tevet=10, Shevat=11, Adar/Adar I=12,
 * and Adar II=13 in leap years. A day/month/year that does not exist throws.
 * The converted Gregorian result must be in years 1..9999; otherwise an
 * out-of-range error is raised. The conversion is timezone-independent.
 *
 * @param {{year:number,month:number,day:number}} date Hebrew date (Nisan=1).
 * @returns {{year:number,month:number,day:number}} Gregorian date.
 */
export function toGregorian(date) {
  return absoluteToGregorian(hebrewToAbsolute(date));
}
