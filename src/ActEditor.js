import fs from 'fs';
import path from 'path';
import { THEMES } from './utils/themes.js';
import { SessionManager } from './utils/session.js';
import { Tab } from './components/Tab.js';
import { UIManager } from './components/UIManager.js';
import { Renderer } from './components/Renderer.js';
import { EditingOperations } from './handlers/EditingOperations.js';
import { CursorMovement } from './handlers/CursorMovement.js';
import { ClipboardOperations } from './handlers/ClipboardOperations.js';

export class ActEditor {
  constructor(initialFilename = '') {
    // Load previous session
    const sessionData = SessionManager.load();
    
    // Initialize state
    if (!initialFilename && sessionData) {
      this.tabs = sessionData.tabs.map(tabData => {
        const tab = new Tab(tabData.id);
        Object.assign(tab, tabData);
        tab.undoStack = [];
        tab.redoStack = [];
        tab.selectionStart = null;
        tab.selectionEnd = null;
        return tab;
      });
      this.activeTabIndex = sessionData.activeTabIndex || 0;
      this.themeIndex = sessionData.themeIndex || 0;
      this.nextTabId = Math.max(...this.tabs.map(t => t.id), 0) + 1;
    } else {
      this.tabs = [];
      this.activeTabIndex = 0;
      this.nextTabId = 1;
      this.themeIndex = sessionData?.themeIndex || 0;
      
      if (initialFilename && fs.existsSync(initialFilename)) {
        this.tabs.push(new Tab(this.nextTabId++, initialFilename));
      } else {
        this.tabs.push(new Tab(this.nextTabId++, initialFilename || ''));
      }
    }
    
    if (this.tabs.length === 0) {
      this.tabs.push(new Tab(this.nextTabId++, ''));
    }
    
    this.statusMessage = '';
    this.inputMode = false;
    this.inputPrompt = '';
    this.inputValue = '';
    this.inputCursorPos = 0; // Cursor position in input field
    this.inputSelectionStart = null; // Selection start for input field
    this.inputSelectionEnd = null; // Selection end for input field
    this.inputCallback = null;
    this.currentTime = new Date();
    
    // Create UI
    this.uiManager = new UIManager(this.theme.color);
    this.renderer = new Renderer(this.uiManager);
    
    // Create handlers
    this.editingOps = new EditingOperations(this);
    this.cursorMovement = new CursorMovement(this);
    this.clipboardOps = new ClipboardOperations(this);
    
    this.setupKeyHandlers();
    this.startClock();
    
    // Auto-save session periodically
    setInterval(() => this.saveSession(), 5000);
  }
  
  get activeTab() {
    return this.tabs[this.activeTabIndex];
  }
  
  get theme() {
    return THEMES[this.themeIndex];
  }
  
  saveSession() {
    SessionManager.save(this.tabs, this.activeTabIndex, this.themeIndex);
  }
  
  adjustScroll() {
    const tab = this.activeTab;
    const viewportHeight = this.uiManager.getViewportHeight();
    const viewportWidth = this.uiManager.getViewportWidth();
    
    tab.cursorY = Math.max(0, Math.min(tab.cursorY, tab.lines.length - 1));
    
    // Vertical scrolling
    if (tab.cursorY < tab.scrollOffset) {
      tab.scrollOffset = tab.cursorY;
    } else if (tab.cursorY >= tab.scrollOffset + viewportHeight) {
      tab.scrollOffset = Math.max(0, tab.cursorY - viewportHeight + 1);
    }
    
    const maxScroll = Math.max(0, tab.lines.length - viewportHeight);
    tab.scrollOffset = Math.max(0, Math.min(tab.scrollOffset, maxScroll));
    
    // Horizontal scrolling
    const margin = 5; // Keep 5 characters margin on each side
    if (tab.cursorX < tab.horizontalScrollOffset + margin) {
      tab.horizontalScrollOffset = Math.max(0, tab.cursorX - margin);
    } else if (tab.cursorX >= tab.horizontalScrollOffset + viewportWidth - margin) {
      tab.horizontalScrollOffset = Math.max(0, tab.cursorX - viewportWidth + margin);
    }
  }
  
