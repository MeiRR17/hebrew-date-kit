import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getHebrewMonthCalendar, toHebrew, toGregorian,
  getHebrewWeekday, getJewishHolidays,
} from '../src/index.js';

const month = (year, number, options={region:'israel'}) =>
  getHebrewMonthCalendar(year, number, options);
const days = grid => grid.weeks.flat().filter(Boolean);
const find = (grid, day) => days(grid).find(cell => cell.hebrewDate.day === day);
const event = (cell, id) => cell.holidays.find(holiday => holiday.id === id);

test('Tishrei 5787 starts on Saturday and fits six Sunday-first weeks', () => {
  const grid = month(5787, 7);
  assert.equal(grid.year, 5787);
  assert.equal(grid.month, 7);
  assert.equal(grid.monthName, 'Tishrei');
  assert.equal(grid.region, 'israel');
  assert.equal(grid.locale, 'en');
  assert.equal(grid.weekStartsOn, 0);
  assert.equal(grid.daysInMonth, 30);
  assert.equal(grid.weeks.length, 6);
  assert.ok(grid.weeks.every(week => week.length === 7));
  assert.ok(grid.weeks[0].slice(0,6).every(cell => cell === null));
  assert.equal(grid.weeks[0][6].hebrewDate.day, 1);
  assert.deepEqual(grid.weeks[0][6].gregorianDate, {year:2026,month:9,day:12});
  assert.equal(grid.weeks[0][6].weekday, 6);
  assert.equal(grid.weeks[1][0].hebrewDate.day, 2);
  assert.deepEqual(days(grid).map(cell => cell.hebrewDate.day),
    Array.from({length:30}, (_, i) => i+1));
  assert.equal(grid.weeks[5].filter(Boolean).length, 1);
});

test('weekStartsOn rotates the columns without changing day records', () => {
  const baseline = month(5787,7);
  for (const first of [1,2,3,4,5,6]) {
    const rotated = month(5787,7,{region:'israel',weekStartsOn:first});
    assert.ok(rotated.weeks.length>=4&&rotated.weeks.length<=6);
    assert.ok(rotated.weeks.every(row=>row.length===7));
    assert.deepEqual(days(rotated),days(baseline));
    const beginning = rotated.weeks[0];
    const expectedLeading=(6-first+7)%7;
    assert.ok(beginning.slice(0,expectedLeading).every(x=>x===null));
    assert.equal(beginning[expectedLeading].hebrewDate.day,1);
    for (const row of rotated.weeks) {
      row.forEach((cell,column)=>{
        if(cell) assert.equal(cell.weekday,(first+column)%7);
      });
    }
  }
});

test('Israel and diaspora share dates but retain regional holiday differences', () => {
  for (const [year,mon] of [[5787,7],[5787,1],[5784,13],[5785,12]]) {
    const israel = month(year,mon);
    const diaspora = month(year,mon,{region:'diaspora'});
    const stripHolidays=grid=>days(grid).map(({holidays,...rest})=>rest);
    assert.deepEqual(stripHolidays(israel),stripHolidays(diaspora));
  }
  const ilT = month(5787,7), abroadT=month(5787,7,{region:'diaspora'});
  assert.equal(event(find(ilT,16),'sukkot').type,'chol_hamoed');
  assert.equal(event(find(abroadT,16),'sukkot').type,'yom_tov');
  assert.ok(event(find(ilT,22),'simchat_torah'));
  assert.equal(event(find(abroadT,22),'simchat_torah'),undefined);
  assert.ok(event(find(abroadT,23),'simchat_torah'));

  const ilP=month(5787,1), abroadP=month(5787,1,{region:'diaspora'});
  assert.equal(event(find(ilP,16),'pesach').type,'chol_hamoed');
  assert.equal(event(find(abroadP,16),'pesach').type,'yom_tov');
  assert.equal(event(find(ilP,22),'pesach'),undefined);
  assert.equal(event(find(abroadP,22),'pesach').type,'yom_tov');
});

test('overlapping observances remain distinct on their shared day', () => {
  const israel=month(5787,7);
  const day21=find(israel,21);
  assert.ok(event(day21,'hoshana_rabbah'));
  assert.ok(event(day21,'sukkot'));
  assert.equal(day21.holidays.filter(e=>e.id==='sukkot').length,1);
  assert.equal(day21.holidays.filter(e=>e.id==='hoshana_rabbah').length,1);
  const day22=find(israel,22);
  assert.ok(event(day22,'shemini_atzeret'));
  assert.ok(event(day22,'simchat_torah'));
});

