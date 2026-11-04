import test from 'node:test';
import assert from 'node:assert/strict';
import { auditScriptCompliance } from './compliance';

test('flags prohibited medical cure claims as CRITICAL and BLOCKED', () => {
  const badScript = 'Produk Transfer Factor ini terbukti menyembuhkan kanker dan diabetes!';
  const result = auditScriptCompliance(badScript);
  assert.equal(result.isBlocked, true);
  assert.equal(result.overallStatus, 'BLOCKED');
  assert.ok(result.violations.some((v) => v.category === 'medical_cure'));
});

test('flags prohibited income promises as CRITICAL and BLOCKED', () => {
  const badScript = 'Gabung bisnis 4Life sekarang, pasti kaya dan dapat garansi penghasilan 50 juta!';
  const result = auditScriptCompliance(badScript);
  assert.equal(result.isBlocked, true);
  assert.equal(result.overallStatus, 'BLOCKED');
  assert.ok(result.violations.some((v) => v.category === 'income_guarantee'));
});

test('approves compliant educational health script', () => {
  const goodScript =
    'Menjaga daya tahan tubuh sangat penting bagi kita yang memasuki usia 40 tahun. Transfer factor dari kolostrum dan kuning telur membantu memelihara sistem imun tubuh secara alami.';
  const result = auditScriptCompliance(goodScript);
  assert.equal(result.isBlocked, false);
  assert.equal(result.overallStatus, 'PASSED');
  assert.equal(result.violations.length, 0);
  assert.ok(result.claims.length > 0);
});
