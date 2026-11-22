import {exportJewishHolidaysInRangeIcs} from 'hebrew-date-kit';

// Save via: node examples/export-range-ics.mjs > selected-holidays.ics
// Both endpoints are Gregorian CIVIL dates; these are not sunset-aware times.
process.stdout.write(exportJewishHolidaysInRangeIcs(
  {year: 2026, month: 9, day: 10},
  {year: 2026, month: 9, day: 25},
  {
    region: 'israel',
    locale: 'he',
    types: ['yom_tov', 'fast'],
    dtstamp: '20261113T175700Z',
  },
));
