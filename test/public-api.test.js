import assert from 'node:assert/strict';
import test from 'node:test';
import * as api from 'hebrew-date-kit';
import * as entry from '../src/index.js';

const exportsExpected = [
  'formatHebrewDate',
  'formatHebrewNumber',
  'formatHebrewYear',
  'getHebrewMonthName',
  'getJewishHolidays',
  'toGregorian',
  'toHebrew',
];

test('package self-reference exposes exactly the documented functions', () => {
  assert.deepEqual(Object.keys(api), exportsExpected);
  assert.deepEqual(Object.keys(entry), exportsExpected);
  for (const key of exportsExpected) {
    assert.equal(typeof api[key], 'function');
    assert.strictEqual(api[key], entry[key]);
  }
});

test('public conversions are accurate and return plain civil date fields', () => {
  const civil = { year: 2026, month: 9, day: 12 };
  const hebrew = { year: 5787, month: 7, day: 1 };
  assert.deepEqual(api.toHebrew(civil), hebrew);
  assert.deepEqual(api.toGregorian(hebrew), civil);
  assert.deepEqual(api.toGregorian({ year: 5784, month: 13, day: 14 }),
    { year: 2024, month: 3, day: 24 });
});

test('public holiday API includes Israel/diaspora differences', () => {
  const il = api.getJewishHolidays(5787, { region: 'israel' });
  const diaspora = api.getJewishHolidays(5787, { region: 'diaspora' });
  assert.deepEqual(il.find(e => e.id === 'simchat_torah').hebrewDate,
    { year: 5787, month: 7, day: 22 });
  assert.deepEqual(diaspora.find(e => e.id === 'simchat_torah').hebrewDate,
    { year: 5787, month: 7, day: 23 });
});

test('public numeral API preserves special spelling and abbreviated years', () => {
  assert.equal(api.formatHebrewNumber(15), 'ט״ו');
  assert.equal(api.formatHebrewNumber(16), 'ט״ז');
  assert.equal(api.formatHebrewYear(5787), 'תשפ״ז');
  assert.equal(api.getHebrewMonthName(5784, 13, {locale:'he'}), 'אדר ב׳');
  assert.equal(api.formatHebrewDate({year:5787,month:7,day:1}), 'א׳ בתשרי תשפ״ז');
});
