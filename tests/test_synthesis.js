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
        assert.strictEqual(blueprint.painPoints[0], 'I hate slow workflows');
        console.log('✅ Synthesis test passed');
    } finally {
        if (fs.existsSync(dummyComments)) fs.unlinkSync(dummyComments);
    }
}

runTest().catch(err => {
    console.error('❌ Synthesis test failed:', err);
    process.exit(1);
});
