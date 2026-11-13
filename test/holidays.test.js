import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {getJewishHolidays} from '../src/holidays.js';
import {hebrewMonthLength, hebrewToAbsolute, gregorianToAbsolute, isHebrewLeapYear} from '../src/calendar-core.js';

const fixture = JSON.parse(readFileSync(new URL('./fixtures/holiday-cases.json', import.meta.url), 'utf8'));
const types = {y:'yom_tov', c:'chol_hamoed', f:'fast', o:'observance'};
const cache = new Map();
function events(year, region) {
  const key = year + '/' + region;
  if (!cache.has(key)) cache.set(key, getJewishHolidays(year, {region}));
  return cache.get(key);
}
function at(year, region, id, month, day) {
  return events(year, region).filter(e => e.id === id && e.hebrewDate.month === month && e.hebrewDate.day === day);
}

test('72 independent dates and 15 absence cases match their observances', () => {
  assert.equal(fixture.expected.length, 72);
  assert.equal(fixture.absent.length, 15);
  for (const [year, code, id, month, day, gy, gm, gd, absoluteDay, type, festivalDay] of fixture.expected) {
    const region = code === 'i' ? 'israel' : 'diaspora';
    const observed = at(year, region, id, month, day);
    assert.equal(observed.length, 1, year + '/' + region + '/' + id + '/' + month + '/' + day);
    const [event] = observed;
    assert.deepEqual(event.hebrewDate, {year, month, day});
    assert.deepEqual(event.gregorianDate, {year: gy, month: gm, day: gd});
    assert.equal(event.absoluteDay, absoluteDay);
    assert.equal(event.type, types[type]);
    if (festivalDay) assert.equal(event.dayOfFestival, festivalDay);
  }
  for (const [year, code, id, month, day] of fixture.absent) {
    const region = code === 'i' ? 'israel' : 'diaspora';
    assert.equal(at(year, region, id, month, day).length, 0);
  }
});

test('Pesach seven versus eight days and the four diaspora Yom Tov days', () => {
  for (const region of ['israel', 'diaspora']) {
    const pesach = events(5787, region).filter(e => e.id === 'pesach');
    assert.equal(pesach.length, region === 'israel' ? 7 : 8);
    assert.deepEqual(pesach.filter(e => e.type === 'yom_tov').map(e => e.hebrewDate.day),
      region === 'israel' ? [15,21] : [15,16,21,22]);
    assert.equal(pesach[0].dayOfFestival, 1);
    assert.equal(pesach.at(-1).dayOfFestival, pesach.length);
  }
});

test('Sukkot second day, Hoshana Rabbah, overlapping observances', () => {
  assert.equal(at(5787, 'israel', 'sukkot', 7, 16)[0].type, 'chol_hamoed');
  assert.equal(at(5787, 'diaspora', 'sukkot', 7, 16)[0].type, 'yom_tov');
  for (const region of ['israel','diaspora']) {
    const hoshana = at(5787, region, 'hoshana_rabbah', 7, 21)[0];
    const sukkot = at(5787, region, 'sukkot', 7, 21)[0];
    assert.equal(hoshana.absoluteDay, sukkot.absoluteDay);
  }
});

test('Shemini Atzeret, Simchat Torah and Shavuot region distinctions', () => {
  for (const region of ['israel','diaspora']) {
    assert.equal(at(5787, region, 'shemini_atzeret', 7, 22).length, 1);
    assert.equal(events(5787, region).filter(e => e.id === 'shavuot').length,
      region === 'israel' ? 1 : 2);
  }
  assert.equal(at(5787, 'israel', 'simchat_torah', 7, 22).length, 1);
  assert.equal(at(5787, 'israel', 'simchat_torah', 7, 23).length, 0);
  assert.equal(at(5787, 'diaspora', 'simchat_torah', 7, 22).length, 0);
  assert.equal(at(5787, 'diaspora', 'simchat_torah', 7, 23).length, 1);
  assert.equal(at(5787, 'israel', 'shemini_atzeret', 7, 22)[0].absoluteDay,
    at(5787, 'israel', 'simchat_torah', 7, 22)[0].absoluteDay);
});