  render() {
    const tab = this.activeTab;
    
    if (tab.isWelcomePage()) {
      this.renderer.renderWelcomePage(this.theme.color, this.theme.name);
    } else {
      this.adjustScroll();
      this.renderer.renderEditor(tab, this.theme.color, tab.scrollOffset, tab.horizontalScrollOffset);
    }
    
    this.renderer.renderStatusBar(
      this.tabs,
      this.activeTabIndex,
      this.theme.color,
      this.currentTime,
      this.inputMode,
      this.inputValue,
      this.inputCursorPos,
      this.inputSelectionStart,
      this.inputSelectionEnd
    );
    
    this.uiManager.render();
  }
  
  startClock() {
    setInterval(() => {
      this.currentTime = new Date();
      this.renderer.renderStatusBar(
        this.tabs,
        this.activeTabIndex,
        this.theme.color,
        this.currentTime,
        this.inputMode,
        this.inputValue,
        this.inputCursorPos,
        this.inputSelectionStart,
        this.inputSelectionEnd
      );
      this.uiManager.render();
    }, 60000);
  }
  
  setStatus(message) {
    this.statusMessage = message;
    this.render();
    setTimeout(() => {
      this.statusMessage = '';
      this.render();
    }, 2000);
  }
  
  promptInput(prompt, callback) {
    this.inputMode = true;
    this.inputPrompt = prompt;
    this.inputValue = '';
    this.inputCursorPos = 0;
    this.inputSelectionStart = null;
    this.inputSelectionEnd = null;
    this.inputCallback = callback;
    this.render();
  }
  
  // Tab operations
  newTab() {
    this.tabs.push(new Tab(this.nextTabId++, ''));
    this.activeTabIndex = this.tabs.length - 1;
    this.render();
  }
  
  nextTab() {
    if (this.tabs.length > 1) {
      this.activeTabIndex = (this.activeTabIndex + 1) % this.tabs.length;
      this.render();
    }
  }
  
  previousTab() {
    if (this.tabs.length > 1) {
      this.activeTabIndex = (this.activeTabIndex - 1 + this.tabs.length) % this.tabs.length;
      this.render();
    }
  }
  
  closeTab() {
    if (this.tabs.length === 1) {
      const tab = this.activeTab;
      tab.filename = '';
      tab.lines = [''];
      tab.cursorX = 0;
      tab.cursorY = 0;
      tab.scrollOffset = 0;
      tab.modified = false;
      tab.readOnly = false;
      tab.selectionStart = null;
      tab.selectionEnd = null;
      this.render();
      return;
    }
    
    this.tabs.splice(this.activeTabIndex, 1);
    if (this.activeTabIndex >= this.tabs.length) {
      this.activeTabIndex = this.tabs.length - 1;
    }
    this.render();
  }
  
  // File operations
  saveFile() {
    const tab = this.activeTab;
    
    if (!tab.filename) {
      this.promptInput('Save as: ', (filename) => {
        if (filename) {
          tab.filename = filename;
          this.saveFile();
        }
      });
      return;
    }
    
    try {
      const savePath = path.isAbsolute(tab.filename) 
        ? path.resolve(tab.filename)
        : path.resolve(process.cwd(), tab.filename);
      
      fs.writeFileSync(savePath, tab.lines.join('\n'), 'utf-8');
      tab.modified = false;
      this.setStatus(`Saved: ${path.basename(savePath)}`);
    } catch (error) {
      this.setStatus(`Error: ${error.message}`);
    }
  }
  
  openFile(inNewTab = false) {
    this.promptInput('Open file: ', (filename) => {
      if (!filename) return;
      
      if (!fs.existsSync(filename)) {
        this.setStatus('File not found');
        return;
      }
      
      if (inNewTab || !this.activeTab.isWelcomePage()) {
        this.tabs.push(new Tab(this.nextTabId++, filename));
        this.activeTabIndex = this.tabs.length - 1;
      } else {
        const tab = this.activeTab;
        try {
          const content = fs.readFileSync(filename, 'utf-8');
          tab.filename = filename;
          tab.lines = content.split('\n');
          if (tab.lines.length === 0) tab.lines = [''];
          tab.cursorX = 0;
          tab.cursorY = 0;
          tab.scrollOffset = 0;
        } catch (error) {
          this.setStatus(`Error: ${error.message}`);
        }
      }
      
      this.render();
    });
  }
  
