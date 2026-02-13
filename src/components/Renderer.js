import path from 'path';
import fs from 'fs';

export class Renderer {
  constructor(uiManager) {
    this.uiManager = uiManager;
  }
  
  renderWelcomePage(themeColor, themeName) {
    const color = themeColor;
    const cwd = process.cwd();
    
    let content = '\n\n\n\n\n';
    content += `{center}{${color}-fg}{bold}Welcome to Act!{/bold}{/${color}-fg}{/center}\n\n`;
    content += `{center}{${color}-fg}{bold}Usage{/bold}{/${color}-fg}{/center}\n`;
    content += `{center}{${color}-fg}$ act{/${color}-fg}{/center}\n`;
    content += `{center}{${color}-fg}$ act file.txt{/${color}-fg}{/center}\n\n`;
    content += `{center}{${color}-fg}{bold}Controls{/bold}{/${color}-fg}{/center}\n\n`;
    
    content += `{center}{${color}-fg}Open file    : Ctrl + O{/${color}-fg}          {${color}-fg}Select     : Shift + ↑↓←→{/${color}-fg}{/center}\n`;
    content += `{center}{${color}-fg}Save         : Ctrl + S{/${color}-fg}          {${color}-fg}Cut        : Ctrl + X{/${color}-fg}{/center}\n`;
    content += `{center}{${color}-fg}New tab      : Ctrl + T{/${color}-fg}          {${color}-fg}Copy       : Ctrl + C{/${color}-fg}{/center}\n`;
    content += `{center}{${color}-fg}Next tab     : Ctrl + N{/${color}-fg}          {${color}-fg}Paste      : Ctrl + V{/${color}-fg}{/center}\n`;
    content += `{center}{${color}-fg}Previous tab : Ctrl + P{/${color}-fg}          {${color}-fg}Undo       : Ctrl + Z{/${color}-fg}{/center}\n`;
    content += `{center}{${color}-fg}Close tab    : Ctrl + W{/${color}-fg}          {${color}-fg}Redo       : Ctrl + Y{/${color}-fg}{/center}\n`;
    content += `{center}{${color}-fg}Quit         : Ctrl + Q{/${color}-fg}          {${color}-fg}Select all : Ctrl + A{/${color}-fg}{/center}\n\n`;
    content += `{center}{${color}-fg}Read-only : Ctrl + R{/${color}-fg}{/center}\n`;
    content += `{center}{${color}-fg}Theme     : Ctrl + L{/${color}-fg}{/center}\n\n\n`;
    content += `{center}{gray-fg}Directory: ${cwd}{/gray-fg}{/center}\n`;
    content += `{center}{gray-fg}Theme: ${themeName}{/gray-fg}{/center}`;
    
    this.uiManager.contentBox.setContent(content);
  }
  
  renderEditor(tab, themeColor, scrollOffset, horizontalScrollOffset = 0) {
    const viewportHeight = this.uiManager.getViewportHeight();
    const visibleLines = tab.lines.slice(scrollOffset, scrollOffset + viewportHeight);
    const color = themeColor;
    
    // Calculate line number width based on total number of lines
    const totalLines = tab.lines.length;
    const lineNumWidth = String(totalLines).length;
    
    let content = '';
    for (let i = 0; i < visibleLines.length; i++) {
      const lineIndex = scrollOffset + i;
      const lineNum = String(lineIndex + 1).padStart(lineNumWidth, ' ');
      const fullLine = visibleLines[i] || '';
      
      // Apply horizontal scrolling to the line
      const line = fullLine.substring(horizontalScrollOffset);
      
      if (lineIndex === tab.cursorY) {
        // Adjust cursor position for horizontal scroll
        const adjustedCursorX = tab.cursorX - horizontalScrollOffset;
        const before = line.substring(0, adjustedCursorX);
        const cursorChar = line[adjustedCursorX] || ' ';
        const after = line.substring(adjustedCursorX + 1);
        
        if (tab.selectionStart && tab.selectionEnd) {
          content += `{${color}-fg}${lineNum} │{/${color}-fg} ${this.renderLineWithSelection(line, lineIndex, tab, scrollOffset, horizontalScrollOffset)}\n`;
        } else {
          content += `{${color}-fg}${lineNum} │{/${color}-fg} ${before}{inverse}${cursorChar}{/inverse}${after}\n`;
        }
      } else {
        if (tab.selectionStart && tab.selectionEnd) {
          content += `{${color}-fg}${lineNum} │{/${color}-fg} ${this.renderLineWithSelection(line, lineIndex, tab, scrollOffset, horizontalScrollOffset)}\n`;
        } else {
          content += `{${color}-fg}${lineNum} │{/${color}-fg} ${line}\n`;
        }
      }
    }
    
    this.uiManager.contentBox.setContent(content);
  }
  