test('locale changes only display names, not weekday or event metadata', () => {
  const en=month(5787,7,{region:'israel'});
  const he=month(5787,7,{region:'israel',locale:'he'});
  assert.equal(he.monthName,'תשרי');
  assert.equal(en.monthName,'Tishrei');
  assert.equal(event(find(he,1),'rosh_hashanah').name,'ראש השנה');
  assert.equal(event(find(he,16),'sukkot').name,'חול המועד סוכות');
  assert.equal(event(find(en,1),'rosh_hashanah').name,'Rosh Hashanah');
  const sansNames=grid=>days(grid).map(cell=>({
    ...cell,holidays:cell.holidays.map(({name,...rest})=>rest),
  }));
  assert.deepEqual(sansNames(en),sansNames(he));
});

test('Adar II and regular Adar have the correct lengths and Purim events', () => {
  const leap=month(5784,13,{region:'israel',locale:'he'});
  const normal=month(5785,12,{region:'israel',locale:'he'});
  assert.equal(leap.monthName,'אדר ב׳');
  assert.equal(normal.monthName,'אדר');
  assert.equal(leap.daysInMonth,29);
  assert.equal(normal.daysInMonth,29);
  assert.ok(event(find(leap,14),'purim'));
  assert.ok(event(find(normal,14),'purim'));
  assert.throws(()=>month(5785,13),RangeError);
  assert.equal(month(5784,12).monthName,'Adar I');
});

test('Cheshvan/Kislev year types retain their varying month lengths', () => {
  for (const [year,cheshvan,kislev] of [[5784,29,29],[5785,30,30],[5786,29,30]]) {
    assert.equal(month(year,8).daysInMonth,cheshvan);
    assert.equal(month(year,9).daysInMonth,kislev);
  }
});

test('all calendar cells round-trip and match source holiday events', () => {
  for(const [year,mon] of [[5782,9],[5784,13],[5785,8],[5787,7],[5787,1],[5790,3]]) {
    for (const region of ['israel','diaspora']) {
      const grid=month(year,mon,{region,locale:'he'});
      const eventList=getJewishHolidays(year,{region,locale:'he'});
      const byDay=eventList.filter(e=>e.hebrewDate.month===mon);
      const actual=[];
      assert.equal(days(grid).length,grid.daysInMonth);
      for (const cell of days(grid)) {
        assert.deepEqual(toHebrew(cell.gregorianDate),cell.hebrewDate);
        assert.deepEqual(toGregorian(cell.hebrewDate),cell.gregorianDate);
        assert.equal(getHebrewWeekday(cell.hebrewDate),cell.weekday);
        for (const holiday of cell.holidays) {
          const original=byDay.find(e=>e.id===holiday.id && e.hebrewDate.day===cell.hebrewDate.day);
          assert.ok(original);
          assert.equal(holiday.name,original.name);
          assert.equal(holiday.type,original.type);
          if(original.dayOfFestival !== undefined) assert.equal(holiday.dayOfFestival,original.dayOfFestival);
          actual.push(original.id+'@'+original.absoluteDay);
        }
      }
      assert.deepEqual(actual.sort(),byDay.map(x=>x.id+'@'+x.absoluteDay).sort());
    }
  }
});

test('invalid options, dates, months, locales and week starts are rejected', () => {
  for(const options of [null, undefined, [], 'israel', {}, {region:'nope'},
    {region:'israel',locale:'fr'}, {region:'diaspora',locale:null},
    {region:'israel',weekStartsOn:-1},{region:'israel',weekStartsOn:7},
    {region:'israel',weekStartsOn:2.5},{region:'israel',weekStartsOn:'0'},
    {region:'israel',weekStartsOn:NaN},{region:'israel',weekStartsOn:Infinity},
  ]) {
    assert.throws(()=>getHebrewMonthCalendar(5787,7,options),{name:/^(RangeError|TypeError)$/});
  }
  for (const year of [0,-1,'5787',NaN,Infinity,1,20000]) {
    assert.throws(()=>month(year,7),RangeError);
  }
  for (const mon of [0,-1,14,2.5,'7',null]) {
    assert.throws(()=>month(5787,mon),RangeError);
  }
});

test('returned data is fresh and does not mutate source events or other grids', () => {
  const original=month(5787,7,{region:'israel',locale:'he'});
  const first=original.weeks[0][6];
  first.hebrewDate.day=42;
  first.gregorianDate.year=42;
  first.holidays[0].name='Modified';
  const other=month(5787,7,{region:'israel',locale:'he'});
  assert.deepEqual(other.weeks[0][6].hebrewDate,{year:5787,month:7,day:1});
  assert.deepEqual(other.weeks[0][6].gregorianDate,{year:2026,month:9,day:12});
  assert.equal(other.weeks[0][6].holidays[0].name,'ראש השנה');
});
