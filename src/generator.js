const fs = require('fs');
const path = require('path');

/**
 * Generates a presentation HTML file from blueprint data.
 * @param {Object} blueprintData 
 * @param {string[]} blueprintData.painPoints
 * @param {string} blueprintData.title
 * @param {string} blueprintData.benefit
 * @param {Object[]} blueprintData.steps - { metaphor: string, description: string }
 * @param {string} blueprintData.mistake
 * @returns {string} Path to the generated file
 */
function generatePresentation(blueprintData) {
    const templatePath = path.join(__dirname, '../templates/presentation.html');
    if (!fs.existsSync(templatePath)) {
        throw new Error(`Template not found at ${templatePath}`);
    }

    let html = fs.readFileSync(templatePath, 'utf8');

    // Replace Hook
    html = html.replace('{{HOOK_TITLE}}', blueprintData.painPoints[0] || 'The Problem');
    html = html.replace('{{HOOK_TEXT}}', 'Stop wasting time on solutions that don\'t work for your specific use case.');

    // Replace Hero
    html = html.replace('{{HERO_TITLE}}', blueprintData.title || 'The Solution');
    html = html.replace('{{HERO_BENEFIT}}', blueprintData.benefit || 'Unlock the power of efficient automation.');

    // Replace Guide Steps
    const stepsHtml = (blueprintData.steps || []).map(step => `
        <div class="step-item">
            <span class="step-metaphor">${step.metaphor}</span>
            <p>${step.description}</p>
        </div>
    `).join('');
    html = html.replace('{{GUIDE_STEPS}}', stepsHtml || '<p>Follow our proven path to success.</p>');

    // Replace Trap
    html = html.replace('{{TRAP_TEXT}}', blueprintData.mistake || 'Don\'t fall into the common trap of overcomplicating your initial setup.');

    // Ensure dist directory exists
    const distDir = path.join(__dirname, '../dist');
    if (!fs.existsSync(distDir)) {
        fs.mkdirSync(distDir, { recursive: true });
    }

    const outputPath = path.join(distDir, 'presentation.html');
    fs.writeFileSync(outputPath, html);

    return outputPath;
}

module.exports = { generatePresentation };