test('eight Hanukkah days cross Tevet in both Cheshvan/Kislev year types', () => {
  for (const year of [5777,5784,5785,5786,5787]) {
    for (const region of ['israel','diaspora']) {
      const holiday = events(year, region).filter(e => e.id === 'hanukkah');
      assert.equal(holiday.length, 8);
      assert.deepEqual(holiday.map(e => e.dayOfFestival), [1,2,3,4,5,6,7,8]);
      assert.deepEqual(holiday[0].hebrewDate, {year,month:9,day:25});
      assert.deepEqual(holiday[7].hebrewDate, {
        year, month:10, day: hebrewMonthLength(year,9) === 29 ? 3 : 2,
      });
      for (let i=1; i<8; i+=1) assert.equal(holiday[i].absoluteDay-holiday[i-1].absoluteDay,1);
    }
  }
});

test('Purim in Adar II only in leap years and Purim Katan in Adar I', () => {
  for (const year of [5782,5784,5785,5786,5787]) {
    for (const region of ['israel','diaspora']) {
      const leap = isHebrewLeapYear(year);
      const purim = events(year,region).filter(e=>e.id==='purim');
      assert.equal(purim.length,1);
      assert.equal(purim[0].hebrewDate.month, leap ? 13 : 12);
      assert.equal(events(year,region).filter(e=>e.id==='purim_katan').length,leap?1:0);
    }
  }
});

test('fasting postponement to Sunday or advance to Thursday for Esther', () => {
  for (const [year,id,month,actualDay,nominalDay,shift] of [
    [5785,'fast_of_gedaliah',7,4,3,1],
    [5782,'seventeenth_of_tammuz',4,18,17,1],
    [5782,'tisha_bav',5,10,9,1],
    [5784,'fast_of_esther',13,11,13,-2],
  ]) {
    const nominal = hebrewToAbsolute({year,month,day:nominalDay});
    assert.equal(nominal%7,6);
    for (const region of ['israel','diaspora']) {
      const found = at(year,region,id,month,actualDay);
      assert.equal(found.length,1);
      assert.equal(found[0].absoluteDay-nominal,shift);
      assert.notEqual(found[0].absoluteDay%7,6);
      assert.equal(events(year,region).filter(e=>e.id===id).length,1);
    }
  }
  assert.equal(at(5787,'israel','tenth_of_tevet',10,10).length,1);
});

test('chronological sorted output, valid cross-calendar dates, no duplicates', () => {
  for (const year of [5782,5784,5785,5786,5787]) {
    for (const region of ['israel','diaspora']) {
      const values=events(year,region);
      const keys=new Set();
      values.forEach((e,i)=>{
        assert.equal(e.hebrewDate.year,year);
        assert.equal(e.absoluteDay,hebrewToAbsolute(e.hebrewDate));
        assert.equal(e.absoluteDay,gregorianToAbsolute(e.gregorianDate));
        assert.ok(['yom_tov','chol_hamoed','fast','observance'].includes(e.type));
        assert.ok(i===0||values[i-1].absoluteDay<=e.absoluteDay);
        const key=e.id+'@'+e.absoluteDay;
        assert.ok(!keys.has(key),key);
        keys.add(key);
      });
    }
  }
});

test('regional differences and event counts hold over a 19-year cycle', () => {
  for(let year=5770;year<=5788;year+=1){
    const israel=events(year,'israel'), diaspora=events(year,'diaspora');
    assert.equal(diaspora.length-israel.length,2);
    for(const region of ['israel','diaspora']){
      const list=events(year,region);
      for(const [id,n] of [['rosh_hashanah',2],['yom_kippur',1],['sukkot',7],['hanukkah',8]]){
        assert.equal(list.filter(e=>e.id===id).length,n);
      }
    }
  }
});

test('reject invalid years, options, regions and unsupported Gregorian years', () => {
  for(const bad of [undefined,null,[],'israel',{}, {region:'invalid'}, {region:null}]){
    assert.throws(()=>getJewishHolidays(5787,bad), {name:/^(TypeError|RangeError)$/});
  }
  for(const bad of [undefined,null,'5787',0,-1,1.5,20001,NaN,Infinity,3n,1,3761,13760,20000]){
    assert.throws(()=>getJewishHolidays(bad,{region:'israel'}),RangeError);
  }
  const first=getJewishHolidays(5787,{region:'israel'});
  first[0].hebrewDate.day=-1; first[0].name='modified';
  const second=getJewishHolidays(5787,{region:'israel'});
  assert.notEqual(second[0].hebrewDate.day,-1);
  assert.notEqual(second[0].name,'modified');
});
