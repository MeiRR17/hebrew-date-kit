import assert from 'node:assert/strict';
import test from 'node:test';
import {getJewishHolidays} from '../src/index.js';

function normalize(events) {
  return events.map(({name, ...metadata}) => metadata);
}

test('default English names and explicit English locale are identical', () => {
  for (const year of [5777, 5782, 5784, 5785, 5787, 5790]) {
    for (const region of ['israel', 'diaspora']) {
      assert.deepEqual(
        getJewishHolidays(year, {region}),
        getJewishHolidays(year, {region, locale: 'en'})
      );
    }
  }
});

test('Hebrew localization preserves IDs, calendar dates, types, and sort order', () => {
  for (const year of [5777, 5782, 5784, 5785, 5787, 5790]) {
    for (const region of ['israel', 'diaspora']) {
      const english = getJewishHolidays(year, {region});
      const hebrew = getJewishHolidays(year, {region, locale: 'he'});
      assert.deepEqual(normalize(hebrew), normalize(english));
      for (const event of hebrew) {
        assert.match(event.name, /[\u0590-\u05ff]/u);
        assert.ok(!event.name.includes('undefined'));
      }
    }
  }
});

test('Hebrew names cover festivals, fasts, and simultaneous observances', () => {
  const israel = getJewishHolidays(5787, {region: 'israel', locale: 'he'});
  const diaspora = getJewishHolidays(5787, {region: 'diaspora', locale: 'he'});
  const find = (events, id, month, day) => events.find(e =>
    e.id === id && e.hebrewDate.month === month && e.hebrewDate.day === day
  )?.name;
  assert.equal(find(israel, 'rosh_hashanah', 7, 1), 'ראש השנה');
  assert.equal(find(israel, 'yom_kippur', 7, 10), 'יום הכיפורים');
  assert.equal(find(israel, 'sukkot', 7, 15), 'סוכות');
  assert.equal(find(israel, 'sukkot', 7, 16), 'חול המועד סוכות');
  assert.equal(find(israel, 'hoshana_rabbah', 7, 21), 'הושענא רבה');
  assert.equal(find(israel, 'simchat_torah', 7, 22), 'שמחת תורה');
  assert.equal(find(diaspora, 'simchat_torah', 7, 23), 'שמחת תורה');
  assert.equal(find(israel, 'pesach', 1, 15), 'פסח');
  assert.equal(find(israel, 'pesach', 1, 16), 'חול המועד פסח');
  assert.equal(find(diaspora, 'pesach', 1, 22), 'פסח');
  assert.equal(find(israel, 'fast_of_esther', 13, 13), 'תענית אסתר');
  assert.equal(find(israel, 'hanukkah', 9, 25), 'חנוכה');
  assert.equal(find(israel, 'shavuot', 3, 6), 'שבועות');
  assert.equal(find(israel, 'tisha_bav', 5, 9), 'תשעה באב');
});

test('all known traditional holiday IDs have localized names', () => {
  const names = new Map();
  for (let year = 5777; year <= 5795; year += 1) {
    for (const region of ['israel', 'diaspora']) {
      for (const event of getJewishHolidays(year, {region, locale: 'he'})) {
        if (event.type !== 'chol_hamoed') names.set(event.id, event.name);
      }
    }
  }
  const expectedIDs = [
    'rosh_hashanah', 'fast_of_gedaliah', 'yom_kippur', 'sukkot',
    'hoshana_rabbah', 'shemini_atzeret', 'simchat_torah', 'hanukkah',
    'tenth_of_tevet', 'tu_bishvat', 'purim_katan', 'shushan_purim_katan',
    'fast_of_esther', 'purim', 'shushan_purim', 'pesach', 'pesach_sheni',
    'lag_baomer', 'shavuot', 'seventeenth_of_tammuz', 'tisha_bav', 'tu_bav',
  ];
  assert.deepEqual([...names.keys()].sort(), expectedIDs.sort());
  for (const name of names.values()) assert.match(name, /[\u0590-\u05ff]/u);
});

test('invalid locales are rejected rather than silently falling back', () => {
  for (const locale of ['fr', 'HE', '', null, false, 3, ['he']]) {
    assert.throws(() => getJewishHolidays(5787, {region:'israel', locale}), RangeError);
  }
  assert.deepEqual(getJewishHolidays(5787, {region:'israel', locale:undefined}),
    getJewishHolidays(5787, {region:'israel'}));
});