  renderLineWithSelection(line, lineIndex, tab, scrollOffset, horizontalScrollOffset = 0) {
    if (!tab.selectionStart || !tab.selectionEnd) return line;
    
    const [start, end] = this.getOrderedSelection(tab.selectionStart, tab.selectionEnd);
    
    if (lineIndex < start.y || lineIndex > end.y) return line;
    
    let result = '';
    for (let i = 0; i < line.length; i++) {
      const actualX = i + horizontalScrollOffset; // Actual position in the full line
      const isSelected = this.isCharSelected(actualX, lineIndex, start, end);
      const isCursor = lineIndex === tab.cursorY && actualX === tab.cursorX;
      
      if (isCursor) {
        result += `{inverse}${line[i]}{/inverse}`;
      } else if (isSelected) {
        result += `{blue-bg}{white-fg}${line[i]}{/white-fg}{/blue-bg}`;
      } else {
        result += line[i];
      }
    }
    
    if (lineIndex === tab.cursorY && tab.cursorX >= horizontalScrollOffset + line.length) {
      result += '{inverse} {/inverse}';
    }
    
    return result;
  }
  
  isCharSelected(x, y, start, end) {
    if (y < start.y || y > end.y) return false;
    if (y === start.y && y === end.y) return x >= start.x && x < end.x;
    if (y === start.y) return x >= start.x;
    if (y === end.y) return x < end.x;
    return true;
  }
  
  getOrderedSelection(start, end) {
    return start.y < end.y || (start.y === end.y && start.x <= end.x)
      ? [start, end]
      : [end, start];
  }
  
  renderStatusBar(tabs, activeTabIndex, themeColor, currentTime, inputMode, inputValue, inputCursorPos, inputSelectionStart, inputSelectionEnd) {
    const tab = tabs[activeTabIndex];
    const color = themeColor;
    
    if (inputMode) {
      const fileExists = inputValue.trim() && fs.existsSync(inputValue.trim());
      const indicator = inputValue.trim() ? (fileExists ? '{green-fg}✓{/green-fg}' : '{gray-fg}○{/gray-fg}') : '';
      
      let displayValue = '';
      
      // If there's a selection, show it
      if (inputSelectionStart !== null && inputSelectionEnd !== null) {
        const start = Math.min(inputSelectionStart, inputSelectionEnd);
        const end = Math.max(inputSelectionStart, inputSelectionEnd);
        const beforeSelection = inputValue.slice(0, start);
        const selection = inputValue.slice(start, end);
        const afterSelection = inputValue.slice(end);
        displayValue = `${beforeSelection}{inverse}${selection}{/inverse}${afterSelection}`;
      } else {
        // Show cursor
        const beforeCursor = inputValue.slice(0, inputCursorPos);
        const atCursor = inputValue[inputCursorPos] || ' ';
        const afterCursor = inputValue.slice(inputCursorPos + 1);
        displayValue = `${beforeCursor}{inverse}${atCursor}{/inverse}${afterCursor}`;
      }
      
      const content = `{${color}-fg}File:{/${color}-fg} ${indicator} ${displayValue} {gray-fg}(Enter to open, Esc to ${inputSelectionStart !== null ? 'unselect' : 'cancel'}){/gray-fg}`;
      this.uiManager.statusBar.setContent(content);
      return;
    }
    
    let content = '';
    
    if (tabs.length > 1) {
      const tabNames = tabs.map((t, i) => {
        const isActive = i === activeTabIndex;
        const isWelcome = t.isWelcomePage();
        const name = isWelcome ? 'Welcome' : (t.filename ? path.basename(t.filename) : 'untitled');
        const modified = t.modified ? '' : '';
        const readOnlyMark = isActive && t.readOnly ? ' 🔒' : '';
        
        if (isActive) {
          return `{${color}-fg}{bold}${name}${modified}${readOnlyMark}{/bold}{/${color}-fg}`;
        } else {
          return `{gray-fg}${name}${modified}{/gray-fg}`;
        }
      }).join(' {gray-fg}│{/gray-fg} ');
      
      content = ` ${tabNames}`;
    } else {
      const isWelcome = tab.isWelcomePage();
      const name = isWelcome ? 'Welcome' : (tab.filename ? path.basename(tab.filename) : 'untitled');
      const readOnlyMark = tab.readOnly ? ' 🔒' : '';
      content = ` {${color}-fg}${name}${readOnlyMark}{/${color}-fg}`;
    }
    
    const time = this.formatTime(currentTime);
    content += `{|}{${color}-fg}${time}{/${color}-fg}`;
    
    this.uiManager.statusBar.setContent(content);
  }
  
  formatTime(date) {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }
}
