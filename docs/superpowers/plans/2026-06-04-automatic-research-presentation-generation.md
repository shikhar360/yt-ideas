# Automatic Research & Presentation Generation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a `build` command that combines video blueprints with research data to generate an enriched presentation.

**Architecture:** 
1. `bin/yt-engine.js` gets a `build` command.
2. `src/generator.js` is updated to handle research data and better parse blueprints.
3. `templates/presentation.html` is updated with a research section.
4. The system searches for related research in `yt-ideas/wiki/` (sources, intel).

**Tech Stack:** Node.js, Commander, File System.

---

### Task 1: Update templates/presentation.html

**Files:**
- Modify: `templates/presentation.html`

- [ ] **Step 1: Add research section to template**

```html
    <!-- Add this after the Trap section -->
    <div class="slide slide-research">
        <div class="talent-zone"></div>
        <div class="content">
            <h1>Deep Dive & Research</h1>
            <div id="research-content">
                {{RESEARCH_DATA}}
            </div>
        </div>
    </div>
```

- [ ] **Step 2: Add styles for the research section**

```css
        .slide-research .content {
            background: rgba(30, 41, 59, 0.7);
            border-left: 4px solid #3b82f6;
            padding: 2rem;
        }
        .research-item {
            margin-bottom: 1.5rem;
        }
        .research-item h3 {
            color: #60a5fa;
            margin-top: 0;
        }
```

- [ ] **Step 3: Commit**

```bash
git add templates/presentation.html
git commit -m "chore: add research section to presentation template"
```

### Task 2: Update src/generator.js

**Files:**
- Modify: `src/generator.js`

- [ ] **Step 1: Update generatePresentation to accept researchData and improve parsing**

```javascript
function generatePresentation(blueprintData, outputPath, researchData = []) {
    const templatePath = path.join(__dirname, '../templates/presentation.html');
    if (!fs.existsSync(templatePath)) {
        throw new Error(`Template not found at ${templatePath}`);
    }

    let html = fs.readFileSync(templatePath, 'utf8');

    // Replace Hook
    const mainPainPoint = blueprintData.painPoints && blueprintData.painPoints.length > 0 
        ? blueprintData.painPoints[0] 
        : 'The Common Struggle';
    html = html.replace('{{HOOK_TITLE}}', mainPainPoint);
    
    const hookText = blueprintData.painPoints && blueprintData.painPoints.length > 1
        ? `Stop struggling with ${blueprintData.painPoints[1].toLowerCase()}.`
        : 'Stop wasting time on solutions that don\'t work for your specific use case.';
    html = html.replace('{{HOOK_TEXT}}', hookText);

    // Replace Hero
    html = html.replace('{{HERO_TITLE}}', blueprintData.title || 'The Solution');
    html = html.replace('{{HERO_BENEFIT}}', blueprintData.benefit || 'Unlock the power of efficient automation.');

    // Replace Guide Steps
    const stepsHtml = (blueprintData.steps || []).map(step => `
        <div class="step-item">
            <span class="step-metaphor">${step.metaphor || ''}</span>
            <p>${step.description}</p>
        </div>
    `).join('');
    html = html.replace('{{GUIDE_STEPS}}', stepsHtml || '<p>Follow our proven path to success.</p>');

    // Replace Trap
    html = html.replace('{{TRAP_TEXT}}', blueprintData.mistake || 'Don\'t fall into the common trap of overcomplicating your initial setup.');

    // Replace Research Data
    const researchHtml = researchData.map(res => `
        <div class="research-item">
            <h3>${res.title}</h3>
            <p>${res.content}</p>
        </div>
    `).join('') || '<p>No additional research data available yet.</p>';
    html = html.replace('{{RESEARCH_DATA}}', researchHtml);

    // Ensure directory exists
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, html);
    return outputPath;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/generator.js
git commit -m "feat: update generator to support research data"
```

### Task 3: Implement build command in bin/yt-engine.js

**Files:**
- Modify: `bin/yt-engine.js`

- [ ] **Step 1: Add build command to bin/yt-engine.js**

```javascript
program
  .command('build <blueprint-file>')
  .description('Build final presentation from blueprint and research')
  .action(async (blueprintFile) => {
    try {
      const blueprintPath = path.resolve(blueprintFile);
      if (!fs.existsSync(blueprintPath)) {
          throw new Error(`Blueprint file not found: ${blueprintPath}`);
      }

      console.log(`Reading blueprint: ${blueprintFile}...`);
      const content = fs.readFileSync(blueprintPath, 'utf8');
      
      // Simple parser for the blueprint markdown
      const blueprint = {
          title: content.match(/^# (.*)/m)?.[1],
          painPoints: content.match(/## Pain Points\n([\s\S]*?)\n##/)?.[1]
            .split('\n')
            .map(line => line.replace(/^- /, '').trim())
            .filter(Boolean),
          benefit: content.match(/## Benefit\n(.*)/)?.[1]?.trim(),
          steps: content.match(/## Steps\n([\s\S]*?)\n##/)?.[1]
            .split('\n')
            .filter(line => line.startsWith('- '))
            .map(line => {
                const parts = line.match(/- \*\*(.*)\*\*: (.*)/);
                return parts ? { metaphor: parts[1], description: parts[2] } : { description: line.replace(/^- /, '').trim() };
            }),
          mistake: content.match(/## The Trap to Avoid\n([\s\S]*)$/)?.[1]?.trim()
      };

      console.log('Searching for research data...');
      const researchData = [];
      const researchDirs = [
          path.join(__dirname, '../yt-ideas/wiki/sources'),
          path.join(__dirname, '../yt-ideas/wiki/intel')
      ];

      // Simple keyword search in research directories based on title
      const keywords = blueprint.title.toLowerCase().split(' ');
      researchDirs.forEach(dir => {
          if (fs.existsSync(dir)) {
              const files = fs.readdirSync(dir);
              files.forEach(file => {
                  if (file.endsWith('.md')) {
                      const filePath = path.join(dir, file);
                      const fileContent = fs.readFileSync(filePath, 'utf8');
                      if (keywords.some(kw => fileContent.toLowerCase().includes(kw))) {
                          researchData.push({
                              title: file.replace('.md', ''),
                              content: fileContent.slice(0, 500) + (fileContent.length > 500 ? '...' : '')
                          });
                      }
                  }
              });
          }
      });

      console.log(`Found ${researchData.length} relevant research notes.`);

      console.log('Generating final presentation...');
      const outputPath = path.join(__dirname, '../dist/presentation.html');
      await generatePresentation(blueprint, outputPath, researchData);

      console.log(`Success! Final presentation: ${outputPath}`);
    } catch (error) {
      console.error('Error during build:', error.message);
      process.exit(1);
    }
  });
```

- [ ] **Step 2: Commit**

```bash
git add bin/yt-engine.js
git commit -m "feat: add build command to yt-engine"
```

### Task 4: Final Verification

- [ ] **Step 1: Run build command with existing blueprint**

Run: `node bin/yt-engine.js build yt-ideas/wiki/ideas/blueprint-1780597357263.md`
Expected: Output showing it read the blueprint and generated the presentation.

- [ ] **Step 2: Verify dist/presentation.html exists and contains the research section**

Run: `grep "Deep Dive & Research" dist/presentation.html`
Expected: Match found.

- [ ] **Step 3: Commit final changes if any**
