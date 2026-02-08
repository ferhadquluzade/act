import fs from 'fs';
import path from 'path';
import os from 'os';

const SESSION_FILE = path.join(os.homedir(), '.act-session.json');

export class SessionManager {
  static load() {
    try {
      if (fs.existsSync(SESSION_FILE)) {
        const data = fs.readFileSync(SESSION_FILE, 'utf-8');
        return JSON.parse(data);
      }
    } catch (error) {
      return null;
    }
    return null;
  }
  
  static save(tabs, activeTabIndex, themeIndex) {
    try {
      const data = {
        tabs: tabs.map(tab => ({
          id: tab.id,
          filename: tab.filename,
          lines: tab.lines,
          cursorX: tab.cursorX,
          cursorY: tab.cursorY,
          scrollOffset: tab.scrollOffset,
          readOnly: tab.readOnly
        })),
        activeTabIndex,
        themeIndex
      };
      fs.writeFileSync(SESSION_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
      // Silently fail
    }
  }
}
