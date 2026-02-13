// Key mapping configuration
// Each entry maps a key sequence (as hex bytes) to a handler function name

export const KEY_SEQUENCES = {
  // Alt+Arrow keys - multiple possible sequences for different terminals
  ALT_LEFT: [
    [0x1b, 0x5b, 0x31, 0x3b, 0x33, 0x44],  // ESC[1;3D (common)
    [0x1b, 0x62],                            // ESC b (emacs-style)
    [0x1b, 0x1b, 0x5b, 0x44],               // ESC ESC[D (some terminals)
    [0x1b, 0x5b, 0x44],                      // ESC[D (some configs)
  ],
  
  ALT_RIGHT: [
    [0x1b, 0x5b, 0x31, 0x3b, 0x33, 0x43],  // ESC[1;3C (common)
    [0x1b, 0x66],                            // ESC f (emacs-style)
    [0x1b, 0x1b, 0x5b, 0x43],               // ESC ESC[C (some terminals)
    [0x1b, 0x5b, 0x43],                      // ESC[C (some configs)
  ],
  
  ALT_SHIFT_LEFT: [
    [0x1b, 0x5b, 0x31, 0x3b, 0x34, 0x44],  // ESC[1;4D
    [0x1b, 0x5b, 0x31, 0x3b, 0x37, 0x44],  // ESC[1;7D (ctrl+alt)
  ],
  
  ALT_SHIFT_RIGHT: [
    [0x1b, 0x5b, 0x31, 0x3b, 0x34, 0x43],  // ESC[1;4C
    [0x1b, 0x5b, 0x31, 0x3b, 0x37, 0x43],  // ESC[1;7C (ctrl+alt)
  ],
  
  // Alt+Backspace - delete word backward
  ALT_BACKSPACE: [
    [0x1b, 0x7f],                            // ESC DEL
    [0x1b, 0x08],                            // ESC BS
    [0x1b, 0x1b, 0x7f],                      // ESC ESC DEL (some terminals)
    [0x17],                                  // Ctrl+W (common binding)
  ],
  
  // Alt+Delete - delete word forward
  ALT_DELETE: [
    [0x1b, 0x5b, 0x33, 0x3b, 0x33, 0x7e],  // ESC[3;3~
    [0x1b, 0x5b, 0x33, 0x7e],               // ESC[3~ with meta flag
    [0x1b, 0x64],                            // ESC d (emacs-style)
  ],
};

// Helper function to match byte sequences
export function matchKeySequence(data) {
  const bytes = Array.from(data);
  
  for (const [action, sequences] of Object.entries(KEY_SEQUENCES)) {
    for (const sequence of sequences) {
      if (arraysEqual(bytes, sequence)) {
        return action;
      }
    }
  }
  
  return null;
}

function arraysEqual(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

// Action handlers mapping
export const KEY_ACTIONS = {
  ALT_LEFT: 'moveWordLeft',
  ALT_RIGHT: 'moveWordRight',
  ALT_SHIFT_LEFT: 'moveWordLeftSelect',
  ALT_SHIFT_RIGHT: 'moveWordRightSelect',
  ALT_BACKSPACE: 'deleteWordBackward',
  ALT_DELETE: 'deleteWordForward',
};
