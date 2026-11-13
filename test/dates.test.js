import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {toHebrew, toGregorian} from '../src/dates.js';
import {absoluteToHebrew, gregorianToAbsolute, hebrewToAbsolute, isHebrewLeapYear} from '../src/calendar-core.js';

const {pairs} = JSON.parse(readFileSync(new URL('./fixtures/date-pairs.json', import.meta.url), 'utf8'));

test('independent Gregorian/Hebrew fixtures match in both directions', () => {
  assert.ok(pairs.length >= 50);
  for (const {gregorian, hebrew, absoluteDay} of pairs) {
    assert.deepEqual(toHebrew(gregorian), hebrew, `Gregorian: ${JSON.stringify(gregorian)}`);
    assert.deepEqual(toGregorian(hebrew), gregorian, `Hebrew: ${JSON.stringify(hebrew)}`);
    assert.equal(gregorianToAbsolute(gregorian), absoluteDay);
    assert.equal(hebrewToAbsolute(hebrew), absoluteDay);
  }
});

test('conversions return only numeric date fields and do not mutate inputs', () => {
  const civil = Object.freeze({year: 2026, month: 9, day: 12});
  const hebrew = Object.freeze({year: 5787, month: 7, day: 1});
  const resultH = toHebrew(civil);
  const resultG = toGregorian(hebrew);
  assert.deepEqual(resultH, hebrew);
  assert.deepEqual(resultG, civil);
  assert.deepEqual(Object.keys(resultH), ['year', 'month', 'day']);
  assert.deepEqual(Object.keys(resultG), ['year', 'month', 'day']);
  assert.notStrictEqual(resultH, hebrew);
  assert.notStrictEqual(resultG, civil);
});

test('leap days and Gregorian year boundaries', () => {
  assert.deepEqual(toHebrew({year: 2024, month: 2, day: 29}), {year: 5784, month: 12, day: 20});
  assert.deepEqual(toGregorian({year: 5784, month: 12, day: 20}), {year: 2024, month: 2, day: 29});
  for (const year of [1, 4, 1582, 1700, 1900, 2000, 2024, 2025, 2026, 2027, 2400, 9999]) {
    for (const month of [1, 6, 12]) {
      const date = {year, month, day: 1};
      assert.deepEqual(toGregorian(toHebrew(date)), date);
    }
  }
});

test('Adar I and Adar II, Nisan and the Hebrew year rollover', () => {
  assert.equal(isHebrewLeapYear(5784), true);
  assert.equal(isHebrewLeapYear(5785), false);
  assert.deepEqual(toGregorian({year: 5784, month: 12, day: 30}), {year: 2024, month: 3, day: 10});
  assert.deepEqual(toGregorian({year: 5784, month: 13, day: 1}), {year: 2024, month: 3, day: 11});
  assert.deepEqual(toGregorian({year: 5787, month: 1, day: 1}), {year: 2027, month: 4, day: 8});
  assert.deepEqual(toHebrew({year: 2026, month: 9, day: 11}), {year: 5786, month: 6, day: 29});
  assert.deepEqual(toHebrew({year: 2026, month: 9, day: 12}), {year: 5787, month: 7, day: 1});
  assert.deepEqual(toHebrew({year: 2027, month: 10, day: 1}), {year: 5787, month: 6, day: 29});
  assert.deepEqual(toHebrew({year: 2027, month: 10, day: 2}), {year: 5788, month: 7, day: 1});
});

test('dense Gregorian round trips across leap-year and Hebrew year changes', () => {
  for (let absolute = 737425; absolute < 740500; absolute += 7) {
    // From a known positive absolute day to a Hebrew calendar date and back.
    const hebrew = absoluteToHebrew(absolute);
    const civil = toGregorian(hebrew);
    assert.equal(gregorianToAbsolute(civil), absolute);
    assert.deepEqual(toHebrew(civil), hebrew);
  }
});

test('invalid Gregorian date values are rejected without date normalization', () => {
  for (const invalid of [
    null, undefined, 2026, '2026-09-12', [],
    {year: 2024, month: 2, day: 30},
    {year: 2025, month: 2, day: 29},
    {year: 1900, month: 2, day: 29},
    {year: 2026, month: 13, day: 1},
    {year: 2026, month: 0, day: 1},
    {year: 2026, month: 9, day: 0},
    {year: 0, month: 1, day: 1},
    {year: 10000, month: 1, day: 1},
    {year: '2026', month: 9, day: 12},
    {year: 2026, month: 9, day: 12.5},
  ]) {
    assert.throws(() => toHebrew(invalid), {name: /^(TypeError|RangeError)$/});
  }
});

test('invalid Hebrew date values are rejected, including absent Adar II', () => {
  for (const invalid of [
    null, undefined, '5787-07-01', [],
    {year: 5785, month: 13, day: 1},
    {year: 5784, month: 13, day: 30},
    {year: 5785, month: 12, day: 30},
    {year: 5784, month: 8, day: 30},
    {year: 5787, month: 0, day: 1},
    {year: 5787, month: 14, day: 1},
    {year: 5787, month: 7, day: 31},
    {year: 5787, month: 7, day: 1.5},
    {year: 5787, month: '7', day: 1},
    {year: 0, month: 7, day: 1},
    {year: 20001, month: 7, day: 1},
  ]) {
    assert.throws(() => toGregorian(invalid), {name: /^(TypeError|RangeError)$/});
  }
});

test('Hebrew dates outside the supported Gregorian range are rejected', () => {
  assert.throws(() => toGregorian({year: 1, month: 7, day: 1}), RangeError);
  assert.throws(() => toGregorian({year: 20000, month: 7, day: 1}), RangeError);
});