  // Other operations
  selectAll() {
    const tab = this.activeTab;
    tab.selectionStart = { x: 0, y: 0 };
    tab.selectionEnd = { x: tab.lines[tab.lines.length - 1].length, y: tab.lines.length - 1 };
    this.render();
  }
  
  // Input bar helpers
  inputMoveLeft() {
    if (this.inputCursorPos > 0) {
      this.inputCursorPos--;
      this.inputSelectionStart = null;
      this.inputSelectionEnd = null;
      this.render();
    }
  }
  
  inputMoveRight() {
    if (this.inputCursorPos < this.inputValue.length) {
      this.inputCursorPos++;
      this.inputSelectionStart = null;
      this.inputSelectionEnd = null;
      this.render();
    }
  }
  
  inputHome() {
    this.inputCursorPos = 0;
    this.inputSelectionStart = null;
    this.inputSelectionEnd = null;
    this.render();
  }
  
  inputEnd() {
    this.inputCursorPos = this.inputValue.length;
    this.inputSelectionStart = null;
    this.inputSelectionEnd = null;
    this.render();
  }
  
  inputSelectAll() {
    if (this.inputValue.length > 0) {
      this.inputSelectionStart = 0;
      this.inputSelectionEnd = this.inputValue.length;
      this.inputCursorPos = this.inputValue.length;
      this.render();
    }
  }
  
  inputBackspace() {
    // If there's a selection, delete it
    if (this.inputSelectionStart !== null && this.inputSelectionEnd !== null) {
      const start = Math.min(this.inputSelectionStart, this.inputSelectionEnd);
      const end = Math.max(this.inputSelectionStart, this.inputSelectionEnd);
      this.inputValue = this.inputValue.slice(0, start) + this.inputValue.slice(end);
      this.inputCursorPos = start;
      this.inputSelectionStart = null;
      this.inputSelectionEnd = null;
      this.render();
    } else if (this.inputCursorPos > 0) {
      this.inputValue = this.inputValue.slice(0, this.inputCursorPos - 1) + 
                       this.inputValue.slice(this.inputCursorPos);
      this.inputCursorPos--;
      this.render();
    }
  }
  
  inputDelete() {
    // If there's a selection, delete it
    if (this.inputSelectionStart !== null && this.inputSelectionEnd !== null) {
      const start = Math.min(this.inputSelectionStart, this.inputSelectionEnd);
      const end = Math.max(this.inputSelectionStart, this.inputSelectionEnd);
      this.inputValue = this.inputValue.slice(0, start) + this.inputValue.slice(end);
      this.inputCursorPos = start;
      this.inputSelectionStart = null;
      this.inputSelectionEnd = null;
      this.render();
    } else if (this.inputCursorPos < this.inputValue.length) {
      this.inputValue = this.inputValue.slice(0, this.inputCursorPos) + 
                       this.inputValue.slice(this.inputCursorPos + 1);
      this.render();
    }
  }
  
  inputInsertChar(ch) {
    // If there's a selection, replace it
    if (this.inputSelectionStart !== null && this.inputSelectionEnd !== null) {
      const start = Math.min(this.inputSelectionStart, this.inputSelectionEnd);
      const end = Math.max(this.inputSelectionStart, this.inputSelectionEnd);
      this.inputValue = this.inputValue.slice(0, start) + ch + this.inputValue.slice(end);
      this.inputCursorPos = start + 1;
      this.inputSelectionStart = null;
      this.inputSelectionEnd = null;
    } else {
      // Insert character at cursor position
      this.inputValue = this.inputValue.slice(0, this.inputCursorPos) + 
                       ch + 
                       this.inputValue.slice(this.inputCursorPos);
      this.inputCursorPos++;
    }
    this.render();
  }
  
