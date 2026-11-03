/* global maestro, output -- provided by Maestro's script runtime */
// "sieben · zwei · fünf" → output.gate0..2 = 7, 2, 5 (same words as features/parents/gate.ts)
const words = ['eins', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun'];
const parts = maestro.copiedText.split(/\s+/).filter(function (p) {
  return words.indexOf(p) >= 0;
});
for (let i = 0; i < parts.length; i++) output['gate' + i] = words.indexOf(parts[i]) + 1;
