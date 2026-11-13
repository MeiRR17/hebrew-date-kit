import assert from 'node:assert/strict';
import test from 'node:test';
import {exportJewishHolidaysIcs, getJewishHolidays} from '../src/index.js';

const STAMP = '20261113T175700Z';
const options = (region='israel', locale='en') => ({region, locale, dtstamp: STAMP});

function unfold(text) {
  // Proper iCalendar unfolding removes the CRLF plus one leading WSP.
  return text.replace(/\r\n[ \t]/g, '').split('\r\n');
}

function eventRecords(text) {
  return unfold(text).join('\r\n').split('BEGIN:VEVENT\r\n').slice(1).map(block => {
    const [body] = block.split('END:VEVENT\r\n');
    return new Map(body.split('\r\n').filter(Boolean).map(line => {
      const index = line.indexOf(':');
      return [line.slice(0,index), line.slice(index+1)];
    }));
  });
}

test('iCalendar required container properties and all-day VEVENT fields', () => {
  const ics=exportJewishHolidaysIcs(5787,options());
  const lines=unfold(ics);
  assert.equal(lines[0], 'BEGIN:VCALENDAR');
  assert.equal(lines[1], 'VERSION:2.0');
  assert.equal(lines[2], 'PRODID:-//MeiRR17//hebrew-date-kit//EN');
  assert.equal(lines[3], 'CALSCALE:GREGORIAN');
  assert.ok(lines.includes('END:VCALENDAR'));
  assert.ok(ics.endsWith('END:VCALENDAR\r\n'));
  assert.equal(ics.replaceAll('\r\n','').includes('\n'),false);
  const records=eventRecords(ics);
  assert.equal(records.length,getJewishHolidays(5787,{region:'israel'}).length);
  for(const record of records){
    assert.match(record.get('UID'),/^[a-z_]+-\d+-israel@MeiRR17\.github\.io$/);
    assert.equal(record.get('DTSTAMP'),STAMP);
    assert.match(record.get('DTSTART;VALUE=DATE'),/^\d{8}$/);
    assert.ok(record.get('SUMMARY')?.length);
    assert.ok(record.get('DESCRIPTION')?.includes('\\n'));
    assert.equal(record.get('TRANSP'),'TRANSPARENT');
    assert.equal(record.has('DTEND'),false);
    assert.equal(record.has('DURATION'),false);
  }
});

test('stable event IDs, day dates, and region-specific names match holiday API', () => {
  for(const year of [5784,5785,5787]){
    for(const region of ['israel','diaspora']){
      for(const locale of ['en','he']){
        const ics=exportJewishHolidaysIcs(year,options(region,locale));
        const records=eventRecords(ics);
        const source=getJewishHolidays(year,{region,locale});
        assert.equal(records.length,source.length);
        assert.deepEqual(records.map(x=>x.get('DTSTART;VALUE=DATE')),
          source.map(x=>String(x.gregorianDate.year).padStart(4,'0')+
            String(x.gregorianDate.month).padStart(2,'0')+
            String(x.gregorianDate.day).padStart(2,'0')));
        assert.deepEqual(records.map(x=>x.get('UID')),
          source.map(x=>x.id+'-'+x.absoluteDay+'-'+region+'@MeiRR17.github.io'));
        const uidSet=new Set(records.map(x=>x.get('UID')));
        assert.equal(uidSet.size,records.length);
      }
    }
  }
});