  toggleReadOnly() {
    this.activeTab.readOnly = !this.activeTab.readOnly;
    const status = this.activeTab.readOnly ? 'Read-only mode ON' : 'Read-only mode OFF';
    this.setStatus(status);
  }
  
  nextTheme() {
    this.themeIndex = (this.themeIndex + 1) % THEMES.length;
    this.setStatus(`Theme: ${this.theme.name}`);
    this.uiManager.updateThemeColor(this.theme.color);
    this.saveSession();
    this.render();
  }
  
  undo() {
    const tab = this.activeTab;
    if (tab.undoStack.length === 0) return;
    
    const currentState = {
      lines: [...tab.lines],
      cursorX: tab.cursorX,
      cursorY: tab.cursorY,
      scrollOffset: tab.scrollOffset
    };
    tab.redoStack.push(currentState);
    
    const prevState = tab.undoStack.pop();
    tab.restoreState(prevState);
    this.render();
  }
  
  redo() {
    const tab = this.activeTab;
    if (tab.redoStack.length === 0) return;
    
    const currentState = {
      lines: [...tab.lines],
      cursorX: tab.cursorX,
      cursorY: tab.cursorY,
      scrollOffset: tab.scrollOffset
    };
    tab.undoStack.push(currentState);
    
    const nextState = tab.redoStack.pop();
    tab.restoreState(nextState);
    this.render();
  }
  
