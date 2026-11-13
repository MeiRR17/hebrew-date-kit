# hebrew-date-kit

Hebrew calendar dates, traditional Jewish holidays, and Hebrew numerals in plain JavaScript.

A **zero-dependency ES module library** for Node.js 22+ that converts between Gregorian and Hebrew civil dates, lists Jewish observances with Israel/diaspora differences, and writes Hebrew numerals and calendar years. It uses integer arithmetic rather than system time zones or locale-dependent date formatting.

## Why it exists

Date conversion and holiday rules often get mixed with timezone-sensitive `Date` objects or with the differences between holiday calendars in Israel and the diaspora. This library keeps the calendar computation deterministic, testable, and usable without a network connection or external package.

## Features

- Convert Gregorian dates to Hebrew dates and back (`toHebrew`, `toGregorian`).
- Handle Hebrew leap years, Adar I/II, Gregorian leap days, and Hebrew year boundaries.
- List traditional holidays and observances for a Hebrew year (`getJewishHolidays`), including regional differences for Pesach, Shavuot, and Simchat Torah, postponements of traditional fasts, and optional Hebrew event names (`locale: 'he'`).
- Format positive integers and Hebrew years with geresh/gershayim and the special forms for 15 and 16 (`formatHebrewNumber`, `formatHebrewYear`).
- Get Hebrew month names in English or Hebrew and format complete Hebrew civil dates, including Adar I/II (`getHebrewMonthName`, `formatHebrewDate`).
- Add or subtract days, calculate signed day differences, and find Hebrew weekdays without timezones (`addHebrewDays`, `daysBetweenHebrewDates`, `getHebrewWeekday`).
- Run offline, with no runtime or development npm dependencies.

## Quick start

Requires **Node.js 22 or newer**. Clone the repository and run the examples directly:

```sh
git clone https://github.com/MeiRR17/hebrew-date-kit.git
cd hebrew-date-kit
node examples/date-conversion.mjs
node examples/holidays.mjs
node examples/numerals.mjs
```

The package provides a root ES module export (`hebrew-date-kit`), so the examples can import the package from within the checked-out repository without running `npm install`. The repository is public; no claim of an npm registry release is made here.

## Usage

```js
import {
  toHebrew,
  toGregorian,
  getJewishHolidays,
  formatHebrewNumber,
  formatHebrewYear,
  getHebrewMonthName,
  formatHebrewDate,
  addHebrewDays,
  daysBetweenHebrewDates,
  getHebrewWeekday,
} from 'hebrew-date-kit';

// January=1 for Gregorian months; Nisan=1, Tishrei=7 for Hebrew months.
toHebrew({ year: 2026, month: 9, day: 12 });
// { year: 5787, month: 7, day: 1 }

toGregorian({ year: 5784, month: 13, day: 14 });
// { year: 2024, month: 3, day: 24 } (14 Adar II)

const israel = getJewishHolidays(5787, { region: 'israel' });
const diaspora = getJewishHolidays(5787, { region: 'diaspora' });
const hebrewNames = getJewishHolidays(5787, { region: 'israel', locale: 'he' });
// hebrewNames[0].name === 'ראש השנה'
const simchatTorahInIsrael = israel.find(event => event.id === 'simchat_torah');
// simchatTorahInIsrael.hebrewDate = { year: 5787, month: 7, day: 22 }

formatHebrewNumber(15); // 'ט״ו'
formatHebrewNumber(5787); // 'ה׳תשפ״ז'
formatHebrewYear(5787); // 'תשפ״ז'
getHebrewMonthName(5784, 13, { locale: 'he' }); // 'אדר ב׳'
getHebrewMonthName(5785, 12); // 'Adar'
formatHebrewDate({ year: 5784, month: 13, day: 14 });
// 'י״ד באדר ב׳ תשפ״ד'
formatHebrewDate({ year: 5784, month: 13, day: 14 }, { locale: 'en' });
// '14 Adar II 5784'

// Integer-only Hebrew date arithmetic; weekdays: Sunday=0 ... Shabbat=6
const roshHashanah = { year: 5787, month: 7, day: 1 };
addHebrewDays(roshHashanah, -1); // { year: 5786, month: 6, day: 29 }
addHebrewDays({ year: 5784, month: 12, day: 30 }, 1);
// { year: 5784, month: 13, day: 1 } (Adar I → Adar II)
daysBetweenHebrewDates({ year: 5786, month: 6, day: 29 }, roshHashanah); // 1
getHebrewWeekday(roshHashanah); // 6 (Shabbat)
```

