import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {
  absoluteToGregorian, absoluteToHebrew, gregorianMonthLength,
  gregorianToAbsolute, hebrewMonthLength, hebrewMonthsInYear,
  hebrewToAbsolute, hebrewYearLength, isGregorianLeapYear,
  isHebrewLeapYear, isLongCheshvan, isShortKislev,
  roshHashanahAbsolute,
} from '../src/calendar-core.js';

const anchors = JSON.parse(readFileSync(new URL('./fixtures/calendar-anchors.json', import.meta.url)));

test('Gregorian day one, Julian/Gregorian reform and leap-century boundaries', () => {
  assert.equal(gregorianToAbsolute({year: 1, month: 1, day: 1}), 1);
  assert.deepEqual(absoluteToGregorian(1), {year: 1, month: 1, day: 1});
  assert.equal(isGregorianLeapYear(1600), true);
  assert.equal(isGregorianLeapYear(1700), false);
  assert.equal(isGregorianLeapYear(1900), false);
  assert.equal(isGregorianLeapYear(2000), true);
  assert.equal(isGregorianLeapYear(2024), true);
  assert.equal(gregorianMonthLength(2000, 2), 29);
  assert.equal(gregorianMonthLength(1900, 2), 28);
  for (const {year, month, day, absoluteDay} of anchors.gregorian) {
    assert.equal(gregorianToAbsolute({year, month, day}), absoluteDay);
    assert.deepEqual(absoluteToGregorian(absoluteDay), {year, month, day});
  }
});

test('independent Rosh Hashanah anchors cover leap and deficient/regular/complete years', () => {
  const types = new Set();
  for (const anchor of anchors.roshHashanah) {
    const {hebrewYear: year, absoluteDay, gregorian: civil, yearLength, leap,
      cheshvanDays, kislevDays} = anchor;
    types.add(yearLength);
    assert.equal(roshHashanahAbsolute(year), absoluteDay, 'Rosh Hashanah ' + year);
    assert.deepEqual(absoluteToGregorian(absoluteDay), civil);
    assert.deepEqual(absoluteToHebrew(absoluteDay), {year, month: 7, day: 1});
    assert.equal(hebrewToAbsolute({year, month: 7, day: 1}), absoluteDay);
    assert.equal(hebrewYearLength(year), yearLength);
    assert.equal(isHebrewLeapYear(year), leap);
    assert.equal(hebrewMonthsInYear(year), leap ? 13 : 12);
    assert.equal(hebrewMonthLength(year, 8), cheshvanDays);
    assert.equal(hebrewMonthLength(year, 9), kislevDays);
    assert.equal(isLongCheshvan(year), cheshvanDays === 30);
    assert.equal(isShortKislev(year), kislevDays === 29);
    assert.equal(roshHashanahAbsolute(year + 1) - absoluteDay, yearLength);
  }
  assert.deepEqual([...types].sort((a, b) => a - b), [353, 354, 355, 383, 384, 385]);
});

test('independent Hebrew date anchors cover Adar I/II and year transitions', () => {
  for (const {hebrew, gregorian: civil, absoluteDay} of anchors.hebrewDates) {
    assert.equal(hebrewToAbsolute(hebrew), absoluteDay, JSON.stringify(hebrew));
    assert.deepEqual(absoluteToHebrew(absoluteDay), hebrew);
    assert.deepEqual(absoluteToGregorian(absoluteDay), civil);
  }
});

test('all month lengths sum to the year, including a 19-year Metonic cycle', () => {
  for (let year = 5775; year < 5775 + 38; year += 1) {
    const last = hebrewMonthsInYear(year);
    const chronological = [...Array.from({length: last - 6}, (_, i) => i + 7),
      ...Array.from({length: 6}, (_, i) => i + 1)];
    const total = chronological.reduce((sum, month) => sum + hebrewMonthLength(year, month), 0);
    assert.equal(total, hebrewYearLength(year), 'month sum ' + year);
    const lastMonth = {year, month: 6, day: 29};
    assert.equal(hebrewToAbsolute(lastMonth) + 1, roshHashanahAbsolute(year + 1));
    assert.deepEqual(absoluteToHebrew(roshHashanahAbsolute(year + 1) - 1), lastMonth);
  }
});

test('ordinal round trips across Gregorian/Hebrew year boundaries and epoch', () => {
  const epoch = gregorianToAbsolute({year: 1, month: 1, day: 1});
  assert.equal(epoch, 1);
  assert.deepEqual(absoluteToHebrew(roshHashanahAbsolute(1)), {year: 1, month: 7, day: 1});
  assert.equal(hebrewToAbsolute({year: 1, month: 7, day: 1}), -1373427);
  const first = gregorianToAbsolute({year: 2015, month: 1, day: 1});
  const last = gregorianToAbsolute({year: 2035, month: 12, day: 31});
  for (let rd = first; rd <= last; rd += 37) {
    const civil = absoluteToGregorian(rd);
    const hebrew = absoluteToHebrew(rd);
    assert.equal(gregorianToAbsolute(civil), rd);
    assert.equal(hebrewToAbsolute(hebrew), rd);
  }
  const end = gregorianToAbsolute({year: 9999, month: 12, day: 31});
  assert.equal(gregorianToAbsolute(absoluteToGregorian(end)), end);
  assert.equal(hebrewToAbsolute(absoluteToHebrew(end)), end);
});

test('invalid dates, months, years, types and absolute days are rejected', () => {
  for (const value of [0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, '5787', null, undefined, 3n]) {
    for (const fn of [isHebrewLeapYear, isGregorianLeapYear, roshHashanahAbsolute,
      hebrewYearLength, hebrewMonthsInYear]) {
      assert.throws(() => fn(value), RangeError);
    }
  }
  for (const fn of [gregorianToAbsolute, hebrewToAbsolute]) {
    for (const bad of [null, undefined, [], '2026-09-12', 123]) {
      assert.throws(() => fn(bad), TypeError);
    }
  }
  for (const bad of [
    {year: 1900, month: 2, day: 29}, {year: 2024, month: 2, day: 30},
    {year: 2024, month: 13, day: 1}, {year: 2024, month: 0, day: 1},
    {year: 10000, month: 1, day: 1}, {year: 2024, month: 2, day: 1.1},
  ]) assert.throws(() => gregorianToAbsolute(bad), RangeError);
  for (const bad of [
    {year: 5785, month: 13, day: 1}, {year: 5787, month: 14, day: 1},
    {year: 5787, month: 13, day: 30}, {year: 5784, month: 8, day: 30},
    {year: 5786, month: 12, day: 30}, {year: 5787, month: 7, day: 0},
    {year: 20001, month: 7, day: 1},
  ]) assert.throws(() => hebrewToAbsolute(bad), RangeError);
  for (const bad of [0, -1, 1.5, '5', Number.NaN, Number.POSITIVE_INFINITY]) {
    assert.throws(() => absoluteToGregorian(bad), RangeError);
  }
  assert.throws(() => absoluteToHebrew(roshHashanahAbsolute(1) - 1), RangeError);
  assert.throws(() => absoluteToHebrew(roshHashanahAbsolute(20000) + hebrewYearLength(20000)), RangeError);
});

test('civil date arithmetic has no dependency on the process timezone', () => {
  assert.equal(gregorianToAbsolute({year: 2024, month: 3, day: 1}) -
               gregorianToAbsolute({year: 2024, month: 2, day: 29}), 1);
  assert.deepEqual(absoluteToHebrew(gregorianToAbsolute({year: 2026, month: 9, day: 12})),
    {year: 5787, month: 7, day: 1});
});
