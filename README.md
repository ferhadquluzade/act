# Act Editor 

A terminal-based text editor built in Javascript/Node.js.

## Installation

```
git clone https://github.com/ferhadquluzade/act
cd act
npm install
npm install -g
```

## Usage

```
act file.txt
```
> Note: You can also use `act` to get started.

## Project Structure

```
act-editor/
├── index.js                    # Entry point
├── package.json               # Dependencies and config
└── src/
    ├── ActEditor.js           # Main editor class (orchestrator)
    ├── components/            # UI and data components
    │   ├── Tab.js            # Tab model (data structure)
    │   ├── UIManager.js      # Blessed screen & UI elements
    │   └── Renderer.js       # Rendering logic for editor/welcome page
    ├── handlers/              # Operation handlers
    │   ├── EditingOperations.js    # Insert, delete, selection
    │   ├── CursorMovement.js       # Navigation and scrolling
    │   └── ClipboardOperations.js  # Copy, cut, paste
    └── utils/                 # Utilities
        ├── themes.js         # Theme definitions
        └── session.js        # Session save/load
```

## Component Responsibilities

### Main Components

- **ActEditor.js**: Main orchestrator that coordinates all components
  - Manages tabs and active tab state
  - Handles keyboard input routing
  - Coordinates rendering
  - Manages file operations and session

- **Tab.js**: Data model for a single tab
  - Stores file content (lines)
  - Cursor position and scroll offset
  - Undo/redo stacks
  - Selection state
  - Modified/read-only flags

- **UIManager.js**: Manages blessed screen and UI elements
  - Creates and configures blessed components
  - Status bar, content box, background
  - Theme color updates
  - Provides viewport height calculation

- **Renderer.js**: Rendering logic
  - Renders welcome page
  - Renders editor with line numbers and cursor
  - Renders status bar with tabs/time
  - Handles text selection highlighting

### Handlers

- **EditingOperations.js**: Text editing operations
  - Insert/delete characters
  - Insert newlines and tabs
  - Selection deletion
  - State management for undo

- **CursorMovement.js**: Cursor navigation
  - Arrow key movement
  - Page up/down
  - Home/end
  - Selection with Shift

- **ClipboardOperations.js**: Clipboard functionality
  - Copy selected text
  - Cut (copy + delete)
  - Paste with multi-line support

### Utilities

- **themes.js**: Theme color definitions (11 themes)
- **session.js**: Save/restore editor state to `~/.act-session.json`

## Usage

```bash
npm install
node index.js [filename]
```

## Key Features

- **Modular Design**: Each component has a single responsibility
- **Clean Separation**: UI, data, and operations are separate
- **Easy to Extend**: Add new features by creating new handlers
- **Session Persistence**: Auto-saves state every 5 seconds
- **Theme Support**: 11 color themes with live switching
