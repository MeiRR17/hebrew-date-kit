import { getHebrewMonthCalendar } from 'hebrew-date-kit';

const calendar = getHebrewMonthCalendar(5787, 7, {
  region: 'israel',
  locale: 'he',
  weekStartsOn: 0, // Sunday; Sunday=0 through Saturday=6
});

console.log(calendar.monthName, calendar.year);
console.log('Weekdays: Sun Mon Tue Wed Thu Fri Sat');
for (const week of calendar.weeks) {
  console.log(week.map(day => day ? String(day.hebrewDate.day).padStart(3) : '  -').join(' '));
}
for (const week of calendar.weeks) {
  for (const day of week) {
    if (day?.holidays.length) {
      console.log(day.hebrewDate.day, day.gregorianDate,
        day.holidays.map(holiday => holiday.name).join(', '));
    }
  }
}
