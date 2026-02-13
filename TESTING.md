# Testing and Configuring Key Mappings

## Quick Start

### 1. Test Your Terminal's Key Sequences

Run the key sequence tester to see what bytes your terminal sends:

```bash
node test-keys.js
```

Then press:
- Alt+Left Arrow
- Alt+Right Arrow
- Alt+Backspace
- Alt+Delete

The output will show you the exact byte sequences. Example output:
```
Bytes: [0x1b, 0x5b, 0x31, 0x3b, 0x33, 0x44]
Display: ESC [ 1 ; 3 D
---
```

### 2. Update Key Mappings

If your terminal sends different sequences, edit `src/config/keymaps.js` and add them to the appropriate arrays.

For example, if Alt+Left sends `[0x1b, 0x5b, 0x44]` (not currently in the config):

```javascript
ALT_LEFT: [
  [0x1b, 0x5b, 0x31, 0x3b, 0x33, 0x44],  // ESC[1;3D (common)
  [0x1b, 0x62],                            // ESC b (emacs-style)
  [0x1b, 0x5b, 0x44],                      // YOUR SEQUENCE - add this line
],
```

### 3. Run Word Movement Tests

Test the word movement logic:

```bash
node test-word-movement.js
```

This will verify that the cursor and delete operations work correctly.

### 4. Debug in the Editor

The editor now logs unmatched escape sequences to stderr. Run your editor and check the console output when pressing Alt key combinations.

Look for lines like:
```
Unmatched ESC sequence: [0x1b, 0x5b, ...]
```

Add these sequences to `src/config/keymaps.js`.

## Common Terminal Key Sequences

### iTerm2 (macOS)
- Alt+Left: `ESC[1;3D` or `ESC b` (if "Use Option as Meta key" is enabled)
- Alt+Right: `ESC[1;3C` or `ESC f`
- Alt+Backspace: `ESC DEL` (0x1b 0x7f)

### macOS Terminal
- Enable "Use Option as Meta key" in Preferences > Profiles > Keyboard
- Alt+Left: Usually `ESC b`
- Alt+Right: Usually `ESC f`

### Linux Terminals (gnome-terminal, konsole, etc.)
- Alt+Left: `ESC[1;3D`
- Alt+Right: `ESC[1;3C`

## Troubleshooting

1. **Keys not working at all**: Make sure your terminal sends escape sequences for Alt keys. Check terminal preferences.

2. **Wrong sequences**: Use `test-keys.js` to identify the exact bytes and add them to `keymaps.js`.

3. **Cursor jumping wrong places**: Run `test-word-movement.js` to verify the logic works correctly.

4. **Still issues**: Check the editor's console output for "Unmatched ESC sequence" messages.
