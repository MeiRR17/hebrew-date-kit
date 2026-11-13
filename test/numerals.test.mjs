import assert from 'node:assert/strict';
import test from 'node:test';
import { formatHebrewNumber, formatHebrewYear } from '../src/numerals.mjs';

test('single letters and geresh', () => {
  for (const [n, output] of [[1,'א׳'],[9,'ט׳'],[10,'י׳'],[20,'כ׳'],[100,'ק׳'],[400,'ת׳']]) {
    assert.equal(formatHebrewNumber(n), output);
  }
});
test('gershayim and special spellings of 15 and 16', () => {
  for (const [n, output] of [[11,'י״א'],[15,'ט״ו'],[16,'ט״ז'],[17,'י״ז'],[115,'קט״ו'],[116,'קט״ז'],[215,'רט״ו'],[516,'תקט״ז']]) {
    assert.equal(formatHebrewNumber(n), output);
  }
});
test('hundreds and repeated tav', () => {
  for (const [n, output] of [[90,'צ׳'],[99,'צ״ט'],[399,'שצ״ט'],[500,'ת״ק'],[600,'ת״ר'],[700,'ת״ש'],[800,'ת״ת'],[900,'תת״ק'],[999,'תתקצ״ט']]) {
    assert.equal(formatHebrewNumber(n), output);
  }
});
test('thousands and large numbers', () => {
  for (const [n, output] of [[1000,'א׳'],[1001,'א׳א׳'],[1015,'א׳ט״ו'],[2000,'ב׳'],[5000,'ה׳'],[5787,'ה׳תשפ״ז'],[10000,'י׳'],[999999,'תתקצ״טתתקצ״ט']]) {
    assert.equal(formatHebrewNumber(n), output);
  }
});
test('abbreviated contemporary Hebrew years', () => {
  for (const [n, output] of [[1,'א׳'],[5000,'ה׳'],[5001,'א׳'],[5715,'תשט״ו'],[5786,'תשפ״ו'],[5787,'תשפ״ז'],[5999,'תתקצ״ט'],[6000,'ו׳'],[6001,'ו׳א׳']]) {
    assert.equal(formatHebrewYear(n), output);
  }
});
test('invalid values fail without coercion', () => {
  for (const n of [0,-1,1.25,1e6,NaN,Infinity,-Infinity,'5787',null,undefined,3n]) {
    assert.throws(() => formatHebrewNumber(n), RangeError);
    assert.throws(() => formatHebrewYear(n), RangeError);
  }
});
