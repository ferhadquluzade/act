export class EditingOperations {
  constructor(editor) {
    this.editor = editor;
  }
  
  insertChar(char) {
    const tab = this.editor.activeTab;
    if (tab.readOnly) {
      this.editor.setStatus('Read-only mode - cannot edit');
      return;
    }
    
    if (tab.selectionStart && tab.selectionEnd) {
      this.deleteSelection();
    }
    
    tab.saveState();
    const line = tab.lines[tab.cursorY];
    tab.lines[tab.cursorY] = line.substring(0, tab.cursorX) + char + line.substring(tab.cursorX);
    tab.cursorX++;
    tab.modified = true;
    tab.selectionStart = null;
    tab.selectionEnd = null;
    this.editor.render();
  }
  
  deleteChar() {
    const tab = this.editor.activeTab;
    if (tab.readOnly) {
      this.editor.setStatus('Read-only mode - cannot edit');
      return;
    }
    
    if (tab.selectionStart && tab.selectionEnd) {
      this.deleteSelection();
      return;
    }
    
    if (tab.cursorX > 0) {
      tab.saveState();
      const line = tab.lines[tab.cursorY];
      tab.lines[tab.cursorY] = line.substring(0, tab.cursorX - 1) + line.substring(tab.cursorX);
      tab.cursorX--;
      tab.modified = true;
      this.editor.adjustScroll();
      this.editor.render();
    } else if (tab.cursorY > 0) {
      tab.saveState();
      const currentLine = tab.lines[tab.cursorY];
      const prevLine = tab.lines[tab.cursorY - 1];
      tab.lines[tab.cursorY - 1] = prevLine + currentLine;
      tab.lines.splice(tab.cursorY, 1);
      tab.cursorX = prevLine.length;
      tab.cursorY--;
      tab.modified = true;
      this.editor.adjustScroll();
      this.editor.render();
    }
  }
  
  deleteForward() {
    const tab = this.editor.activeTab;
    if (tab.readOnly) {
      this.editor.setStatus('Read-only mode - cannot edit');
      return;
    }
    
    if (tab.selectionStart && tab.selectionEnd) {
      this.deleteSelection();
      return;
    }
    
    const line = tab.lines[tab.cursorY];
    if (tab.cursorX < line.length) {
      tab.saveState();
      tab.lines[tab.cursorY] = line.substring(0, tab.cursorX) + line.substring(tab.cursorX + 1);
      tab.modified = true;
      this.editor.render();
    } else if (tab.cursorY < tab.lines.length - 1) {
      tab.saveState();
      const nextLine = tab.lines[tab.cursorY + 1];
      tab.lines[tab.cursorY] = line + nextLine;
      tab.lines.splice(tab.cursorY + 1, 1);
      tab.modified = true;
      this.editor.render();
    }
  }
  
  deleteSelection() {
    const tab = this.editor.activeTab;
    const [start, end] = this.getOrderedSelection(tab.selectionStart, tab.selectionEnd);
    
    tab.saveState();
    if (start.y === end.y) {
      const line = tab.lines[start.y];
      tab.lines[start.y] = line.substring(0, start.x) + line.substring(end.x);
    } else {
      const before = tab.lines[start.y].substring(0, start.x);
      const after = tab.lines[end.y].substring(end.x);
      tab.lines.splice(start.y, end.y - start.y + 1, before + after);
    }
    
    tab.cursorX = start.x;
    tab.cursorY = start.y;
    tab.selectionStart = null;
    tab.selectionEnd = null;
    tab.modified = true;
    this.editor.render();
  }
  
  insertNewLine() {
    const tab = this.editor.activeTab;
    if (tab.readOnly) {
      this.editor.setStatus('Read-only mode - cannot edit');
      return;
    }
    
    tab.saveState();
    const line = tab.lines[tab.cursorY];
    const before = line.substring(0, tab.cursorX);
    const after = line.substring(tab.cursorX);
    
    tab.lines[tab.cursorY] = before;
    tab.lines.splice(tab.cursorY + 1, 0, after);
    tab.cursorY++;
    tab.cursorX = 0;
    tab.modified = true;
    tab.selectionStart = null;
    tab.selectionEnd = null;
    
    this.editor.adjustScroll();
    this.editor.render();
  }
  
  insertTab() {
    const tab = this.editor.activeTab;
    if (tab.readOnly) {
      this.editor.setStatus('Read-only mode - cannot edit');
      return;
    }
    
    tab.saveState();
    const line = tab.lines[tab.cursorY];
    tab.lines[tab.cursorY] = line.substring(0, tab.cursorX) + '  ' + line.substring(tab.cursorX);
    tab.cursorX += 2;
    tab.modified = true;
    this.editor.render();
  }
  
  getOrderedSelection(start, end) {
    return start.y < end.y || (start.y === end.y && start.x <= end.x)
      ? [start, end]
      : [end, start];
  }
}
