import assert from 'node:assert/strict';
import test from 'node:test';
import {
  addHebrewDays, daysBetweenHebrewDates, getHebrewWeekday, toHebrew,
} from '../src/index.js';

test('Elul/Tishrei rollover and signed day shifts', () => {
  const lastElul = {year: 5786, month: 6, day: 29};
  const firstTishrei = {year: 5787, month: 7, day: 1};
  assert.deepEqual(addHebrewDays(lastElul, 1), firstTishrei);
  assert.deepEqual(addHebrewDays(firstTishrei, -1), lastElul);
  assert.deepEqual(addHebrewDays(firstTishrei, 1), {year: 5787, month: 7, day: 2});
  assert.deepEqual(addHebrewDays({year:5787, month:6, day:29}, 1), {year:5788,month:7,day:1});
  assert.equal(daysBetweenHebrewDates(lastElul, firstTishrei), 1);
  assert.equal(daysBetweenHebrewDates(firstTishrei, lastElul), -1);
});

test('Adar I/II and Nisan transitions in leap years', () => {
  assert.deepEqual(addHebrewDays({year: 5784, month: 12, day: 30}, 1),
    {year: 5784, month: 13, day: 1});
  assert.deepEqual(addHebrewDays({year: 5784, month: 13, day: 1}, -1),
    {year: 5784, month: 12, day: 30});
  assert.deepEqual(addHebrewDays({year: 5784, month: 13, day: 29}, 1),
    {year: 5784, month: 1, day: 1});
  assert.deepEqual(addHebrewDays({year: 5785, month: 12, day: 29}, 1),
    {year: 5785, month: 1, day: 1});
});

test('zero shifts preserve fields without returning or mutating the same object', () => {
  const input = Object.freeze({year:5787,month:7,day:1});
  const shifted = addHebrewDays(input, 0);
  assert.deepEqual(shifted, input);
  assert.notStrictEqual(shifted, input);
  assert.deepEqual(input, {year:5787,month:7,day:1});
});

test('date differences use end minus start and obey antisymmetry', () => {
  const dates = [
    {year:5784,month:12,day:30}, {year:5784,month:13,day:1},
    {year:5784,month:1,day:1}, {year:5786,month:6,day:29},
    {year:5787,month:7,day:1}, {year:5788,month:7,day:1},
  ];
  for (const a of dates) {
    assert.equal(daysBetweenHebrewDates(a, a), 0);
    for (const b of dates) {
      assert.equal(daysBetweenHebrewDates(a,b), -daysBetweenHebrewDates(b,a));
    }
  }
});

test('offsets round-trip across month/year boundaries and leap cycles', () => {
  const starts = [
    {year:1,month:7,day:1}, {year:5700,month:7,day:1},
    {year:5784,month:12,day:30}, {year:5784,month:13,day:29},
    {year:5785,month:1,day:15}, {year:5787,month:6,day:29},
    {year:6000,month:7,day:1}, {year:20000,month:6,day:29},
  ];
  for (const date of starts) {
    for (const delta of [-740,-384,-30,-7,-1,0,1,7,30,384,740]) {
      let target;
      try {
        target = addHebrewDays(date, delta);
      } catch (error) {
        assert.ok(error instanceof RangeError);
        continue;
      }
      assert.deepEqual(addHebrewDays(target,-delta),date);
      assert.equal(daysBetweenHebrewDates(date,target),delta);
    }
  }
});

test('weekday uses Sunday=0 to Saturday=6 on documented civil days', () => {
  const dates = [
    [{year:5787,month:7,day:1},6], // 2026-09-12, Saturday
    [{year:5787,month:7,day:2},0], // 2026-09-13, Sunday
    [{year:5786,month:6,day:29},5], // 2026-09-11, Friday
    [{year:5786,month:7,day:1},2], // 2025-09-23, Tuesday
  ];
  for (const [date,weekday] of dates) assert.equal(getHebrewWeekday(date),weekday);
  const first=toHebrew({year:1,month:1,day:1});
  assert.equal(getHebrewWeekday(first),1); // epoch Monday
  for (let day=-20;day<=20;day++) {
    const date=addHebrewDays({year:5787,month:7,day:1},day);
    assert.equal(getHebrewWeekday(date),((6+day)%7+7)%7);
  }
});

test('early Hebrew calendar dates have normalized weekday indices', () => {
  const epoch = {year:1,month:7,day:1};
  for(let shift=0;shift<60;shift++){
    const day = addHebrewDays(epoch,shift);
    assert.equal(getHebrewWeekday(day),(getHebrewWeekday(epoch)+shift)%7);
    assert.ok(getHebrewWeekday(day)>=0&&getHebrewWeekday(day)<=6);
  }
});

test('date arithmetic respects the Hebrew year 1..20000 boundaries', () => {
  assert.throws(() => addHebrewDays({year:1,month:7,day:1},-1),RangeError);
  assert.throws(() => addHebrewDays({year:20000,month:6,day:29},1),RangeError);
  assert.deepEqual(addHebrewDays({year:1,month:7,day:1},0),{year:1,month:7,day:1});
  assert.deepEqual(addHebrewDays({year:20000,month:6,day:29},0),
    {year:20000,month:6,day:29});
});

test('reject non-integer offsets and invalid calendar dates', () => {
  const good={year:5787,month:7,day:1};
  for (const bad of [1.5,'2',null,undefined,NaN,Infinity,-Infinity,3n,
    Number.MAX_SAFE_INTEGER,Number.MIN_SAFE_INTEGER]) {
    assert.throws(() => addHebrewDays(good,bad),RangeError);
  }
  for (const bad of [
    null,undefined,[],{},'5787-07-01',
    {year:5785,month:13,day:1},
    {year:5787,month:7,day:0},
    {year:5787,month:7,day:31},
  ]) {
    assert.throws(() => addHebrewDays(bad,1),{name:/^(TypeError|RangeError)$/});
    assert.throws(() => daysBetweenHebrewDates(good,bad),{name:/^(TypeError|RangeError)$/});
    assert.throws(() => daysBetweenHebrewDates(bad,good),{name:/^(TypeError|RangeError)$/});
    assert.throws(() => getHebrewWeekday(bad),{name:/^(TypeError|RangeError)$/});
  }
});
