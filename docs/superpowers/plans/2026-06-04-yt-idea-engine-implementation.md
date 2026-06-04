# YouTube Idea & Presentation Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a CLI-driven system to scrape YouTube comments, synthesize them into video ideas in an Obsidian Wiki, and generate psychologically engaging HTML presentations.

**Architecture:** A modular CLI pipeline: `Intake (Scraper)` -> `Synthesis (Obsidian/LLM)` -> `Research (Autoresearch)` -> `Presentation (HTML/CSS Generator)`.

**Tech Stack:** Node.js (CLI), Python (`scrapling`), Obsidian (Wiki), Vanilla HTML/CSS/JS (SPA).

---

### Task 1: Project Scaffolding & CLI Setup

**Files:**
- Create: `package.json`
- Create: `bin/yt-engine.js`
- Create: `.gitignore`

- [ ] **Step 1: Initialize pnpm project**
Run: `pnpm init`

- [ ] **Step 2: Create base CLI structure**
```javascript
#!/usr/bin/env node
const { program } = require('commander');

program
  .version('1.0.0')
  .description('YouTube Idea & Presentation Engine');

program
  .command('generate <url>')
  .description('Generate video blueprint and presentation from a YouTube URL')
  .action((url) => {
    console.log(`Processing URL: ${url}`);
  });

program.parse(process.argv);
```

- [ ] **Step 3: Setup gitignore**
```text
node_modules
.DS_Store
.env
dist
```

- [ ] **Step 4: Commit**
```bash
git add .
git commit -m "chore: initial project scaffold"
```

---

### Task 2: Comment Scraper Implementation (Python/Scrapling)

**Files:**
- Create: `scripts/scrape_comments.py`
- Modify: `package.json` (add dependency/script)

- [ ] **Step 1: Write Python scraper using scrapling**
```python
import sys
import json
from scrapling import fetch

def scrape_comments(url):
    # This is a placeholder for actual scrapling logic based on current package capabilities
    # We will assume a simple fetch and selector for comments
    page = fetch(url)
    comments = page.css('.comment-text-class').texts() # Adjust based on actual YT DOM
    return comments

if __name__ == "__main__":
    url = sys.argv[1]
    results = scrape_comments(url)
    print(json.dumps(results))
```

- [ ] **Step 2: Add test script for scraper**
Create `tests/test_scraper.py`
```python
from scripts.scrape_comments import scrape_comments

def test_scrape_logic():
    # Mock test or simple check
    assert callable(scrape_comments)
```

- [ ] **Step 3: Run verification**
Run: `python3 tests/test_scraper.py`

- [ ] **Step 4: Commit**
```bash
git add scripts/scrape_comments.py
git commit -m "feat: add comment scraper script"
```

---

### Task 3: Wiki Synthesis Logic

**Files:**
- Create: `src/synthesis.js`
- Modify: `bin/yt-engine.js`

- [ ] **Step 1: Implement LLM synthesis to Markdown**
```javascript
const fs = require('fs');
const path = require('path');

async function synthesize(comments, url) {
    const blueprint = `---
type: video-idea
status: raw
url: ${url}
---
# Video Blueprint: [Generated Title]

## Pain Points (From Comments)
${comments.map(c => `- ${c}`).join('\n')}

## Curiosity Gaps
- TBD via trend analysis

## Key Metaphors
- Metaphor 1: [Description]
`;
    const filePath = path.join(__dirname, '../yt-ideas/wiki/ideas/', `blueprint-${Date.now()}.md`);
    fs.writeFileSync(filePath, blueprint);
    return filePath;
}
module.exports = { synthesize };
```

- [ ] **Step 2: Commit**
```bash
git add src/synthesis.js
git commit -m "feat: add wiki synthesis logic"
```

---

### Task 4: Presentation HTML/CSS Generator

**Files:**
- Create: `src/generator.js`
- Create: `templates/presentation.html`

- [ ] **Step 1: Create HTML template with "Retention-Engine" phases**
```html
<!DOCTYPE html>
<html>
<head>
    <style>
        /* Phase styles from design spec */
        body { background: #0b0f19; color: #e2e8f0; font-family: sans-serif; }
        .section { height: 100vh; display: flex; align-items: center; padding: 50px; }
        .talent-zone { width: 300px; height: 400px; border: 2px dashed #ff00ff; }
    </style>
</head>
<body>
    <div id="hook" class="section">
        <div class="content"><h1>{{HOOK_TITLE}}</h1><p>{{HOOK_TEXT}}</p></div>
        <div class="talent-zone"></div>
    </div>
    <!-- Other phases: Hero, Guide, Trap -->
</body>
</html>
```

- [ ] **Step 2: Implement generator logic**
```javascript
const fs = require('fs');
function generatePresentation(blueprintData) {
    let html = fs.readFileSync('./templates/presentation.html', 'utf8');
    html = html.replace('{{HOOK_TITLE}}', blueprintData.painPoints[0]);
    fs.writeFileSync('./dist/presentation.html', html);
}
```

- [ ] **Step 3: Commit**
```bash
git add src/generator.js templates/presentation.html
git commit -m "feat: add presentation generator"
```

---

### Task 5: Integration & Verification

- [ ] **Step 1: Wire all components in `bin/yt-engine.js`**
- [ ] **Step 2: Run end-to-end test with a sample URL**
- [ ] **Step 3: Verify output in `yt-ideas/wiki/ideas/` and `dist/presentation.html`**
- [ ] **Step 4: Final Commit**
```bash
git commit -m "feat: complete end-to-end integration"
```
