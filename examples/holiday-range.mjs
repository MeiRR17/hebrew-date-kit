import {getJewishHolidaysInRange} from 'hebrew-date-kit';

// Cross the Hebrew new-year boundary in September 2026. All dates below
// refer to Gregorian calendar DAYS, not times after/before local sunset.
const start = {year: 2026, month: 9, day: 10};
const end = {year: 2026, month: 9, day: 25};

for (const region of ['israel', 'diaspora']) {
  const observances = getJewishHolidaysInRange(start, end, {
    region,
    locale: 'he',
    types: ['yom_tov', 'fast'],
  });

  console.log('\n' + region + ' — yom tov and fast days in range:');
  for (const event of observances) {
    const {year, month, day} = event.gregorianDate;
    const civil = [
      String(year).padStart(4, '0'),
      String(month).padStart(2, '0'),
      String(day).padStart(2, '0'),
    ].join('-');
    console.log(civil + ' | ' + event.name + ' | ' + event.type);
  }
}

// The same API can query one day, including multiple distinct event records.
const onFirstDay = getJewishHolidaysInRange(
  {year: 2026, month: 9, day: 12},
  {year: 2026, month: 9, day: 12},
  {region: 'israel'},
);
console.log('\nSelected events on 2026-09-12:', onFirstDay.map(e => e.id));
