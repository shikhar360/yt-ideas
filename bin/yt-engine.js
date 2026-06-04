#!/usr/bin/env node
const { program } = require('commander');
const { execSync } = require('child_process');
const { synthesize } = require('../src/synthesis');
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

      // Run Python scraper and capture stdout to file
      execSync(`python3 "${scraperPath}" "${url}" > "${rawDataPath}"`);

      console.log('Synthesizing ideas...');
      const ideas = await synthesize(rawDataPath);

      console.log(`\nRESEARCH_REQUIRED: ${ideas.title}`);
      console.log('Follow-up: Run autoresearch on the topic above, then run:');
      console.log('node bin/yt-engine.js build <blueprint-file>');
    } catch (error) {
      console.error('Error during generation:', error.message);
      process.exit(1);
    }
  });

program
  .command('build <blueprint-file>')
  .description('Build final presentation data from blueprint and research')
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
          painPoints: (content.match(/## Pain Points\n([\s\S]*?)\n##/)?.[1] || '')
            .split('\n')
            .map(line => line.replace(/^- /, '').trim())
            .filter(Boolean),
          benefit: content.match(/## Benefit\n(.*)/)?.[1]?.trim(),
          steps: (content.match(/## Steps\n([\s\S]*?)\n##/)?.[1] || '')
            .split('\n')
            .filter(line => line.startsWith('- '))
            .map(line => {
                const parts = line.match(/- \*\*(.*)\*\*: (.*)/);
                return parts ? { metaphor: parts[1], description: parts[2] } : { description: line.replace(/^- /, '').trim() };
            }),
          mistake: content.match(/## The Trap to Avoid\n([\s\S]*)$/)?.[1]?.trim()
      };

      if (!blueprint.title) {
          throw new Error('Could not parse title from blueprint. Ensure it starts with # Title');
      }

      console.log('Searching for research data...');
      const researchData = [];
      const researchDirs = [
          path.join(__dirname, '../yt-ideas/wiki/sources'),
          path.join(__dirname, '../yt-ideas/wiki/intel')
      ];

      // Simple keyword search in research directories based on title
      const keywords = blueprint.title.toLowerCase().split(' ').filter(k => k.length > 3);
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
                              content: fileContent.slice(0, 1000) // Give more content to Next.js
                          });
                      }
                  }
              });
          }
      });

      console.log(`Found ${researchData.length} relevant research notes.`);

      const finalData = {
          ...blueprint,
          research: researchData,
          updatedAt: new Date().toISOString()
      };

      const presentationDataPath = path.join(__dirname, '../presentation/data/latest.json');
      const dataDir = path.dirname(presentationDataPath);
      if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

      fs.writeFileSync(presentationDataPath, JSON.stringify(finalData, null, 2));

      console.log(`Success! Data saved for Next.js app: ${presentationDataPath}`);
      console.log('Start the presentation app to view: cd presentation && pnpm dev');
    } catch (error) {
      console.error('Error during build:', error.message);
      process.exit(1);
    }
  });

program.parse();
