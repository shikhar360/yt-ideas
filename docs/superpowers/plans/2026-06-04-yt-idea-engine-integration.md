# Integration & Verification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate the Python scraper, Node.js synthesis, and presentation generator into a single cohesive CLI command in `bin/yt-engine.js` and verify it end-to-end.

**Architecture:** Use `commander` for CLI structure. The `generate` command will chain the Python scraper (via `child_process.execSync`), the `synthesize` logic, and the `generatePresentation` logic.

**Tech Stack:** Node.js, Python, Commander.js, fs-extra (if available) or standard fs.

---

### Task 1: Research & Readiness

**Files:**
- Modify: `bin/yt-engine.js`
- Modify: `src/synthesis.js`
- Modify: `src/generator.js`
- Check: `package.json`

- [ ] **Step 1: Check existing `bin/yt-engine.js` structure**
- [ ] **Step 2: Verify `package.json` dependencies (commander, fs-extra, etc.)**
- [ ] **Step 3: Check `src/synthesis.js` for `fs.mkdirSync` safety**

### Task 2: Core Integration in `bin/yt-engine.js`

**Files:**
- Modify: `bin/yt-engine.js`

- [ ] **Step 1: Wire the components in `bin/yt-engine.js`**

```javascript
#!/usr/bin/env node
const { program } = require('commander');
const { execSync } = require('child_process');
const { synthesize } = require('../src/synthesis');
const { generatePresentation } = require('../src/generator');
const path = require('path');
const fs = require('fs');

program
  .name('yt-engine')
  .description('YouTube Idea Engine CLI')
  .version('1.0.0');

program
  .command('generate <url>')
  .description('Generate video ideas and presentation from a YouTube URL')
  .action(async (url) => {
    try {
      console.log(`Scraping comments for: ${url}...`);
      const scraperPath = path.join(__dirname, '../scripts/scrape_comments.py');
      const rawDataPath = path.join(__dirname, '../yt-ideas/.raw/comments.json');
      
      // Ensure .raw directory exists
      const rawDir = path.dirname(rawDataPath);
      if (!fs.existsSync(rawDir)) fs.mkdirSync(rawDir, { recursive: true });

      // Run Python scraper
      // Using execSync for simplicity in this integration step
      execSync(`python3 "${scraperPath}" "${url}" "${rawDataPath}"`, { stdio: 'inherit' });

      console.log('Synthesizing ideas...');
      const ideas = await synthesize(rawDataPath);

      console.log('Generating presentation...');
      const outputPath = path.join(__dirname, '../dist/presentation.html');
      const outputDir = path.dirname(outputPath);
      if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
      
      await generatePresentation(ideas, outputPath);

      console.log(`Done! Presentation generated at: ${outputPath}`);
    } catch (error) {
      console.error('Error during generation:', error.message);
      process.exit(1);
    }
  });

program.parse();
```

- [ ] **Step 2: Commit**
```bash
git add bin/yt-engine.js
git commit -m "feat: integrate scraper, synthesis, and generator in CLI"
```

### Task 3: Robustness & Refactoring

**Files:**
- Modify: `src/synthesis.js`
- Modify: `src/generator.js`

- [ ] **Step 1: Ensure `src/synthesis.js` handles directory creation safely**
- [ ] **Step 2: Make data flow in `src/generator.js` robust (avoid "HOOK_TEXT" reliance if possible)**

### Task 4: Testing & Verification

**Files:**
- Create: `tests/test_synthesis.test.js`
- Create: `tests/test_generator.test.js`

- [ ] **Step 1: Write synthesis test**
- [ ] **Step 2: Write generator test**
- [ ] **Step 3: Run end-to-end test with a sample URL**
```bash
node bin/yt-engine.js generate https://www.youtube.com/watch?v=dQw4w9WgXcQ
```
- [ ] **Step 4: Verify output in `yt-ideas/wiki/ideas/` and `dist/presentation.html`**

### Task 5: Final Commit
- [ ] **Step 1: Final Commit**
```bash
git commit -m "feat: complete end-to-end integration"
```