test('Hebrew names and RFC TEXT escaping use UTF-8-safe folding', () => {
  const he=exportJewishHolidaysIcs(5787,options('israel','he'));
  assert.match(he,/SUMMARY:ראש השנה/);
  assert.match(he,/SUMMARY:חול המועד סוכות/);
  assert.match(he,/X-WR-CALNAME:מועדים 5787/);
  assert.ok(unfold(he).join('\r\n').includes('\\nאזור: ישראל'));
  assert.ok(he.includes('\r\n '), 'multibyte Hebrew descriptions should be folded');
  for(const row of he.split('\r\n')){
    assert.ok(Buffer.byteLength(row,'utf8')<=75,
      'folded line exceeds 75 UTF-8 octets: '+row);
  }
  // Unfold and verify all characters survive at their original code points.
  const records=eventRecords(he);
  assert.equal(records[0].get('SUMMARY'),'ראש השנה');
  assert.ok(records[0].get('DESCRIPTION').includes('תאריך עברי: א׳ בתשרי תשפ״ז'));
  assert.ok(records[0].get('DESCRIPTION').includes('\\n'));
});

test('calendar overlays keep overlapping observances as separate VEVENTs', () => {
  const israel=eventRecords(exportJewishHolidaysIcs(5787,options('israel')));
  const diaspora=eventRecords(exportJewishHolidaysIcs(5787,options('diaspora')));
  const on=(records,date)=>records.filter(e=>e.get('DTSTART;VALUE=DATE')===date);
  const onSimchatTorah=on(israel,'20261003');
  assert.ok(onSimchatTorah.some(e=>e.get('SUMMARY')==='Simchat Torah'));
  assert.ok(onSimchatTorah.some(e=>e.get('SUMMARY')==='Shemini Atzeret'));
  assert.ok(on(diaspora,'20261004').some(e=>e.get('SUMMARY')==='Simchat Torah'));
  assert.equal(on(israel,'20261004').some(e=>e.get('SUMMARY')==='Simchat Torah'),false);
  const holHamos=on(israel,'20261002');
  assert.ok(holHamos.some(e=>e.get('SUMMARY')==='Hoshana Rabbah'));
  assert.ok(holHamos.some(e=>e.get('SUMMARY')==='Sukkot Chol HaMoed'));
  const unique=new Set(israel.map(e=>e.get('UID')));
  assert.equal(unique.size,israel.length);
});

test('fixed dtstamp makes output byte-identical and generated stamps are valid', () => {
  assert.equal(exportJewishHolidaysIcs(5787,options()),
    exportJewishHolidaysIcs(5787,options()));
  const defaultTimestamp=exportJewishHolidaysIcs(5787,{region:'israel'});
  for(const rec of eventRecords(defaultTimestamp)) {
    assert.match(rec.get('DTSTAMP'),/^\d{8}T\d{6}Z$/);
  }
  assert.equal(defaultTimestamp.startsWith('BEGIN:VCALENDAR\r\n'),true);
});

test('invalid region, locale, timestamp and Hebrew year are rejected', () => {
  for(const bad of [undefined,null,[],{},'israel',{region:'invalid'},
    {region:'israel',locale:null}, {region:'israel',locale:'fr'}]){
    assert.throws(()=>exportJewishHolidaysIcs(5787,bad),
      {name:/^(TypeError|RangeError)$/});
  }
  for(const invalid of ['',null,0,'20261113','20261113T000000',
    '20260230T000000Z','20261301T000000Z','20261113T246000Z',
    '20261113T000061Z','20261113T000000Z\r\nBEGIN:FAKE']){
    assert.throws(()=>exportJewishHolidaysIcs(5787,
      {region:'israel',dtstamp:invalid}),RangeError);
  }
  for(const invalid of [0,-1,5787.2,'5787',null,20000,NaN]){
    assert.throws(()=>exportJewishHolidaysIcs(invalid,options()),RangeError);
  }
});

test('all ICS output lines respect 75-octet bound in English and Hebrew', () => {
  for(const year of [5782,5784,5785,5787]){
    for(const region of ['israel','diaspora']){
      for(const locale of ['en','he']){
        const ics=exportJewishHolidaysIcs(year,options(region,locale));
        for(const row of ics.split('\r\n')){
          assert.ok(Buffer.byteLength(row,'utf8')<=75,
            year+'/'+region+'/'+locale+': '+row);
        }
      }
    }
  }
});
