const fs = require('fs');
const path = require('path');

async function synthesize(commentsFilePath) {
    // 1. Read comments from JSON
    const rawData = fs.readFileSync(commentsFilePath, 'utf8');
    const comments = JSON.parse(rawData);

    // 2. Extract pain points (simple heuristic for now)
    const painPoints = comments.slice(0, 3).map(c => c.text || c);

    // 3. Create a dummy structured blueprint (LLM would do this in real app)
    const blueprintData = {
        title: "The Ultimate Developer Workflow",
        benefit: "Save 10 hours a week with automation",
        painPoints: painPoints.length > 0 ? painPoints : ["Manual repetitive tasks", "Context switching", "Lack of documentation"],
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
