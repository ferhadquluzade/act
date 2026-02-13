// Test to verify selection/highlighting works

import { CursorMovement } from './src/handlers/CursorMovement.js';

class MockEditor {
  constructor() {
    this.activeTab = {
      lines: ['hello world test', 'another line here'],
      cursorX: 0,
      cursorY: 0,
      selectionStart: null,
      selectionEnd: null,
    };
  }
  
  render() {}
  adjustScroll() {}
}

const editor = new MockEditor();
const movement = new CursorMovement(editor);

console.log('Testing Selection Feature');
console.log('=========================\n');

// Test Shift+Right to select
console.log('Initial state:');
console.log('  Cursor: (0, 0)');
console.log('  Selection: null\n');

// Move right with shift (should select)
movement.moveCursor(1, 0, true);
console.log('After Shift+Right (move with selection):');
console.log('  Cursor:', `(${editor.activeTab.cursorX}, ${editor.activeTab.cursorY})`);
console.log('  Selection Start:', editor.activeTab.selectionStart);
console.log('  Selection End:', editor.activeTab.selectionEnd);

if (editor.activeTab.selectionStart && editor.activeTab.selectionEnd) {
  console.log('  ✓ Selection created!\n');
} else {
  console.log('  ✗ Selection NOT created!\n');
}

// Continue selecting
movement.moveCursor(1, 0, true);
movement.moveCursor(1, 0, true);
console.log('After 3 more Shift+Right:');
console.log('  Cursor:', `(${editor.activeTab.cursorX}, ${editor.activeTab.cursorY})`);
console.log('  Selection Start:', editor.activeTab.selectionStart);
console.log('  Selection End:', editor.activeTab.selectionEnd);

// Move without shift (should clear selection)
movement.moveCursor(1, 0, false);
console.log('\nAfter Right (without shift):');
console.log('  Cursor:', `(${editor.activeTab.cursorX}, ${editor.activeTab.cursorY})`);
console.log('  Selection:', editor.activeTab.selectionStart);

if (!editor.activeTab.selectionStart && !editor.activeTab.selectionEnd) {
  console.log('  ✓ Selection cleared!\n');
} else {
  console.log('  ✗ Selection NOT cleared!\n');
}
