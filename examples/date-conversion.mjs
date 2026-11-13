import { toHebrew, toGregorian, getHebrewMonthName, formatHebrewDate } from 'hebrew-date-kit';

const civilDate = { year: 2026, month: 9, day: 12 };
const hebrewDate = toHebrew(civilDate);
console.log('Gregorian:', civilDate);
console.log('Hebrew (Nisan=1):', hebrewDate);
console.log('Formatted Hebrew date:', formatHebrewDate(hebrewDate));
console.log('Hebrew month:', getHebrewMonthName(hebrewDate.year, hebrewDate.month, {locale: 'he'}));
console.log('Converted back:', toGregorian(hebrewDate));

const leapYearDate = { year: 5784, month: 13, day: 14 }; // 14 Adar II
console.log('14 Adar II 5784:', toGregorian(leapYearDate));
