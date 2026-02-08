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
}
