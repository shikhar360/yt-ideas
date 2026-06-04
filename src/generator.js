const fs = require('fs');
const path = require('path');

/**
 * Generates a presentation HTML file from blueprint data.
 * @param {Object} blueprintData 
 * @param {string} outputPath
 * @param {Array} researchData
 */
function generatePresentation(blueprintData, outputPath, researchData = []) {
    const templatePath = path.join(__dirname, '../templates/presentation.html');
    if (!fs.existsSync(templatePath)) {
        throw new Error(`Template not found at ${templatePath}`);
    }

    let html = fs.readFileSync(templatePath, 'utf8');

    // Replace Hook
    const mainPainPoint = blueprintData.painPoints && blueprintData.painPoints.length > 0 
        ? blueprintData.painPoints[0] 
        : 'The Common Struggle';
    html = html.replace('{{HOOK_TITLE}}', mainPainPoint);
    
    const hookText = blueprintData.painPoints && blueprintData.painPoints.length > 1
        ? `Stop struggling with ${blueprintData.painPoints[1].toLowerCase()}.`
        : 'Stop wasting time on solutions that don\'t work for your specific use case.';
    html = html.replace('{{HOOK_TEXT}}', hookText);

    // Replace Hero
    html = html.replace('{{HERO_TITLE}}', blueprintData.title || 'The Solution');
    html = html.replace('{{HERO_BENEFIT}}', blueprintData.benefit || 'Unlock the power of efficient automation.');

    // Replace Guide Steps
    const stepsHtml = (blueprintData.steps || []).map(step => `
        <div class="step-item">
            <span class="step-metaphor">${step.metaphor || ''}</span>
            <p>${step.description}</p>
        </div>
    `).join('');
    html = html.replace('{{GUIDE_STEPS}}', stepsHtml || '<p>Follow our proven path to success.</p>');

    // Replace Trap
    html = html.replace('{{TRAP_TEXT}}', blueprintData.mistake || 'Don\'t fall into the common trap of overcomplicating your initial setup.');

    // Replace Research Data
    const researchHtml = researchData.map(res => `
        <div class="research-item">
            <h3>${res.title}</h3>
            <p>${res.content}</p>
        </div>
    `).join('') || '<p>No additional research data available yet.</p>';
    html = html.replace('{{RESEARCH_DATA}}', researchHtml);

    // Ensure directory exists
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, html);
    return outputPath;
}

module.exports = { generatePresentation };
