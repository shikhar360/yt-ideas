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

      // Run Python scraper and capture stdout to file
      execSync(`python3 "${scraperPath}" "${url}" > "${rawDataPath}"`);

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
