/**
 * RFC 5545 iCalendar export for traditional Jewish observances.
 *
 * Events are all-day Gregorian *civil* dates, not sunset-based events or
 * halachic start/end times. No recurrence rules, external dependencies,
 * or timezone interpretation are needed for DATE-valued DTSTART.
 */
import {getJewishHolidays} from './holidays.js';
import {getJewishHolidaysInRange} from './holiday-range.js';
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
 * Shared RFC 5545 serializer for either a Hebrew year or a civil-date subset.
 * The UID intentionally depends on the source event, absolute day and region,
 * not on the chosen export range, so importing overlapping exports deduplicates.
 */
function serializeHolidayEvents(events, {region, locale, dtstamp, label}) {
  const stamp = dtstamp === undefined ? utcTimestamp(new Date()) : validateStamp(dtstamp);
  const regionLabel = locale === 'he'
    ? (region === 'israel' ? 'ישראל' : 'תפוצות')
    : (region === 'israel' ? 'Israel' : 'Diaspora');
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//MeiRR17//hebrew-date-kit//EN',
    'CALSCALE:GREGORIAN',
    'X-WR-CALNAME:' + escapeText(label),
  ];
  for (const event of events) {
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

/**
 * Export one Hebrew year's traditional observances as RFC 5545 all-day
 * civil-date VEVENTs. This retains the original yearly API and UID scheme.
 * A fixed UTC dtstamp supports reproducible exports.
 */
export function exportJewishHolidaysIcs(hebrewYear, options) {
  if (options === null || typeof options !== 'object' || Array.isArray(options)) {
    throw new TypeError('options must be an object with region');
  }
  const {region, locale = 'en', dtstamp} = options;
  const events = getJewishHolidays(hebrewYear, {region, locale});
  const label = locale === 'he'
    ? 'מועדים ' + hebrewYear + ' (' + (region === 'israel' ? 'ישראל' : 'תפוצות') + ')'
    : 'Jewish Holidays ' + hebrewYear + ' (' + (region === 'israel' ? 'Israel' : 'Diaspora') + ')';
  return serializeHolidayEvents(events, {region, locale, dtstamp, label});
}

/**
 * Export only matching traditional observances within an INCLUSIVE Gregorian
 * civil-date range, crossing Hebrew years when needed. Optional types select
 * source event categories; multiple events on one day remain separate.
 *
 * Uses the same event UIDs, escaping, UTF-8 folding and all-day DATE semantics
 * as the yearly export, without local time zones or sunset calculation.
 * Range validation, regional calendars and the 1830-day cap are inherited
 * from getJewishHolidaysInRange.
 *
 * @param {{year:number,month:number,day:number}} start Gregorian date.
 * @param {{year:number,month:number,day:number}} end Gregorian date.
 * @param {{region:'israel'|'diaspora',locale?:'en'|'he',types?:string[],dtstamp?:string}} options
 * @returns {string} UTF-8 iCalendar text with CRLF line endings.
 */
export function exportJewishHolidaysInRangeIcs(start, end, options) {
  if (options === null || typeof options !== 'object' || Array.isArray(options)) {
    throw new TypeError('options must be an object with region');
  }
  const {region, locale = 'en', types, dtstamp} = options;
  const events = getJewishHolidaysInRange(start, end, {region, locale, types});
  const label = locale === 'he'
    ? 'מועדים ' + icsDate(start) + '–' + icsDate(end) +
      ' (' + (region === 'israel' ? 'ישראל' : 'תפוצות') + ')'
    : 'Jewish Holidays ' + icsDate(start) + '-' + icsDate(end) +
      ' (' + (region === 'israel' ? 'Israel' : 'Diaspora') + ')';
  return serializeHolidayEvents(events, {region, locale, dtstamp, label});
}
