import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  toHebrew, toGregorian, getJewishHolidays,
  formatHebrewNumber, formatHebrewYear,
} from '../src/index.js';
import {
  gregorianToAbsolute, hebrewToAbsolute,
  isHebrewLeapYear,
} from '../src/calendar-core.js';

const fixture = JSON.parse(
  readFileSync(new URL('./fixtures/acceptance-pairs.json', import.meta.url), 'utf8')
);

test('independent date table spans Gregorian years 1–9999 and leap boundaries', () => {
  assert.ok(fixture.pairs.length >= 70);
  const years = new Set(fixture.pairs.map(([year]) => year));
  for (const year of [1, 4, 100, 400, 1582, 1600, 1700, 1900,
    2000, 2024, 2026, 2027, 2028, 2100, 2400, 4000, 9999]) {
    assert.ok(years.has(year), 'Missing year ' + year);
  }
  assert.ok(fixture.pairs.some(([y,m,d]) => y === 2024 && m === 2 && d === 29));
  assert.ok(fixture.pairs.some(([y,m,d]) => y === 2024 && m === 3 && d === 11));
  assert.ok(fixture.pairs.some(([y,m,d]) => y === 2026 && m === 9 && d === 12));
});

test('all independent dates convert correctly in both directions', () => {
  for (const [gy, gm, gd, hy, hm, hd, absolute] of fixture.pairs) {
    const civil = { year:gy, month:gm, day:gd };
    const hebrew = { year:hy, month:hm, day:hd };
    assert.deepEqual(toHebrew(civil), hebrew, 'Gregorian ' + JSON.stringify(civil));
    assert.deepEqual(toGregorian(hebrew), civil, 'Hebrew ' + JSON.stringify(hebrew));
    assert.equal(gregorianToAbsolute(civil), absolute, JSON.stringify(civil));
    assert.equal(hebrewToAbsolute(hebrew), absolute, JSON.stringify(hebrew));
  }
});

test('Gregorian and Hebrew leap years and year rollovers remain invertible', () => {
  for (const [before, after] of [
    [{year:2024,month:2,day:29},{year:2024,month:3,day:1}],
    [{year:2024,month:3,day:10},{year:2024,month:3,day:11}],
    [{year:2025,month:12,day:31},{year:2026,month:1,day:1}],
    [{year:2026,month:9,day:11},{year:2026,month:9,day:12}],
    [{year:2027,month:3,day:9},{year:2027,month:3,day:10}],
    [{year:2027,month:10,day:1},{year:2027,month:10,day:2}],
  ]) {
    assert.equal(gregorianToAbsolute(after)-gregorianToAbsolute(before), 1);
    assert.equal(hebrewToAbsolute(toHebrew(after))-hebrewToAbsolute(toHebrew(before)), 1);
    assert.deepEqual(toGregorian(toHebrew(after)), after);
  }
  assert.ok(isHebrewLeapYear(5784));
  assert.ok(!isHebrewLeapYear(5785));
  assert.ok(isHebrewLeapYear(5787));
  assert.deepEqual(toHebrew({year:2024,month:3,day:11}), {year:5784,month:13,day:1});
});

test('regional holidays integrate with the same public date conversions', () => {
  for (const year of [5777,5782,5784,5785,5786,5787,5788]) {
    const il = getJewishHolidays(year, {region:'israel'});
    const abroad = getJewishHolidays(year, {region:'diaspora'});
    assert.equal(abroad.length, il.length + 2, 'Regional count ' + year);
    for (const events of [il, abroad]) {
      const unique = new Set();
      for (let n=0;n<events.length;n+=1) {
        const e = events[n];
        assert.deepEqual(toHebrew(e.gregorianDate), e.hebrewDate);
        assert.deepEqual(toGregorian(e.hebrewDate), e.gregorianDate);
        assert.equal(gregorianToAbsolute(e.gregorianDate), e.absoluteDay);
        assert.ok(n === 0 || events[n-1].absoluteDay <= e.absoluteDay);
        assert.ok(!unique.has(e.id + '@' + e.absoluteDay));
        unique.add(e.id + '@' + e.absoluteDay);
      }
    }
  }
});

test('holidays retain regional distinctions, fast shifts and overlapping events', () => {
  const il = getJewishHolidays(5787,{region:'israel'});
  const abroad = getJewishHolidays(5787,{region:'diaspora'});
  const find = (events,id,month,day) =>
    events.filter(e=>e.id===id && e.hebrewDate.month===month && e.hebrewDate.day===day);
  assert.equal(find(il,'simchat_torah',7,22).length,1);
  assert.equal(find(abroad,'simchat_torah',7,23).length,1);
  assert.equal(find(abroad,'shemini_atzeret',7,22).length,1);
  assert.equal(find(il,'pesach',1,22).length,0);
  assert.equal(find(abroad,'pesach',1,22).length,1);
  assert.equal(find(abroad,'shavuot',3,7).length,1);
  assert.equal(find(il,'sukkot',7,16)[0].type,'chol_hamoed');
  assert.equal(find(abroad,'sukkot',7,16)[0].type,'yom_tov');
  assert.equal(find(il,'shemini_atzeret',7,22)[0].absoluteDay,
    find(il,'simchat_torah',7,22)[0].absoluteDay);
  const fast = getJewishHolidays(5784,{region:'israel'})
    .find(e=>e.id==='fast_of_esther');
  assert.deepEqual(fast.hebrewDate,{year:5784,month:13,day:11});
});

test('gematria works alongside public calendar and holidays APIs', () => {
  const civil = {year:2026,month:9,day:12};
  const year = toHebrew(civil).year;
  assert.equal(year,5787);
  assert.equal(formatHebrewYear(year),'תשפ״ז');
  assert.equal(formatHebrewNumber(15),'ט״ו');
  assert.equal(formatHebrewNumber(16),'ט״ז');
  assert.equal(formatHebrewNumber(year),'ה׳תשפ״ז');
  const rh = getJewishHolidays(year,{region:'israel'})
    .find(e=>e.id==='rosh_hashanah' && e.dayOfFestival===1);
  assert.deepEqual(rh.gregorianDate,civil);
  assert.deepEqual(toHebrew(rh.gregorianDate),rh.hebrewDate);
});

test('public library has no dependencies, CLI entry, or undocumented exports', () => {
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  assert.equal(pkg.type,'module');
  assert.equal(pkg.engines.node,'>=22');
  assert.equal(pkg.exports['.'],'./src/index.js');
  assert.equal(pkg.license,'MIT');
  for (const field of ['dependencies','devDependencies','optionalDependencies','peerDependencies','bin']) {
    assert.equal(Object.hasOwn(pkg,field),false,field);
  }
  const readme=readFileSync(new URL('../README.md',import.meta.url),'utf8');
  assert.ok(readme.trimEnd().endsWith(
    'Built by Meir Dvir · [https://github.com/MeiRR17](https://github.com/MeiRR17)'));
  const license=readFileSync(new URL('../LICENSE',import.meta.url),'utf8');
  assert.ok(license.includes('MIT License'));
  assert.ok(license.includes('Copyright (c) 2026 Meir Dvir'));
});
