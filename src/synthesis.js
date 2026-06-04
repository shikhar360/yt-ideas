const fs = require('fs');
const path = require('path');

async function synthesize(commentsFilePath) {
    // 1. Read comments from JSON
    const rawData = fs.readFileSync(commentsFilePath, 'utf8');
    const comments = JSON.parse(rawData);

    // 2. Select ONE "worthy" idea (heuristic: longest with '?', then just longest)
    const texts = comments.map(c => (typeof c === 'string' ? c : c.text) || "");
    const questions = texts.filter(t => t.includes('?'));
    
    let selectedIdea = "";
    if (questions.length > 0) {
        selectedIdea = questions.reduce((a, b) => a.length >= b.length ? a : b);
    } else if (texts.length > 0) {
        selectedIdea = texts.reduce((a, b) => a.length >= b.length ? a : b);
    }

    const researchTopic = selectedIdea || "General Developer Efficiency";

    // 3. Create a structured blueprint
    const blueprintData = {
        title: "The Ultimate Developer Workflow",
        researchTopic: researchTopic,
        benefit: "Save 10 hours a week with automation",
        painPoints: [selectedIdea].filter(Boolean).length > 0 ? [selectedIdea] : ["Manual repetitive tasks", "Context switching", "Lack of documentation"],
        steps: [
            { metaphor: "The Blueprint", description: "Map out your most frequent manual steps." },
            { metaphor: "The Script", description: "Automate the mapping using simple Node.js scripts." },
            { metaphor: "The Feedback Loop", description: "Continuously refine based on actual usage." }
        ],
        mistake: "Don't try to automate everything at once - start small and iterate."
    };

    // 4. Save to Obsidian wiki
    const wikiDir = path.join(__dirname, '../yt-ideas/wiki/ideas');
    if (!fs.existsSync(wikiDir)) {
        fs.mkdirSync(wikiDir, { recursive: true });
    }

    const wikiContent = `---
type: video-idea
status: raw
date: ${new Date().toISOString()}
---

# ${blueprintData.title}

## Research Topic
${blueprintData.researchTopic}

## Pain Points
${blueprintData.painPoints.map(p => `- ${p}`).join('\n')}

## Benefit
${blueprintData.benefit}

## Steps
${blueprintData.steps.map(s => `- **${s.metaphor}**: ${s.description}`).join('\n')}

## The Trap to Avoid
${blueprintData.mistake}
`;

    const wikiPath = path.join(wikiDir, `blueprint-${Date.now()}.md`);
    fs.writeFileSync(wikiPath, wikiContent);

    return blueprintData;
}

module.exports = { synthesize };
