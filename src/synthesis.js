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
    const targetDir = path.join(__dirname, '../yt-ideas/wiki/ideas/');
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
    }
    const filePath = path.join(targetDir, `blueprint-${Date.now()}.md`);
    fs.writeFileSync(filePath, blueprint);
    return filePath;
}

module.exports = { synthesize };
