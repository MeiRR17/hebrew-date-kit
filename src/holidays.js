/**
 * Traditional Jewish holidays and observances by Hebrew year and region.
 * Civil dates only: no sunset, timezone or timestamps.
 * Hebrew months: Nisan=1, Elul=6, Tishrei=7, Adar II=13 in leap years.
 * Modern state-designated holidays are intentionally out of scope.
 */
import {
  absoluteToGregorian,
  absoluteToHebrew,
  gregorianToAbsolute,
  hebrewToAbsolute,
  isHebrewLeapYear,
} from './calendar-core.js';

const LAST_GREGORIAN_DAY = gregorianToAbsolute({year: 9999, month: 12, day: 31});
const SATURDAY = 6; // Absolute day 1 = Monday, therefore Saturday is remainder 6.

/**
 * Return a chronologically sorted collection of Jewish holidays.
 *
 * Each event has {id, name, type, hebrewDate, gregorianDate, absoluteDay},
 * optionally dayOfFestival. Types are yom_tov, chol_hamoed, fast, observance.
 * Different observances on the same date are retained; duplicate event IDs
 * on the same absolute day are eliminated. All dates must be representable
 * in the proleptic Gregorian calendar years 1 through 9999.
 *
 * @param {number} hebrewYear Hebrew calendar year, integer, wholly representable in Gregorian years 1..9999.
 * @param {{region:'israel'|'diaspora'}} options Required region selector.
 * @returns {Array<{id:string,name:string,type:string,hebrewDate:object,gregorianDate:object,absoluteDay:number,dayOfFestival?:number}>} Events sorted by absolute day.
 * @throws {TypeError|RangeError} Invalid input or unsupported calendar range.
 */
export function getJewishHolidays(hebrewYear, options) {
  if (options === null || typeof options !== 'object' || Array.isArray(options)) {
    throw new TypeError('options must be an object containing region');
  }
  const {region} = options;
  if (region !== 'israel' && region !== 'diaspora') {
    throw new RangeError('region must be either israel or diaspora');
  }
  if (!Number.isSafeInteger(hebrewYear) || hebrewYear < 1 || hebrewYear > 20000) {
    throw new RangeError('hebrewYear must be an integer between 1 and 20000');
  }
  const firstDay = hebrewToAbsolute({year: hebrewYear, month: 7, day: 1});
  const lastDay = hebrewToAbsolute({year: hebrewYear, month: 6, day: 29});
  if (firstDay < 1 || lastDay > LAST_GREGORIAN_DAY) {
    throw new RangeError('The entire Hebrew year must fall within Gregorian years 1..9999');
  }

  const diaspora = region === 'diaspora';
  const events = [];
  const seen = new Set();
  function addAbsolute(absoluteDay, id, name, type, dayOfFestival) {
    const key = id + "@" + absoluteDay;
    if (seen.has(key)) return;
    seen.add(key);
    const event = {
      id, name, type,
      hebrewDate: absoluteToHebrew(absoluteDay),
      gregorianDate: absoluteToGregorian(absoluteDay),
      absoluteDay,
    };
    if (dayOfFestival !== undefined) event.dayOfFestival = dayOfFestival;
    events.push(event);
  }
  function add(month, day, id, name, type, dayOfFestival) {
    addAbsolute(hebrewToAbsolute({year: hebrewYear, month, day}),
      id, name, type, dayOfFestival);
  }
  function fast(month, day, id, name, moveEarlier = false) {
    let absoluteDay = hebrewToAbsolute({year: hebrewYear, month, day});
    if (absoluteDay % 7 === SATURDAY) absoluteDay += moveEarlier ? -2 : 1;
    addAbsolute(absoluteDay, id, name, 'fast');
  }

  // Tishrei.
  for (let day = 1; day <= 2; day += 1) {
    add(7, day, 'rosh_hashanah', 'Rosh Hashanah', 'yom_tov', day);
  }
  fast(7, 3, 'fast_of_gedaliah', 'Fast of Gedaliah');
  add(7, 10, 'yom_kippur', 'Yom Kippur', 'yom_tov');
  for (let day = 15; day <= 21; day += 1) {
    const yomTov = day === 15 || (diaspora && day === 16);
    add(7, day, 'sukkot', yomTov ? 'Sukkot' : 'Sukkot Chol HaMoed',
      yomTov ? 'yom_tov' : 'chol_hamoed', day - 14);
  }
  add(7, 21, 'hoshana_rabbah', 'Hoshana Rabbah', 'observance');
  add(7, 22, 'shemini_atzeret', 'Shemini Atzeret', 'yom_tov');
  add(7, diaspora ? 23 : 22, 'simchat_torah', 'Simchat Torah', 'yom_tov');

  // Hanukkah crosses Kislev/Tevet in years with 29- or 30-day Kislev.
  const hanukkahStart = hebrewToAbsolute({year: hebrewYear, month: 9, day: 25});
  for (let offset = 0; offset < 8; offset += 1) {
    addAbsolute(hanukkahStart + offset, 'hanukkah', 'Hanukkah',
      'observance', offset + 1);
  }
  add(10, 10, 'tenth_of_tevet', 'Tenth of Tevet', 'fast');
  add(11, 15, 'tu_bishvat', 'Tu BiShvat', 'observance');

  // Purim in Adar II in leap years; Fast of Esther is advanced to
  // Thursday (11 Adar) if the nominal 13 Adar falls on Shabbat.
  const purimMonth = isHebrewLeapYear(hebrewYear) ? 13 : 12;
  if (purimMonth === 13) {
    add(12, 14, 'purim_katan', 'Purim Katan', 'observance');
    add(12, 15, 'shushan_purim_katan', 'Shushan Purim Katan', 'observance');
  }
  fast(purimMonth, 13, 'fast_of_esther', 'Fast of Esther', true);
  add(purimMonth, 14, 'purim', 'Purim', 'observance');
  add(purimMonth, 15, 'shushan_purim', 'Shushan Purim', 'observance');

  // Pesach 7 days in Israel, 8 days in diaspora. Yom Tov days are
  // 15 and 21 Nisan in Israel; plus 16 and 22 in diaspora.
  for (let day = 15; day <= (diaspora ? 22 : 21); day += 1) {
    const yomTov = day === 15 || day === 21 || (diaspora && (day === 16 || day === 22));
    add(1, day, 'pesach', yomTov ? 'Pesach' : 'Pesach Chol HaMoed',
      yomTov ? 'yom_tov' : 'chol_hamoed', day - 14);
  }
  add(2, 14, 'pesach_sheni', 'Pesach Sheni', 'observance');
  add(2, 18, 'lag_baomer', 'Lag BaOmer', 'observance');
  add(3, 6, 'shavuot', 'Shavuot', 'yom_tov', 1);
  if (diaspora) add(3, 7, 'shavuot', 'Shavuot', 'yom_tov', 2);
  // Minor fasts are postponed from Shabbat to Sunday, except 10 Tevet.
  fast(4, 17, 'seventeenth_of_tammuz', 'Seventeenth of Tammuz');
  fast(5, 9, 'tisha_bav', "Tisha B'Av");
  add(5, 15, 'tu_bav', "Tu B'Av", 'observance');

  events.sort((a, b) => a.absoluteDay - b.absoluteDay || a.id.localeCompare(b.id, 'en'));
  return events;
}
