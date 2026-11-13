import {exportJewishHolidaysIcs} from 'hebrew-date-kit';

// Redirect stdout to a .ics file:
// node examples/export-ics.mjs > holidays-5787.ics
// Dates are all-day civil dates; no sunset or location-based times.
process.stdout.write(exportJewishHolidaysIcs(5787, {
  region: 'israel',
  locale: 'he',
}));
