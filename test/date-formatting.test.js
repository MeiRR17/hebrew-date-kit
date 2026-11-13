import assert from 'node:assert/strict';
import test from 'node:test';
import { formatHebrewDate, getHebrewMonthName, toHebrew } from '../src/index.js';

const names = [
  [1, 'ניסן', 'Nisan'], [2, 'אייר', 'Iyar'], [3, 'סיוון', 'Sivan'],
  [4, 'תמוז', 'Tammuz'], [5, 'אב', 'Av'], [6, 'אלול', 'Elul'],
  [7, 'תשרי', 'Tishrei'], [8, 'חשוון', 'Cheshvan'],
  [9, 'כסלו', 'Kislev'], [10, 'טבת', 'Tevet'], [11, 'שבט', 'Shevat'],
];

test('all Hebrew months have deterministic Hebrew and English names', () => {
  for (const year of [5784, 5785, 5786, 5787, 5790]) {
    for (const [month, hebrew, english] of names) {
      assert.equal(getHebrewMonthName(year, month, {locale:'he'}), hebrew);
      assert.equal(getHebrewMonthName(year, month, {locale:'en'}), english);
      assert.equal(getHebrewMonthName(year, month), english);
    }
  }
});

test('Adar I and II follow the year leap cycle', () => {
  assert.equal(getHebrewMonthName(5784, 12), 'Adar I');
  assert.equal(getHebrewMonthName(5784, 12, {locale:'he'}), 'אדר א׳');
  assert.equal(getHebrewMonthName(5784, 13), 'Adar II');
  assert.equal(getHebrewMonthName(5784, 13, {locale:'he'}), 'אדר ב׳');
  assert.equal(getHebrewMonthName(5785, 12), 'Adar');
  assert.equal(getHebrewMonthName(5785, 12, {locale:'he'}), 'אדר');
  assert.throws(() => getHebrewMonthName(5785, 13), RangeError);
});

test('full Hebrew date uses Hebrew numerals and month preposition', () => {
  assert.equal(formatHebrewDate({year: 5784, month: 13, day: 14}), 'י״ד באדר ב׳ תשפ״ד');
  assert.equal(formatHebrewDate({year: 5784, month: 12, day: 15}), 'ט״ו באדר א׳ תשפ״ד');
  assert.equal(formatHebrewDate({year: 5785, month: 12, day: 16}), 'ט״ז באדר תשפ״ה');
  assert.equal(formatHebrewDate({year: 5787, month: 7, day: 1}), 'א׳ בתשרי תשפ״ז');
  assert.equal(formatHebrewDate({year: 5786, month: 6, day: 29}), 'כ״ט באלול תשפ״ו');
});

test('English date formatting is explicit and stable', () => {
  assert.equal(formatHebrewDate({year:5784, month:13, day:14}, {locale:'en'}), '14 Adar II 5784');
  assert.equal(formatHebrewDate({year:5785, month:12, day:16}, {locale:'en'}), '16 Adar 5785');
  assert.equal(formatHebrewDate({year:5787, month:7, day:1}, {locale:'en'}), '1 Tishrei 5787');
});

test('Gregorian conversion combines with display formatting', () => {
  const civil = Object.freeze({year: 2026, month:9, day:12});
  const hebrew = toHebrew(civil);
  assert.equal(formatHebrewDate(hebrew), 'א׳ בתשרי תשפ״ז');
  assert.deepEqual(civil, {year:2026,month:9,day:12});
  assert.deepEqual(hebrew, {year:5787,month:7,day:1});
});

test('invalid year, month, day, locale and date records are rejected', () => {
  for (const value of [0, -1, 5787.2, '5787', null, undefined, 20001]) {
    assert.throws(() => getHebrewMonthName(value, 7), RangeError);
  }
  for (const value of [0, 14, -1, 1.1, '7', NaN, 13]) {
    assert.throws(() => getHebrewMonthName(5785, value), RangeError);
  }
  for (const bad of [
    null, undefined, [], '5787-7-1',
    {year:5785,month:13,day:1},
    {year:5784,month:13,day:30},
    {year:5785,month:12,day:30},
    {year:5787,month:7,day:0},
    {year:5787,month:7,day:31},
    {year:5787,month:7,day:1.5},
  ]) {
    assert.throws(() => formatHebrewDate(bad), {name:/^(TypeError|RangeError)$/});
  }
  for (const options of [null, [], 'he', {locale:'FR'}, {locale:null}, {locale:5}]) {
    assert.throws(() => getHebrewMonthName(5787,7,options), {name:/^(TypeError|RangeError)$/});
    assert.throws(() => formatHebrewDate({year:5787,month:7,day:1},options),
      {name:/^(TypeError|RangeError)$/});
  }
});

test('date formatting does not depend on ambient timezone across years', () => {
  for (const [civil, expected] of [
    [{year:2024,month:3,day:11}, 'א׳ באדר ב׳ תשפ״ד'],
    [{year:2025,month:3,day:14}, 'י״ד באדר תשפ״ה'],
    [{year:2026,month:9,day:12}, 'א׳ בתשרי תשפ״ז'],
    [{year:2027,month:3,day:10}, 'א׳ באדר ב׳ תשפ״ז'],
  ]) assert.equal(formatHebrewDate(toHebrew(civil)), expected);
});
