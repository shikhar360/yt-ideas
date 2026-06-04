const { generatePresentation } = require('../src/generator');
const fs = require('fs');
const path = require('path');
const assert = require('assert');

async function runTest() {
    console.log('Running generator test...');
    const dummyBlueprint = {
        title: "Test Title",
        benefit: "Test Benefit",
        painPoints: ["P1", "P2"],
        steps: [{ metaphor: "M1", description: "D1" }],
        mistake: "Mistake 1"
    };

    const outputPath = path.join(__dirname, 'test_output.html');
    
    try {
        generatePresentation(dummyBlueprint, outputPath);
        assert.ok(fs.existsSync(outputPath), 'Output file should exist');
        const content = fs.readFileSync(outputPath, 'utf8');
        assert.ok(content.includes('Test Title'), 'Title should be in HTML');
        assert.ok(content.includes('P1'), 'Pain point should be in HTML');
        console.log('✅ Generator test passed');
    } finally {
        if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    }
}

runTest().catch(err => {
    console.error('❌ Generator test failed:', err);
    process.exit(1);
});
