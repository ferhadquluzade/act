export class ClipboardOperations {
  constructor(editor) {
    this.editor = editor;
    this.clipboard = '';
  }
  
  copy() {
    const tab = this.editor.activeTab;
    if (!tab.selectionStart || !tab.selectionEnd) return;
    
    const [start, end] = this.getOrderedSelection(tab.selectionStart, tab.selectionEnd);
    let text = '';
    
    if (start.y === end.y) {
      text = tab.lines[start.y].substring(start.x, end.x);
    } else {
      text = tab.lines[start.y].substring(start.x) + '\n';
      for (let i = start.y + 1; i < end.y; i++) {
        text += tab.lines[i] + '\n';
      }
      text += tab.lines[end.y].substring(0, end.x);
    }
    
    this.clipboard = text;
    this.editor.setStatus('Copied');
  }
  
  cut() {
    if (this.editor.activeTab.readOnly) {
      this.editor.setStatus('Read-only mode - cannot edit');
      return;
    }
    this.copy();
    this.editor.editingOps.deleteSelection();
  }
  
  paste() {
    const tab = this.editor.activeTab;
    if (tab.readOnly) {
      this.editor.setStatus('Read-only mode - cannot edit');
      return;
    }
    
    if (!this.clipboard) return;
    
    if (tab.selectionStart && tab.selectionEnd) {
      this.editor.editingOps.deleteSelection();
    }
    
    tab.saveState();
    const pasteLines = this.clipboard.split('\n');
    
    if (pasteLines.length === 1) {
      const line = tab.lines[tab.cursorY];
      tab.lines[tab.cursorY] = line.substring(0, tab.cursorX) + pasteLines[0] + line.substring(tab.cursorX);
      tab.cursorX += pasteLines[0].length;
    } else {
      const line = tab.lines[tab.cursorY];
      const before = line.substring(0, tab.cursorX);
      const after = line.substring(tab.cursorX);
      
      tab.lines[tab.cursorY] = before + pasteLines[0];
      for (let i = 1; i < pasteLines.length - 1; i++) {
        tab.lines.splice(tab.cursorY + i, 0, pasteLines[i]);
      }
      tab.lines.splice(tab.cursorY + pasteLines.length - 1, 0, pasteLines[pasteLines.length - 1] + after);
      
      tab.cursorY += pasteLines.length - 1;
      tab.cursorX = pasteLines[pasteLines.length - 1].length;
    }
    
    tab.modified = true;
    this.editor.render();
  }
  
  getOrderedSelection(start, end) {
    return start.y < end.y || (start.y === end.y && start.x <= end.x)
      ? [start, end]
      : [end, start];
  }
}
