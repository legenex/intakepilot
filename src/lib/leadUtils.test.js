import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { normalizePhone, getLeadName, formatCents } from './leadUtils.js';

describe('normalizePhone', () => {
  it('adds +1 for 10-digit US numbers', () => {
    assert.equal(normalizePhone('4155551212'), '+14155551212');
  });
  it('keeps 11-digit numbers that start with 1', () => {
    assert.equal(normalizePhone('14155551212'), '+14155551212');
  });
  it('returns empty input unchanged', () => {
    assert.equal(normalizePhone(''), '');
    assert.equal(normalizePhone(null), null);
  });
});

describe('getLeadName', () => {
  it('joins first and last name', () => {
    assert.equal(getLeadName({ first_name: 'Ada', last_name: 'Lovelace' }), 'Ada Lovelace');
  });
  it('falls back to phone then Unknown', () => {
    assert.equal(getLeadName({ phone: '+14155551212' }), '+14155551212');
    assert.equal(getLeadName({}), 'Unknown');
    assert.equal(getLeadName(null), 'Unknown');
  });
});

describe('formatCents', () => {
  it('formats zero and dollars', () => {
    assert.equal(formatCents(0), '$0');
    assert.equal(formatCents(1500), '$15.00');
  });
});
