const { synthesize } = require('../src/synthesis');
const fs = require('fs');
const path = require('path');
const assert = require('assert');

async function runTest() {
    console.log('Running synthesis test...');
    const dummyComments = path.join(__dirname, 'dummy_comments.json');
    fs.writeFileSync(dummyComments, JSON.stringify([{ text: 'I hate slow workflows' }, { text: 'How to automate this?' }]));

    try {
        const blueprint = await synthesize(dummyComments);
        assert.strictEqual(blueprint.title, "The Ultimate Developer Workflow");
        // 'How to automate this?' contains '?' and is longer than other matches if any
        assert.strictEqual(blueprint.researchTopic, 'How to automate this?');
        assert.strictEqual(blueprint.painPoints[0], 'How to automate this?');
        console.log('✅ Synthesis test passed');
    } finally {
        if (fs.existsSync(dummyComments)) fs.unlinkSync(dummyComments);
    }
}

runTest().catch(err => {
    console.error('❌ Synthesis test failed:', err);
    process.exit(1);
});
