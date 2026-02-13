import blessed from 'blessed';

export class UIManager {
  constructor(themeColor) {
    this.screen = blessed.screen({
      smartCSR: true,
      fastCSR: true,
      title: 'Act Editor',
      fullUnicode: true,
      dockBorders: true,
      warnings: false,
      style: {
        bg: '#232335'
      }
    });
    
    // Set up raw mode for stdin
    if (process.stdin.setRawMode) {
      process.stdin.setRawMode(true);
    }
    process.stdin.resume();
    
    this.createComponents(themeColor);
  }
  
  createComponents(themeColor) {
    // Full-screen background
    this.background = blessed.box({
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      style: {
        bg: '#232335'
      }
    });
    
    // Status bar with rounded borders
    this.statusBar = blessed.box({
      top: 0,
      left: 0,
      width: '100%',
      height: 3,
      content: '',
      tags: true,
      border: {
        type: 'line',
        tl: '╭',
        tr: '╮',
        bl: '╰',
        br: '╯',
        ls: '│',
        rs: '│',
        ts: '─',
        bs: '─'
      },
      style: {
        fg: 'white',
        bg: '#232335',
        border: {
          fg: themeColor,
          bg: '#232335'
        }
      }
    });
    
    // Content area
    this.contentBox = blessed.box({
      top: 3,
      left: 0,
      width: '100%',
      height: '100%-3',
      content: '',
      tags: true,
      align: 'left',
      valign: 'top',
      scrollable: true,  // Enable scrollable for mouse wheel support
      alwaysScroll: true,
      keys: false,
      mouse: true,  // Enable mouse for wheel events
      wrap: false,  // Disable text wrapping
      border: {
        type: 'line',
        top: true,
        bottom: false,
        left: false,
        right: false,
        ts: '─'
      },
      style: {
        fg: 'white',
        bg: '#232335',
        border: {
          fg: themeColor,
          bg: '#232335'
        }
      }
    });
    
    this.screen.append(this.background);
    this.screen.append(this.statusBar);
    this.screen.append(this.contentBox);
  }
  
  updateThemeColor(color) {
    this.statusBar.style.border.fg = color;
    this.contentBox.style.border.fg = color;
  }
  
  render() {
    this.screen.render();
  }
  
  getViewportHeight() {
    return Math.max(1, this.contentBox.height - 2);
  }
  
  getViewportWidth() {
    // Account for line numbers and separator (e.g., "  1 │ ")
    // We'll estimate based on a typical 4-digit line number + separator
    return Math.max(1, this.contentBox.width - 8);
  }
}
