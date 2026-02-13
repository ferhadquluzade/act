// Comprehensive Test Suite for Act Editor
import { Tab } from './src/components/Tab.js';
import { CursorMovement } from './src/handlers/CursorMovement.js';
import { EditingOperations } from './src/handlers/EditingOperations.js';
import { ClipboardOperations } from './src/handlers/ClipboardOperations.js';

// Mock editor class
class MockEditor {
  constructor(lines = [''], cursorX = 0, cursorY = 0) {
    this.activeTab = {
      lines: [...lines],
      cursorX,
      cursorY,
      scrollOffset: 0,
      horizontalScrollOffset: 0,
      selectionStart: null,
      selectionEnd: null,
      modified: false,
      readOnly: false,
      saveState: () => {},
    };
  }
  
  render() {}
  adjustScroll() {}
  setStatus() {}
  
  getViewportHeight() { return 20; }
  getViewportWidth() { return 80; }
}

// Test utilities
let testsPassed = 0;
let testsFailed = 0;

function runTest(name, testFn) {
  try {
    testFn();
    console.log(`✓ ${name}`);
    testsPassed++;
  } catch (error) {
    console.log(`✗ ${name}`);
    console.log(`  Error: ${error.message}`);
    testsFailed++;
  }
}

function assertEqual(actual, expected, message) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${message}\n  Expected: ${JSON.stringify(expected)}\n  Actual: ${JSON.stringify(actual)}`);
  }
}

function assertTrue(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

console.log('═══════════════════════════════════════════════════════');
console.log('  Act Editor - Comprehensive Test Suite');
console.log('═══════════════════════════════════════════════════════\n');

// ===== CURSOR MOVEMENT TESTS =====
console.log('📍 Cursor Movement Tests');
console.log('─────────────────────────────────────────────────────\n');

runTest('Move cursor right', () => {
  const editor = new MockEditor(['hello world'], 0, 0);
  const movement = new CursorMovement(editor);
  movement.moveCursor(1, 0, false);
  assertEqual(editor.activeTab.cursorX, 1, 'Cursor should move right');
});

runTest('Move cursor left', () => {
  const editor = new MockEditor(['hello world'], 5, 0);
  const movement = new CursorMovement(editor);
  movement.moveCursor(-1, 0, false);
  assertEqual(editor.activeTab.cursorX, 4, 'Cursor should move left');
});

runTest('Move cursor down', () => {
  const editor = new MockEditor(['line1', 'line2'], 0, 0);
  const movement = new CursorMovement(editor);
  movement.moveCursor(0, 1, false);
  assertEqual(editor.activeTab.cursorY, 1, 'Cursor should move down');
});

runTest('Move cursor up', () => {
  const editor = new MockEditor(['line1', 'line2'], 0, 1);
  const movement = new CursorMovement(editor);
  movement.moveCursor(0, -1, false);
  assertEqual(editor.activeTab.cursorY, 0, 'Cursor should move up');
});

runTest('Cursor wraps to next line at end', () => {
  const editor = new MockEditor(['hello', 'world'], 5, 0);
  const movement = new CursorMovement(editor);
  movement.moveCursor(1, 0, false);
  assertEqual(editor.activeTab.cursorY, 1, 'Should wrap to next line');
  assertEqual(editor.activeTab.cursorX, 0, 'Cursor should be at start of line');
});

runTest('Cursor wraps to previous line at start', () => {
  const editor = new MockEditor(['hello', 'world'], 0, 1);
  const movement = new CursorMovement(editor);
  movement.moveCursor(-1, 0, false);
  assertEqual(editor.activeTab.cursorY, 0, 'Should wrap to previous line');
  assertEqual(editor.activeTab.cursorX, 5, 'Cursor should be at end of line');
});

runTest('Home moves to line start', () => {
  const editor = new MockEditor(['hello world'], 5, 0);
  const movement = new CursorMovement(editor);
  movement.home();
  assertEqual(editor.activeTab.cursorX, 0, 'Should move to start');
});

runTest('End moves to line end', () => {
  const editor = new MockEditor(['hello world'], 0, 0);
  const movement = new CursorMovement(editor);
  movement.end();
  assertEqual(editor.activeTab.cursorX, 11, 'Should move to end');
});

// ===== WORD MOVEMENT TESTS =====
console.log('\n📝 Word Movement Tests');
console.log('─────────────────────────────────────────────────────\n');

runTest('Move word left from end', () => {
  const editor = new MockEditor(['hello world test'], 16, 0);
  const movement = new CursorMovement(editor);
  movement.moveWordLeft(false);
  assertEqual(editor.activeTab.cursorX, 12, 'Should jump to word start');
});

runTest('Move word right from start', () => {
  const editor = new MockEditor(['hello world test'], 0, 0);
  const movement = new CursorMovement(editor);
  movement.moveWordRight(false);
  assertEqual(editor.activeTab.cursorX, 6, 'Should jump to next word');
});

runTest('Move word left with multiple spaces', () => {
  const editor = new MockEditor(['hello    world'], 13, 0);
  const movement = new CursorMovement(editor);
  movement.moveWordLeft(false);
  assertEqual(editor.activeTab.cursorX, 0, 'Should skip spaces and jump to word');
});

// ===== SELECTION TESTS =====
console.log('\n🎯 Selection Tests');
console.log('─────────────────────────────────────────────────────\n');

runTest('Shift+Right creates selection', () => {
  const editor = new MockEditor(['hello'], 0, 0);
  const movement = new CursorMovement(editor);
  movement.moveCursor(1, 0, true);
  assertTrue(editor.activeTab.selectionStart !== null, 'Selection should be created');
  assertTrue(editor.activeTab.selectionEnd !== null, 'Selection end should be set');
});

runTest('Moving without shift clears selection', () => {
  const editor = new MockEditor(['hello'], 0, 0);
  const movement = new CursorMovement(editor);
  movement.moveCursor(1, 0, true);
  movement.moveCursor(1, 0, false);
  assertEqual(editor.activeTab.selectionStart, null, 'Selection should be cleared');
});

runTest('Shift+Word movement creates selection', () => {
  const editor = new MockEditor(['hello world'], 0, 0);
  const movement = new CursorMovement(editor);
  movement.moveWordRight(true);
  assertTrue(editor.activeTab.selectionStart !== null, 'Selection should be created');
  assertEqual(editor.activeTab.selectionEnd.x, 6, 'Selection should extend to word boundary');
});

// ===== EDITING OPERATIONS TESTS =====
console.log('\n✏️  Editing Operations Tests');
console.log('─────────────────────────────────────────────────────\n');

runTest('Insert character', () => {
  const editor = new MockEditor(['hello'], 5, 0);
  const ops = new EditingOperations(editor);
  ops.insertChar('!');
  assertEqual(editor.activeTab.lines[0], 'hello!', 'Character should be inserted');
  assertEqual(editor.activeTab.cursorX, 6, 'Cursor should advance');
});

runTest('Delete character (backspace)', () => {
  const editor = new MockEditor(['hello'], 5, 0);
  const ops = new EditingOperations(editor);
  ops.deleteChar();
  assertEqual(editor.activeTab.lines[0], 'hell', 'Character should be deleted');
  assertEqual(editor.activeTab.cursorX, 4, 'Cursor should move back');
});

runTest('Delete forward', () => {
  const editor = new MockEditor(['hello'], 0, 0);
  const ops = new EditingOperations(editor);
  ops.deleteForward();
  assertEqual(editor.activeTab.lines[0], 'ello', 'Character should be deleted forward');
  assertEqual(editor.activeTab.cursorX, 0, 'Cursor should stay in place');
});

runTest('Insert newline', () => {
  const editor = new MockEditor(['hello world'], 5, 0);
  const ops = new EditingOperations(editor);
  ops.insertNewLine();
  assertEqual(editor.activeTab.lines.length, 2, 'Should have two lines');
  assertEqual(editor.activeTab.lines[0], 'hello', 'First line should be split');
  assertEqual(editor.activeTab.lines[1], ' world', 'Second line should have rest');
  assertEqual(editor.activeTab.cursorY, 1, 'Cursor should move to new line');
  assertEqual(editor.activeTab.cursorX, 0, 'Cursor should be at start');
});

runTest('Insert tab', () => {
  const editor = new MockEditor(['hello'], 0, 0);
  const ops = new EditingOperations(editor);
  ops.insertTab();
  assertEqual(editor.activeTab.lines[0], '  hello', 'Tab should insert 2 spaces');
  assertEqual(editor.activeTab.cursorX, 2, 'Cursor should advance by 2');
});

runTest('Backspace at line start merges lines', () => {
  const editor = new MockEditor(['hello', 'world'], 0, 1);
  const ops = new EditingOperations(editor);
  ops.deleteChar();
  assertEqual(editor.activeTab.lines.length, 1, 'Should merge into one line');
  assertEqual(editor.activeTab.lines[0], 'helloworld', 'Lines should be merged');
});

runTest('Delete selection replaces with character', () => {
  const editor = new MockEditor(['hello world'], 0, 0);
  editor.activeTab.selectionStart = { x: 0, y: 0 };
  editor.activeTab.selectionEnd = { x: 5, y: 0 };
  const ops = new EditingOperations(editor);
  ops.insertChar('H');
  assertEqual(editor.activeTab.lines[0], 'H world', 'Selection should be replaced');
});

// ===== WORD DELETION TESTS =====
console.log('\n🗑️  Word Deletion Tests');
console.log('─────────────────────────────────────────────────────\n');

runTest('Delete word backward', () => {
  const editor = new MockEditor(['hello world'], 11, 0);
  const ops = new EditingOperations(editor);
  ops.deleteWordBackward();
  assertEqual(editor.activeTab.lines[0], 'hello ', 'Word should be deleted');
  assertEqual(editor.activeTab.cursorX, 6, 'Cursor should be at deletion point');
});

runTest('Delete word forward', () => {
  const editor = new MockEditor(['hello world'], 0, 0);
  const ops = new EditingOperations(editor);
  ops.deleteWordForward();
  assertEqual(editor.activeTab.lines[0], ' world', 'Word should be deleted forward');
  assertEqual(editor.activeTab.cursorX, 0, 'Cursor should stay in place');
});

// ===== TAB TESTS =====
console.log('\n📑 Tab Tests');
console.log('─────────────────────────────────────────────────────\n');

runTest('Tab creation', () => {
  const tab = new Tab(1, '');
  assertEqual(tab.id, 1, 'Tab should have correct ID');
  assertEqual(tab.lines.length, 1, 'Should have one line');
  assertEqual(tab.lines[0], '', 'Line should be empty');
});

runTest('Tab identifies welcome page', () => {
  const tab = new Tab(1, '');
  assertTrue(tab.isWelcomePage(), 'Should be identified as welcome page');
});

runTest('Tab state save and restore', () => {
  const tab = new Tab(1, '');
  tab.lines = ['test'];
  tab.cursorX = 4;
  tab.cursorY = 0;
  tab.scrollOffset = 0;
  tab.horizontalScrollOffset = 0;
  
  tab.saveState();
  assertTrue(tab.undoStack.length === 1, 'State should be saved');
  
  tab.lines = ['modified'];
  tab.restoreState(tab.undoStack[0]);
  assertEqual(tab.lines[0], 'test', 'State should be restored');
});

// ===== EDGE CASES =====
console.log('\n⚠️  Edge Cases');
console.log('─────────────────────────────────────────────────────\n');

runTest('Delete at start of file does nothing', () => {
  const editor = new MockEditor(['hello'], 0, 0);
  const ops = new EditingOperations(editor);
  ops.deleteChar();
  assertEqual(editor.activeTab.lines[0], 'hello', 'Should not delete');
});

runTest('Delete forward at end of file does nothing', () => {
  const editor = new MockEditor(['hello'], 5, 0);
  const ops = new EditingOperations(editor);
  ops.deleteForward();
  assertEqual(editor.activeTab.lines[0], 'hello', 'Should not delete');
});

runTest('Cursor cannot move beyond line end', () => {
  const editor = new MockEditor(['hello'], 5, 0);
  const movement = new CursorMovement(editor);
  movement.moveCursor(10, 0, false);
  assertTrue(editor.activeTab.cursorX <= 5, 'Cursor should not exceed line length');
});

runTest('Cursor cannot move to negative position', () => {
  const editor = new MockEditor(['hello'], 0, 0);
  const movement = new CursorMovement(editor);
  movement.moveCursor(-10, 0, false);
  assertTrue(editor.activeTab.cursorX >= 0, 'Cursor should not be negative');
});

runTest('Insert character in middle of line', () => {
  const editor = new MockEditor(['hello'], 2, 0);
  const ops = new EditingOperations(editor);
  ops.insertChar('X');
  assertEqual(editor.activeTab.lines[0], 'heXllo', 'Character should be inserted in middle');
});

runTest('Read-only mode prevents editing', () => {
  const editor = new MockEditor(['hello'], 0, 0);
  editor.activeTab.readOnly = true;
  const ops = new EditingOperations(editor);
  ops.insertChar('X');
  assertEqual(editor.activeTab.lines[0], 'hello', 'Should not modify in read-only mode');
});

// ===== SUMMARY =====
console.log('\n═══════════════════════════════════════════════════════');
console.log('  Test Summary');
console.log('═══════════════════════════════════════════════════════\n');
console.log(`Total Tests: ${testsPassed + testsFailed}`);
console.log(`✓ Passed: ${testsPassed}`);
console.log(`✗ Failed: ${testsFailed}`);
console.log(`Success Rate: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)}%`);
console.log('═══════════════════════════════════════════════════════\n');

process.exit(testsFailed > 0 ? 1 : 0);
