export class CursorMovement {
  constructor(editor) {
    this.editor = editor;
  }
  
  moveCursor(dx, dy, shift = false) {
    const tab = this.editor.activeTab;
    const oldX = tab.cursorX;
    const oldY = tab.cursorY;
    
    if (dy !== 0) {
      tab.cursorY = Math.max(0, Math.min(tab.lines.length - 1, tab.cursorY + dy));
      tab.cursorX = Math.min(tab.cursorX, tab.lines[tab.cursorY].length);
      this.editor.adjustScroll();
    } else if (dx !== 0) {
      if (dx < 0 && tab.cursorX === 0 && tab.cursorY > 0) {
        tab.cursorY--;
        tab.cursorX = tab.lines[tab.cursorY].length;
        this.editor.adjustScroll();
      } else if (dx > 0 && tab.cursorX === tab.lines[tab.cursorY].length && tab.cursorY < tab.lines.length - 1) {
        tab.cursorY++;
        tab.cursorX = 0;
        this.editor.adjustScroll();
      } else {
        tab.cursorX = Math.max(0, Math.min(tab.lines[tab.cursorY].length, tab.cursorX + dx));
      }
    }
    
    if (shift) {
      if (!tab.selectionStart) {
        tab.selectionStart = { x: oldX, y: oldY };
      }
      tab.selectionEnd = { x: tab.cursorX, y: tab.cursorY };
    } else {
      tab.selectionStart = null;
      tab.selectionEnd = null;
    }
    
    this.editor.render();
  }
  
  pageUp() {
    this.moveCursor(0, -10, false);
  }
  
  pageDown() {
    this.moveCursor(0, 10, false);
  }
  
  home() {
    this.editor.activeTab.cursorX = 0;
    this.editor.activeTab.selectionStart = null;
    this.editor.activeTab.selectionEnd = null;
    this.editor.render();
  }
  
  end() {
    const tab = this.editor.activeTab;
    tab.cursorX = tab.lines[tab.cursorY].length;
    tab.selectionStart = null;
    tab.selectionEnd = null;
    this.editor.render();
  }
  
  moveWordLeft(shift = false) {
    const tab = this.editor.activeTab;
    const line = tab.lines[tab.cursorY];
    const oldX = tab.cursorX;
    const oldY = tab.cursorY;
    
    if (tab.cursorX === 0) {
      // Move to end of previous line
      if (tab.cursorY > 0) {
        tab.cursorY--;
        tab.cursorX = tab.lines[tab.cursorY].length;
        this.editor.adjustScroll();
      }
    } else {
      let pos = tab.cursorX;
      
      // Move back one position first
      pos--;
      
      // Skip any trailing whitespace
      while (pos > 0 && /\s/.test(line[pos])) {
        pos--;
      }
      
      // Now skip the word characters to get to the beginning of the word
      if (/\w/.test(line[pos])) {
        while (pos > 0 && /\w/.test(line[pos - 1])) {
          pos--;
        }
      } else if (!/\s/.test(line[pos])) {
        // If it's a non-word, non-space character (like punctuation)
        const charType = line[pos];
        while (pos > 0 && line[pos - 1] === charType) {
          pos--;
        }
      }
      
      tab.cursorX = pos;
    }
    
    if (shift) {
      if (!tab.selectionStart) {
        tab.selectionStart = { x: oldX, y: oldY };
      }
      tab.selectionEnd = { x: tab.cursorX, y: tab.cursorY };
    } else {
      tab.selectionStart = null;
      tab.selectionEnd = null;
    }
    
    this.editor.render();
  }
  
  moveWordRight(shift = false) {
    const tab = this.editor.activeTab;
    const line = tab.lines[tab.cursorY];
    const oldX = tab.cursorX;
    const oldY = tab.cursorY;
    
    if (tab.cursorX === line.length) {
      // Move to beginning of next line
      if (tab.cursorY < tab.lines.length - 1) {
        tab.cursorY++;
        tab.cursorX = 0;
        this.editor.adjustScroll();
      }
    } else {
      let pos = tab.cursorX;
      
      // Skip current word
      const isWordChar = /\w/.test(line[pos]);
      while (pos < line.length && /\w/.test(line[pos]) === isWordChar) {
        pos++;
      }
      
      // Skip whitespace
      while (pos < line.length && /\s/.test(line[pos])) {
        pos++;
      }
      
      tab.cursorX = pos;
    }
    
    if (shift) {
      if (!tab.selectionStart) {
        tab.selectionStart = { x: oldX, y: oldY };
      }
      tab.selectionEnd = { x: tab.cursorX, y: tab.cursorY };
    } else {
      tab.selectionStart = null;
      tab.selectionEnd = null;
    }
    
    this.editor.render();
  }
}
