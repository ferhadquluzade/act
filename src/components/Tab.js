import fs from 'fs';

export class Tab {
  constructor(id, filename = '') {
    this.id = id;
    this.filename = filename;
    this.lines = [''];
    this.cursorX = 0;
    this.cursorY = 0;
    this.scrollOffset = 0;
    this.horizontalScrollOffset = 0;  // Add horizontal scroll
    this.modified = false;
    this.readOnly = false;
    this.undoStack = [];
    this.redoStack = [];
    this.selectionStart = null;
    this.selectionEnd = null;
    
    // Load file if it exists
    if (filename && fs.existsSync(filename)) {
      try {
        const content = fs.readFileSync(filename, 'utf-8');
        this.lines = content.split('\n');
        if (this.lines.length === 0) this.lines = [''];
      } catch (error) {
        // Error will be handled by caller
      }
    }
  }
  
  isWelcomePage() {
    return !this.filename && this.lines.length === 1 && this.lines[0] === '';
  }
  
  saveState() {
    const state = {
      lines: [...this.lines],
      cursorX: this.cursorX,
      cursorY: this.cursorY,
      scrollOffset: this.scrollOffset,
      horizontalScrollOffset: this.horizontalScrollOffset
    };
    this.undoStack.push(state);
    this.redoStack = [];
  }
  
  restoreState(state) {
    this.lines = state.lines;
    this.cursorX = state.cursorX;
    this.cursorY = state.cursorY;
    this.scrollOffset = state.scrollOffset;
    this.horizontalScrollOffset = state.horizontalScrollOffset || 0;
    this.selectionStart = null;
    this.selectionEnd = null;
  }
}
