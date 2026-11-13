/**
 * RFC 5545 iCalendar export for traditional Jewish observances.
 *
 * Events are all-day Gregorian *civil* dates, not sunset-based events or
 * halachic start/end times. No recurrence rules, external dependencies,
 * or timezone interpretation are needed for DATE-valued DTSTART.
 */
import {getJewishHolidays} from './holidays.js';
import {formatHebrewDate} from './format.js';

const encoder = new TextEncoder();

function escapeText(value) {
  return value.replace(/\\/g, '\\\\').replace(/\r\n|\n|\r/g, '\\n')
    .replace(/;/g, '\\;').replace(/,/g, '\\,');
}

// Fold at Unicode code-point boundaries, counting *UTF-8 octets*, not
// JavaScript UTF-16 code units. A continuation space counts toward 75.
function foldLine(line) {
  const pieces = [];
  let part = '';
  let bytes = 0;
  for (const character of line) {
    const size = encoder.encode(character).length;
    if (bytes + size > 75) {
      pieces.push(part);
      part = ' ';
      bytes = 1;
    }
    part += character;
    bytes += size;
  }
  pieces.push(part);
  return pieces.join('\r\n');
}

function utcTimestamp(date) {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

function validateStamp(stamp) {
  if (typeof stamp !== 'string' || !/^\d{8}T\d{6}Z$/.test(stamp)) {
    throw new RangeError('dtstamp must be an RFC 5545 UTC timestamp YYYYMMDDTHHMMSSZ');
  }
  const iso = stamp.slice(0, 4) + '-' + stamp.slice(4, 6) + '-' +
    stamp.slice(6, 8) + 'T' + stamp.slice(9, 11) + ':' +
    stamp.slice(11, 13) + ':' + stamp.slice(13, 15) + 'Z';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime()) || utcTimestamp(date) !== stamp) {
    throw new RangeError('dtstamp must be a real UTC date and time');
  }
  return stamp;
}

function icsDate({year, month, day}) {
  return String(year).padStart(4, '0') +
    String(month).padStart(2, '0') +
    String(day).padStart(2, '0');
}

/**
 * Export all listed traditional Jewish holidays for one Hebrew year
 * as an RFC 5545 iCalendar VCALENDAR with individual all-day VEVENTs.
 *
 * Each VEVENT contains UID, DTSTAMP, DTSTART;VALUE=DATE, SUMMARY,
 * DESCRIPTION, and TRANSP:TRANSPARENT. DTSTART is the Gregorian civil
 * day corresponding to the observed Hebrew date; a missing DTEND means
 * an all-day duration of exactly one civil day (RFC 5545).
 *
 * Holiday/event IDs remain distinct on overlapping dates. UID values are
 * stable across exports for a given event and region. The default DTSTAMP
 * uses the current UTC time *for calendar metadata only*; pass a fixed
 * {dtstamp:'20261113T000000Z'} to obtain reproducible byte-identical output.
 *
 * @param {number} hebrewYear Hebrew year within the Gregorian range supported by getJewishHolidays.
 * @param {{region:'israel'|'diaspora',locale?:'en'|'he',dtstamp?:string}} options Region, optional language and UTC creation/revision stamp.
 * @returns {string} UTF-8 iCalendar text with CRLF line endings, suitable for saving as an .ics file.
 * @throws {TypeError|RangeError} Invalid year, region, language or stamp.
 */
export function exportJewishHolidaysIcs(hebrewYear, options) {
  if (options === null || typeof options !== 'object' || Array.isArray(options)) {
    throw new TypeError('options must be an object with region');
  }
  const {region, locale = 'en', dtstamp} = options;
  // getJewishHolidays performs strict region, locale, year and range checks.
  const events = getJewishHolidays(hebrewYear, {region, locale});
  const stamp = dtstamp === undefined ? utcTimestamp(new Date()) : validateStamp(dtstamp);
  const label = locale === 'he'
    ? 'מועדים ' + hebrewYear + ' (' + (region === 'israel' ? 'ישראל' : 'תפוצות') + ')'
    : 'Jewish Holidays ' + hebrewYear + ' (' + (region === 'israel' ? 'Israel' : 'Diaspora') + ')';
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//MeiRR17//hebrew-date-kit//EN',
    'CALSCALE:GREGORIAN',
    'X-WR-CALNAME:' + escapeText(label),
  ];
  for (const event of events) {
    const regionLabel = locale === 'he'
      ? (region === 'israel' ? 'ישראל' : 'תפוצות')
      : (region === 'israel' ? 'Israel' : 'Diaspora');
    const description = (locale === 'he' ? 'תאריך עברי: ' : 'Hebrew date: ') +
      formatHebrewDate(event.hebrewDate, {locale}) + '\n' +
      (locale === 'he' ? 'אזור: ' : 'Region: ') + regionLabel + '\n' +
      (locale === 'he' ? 'סוג: ' : 'Type: ') + event.type;
    lines.push(
      'BEGIN:VEVENT',
      'UID:' + event.id + '-' + event.absoluteDay + '-' + region + '@MeiRR17.github.io',
      'DTSTAMP:' + stamp,
      'DTSTART;VALUE=DATE:' + icsDate(event.gregorianDate),
      'SUMMARY:' + escapeText(event.name),
      'DESCRIPTION:' + escapeText(description),
      'TRANSP:TRANSPARENT',
      'END:VEVENT',
    );
  }
  lines.push('END:VCALENDAR');
  return lines.map(foldLine).join('\r\n') + '\r\n';
}
