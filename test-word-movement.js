// Test suite for word movement operations
import { CursorMovement } from '../src/handlers/CursorMovement.js';
import { EditingOperations } from '../src/handlers/EditingOperations.js';

// Mock editor
class MockEditor {
  constructor(lines, cursorX = 0, cursorY = 0) {
    this.activeTab = {
      lines: [...lines],
      cursorX,
      cursorY,
      selectionStart: null,
      selectionEnd: null,
      modified: false,
      readOnly: false,
      saveState: () => {},
    };
    this.renderCalled = false;
  }
  
  render() {
    this.renderCalled = true;
  }
  
  adjustScroll() {}
  
  setStatus() {}
}

function runTest(name, testFn) {
  try {
    testFn();
    console.log(`✓ ${name}`);
  } catch (error) {
    console.log(`✗ ${name}`);
    console.log(`  Error: ${error.message}`);
  }
}

function assertEqual(actual, expected, message) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${message}\n  Expected: ${JSON.stringify(expected)}\n  Actual: ${JSON.stringify(actual)}`);
  }
}

console.log('Word Movement Tests');
console.log('===================\n');

// Test moveWordLeft
runTest('moveWordLeft: basic word movement', () => {
  const editor = new MockEditor(['hello world test'], 11, 0); // cursor after 'world'
  const movement = new CursorMovement(editor);
  movement.moveWordLeft(false);
  assertEqual(editor.activeTab.cursorX, 6, 'Cursor should be at start of "world"');
});

runTest('moveWordLeft: from end of word', () => {
  const editor = new MockEditor(['hello world'], 11, 0); // cursor at end
  const movement = new CursorMovement(editor);
  movement.moveWordLeft(false);
  assertEqual(editor.activeTab.cursorX, 6, 'Cursor should be at start of "world"');
});

runTest('moveWordLeft: skip whitespace', () => {
  const editor = new MockEditor(['hello    world'], 13, 0); // cursor after spaces
  const movement = new CursorMovement(editor);
  movement.moveWordLeft(false);
  assertEqual(editor.activeTab.cursorX, 0, 'Cursor should be at start of "hello"');
});

runTest('moveWordLeft: from middle of word', () => {
  const editor = new MockEditor(['hello world'], 8, 0); // cursor in 'world'
  const movement = new CursorMovement(editor);
  movement.moveWordLeft(false);
  assertEqual(editor.activeTab.cursorX, 6, 'Cursor should be at start of "world"');
});

runTest('moveWordLeft: multiple words', () => {
  const editor = new MockEditor(['one two three four'], 18, 0); // end
  const movement = new CursorMovement(editor);
  movement.moveWordLeft(false);
  assertEqual(editor.activeTab.cursorX, 14, 'Should be at "four"');
  movement.moveWordLeft(false);
  assertEqual(editor.activeTab.cursorX, 8, 'Should be at "three"');
  movement.moveWordLeft(false);
  assertEqual(editor.activeTab.cursorX, 4, 'Should be at "two"');
});

// Test moveWordRight
runTest('moveWordRight: basic word movement', () => {
  const editor = new MockEditor(['hello world test'], 0, 0);
  const movement = new CursorMovement(editor);
  movement.moveWordRight(false);
  assertEqual(editor.activeTab.cursorX, 6, 'Cursor should be after "hello"');
});

runTest('moveWordRight: skip whitespace', () => {
  const editor = new MockEditor(['hello    world'], 0, 0);
  const movement = new CursorMovement(editor);
  movement.moveWordRight(false);
  assertEqual(editor.activeTab.cursorX, 9, 'Cursor should be after spaces at "world"');
});

runTest('moveWordRight: from middle of word', () => {
  const editor = new MockEditor(['hello world'], 2, 0); // in 'hello'
  const movement = new CursorMovement(editor);
  movement.moveWordRight(false);
  assertEqual(editor.activeTab.cursorX, 6, 'Cursor should skip to next word');
});

// Test deleteWordBackward
runTest('deleteWordBackward: delete one word', () => {
  const editor = new MockEditor(['hello world'], 11, 0);
  const ops = new EditingOperations(editor);
  ops.deleteWordBackward();
  assertEqual(editor.activeTab.lines[0], 'hello ', 'Should delete "world"');
  assertEqual(editor.activeTab.cursorX, 6, 'Cursor at end of "hello "');
});

runTest('deleteWordBackward: delete word with spaces', () => {
  const editor = new MockEditor(['hello   world'], 13, 0);
  const ops = new EditingOperations(editor);
  ops.deleteWordBackward();
  assertEqual(editor.activeTab.lines[0], 'hello   ', 'Should delete "world"');
});

runTest('deleteWordBackward: from middle of word', () => {
  const editor = new MockEditor(['hello world'], 8, 0); // in 'world'
  const ops = new EditingOperations(editor);
  ops.deleteWordBackward();
  assertEqual(editor.activeTab.lines[0], 'hello ld', 'Should delete "wor"');
});

// Test deleteWordForward
runTest('deleteWordForward: delete one word', () => {
  const editor = new MockEditor(['hello world'], 0, 0);
  const ops = new EditingOperations(editor);
  ops.deleteWordForward();
  assertEqual(editor.activeTab.lines[0], ' world', 'Should delete "hello"');
  assertEqual(editor.activeTab.cursorX, 0, 'Cursor stays at 0');
});

runTest('deleteWordForward: delete word and spaces', () => {
  const editor = new MockEditor(['hello   world'], 0, 0);
  const ops = new EditingOperations(editor);
  ops.deleteWordForward();
  assertEqual(editor.activeTab.lines[0], 'world', 'Should delete "hello   "');
});

runTest('deleteWordForward: from middle of word', () => {
  const editor = new MockEditor(['hello world'], 2, 0); // in 'hello'
  const ops = new EditingOperations(editor);
  ops.deleteWordForward();
  assertEqual(editor.activeTab.lines[0], 'heworld', 'Should delete "llo "');
});

// Edge cases
runTest('moveWordLeft: at beginning of line', () => {
  const editor = new MockEditor(['hello', 'world'], 0, 1);
  const movement = new CursorMovement(editor);
  movement.moveWordLeft(false);
  assertEqual(editor.activeTab.cursorY, 0, 'Should move to previous line');
  assertEqual(editor.activeTab.cursorX, 5, 'Should be at end of previous line');
});

runTest('moveWordRight: at end of line', () => {
  const editor = new MockEditor(['hello', 'world'], 5, 0);
  const movement = new CursorMovement(editor);
  movement.moveWordRight(false);
  assertEqual(editor.activeTab.cursorY, 1, 'Should move to next line');
  assertEqual(editor.activeTab.cursorX, 0, 'Should be at start of next line');
});

console.log('\nAll tests completed!');
