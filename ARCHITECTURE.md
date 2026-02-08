# Act Editor Architecture

## Component Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         index.js                            │
│                       (Entry Point)                         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      ActEditor.js                           │
│                   (Main Orchestrator)                       │
│                                                             │         
│  - Manages tabs, state, and coordination                    │
│  - Routes keyboard input to handlers                        │
│  - Controls rendering flow                                  │
└──┬──────────┬───────────┬────────────┬────────────┬─────────┘
   │          │           │            │            │
   │          │           │            │            │
   ▼          ▼           ▼            ▼            ▼
┌────────┐ ┌───────┐ ┌──────────┐ ┌─────────┐ ┌──────────┐
│  Tab   │ │   UI  │ │ Renderer │ │Handlers │ │  Utils   │
│        │ │Manager│ │          │ │         │ │          │
└────────┘ └───────┘ └──────────┘ └─────────┘ └──────────┘
```

## Data Flow

### User Input → Action → Render

```
User presses key
        ↓
process.stdin / blessed key handler
        ↓
ActEditor.setupKeyHandlers()
        ↓
Handler method called
  ├─→ EditingOperations (insert, delete)
  ├─→ CursorMovement (navigate)
  ├─→ ClipboardOperations (copy/paste)
  ├─→ ActEditor methods (file ops, tabs)
  └─→ Updates Tab state
        ↓
ActEditor.render()
        ↓
Renderer.renderEditor() / renderWelcomePage()
        ↓
UIManager components updated
        ↓
Screen.render() → Terminal display
```

## Component Dependencies

```
ActEditor
├── depends on → Tab (creates instances)
├── depends on → UIManager (manages UI)
├── depends on → Renderer (renders content)
├── depends on → EditingOperations (needs 'editor' ref)
├── depends on → CursorMovement (needs 'editor' ref)
├── depends on → ClipboardOperations (needs 'editor' ref)
├── depends on → SessionManager (load/save)
└── depends on → THEMES (theme data)

UIManager
└── depends on → blessed (UI framework)

Renderer
└── depends on → UIManager (to render to)

Handlers (EditingOps, CursorMovement, ClipboardOps)
└── depends on → ActEditor (passed in constructor)

Tab
└── depends on → fs (file loading)

SessionManager
└── depends on → fs (session persistence)
```

## Key Design Patterns

### 1. **Separation of Concerns**
- **Data (Tab)**: Stores content and state
- **View (UIManager, Renderer)**: Displays the UI
- **Controller (ActEditor, Handlers)**: Handles user input

### 2. **Dependency Injection**
- Handlers receive `editor` reference in constructor
- Allows handlers to call back into editor methods
- Makes testing easier (can mock the editor)

### 3. **Single Responsibility**
- Each class has one clear purpose
- EditingOperations: only text editing
- CursorMovement: only navigation
- Renderer: only rendering logic

### 4. **Stateless Handlers**
- Handlers don't store state (except clipboard)
- All state lives in ActEditor or Tab
- Makes state management predictable

## File Organization Benefits

✅ **Easy to Find**: Need to change cursor behavior? → CursorMovement.js
✅ **Easy to Test**: Each component can be tested independently
✅ **Easy to Extend**: Add new features by creating new handlers
✅ **Easy to Understand**: Clear structure shows what each piece does
✅ **Easy to Maintain**: Changes localized to specific files
