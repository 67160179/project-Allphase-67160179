const test=require('node:test');const assert=require('node:assert/strict');
const {validDate,validateLoan,validId}=require('../src/services/loan-service');
const {formatAvailability,normalizeSearch}=require('../src/services/catalog-service');
test('valid ISO date and reject invalid dates',()=>{assert.equal(validDate('2026-10-25'),true);assert.equal(validDate('2026-02-30'),false);assert.equal(validDate('25/10/2026'),false);});
test('validate a complete loan',()=>assert.equal(validateLoan({book_id:1,member_id:2,loan_date:'2026-10-25',due_date:'2026-11-01'}),null));
test('reject invalid member and book ids',()=>{assert.ok(validateLoan({book_id:0,member_id:1,loan_date:'2026-10-25',due_date:'2026-11-01'}));assert.equal(validId('-1'),false);assert.equal(validId('5'),true);});
test('reject loan due before borrow date',()=>assert.ok(validateLoan({book_id:1,member_id:1,loan_date:'2026-10-25',due_date:'2026-10-20'})));
test('availability never negative',()=>assert.deepEqual(formatAvailability({book_id:1,total_copies:2},4),{book_id:1,total_copies:2,borrowed_copies:4,available_copies:0}));
test('normalize search input',()=>assert.equal(normalizeSearch('  Clean Code  '),'Clean Code'));
