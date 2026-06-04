const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { synthesize } = require('../src/synthesis');

test('synthesize creates a blueprint file in the correct directory', async (t) => {
    const comments = ['Great video!', 'I love the metaphors'];
    const url = 'https://youtube.com/watch?v=123';
    
    // Ensure directory exists for test (normally handled by implementation but for test safety)
    const ideasDir = path.join(__dirname, '../yt-ideas/wiki/ideas/');
    if (!fs.existsSync(ideasDir)) {
        fs.mkdirSync(ideasDir, { recursive: true });
    }

    const filePath = await synthesize(comments, url);
    
    assert.ok(fs.existsSync(filePath), 'File should exist');
    assert.ok(filePath.includes('blueprint-'), 'File name should contain blueprint-');
    
    const content = fs.readFileSync(filePath, 'utf8');
    assert.ok(content.includes('url: https://youtube.com/watch?v=123'), 'Content should include URL');
    assert.ok(content.includes('- Great video!'), 'Content should include comments');
    assert.ok(content.includes('- I love the metaphors'), 'Content should include comments');

    // Cleanup
    fs.unlinkSync(filePath);
});
