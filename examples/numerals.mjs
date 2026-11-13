import { formatHebrewNumber, formatHebrewYear } from 'hebrew-date-kit';

for (const value of [1, 15, 16, 577, 5787]) {
  console.log(`${value}: ${formatHebrewNumber(value)}`);
}
console.log('Hebrew year 5787:', formatHebrewYear(5787));
