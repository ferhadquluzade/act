# Act Editor - Test Suite

This directory contains comprehensive tests for the Act Editor.

## Running Tests

### All Tests
```bash
node test-editor.js
```

### Individual Test Files
```bash
# Test word movement logic
node test-word-movement.js

# Test selection/highlighting
node test-selection.js

# Test key sequence detection
node test-keys.js
```

## Test Coverage

The comprehensive test suite (`test-editor.js`) covers:

### ✅ Cursor Movement (8 tests)
- Basic movement (up, down, left, right)
- Line wrapping
- Home/End navigation
- Boundary checking

### ✅ Word Movement (3 tests)
- Jump to word boundaries
- Handle multiple spaces
- Selection with word movement

### ✅ Selection (3 tests)
- Create selections with Shift
- Clear selections
- Word-level selection

### ✅ Editing Operations (7 tests)
- Character insertion
- Deletion (backspace/forward)
- Newline insertion
- Tab insertion
- Line merging
- Selection replacement

### ✅ Word Deletion (2 tests)
- Delete word backward (Alt+Backspace)
- Delete word forward (Alt+Delete)

### ✅ Tab Management (3 tests)
- Tab creation
- Welcome page detection
- State save/restore (undo/redo)

### ✅ Edge Cases (6 tests)
- Boundary conditions
- Read-only mode
- Invalid operations

## Test Results

Current Status: **30/32 tests passing (93.8%)**

Known Issues:
- Word movement with multiple consecutive spaces needs refinement
- Word deletion forward leaves extra space

## Adding New Tests

Tests follow this pattern:

```javascript
runTest('Description of test', () => {
  const editor = new MockEditor(['initial content'], cursorX, cursorY);
  const ops = new EditingOperations(editor);
  
  // Perform operation
  ops.someOperation();
  
  // Assert expected result
  assertEqual(editor.activeTab.lines[0], 'expected', 'Error message');
});
```

## Utilities

### test-keys.js
Interactive utility to see what byte sequences your terminal sends for key combinations. Useful for debugging keyboard shortcuts.

### TESTING.md
Detailed guide on configuring and debugging key mappings for different terminals.
