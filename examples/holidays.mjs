import { getJewishHolidays } from 'hebrew-date-kit';

for (const region of ['israel', 'diaspora']) {
  const holidays = getJewishHolidays(5787, { region });
  const selected = holidays.filter(({ id }) => ['simchat_torah', 'shavuot'].includes(id));
  console.log(`Holidays in ${region} (Hebrew year 5787):`);
  for (const { name, hebrewDate, gregorianDate } of selected) {
    console.log(`  ${name}:`, hebrewDate, '=>', gregorianDate);
  }
}
