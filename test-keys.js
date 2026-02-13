#!/usr/bin/env node

// Key sequence tester
// Run this to see what byte sequences your terminal sends for different key combinations

console.log('Key Sequence Tester');
console.log('==================');
console.log('Press keys to see their byte sequences');
console.log('Try: Alt+Left, Alt+Right, Alt+Backspace, Alt+Delete');
console.log('Press Ctrl+C to exit\n');

process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.setEncoding(null);

process.stdin.on('data', (data) => {
  // Exit on Ctrl+C
  if (data.length === 1 && data[0] === 0x03) {
    console.log('\nExiting...');
    process.exit(0);
  }
  
  const bytes = Array.from(data);
  const hexBytes = bytes.map(b => '0x' + b.toString(16).padStart(2, '0')).join(', ');
  const display = bytes.map(b => {
    if (b === 0x1b) return 'ESC';
    if (b === 0x7f) return 'DEL';
    if (b === 0x08) return 'BS';
    if (b >= 32 && b <= 126) return String.fromCharCode(b);
    return `\\x${b.toString(16).padStart(2, '0')}`;
  }).join(' ');
  
  console.log(`Bytes: [${hexBytes}]`);
  console.log(`Display: ${display}`);
  console.log('---');
});

process.on('SIGINT', () => {
  console.log('\nExiting...');
  process.exit(0);
});