### Calendar conventions and limits

- All inputs and outputs are **plain `{ year, month, day }` records**: no `Date` objects, times, local time zones, or UTC offsets. The library labels civil calendar days; it **does not calculate sunset** or decide which Hebrew day a particular local timestamp falls in.
- Gregorian month numbers are January=1 through December=12, using the proleptic Gregorian calendar (years 1–9999). Hebrew month numbers start at Nisan=1, so Tishrei=7, Adar=12, and Adar II=13 only in leap years. Months are returned as numbers, not translated month names.
- An absolute day is an integer with Gregorian **0001-01-01 = 1**. The two public conversion functions reject impossible dates. Hebrew-to-Gregorian conversion requires a representable Gregorian date in years 1–9999.
- `getJewishHolidays(year, { region, locale })` requires `region` to be exactly `'israel'` or `'diaspora'`; optional `locale` is `'en'` (default) or `'he'` for Hebrew display names. Only `name` is localized; identifiers, date fields, event types, and sorting are identical. It returns chronologically sorted events with `id`, `name`, `type`, `hebrewDate`, `gregorianDate`, and `absoluteDay`; multi-day festivals also have `dayOfFestival`. The entire requested Hebrew year must be within the supported Gregorian range.
- This list represents selected traditional observances, **not** a comprehensive halachic calendar or a source of religious rulings. Modern state holidays and location-based times are not included.
- Hebrew numerals use traditional punctuation. `formatHebrewNumber(5787)` preserves the thousands prefix, whereas `formatHebrewYear(5787)` omits it. The supported input range for these functions is 1–999999.
- `getHebrewMonthName(year, month, {locale})` uses English by default; `formatHebrewDate({year,month,day}, {locale})` uses Hebrew by default. Both accept `locale: 'en' | 'he'`. Date formatting validates the complete date, including variable Hebrew month lengths. These are display functions only; they do not parse text or calculate sunset.
- `addHebrewDays(date, days)` accepts signed safe integers, including zero; the result must remain within Hebrew calendar years 1–20000 (the full Hebrew date-arithmetic range, not limited to Gregorian years 1–9999). `daysBetweenHebrewDates(start, end)` returns *end minus start*. `getHebrewWeekday(date)` returns Sunday=0, Monday=1, ..., Saturday/Shabbat=6. Arithmetic uses only integer absolute days and does not mutate input records.

## Run tests

```sh
node --test
# or
npm test
```

Fixtures under `test/fixtures/` contain independent calendar anchors, date pairs, and holiday examples. No packages need to be installed before running tests.

## Project structure

```text
src/
  calendar-core.js    # Fixed Hebrew/Gregorian calendar arithmetic
  arithmetic.js       # Day shifts, date differences and weekdays
  dates.js            # Date conversion functions
  format.js           # Month names and formatted Hebrew dates
  holidays.js         # Regional holiday and fast-day rules
  numerals.mjs        # Hebrew numerals and year formatting
  index.js            # Public ES module entry point
examples/
  date-conversion.mjs
  holidays.mjs
  numerals.mjs
test/                  # Node.js built-in test runner + fixtures
package.json          # Node >=22, ES modules and package exports
LICENSE               # MIT
```

## Author

Built by Meir Dvir · [https://github.com/MeiRR17](https://github.com/MeiRR17)