  setupKeyHandlers() {
    const screen = this.uiManager.screen;
    
    // Raw stdin handler for Alt+Arrow keys only (Shift+arrows are handled by screen.key below)
    process.stdin.on('data', (data) => {
      if (this.inputMode) return;
      
      const bytes = Array.from(data);
      
      // Helper to match byte sequences
      const matchBytes = (sequence) => {
        if (bytes.length !== sequence.length) return false;
        return bytes.every((b, i) => b === sequence[i]);
      };
      
      // Alt+Left arrow sequences (move cursor word by word)
      if (matchBytes([0x1b, 0x5b, 0x31, 0x3b, 0x33, 0x44]) ||  // ESC[1;3D
          matchBytes([0x1b, 0x62]) ||                            // ESC b
          matchBytes([0x1b, 0x1b, 0x5b, 0x44])) {               // ESC ESC[D
        this.cursorMovement.moveWordLeft(false);
        return;
      }
      
      // Alt+Right arrow sequences (move cursor word by word)
      if (matchBytes([0x1b, 0x5b, 0x31, 0x3b, 0x33, 0x43]) ||  // ESC[1;3C
          matchBytes([0x1b, 0x66]) ||                            // ESC f
          matchBytes([0x1b, 0x1b, 0x5b, 0x43])) {               // ESC ESC[C
        this.cursorMovement.moveWordRight(false);
        return;
      }
      
      // Alt+Shift+Left (select word by word)
      if (matchBytes([0x1b, 0x5b, 0x31, 0x3b, 0x34, 0x44]) ||
          matchBytes([0x1b, 0x5b, 0x31, 0x3b, 0x37, 0x44])) {
        this.cursorMovement.moveWordLeft(true);
        return;
      }
      
      // Alt+Shift+Right (select word by word)
      if (matchBytes([0x1b, 0x5b, 0x31, 0x3b, 0x34, 0x43]) ||
          matchBytes([0x1b, 0x5b, 0x31, 0x3b, 0x37, 0x43])) {
        this.cursorMovement.moveWordRight(true);
        return;
      }
      
      // Alt+Delete sequences (delete word forward)
      if (matchBytes([0x1b, 0x5b, 0x33, 0x3b, 0x33, 0x7e]) ||  // ESC[3;3~
          matchBytes([0x1b, 0x5b, 0x33, 0x7e]) ||               // ESC[3~
          matchBytes([0x1b, 0x64])) {                            // ESC d
        this.editingOps.deleteWordForward();
        return;
      }
    });
    
    // Navigation
    screen.key(['up'], () => !this.inputMode && this.cursorMovement.moveCursor(0, -1, false));
    screen.key(['down'], () => !this.inputMode && this.cursorMovement.moveCursor(0, 1, false));
    screen.key(['left'], () => this.inputMode ? this.inputMoveLeft() : this.cursorMovement.moveCursor(-1, 0, false));
    screen.key(['right'], () => this.inputMode ? this.inputMoveRight() : this.cursorMovement.moveCursor(1, 0, false));
    
    screen.key(['S-up'], () => !this.inputMode && this.cursorMovement.moveCursor(0, -1, true));
    screen.key(['S-down'], () => !this.inputMode && this.cursorMovement.moveCursor(0, 1, true));
    screen.key(['S-left'], () => !this.inputMode && this.cursorMovement.moveCursor(-1, 0, true));
    screen.key(['S-right'], () => !this.inputMode && this.cursorMovement.moveCursor(1, 0, true));
    
    // Word-by-word navigation with Alt/Option
    screen.key(['M-left'], () => !this.inputMode && this.cursorMovement.moveWordLeft(false));
    screen.key(['M-right'], () => !this.inputMode && this.cursorMovement.moveWordRight(false));
    screen.key(['M-S-left'], () => !this.inputMode && this.cursorMovement.moveWordLeft(true));
    screen.key(['M-S-right'], () => !this.inputMode && this.cursorMovement.moveWordRight(true));
    
    screen.key(['home'], () => this.inputMode ? this.inputHome() : this.cursorMovement.home());
    screen.key(['end'], () => this.inputMode ? this.inputEnd() : this.cursorMovement.end());
    screen.key(['pageup'], () => !this.inputMode && this.cursorMovement.pageUp());
    screen.key(['pagedown'], () => !this.inputMode && this.cursorMovement.pageDown());
    
    // Editing
    screen.key(['backspace', 'C-h', 'C-?'], () => {
      if (this.inputMode) {
        this.inputBackspace();
        return false; // Prevent further processing
      } else {
        this.editingOps.deleteChar();
      }
    });
    
    screen.key(['delete'], () => this.inputMode ? this.inputDelete() : this.editingOps.deleteForward());
    
    screen.key(['enter'], () => {
      if (this.inputMode) {
        this.inputMode = false;
        const callback = this.inputCallback;
        const value = this.inputValue;
        this.inputCallback = null;
        this.inputValue = '';
        this.inputCursorPos = 0;
        this.inputPrompt = '';
        if (callback) callback(value);
        this.render();
      } else {
        this.editingOps.insertNewLine();
      }
    });
    
    screen.key(['tab'], () => !this.inputMode && this.editingOps.insertTab());
    screen.key(['escape'], () => {
      if (this.inputMode) {
        // If there's a selection, clear it
        if (this.inputSelectionStart !== null || this.inputSelectionEnd !== null) {
          this.inputSelectionStart = null;
          this.inputSelectionEnd = null;
          this.render();
        } else {
          // Otherwise, cancel input mode
          this.inputMode = false;
          this.inputCallback = null;
          this.inputValue = '';
          this.inputCursorPos = 0;
          this.inputPrompt = '';
          this.setStatus('');
          this.render();
        }
      } else {
        // Clear selection in editor
        const tab = this.activeTab;
        if (tab.selectionStart || tab.selectionEnd) {
          tab.selectionStart = null;
          tab.selectionEnd = null;
          this.render();
        }
      }
    });
    
    // Commands
    screen.key(['C-s'], () => !this.inputMode && this.saveFile());
    screen.key(['C-o'], () => !this.inputMode && this.openFile(false));
    screen.key(['C-t'], () => !this.inputMode && this.newTab());
    screen.key(['C-n'], () => !this.inputMode && this.nextTab());
    screen.key(['C-p'], () => !this.inputMode && this.previousTab());
    screen.key(['C-w'], () => !this.inputMode && this.closeTab());
    screen.key(['C-c'], () => !this.inputMode && this.clipboardOps.copy());
    screen.key(['C-x'], () => !this.inputMode && this.clipboardOps.cut());
    screen.key(['C-v'], () => !this.inputMode && this.clipboardOps.paste());
    screen.key(['C-z'], () => !this.inputMode && this.undo());
    screen.key(['C-y'], () => !this.inputMode && this.redo());
    screen.key(['C-a'], () => this.inputMode ? this.inputSelectAll() : this.selectAll());
    screen.key(['C-r'], () => !this.inputMode && this.toggleReadOnly());
    screen.key(['C-l'], () => !this.inputMode && this.nextTheme());
    screen.key(['C-q'], () => {
      this.saveSession();
      process.exit(0);
    });
    
    // Mouse wheel support for scrolling
    this.uiManager.contentBox.on('wheeldown', () => {
      if (this.inputMode) return;
      const tab = this.activeTab;
      const viewportHeight = this.uiManager.getViewportHeight();
      const maxScroll = Math.max(0, tab.lines.length - viewportHeight);
      
      // Scroll down 3 lines
      tab.scrollOffset = Math.min(maxScroll, tab.scrollOffset + 3);
      this.render();
    });
    
    this.uiManager.contentBox.on('wheelup', () => {
      if (this.inputMode) return;
      const tab = this.activeTab;
      
      // Scroll up 3 lines
      tab.scrollOffset = Math.max(0, tab.scrollOffset - 3);
      this.render();
    });
    
    // Shift+wheel for horizontal scrolling
    this.uiManager.contentBox.on('wheeldown', (data) => {
      if (this.inputMode) return;
      if (data && data.shift) {
        const tab = this.activeTab;
        // Scroll right 5 characters
        tab.horizontalScrollOffset += 5;
        this.render();
      }
    });
    
    this.uiManager.contentBox.on('wheelup', (data) => {
      if (this.inputMode) return;
      if (data && data.shift) {
        const tab = this.activeTab;
        // Scroll left 5 characters
        tab.horizontalScrollOffset = Math.max(0, tab.horizontalScrollOffset - 5);
        this.render();
      }
    });
    
    // Mouse click to position cursor
    this.uiManager.contentBox.on('click', (data) => {
      if (this.inputMode) return;
      
      const tab = this.activeTab;
      const totalLines = tab.lines.length;
      const lineNumWidth = String(totalLines).length;
      
      // Line number format: "NNN │ " where NNN is right-padded to lineNumWidth
      // So total offset is: lineNumWidth + " │ ".length = lineNumWidth + 3
      const lineNumColumnWidth = lineNumWidth + 3;
      
      // Account for:
      // - Status bar height (3 lines)
      // - Content box border (1 line)
      // = 4 total lines offset
      const clickY = data.y - 4;
      // Subtract 1 more from X to position cursor AT the click, not after it
      const clickX = data.x - lineNumColumnWidth - 1;
      
      if (clickX < 0 || clickY < 0) return;  // Clicked on line numbers or border
      
      // Calculate actual line and column based on scroll offsets
      const lineIndex = tab.scrollOffset + clickY;
      const columnIndex = tab.horizontalScrollOffset + clickX;
      
      // Validate and set cursor position
      if (lineIndex >= 0 && lineIndex < tab.lines.length) {
        tab.cursorY = lineIndex;
        tab.cursorX = Math.min(columnIndex, tab.lines[lineIndex].length);
        
        // Clear selection on click
        tab.selectionStart = null;
        tab.selectionEnd = null;
        
        // Render once
        this.render();
      }
    });
    
    // Regular character input
    screen.on('keypress', (ch, key) => {
      // Ignore special keys like backspace, enter, escape, tab, etc.
      if (key && (key.name === 'backspace' || key.name === 'enter' || key.name === 'escape' || 
          key.name === 'tab' || key.name === 'delete' || key.name === 'return')) {
        return;
      }
      
      // Check if ctrl or meta key is pressed
      const isCtrl = key && key.ctrl === true;
      const isMeta = key && key.meta === true;
      
      if (ch && !isCtrl && !isMeta && ch.length === 1 && ch.charCodeAt(0) >= 32) {
        if (this.inputMode) {
          this.inputInsertChar(ch);
        } else {
          this.editingOps.insertChar(ch);
        }
      }
    });
  }
  
  start() {
    this.render();
  }
}
