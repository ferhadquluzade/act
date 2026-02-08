#!/usr/bin/env node

import { ActEditor } from './src/ActEditor.js';

const filename = process.argv[2] || '';
const editor = new ActEditor(filename);
editor.start();
