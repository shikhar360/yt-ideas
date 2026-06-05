const fs = require('fs');
const path = require('path');

/* =========================================================================
 * SIGNAL DETECTION
 * Instead of matching a tiny list of internal keywords, we score every
 * comment for "video-worthiness" signals: questions, requests, problems,
 * confusion, comparisons, and topic relevance.
 * ========================================================================= */

// Words/phrases that indicate a comment could seed a video.
const SIGNAL_PATTERNS = [
    { tag: 'question',    weight: 3, re: /\?|how (do|does|can|would|to)|what (is|are|about|if)|why (is|are|do|does)|when (do|does|should)|which (one|tool|is)|can you|could you|would you|is it possible|any way to|anyone know/i },
    { tag: 'request',     weight: 3, re: /please (make|do|show|cover|explain)|can you (make|do|show|cover)|would love (to see|a video)|make a video|do a video|tutorial on|guide on|video on|cover .* in (a|the) (video|next)|i'd love|id love|wish you would|hope you (make|do|cover)/i },
    { tag: 'problem',     weight: 3, re: /problem|issue|struggl|stuck|fail|error|broke|doesn'?t work|not working|can'?t (get|figure|seem)|trouble|confus|hard to|difficult|pain|frustrat/i },
    { tag: 'comparison',  weight: 2, re: /\bvs\b|versus|compare|comparison|better than|difference between|different from|instead of|alternative to|or should i/i },
    { tag: 'curiosity',   weight: 2, re: /curious|wonder|interest(ed|ing)|deep dive|more (about|on|detail)|explain|breakdown|how it works|behind the scenes|under the hood/i },
    { tag: 'workflow',    weight: 2, re: /workflow|setup|set up|config|pipeline|automat|integrat|scale|scaling|optimi|productiv|10x|speed up|efficien/i },
    { tag: 'use-case',    weight: 2, re: /how i use|use case|real world|in production|for (my|a) (project|business|client|job|work)|monetiz|income|revenue|lead gen|find (clients|work|job)/i },
    { tag: 'topic',       weight: 1, re: /\b(ai|llm|agent|claude|gpt|prompt|context|token|checkpoint|orchestrat|adversarial|judge|seed|swarm|model|api|rag|fine.?tun|embedding|vector)\b/i },
    { tag: 'suggestion',  weight: 2, re: /you should|what about|have you (tried|considered|thought)|try (using|doing)|idea[: ]|suggestion|recommend/i },
    { tag: 'disagreement',weight: 2, re: /disagree|actually|not really|that'?s wrong|i don'?t think|but what (if|about)|the problem with/i },
];

// Hard junk — ONLY pure noise. Kept tight so we don't kill real comments.
// A comment is junk only if it matches junk AND carries no real signal.
const JUNK_PATTERNS = [
    /^\s*(thanks?|thank you|ty|nice|cool|great|awesome|amazing|love it|first|w|lol|lmao|🔥+|👍+|❤️+)\s*[!.]*\s*$/i,
    /^\s*(great|nice|awesome|amazing|love(ly)?|best) (video|content|stuff|work)\b/i,
    /\b(subbed|subscribed|just subscribed|new sub)\b/i,
    /^\s*congrats?\b/i,
    /^\s*(hi|hello|hey|yo)\s*[!.]*\s*$/i,           // ONLY if that's the whole comment
];

// Promotional / spam links — these are almost never useful as ideas.
const SPAM_PATTERNS = [
    /\b(t\.me|telegram|whatsapp|onlyfans)\b/i,
    /\bhttps?:\/\/\S+/i,                            // raw links (often spam/self-promo)
    /\b(check out my|visit my|dm me|follow me on)\b/i,
];

/* =========================================================================
 * SCORING
 * ========================================================================= */
function scoreComment(text) {
    const matched = [];
    let score = 0;

    for (const sig of SIGNAL_PATTERNS) {
        if (sig.re.test(text)) {
            matched.push(sig.tag);
            score += sig.weight;
        }
    }

    // Length heuristic: very short comments rarely contain an idea.
    const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
    if (wordCount >= 8) score += 1;
    if (wordCount >= 20) score += 1;

    return { score, matched, wordCount };
}

function isPureJunk(text, score) {
    if (SPAM_PATTERNS.some(p => p.test(text))) return true;
    // Junk only counts if the comment has essentially NO idea-signal.
    if (score >= 3) return false;
    return JUNK_PATTERNS.some(p => p.test(text.trim()));
}

/* =========================================================================
 * IDEA GENERATION
 * Build the idea FROM the comment + its detected signals, instead of
 * forcing it into one of 6 rigid templates. We still keep your favored
 * "specialty" templates as a priority layer when strong keywords appear.
 * ========================================================================= */

// Your original high-value templates, used when a comment strongly matches.
const SPECIALTY_TEMPLATES = [
    {
        match: t => /pattern|checkpoint|context|front-?load|degrad|on the rails/i.test(t),
        category: "Technical Pattern",
        title: "Checkpoint-to-File",
        worthiness: "HIGH (Technical Innovation)",
        concept: "The Checkpoint Pattern: Solving LLM Context Degradation",
        angle: "A deep dive into why context extraction is critical for downstream reliability and how the 'checkpoint-to-file' pattern keeps your AI agents 'on the rails' during long sessions."
    },
    {
        match: t => /\bvs\b|versus|different from|compare|superpower|grill/i.test(t),
        category: "Competitive Comparison",
        title: "Superpower vs. Grill Me",
        worthiness: "HIGH (Tool Showdown)",
        concept: "Superpower vs. Grill Me: The Ultimate AI Orchestration Showdown",
        angle: "A direct comparison of the two brainstorming methodologies. Why one uses orchestration/plan-writing and how they differ in outcome for complex developer workflows."
    },
    {
        match: t => /\bseed\b|adversarial|judge/i.test(t),
        category: "Tool Innovation",
        title: "Seed Generation & Adversarial Judges",
        worthiness: "HIGH (Feature Expansion)",
        concept: "Adversarial AI: Using 'Judge Agents' to Quantify Chaos",
        angle: "Explaining how to take a messy 'grill' conversation and use adversarial agents to turn it into a lossless product spec for your next build."
    },
    {
        match: t => /client|job|income|revenue|monetiz|lead gen|find work/i.test(t),
        category: "Business Application",
        title: "AI-Powered Lead Gen",
        worthiness: "MEDIUM/HIGH (Practical Value)",
        concept: "Zero to Client: Automating Lead Gen with Claude Code",
        angle: "A practical, business-focused guide for developers. How to use AI to find, qualify, and reach out to clients on social platforms."
    },
    {
        match: t => /visual|render|graphic|animation|diagram|(agent.*video)|(video.*agent)/i.test(t),
        category: "Visual Storytelling",
        title: "Multi-Agent Visualization",
        worthiness: "MEDIUM (Technical Curiosity)",
        concept: "Visualizing the Swarm: How I Rendered my AI Agents",
        angle: "A behind-the-scenes look at the visuals used in the video. Explaining the logic behind the agent swarm graphics."
    },
    {
        match: t => /10x|productiv|glitch|exponential|skill.?build/i.test(t),
        category: "Growth & Productivity",
        title: "The 'Infinite Productivity' Glitch",
        worthiness: "LOW/MEDIUM (Hype/Growth)",
        concept: "The 10x Glitch: Scaling Claude Code Weekly",
        angle: "A high-energy video about the iterative curve of skill-building and how front-loading context leads to exponential productivity gains."
    },
];

// Map a primary signal tag to a generic-but-useful idea framing.
function buildGenericIdea(text, signals, score) {
    const snippet = text.trim().replace(/\s+/g, ' ');
    const short = snippet.length > 80 ? snippet.slice(0, 77) + '...' : snippet;

    const primary = signals[0] || 'topic';

    const frames = {
        question:     { category: "Audience Question",   worthiness: "MEDIUM/HIGH (Direct Demand)", concept: `Answering: "${short}"`,                          angle: "A viewer asked this directly. Turn the question into a focused explainer that resolves it end-to-end with a real example." },
        request:      { category: "Requested Tutorial",  worthiness: "HIGH (Explicit Demand)",       concept: `Requested Tutorial: "${short}"`,                angle: "A viewer explicitly asked for this. Build a step-by-step tutorial delivering exactly what was requested." },
        problem:      { category: "Problem / Pain Point",worthiness: "HIGH (Pain-Driven)",           concept: `Solving the Pain: "${short}"`,                 angle: "This comment describes a real struggle. Frame the video around the problem, the failure modes, and a reliable fix." },
        comparison:   { category: "Comparison",          worthiness: "MEDIUM/HIGH (Decision Content)",concept: `Head-to-Head: "${short}"`,                     angle: "Viewers want help deciding. Do a structured comparison with criteria, trade-offs, and a clear recommendation." },
        curiosity:    { category: "Deep Dive",           worthiness: "MEDIUM (Curiosity-Driven)",    concept: `Deep Dive: "${short}"`,                        angle: "There's genuine curiosity here. Go under the hood and explain how it actually works with diagrams/examples." },
        workflow:     { category: "Workflow / Setup",    worthiness: "MEDIUM/HIGH (Practical)",       concept: `The Setup: "${short}"`,                        angle: "Show your exact workflow/configuration for this, step by step, so viewers can replicate it." },
        'use-case':   { category: "Real-World Use Case", worthiness: "MEDIUM/HIGH (Practical Value)",concept: `Real Use Case: "${short}"`,                    angle: "Demonstrate this in a real scenario, including results and lessons learned." },
        suggestion:   { category: "Audience Suggestion", worthiness: "MEDIUM (Community Idea)",       concept: `Community Idea: "${short}"`,                    angle: "A viewer suggested this. Validate it on camera and show whether (and how) it works." },
        disagreement: { category: "Myth / Hot Take",     worthiness: "MEDIUM/HIGH (Engagement)",     concept: `Hot Take: "${short}"`,                         angle: "A viewer pushed back. Address the disagreement head-on with evidence — great for engagement." },
        topic:        { category: "Topic Mention",       worthiness: "LOW/MEDIUM (Seed Idea)",       concept: `Explore: "${short}"`,                          angle: "This comment raises a relevant topic worth exploring in its own dedicated video." },
    };

    const frame = frames[primary] || frames.topic;
    return {
        ...frame,
        title: frame.category,
        signals,
        score,
    };
}

/**
 * Returns a brainstormed idea for a comment, or null if it carries no signal.
 * Specialty templates take priority; otherwise we build a generic idea
 * from the strongest detected signal.
 */
function getBrainstormedIdea(text) {
    if (!text || !text.trim()) return null;

    const { score, matched } = scoreComment(text);

    // Reject only true noise.
    if (isPureJunk(text, score)) return null;

    // Require at least a minimal signal so we don't generate junk ideas.
    if (score < 2) return null;

    // 1) Priority: your favored specialty templates.
    for (const tpl of SPECIALTY_TEMPLATES) {
        if (tpl.match(text)) {
            const { match, ...idea } = tpl;
            return { ...idea, signals: matched, score };
        }
    }

    // 2) Fallback: derive an idea from the strongest signal.
    // Sort matched tags by their pattern weight (highest first).
    const orderedSignals = matched.slice().sort((a, b) => {
        const wa = (SIGNAL_PATTERNS.find(s => s.tag === a) || {}).weight || 0;
        const wb = (SIGNAL_PATTERNS.find(s => s.tag === b) || {}).weight || 0;
        return wb - wa;
    });

    return buildGenericIdea(text, orderedSignals, score);
}

/* =========================================================================
 * EXTRACTION
 * ========================================================================= */
function extractPotentialIdeas(commentsFilePath) {
    const rawData = fs.readFileSync(commentsFilePath, 'utf8');
    const comments = JSON.parse(rawData);

    // Normalize comments to strings, handling multiple possible shapes.
    const normalized = comments
        .map(c => {
            if (typeof c === 'string') return c;
            if (c && typeof c === 'object') {
                return c.text || c.comment || c.content || c.body || c.message || "";
            }
            return "";
        })
        .map(t => (t || "").toString())
        .filter(t => t.trim().length > 0);

    // De-duplicate identical comments.
    const seen = new Set();
    const uniqueComments = normalized.filter(t => {
        const key = t.trim().toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });

    // Analyze EVERY comment and keep the ones that produce an idea.
    const worthyIdeas = uniqueComments
        .map(text => {
            const brainstorm = getBrainstormedIdea(text);
            return brainstorm ? { source: text, ...brainstorm } : null;
        })
        .filter(Boolean)
        // Best ideas first.
        .sort((a, b) => (b.score || 0) - (a.score || 0));

    const wikiDir = path.join(__dirname, '../yt-ideas/wiki/ideas');
    if (!fs.existsSync(wikiDir)) {
        fs.mkdirSync(wikiDir, { recursive: true });
    }

    const timestamp = Date.now();
    const ideasFilePath = path.join(wikiDir, `final-brainstorm-${timestamp}.md`);

    const totalAnalyzed = uniqueComments.length;
    const skipped = totalAnalyzed - worthyIdeas.length;

    let markdownContent = `---
type: potential-ideas
status: manual-grade-brainstormed
date: ${new Date().toISOString()}
total_comments: ${comments.length}
analyzed: ${totalAnalyzed}
ideas_found: ${worthyIdeas.length}
skipped_as_noise: ${skipped}
---

# Exhaustive Video Brainstorming (Manual-Grade Analysis)

Analyzed **${totalAnalyzed}** unique comments. Found **${worthyIdeas.length}** potential ideas (skipped **${skipped}** as pure noise/spam).

`;

    worthyIdeas.forEach((item, i) => {
        markdownContent += `## ${i + 1}. ${item.category}: ${item.title}\n`;
        markdownContent += `- **Source Comment:** "${item.source.trim()}"\n`;
        markdownContent += `- **Video Worthiness:** **${item.worthiness}**\n`;
        markdownContent += `- **Brainstormed Concept:** **"${item.concept}"**\n`;
        markdownContent += `- **The Angle:** ${item.angle}\n`;
        if (item.signals && item.signals.length) {
            markdownContent += `- **Signals Detected:** ${item.signals.join(', ')} (score: ${item.score})\n`;
        }
        markdownContent += `\n`;
    });

    if (worthyIdeas.length === 0) {
        markdownContent += "_No high-signal ideas found in this pool._\n";
    }

    markdownContent += `
---
**Next Step:** Choose an idea and run:
\`node bin/yt-engine.js create-blueprint "[Idea Concept Title]"\`
`;

    fs.writeFileSync(ideasFilePath, markdownContent);
    return ideasFilePath;
}

/**
 * Legacy support for manual analysis simulation.
 */
function brainstormManualQuality(text) {
    return getBrainstormedIdea(text);
}

/**
 * Generates the final blueprint for a SPECIFIC chosen idea.
 */
async function generateFinalBlueprint(chosenIdea) {
    const researchTopic = chosenIdea;

    const blueprintData = {
        title: chosenIdea.slice(0, 50).trim() + "...",
        researchTopic: researchTopic,
        benefit: "Research needed to determine specific benefits",
        painPoints: [chosenIdea],
        steps: [
            { description: "Step 1: Deep dive into the core problem" },
            { description: "Step 2: Research existing solutions" },
            { description: "Step 3: Synthesize ultimate workflow" }
        ],
        mistake: "TBD via research"
    };

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
${blueprintData.steps.map(s => `- ${s.description}`).join('\n')}

## The Trap to Avoid
${blueprintData.mistake}
`;

    const wikiPath = path.join(wikiDir, `blueprint-${Date.now()}.md`);
    fs.writeFileSync(wikiPath, wikiContent);

    return { blueprintData, wikiPath };
}

module.exports = { extractPotentialIdeas, generateFinalBlueprint };
















































// const fs = require('fs');
// const path = require('path');

// /**
//  * Enhanced scoring system for comment evaluation
//  */
// function scoreComment(text) {
//     const lower = text.toLowerCase();
//     let score = 0;
//     let matchedCategories = [];
    
//     // Expanded keyword sets with weights
//     const keywordSets = {
//         'Technical Pattern': {
//             keywords: ['pattern', 'checkpoint', 'context', 'front-load', 'architecture', 'workflow', 'orchestration', 'agent', 'llm', 'prompt', 'token', 'context window', 'memory', 'state', 'session', 'reliability', 'degradation'],
//             weight: 2
//         },
//         'Competitive Comparison': {
//             keywords: ['vs', 'different from', 'compare', 'comparison', 'versus', 'better than', 'alternative', 'instead of', 'competing', 'which one', 'difference between'],
//             weight: 1.5
//         },
//         'Tool Innovation': {
//             keywords: ['seed', 'adversarial', 'judge', 'tool', 'automation', 'script', 'generate', 'build', 'create', 'custom', 'workflow', 'pipeline', 'integration', 'api'],
//             weight: 1.8
//         },
//         'Business Application': {
//             keywords: ['client', 'job', 'income', 'find', 'business', 'money', 'freelance', 'contract', 'hire', 'payment', 'sell', 'market', 'agency', 'service', 'lead'],
//             weight: 1.7
//         },
//         'Visual Storytelling': {
//             keywords: ['visual', 'render', 'animation', 'graphic', 'design', 'swarm', 'visualization', 'diagram', 'chart', 'illustration', 'demo', 'showcase'],
//             weight: 1.3
//         },
//         'Growth & Productivity': {
//             keywords: ['10x', 'productivity', 'glitch', 'efficiency', 'faster', 'speed', 'optimize', 'scale', 'growth', 'learn', 'improve', 'better', 'tip', 'trick', 'hack'],
//             weight: 1.2
//         },
//         'Tutorial Request': {
//             keywords: ['how to', 'guide', 'tutorial', 'explain', 'walkthrough', 'step by step', 'example', 'show me', 'teach', 'learn', 'understand'],
//             weight: 1.6
//         },
//         'Problem/Solution': {
//             keywords: ['problem', 'issue', 'bug', 'error', 'fix', 'solution', 'solve', 'resolve', 'struggle', 'difficult', 'challenge', 'stuck'],
//             weight: 1.9
//         },
//         'Feature Request': {
//             keywords: ['wish', 'want', 'need', 'missing', 'add', 'feature', 'functionality', 'capability', 'ability to', 'could', 'should'],
//             weight: 1.4
//         },
//         'Use Case': {
//             keywords: ['use case', 'scenario', 'example', 'project', 'building', 'working on', 'trying to', 'goal', 'objective'],
//             weight: 1.5
//         }
//     };
    
//     // Score against all categories
//     for (const [category, data] of Object.entries(keywordSets)) {
//         let categoryScore = 0;
//         for (const keyword of data.keywords) {
//             if (lower.includes(keyword)) {
//                 categoryScore += data.weight;
//             }
//         }
//         if (categoryScore > 0) {
//             score += categoryScore;
//             matchedCategories.push({ category, score: categoryScore });
//         }
//     }
    
//     // Bonus for comment length (more detailed comments often have better ideas)
//     if (text.length > 100) score += 0.5;
//     if (text.length > 200) score += 0.3;
    
//     // Bonus for questions (shows engagement and curiosity)
//     if (lower.includes('?') || lower.includes('how') || lower.includes('why') || lower.includes('what')) {
//         score += 0.4;
//     }
    
//     // Penalty for very short comments (likely low value)
//     if (text.length < 20) score -= 0.5;
    
//     return { score, matchedCategories };
// }

// /**
//  * Enhanced extraction of video ideas with multiple fallback strategies
//  */
// function getBrainstormedIdea(text) {
//     const lower = text.toLowerCase();
//     const { score, matchedCategories } = scoreComment(text);
    
//     // Minimum score threshold - lowered to catch more ideas
//     if (score < 0.8) return null;
    
//     // If we have high confidence matches, use the primary categories
//     if (matchedCategories.length > 0) {
//         // Sort by score and take the best match
//         const bestMatch = matchedCategories.sort((a, b) => b.score - a.score)[0];
        
//         // Generate specific ideas based on category and content
//         switch(bestMatch.category) {
//             case 'Technical Pattern':
//                 return generateTechnicalIdea(text);
//             case 'Competitive Comparison':
//                 return generateComparisonIdea(text);
//             case 'Tool Innovation':
//                 return generateToolIdea(text);
//             case 'Business Application':
//                 return generateBusinessIdea(text);
//             case 'Visual Storytelling':
//                 return generateVisualIdea(text);
//             case 'Growth & Productivity':
//                 return generateGrowthIdea(text);
//             case 'Tutorial Request':
//                 return generateTutorialIdea(text);
//             case 'Problem/Solution':
//                 return generateProblemSolutionIdea(text);
//             case 'Feature Request':
//                 return generateFeatureIdea(text);
//             case 'Use Case':
//                 return generateUseCaseIdea(text);
//             default:
//                 return generateGenericIdea(text);
//         }
//     }
    
//     // Fallback: check for idea-worthy patterns even without keyword matches
//     if (isIdeaWorthyByPattern(text)) {
//         return generateGenericIdea(text);
//     }
    
//     return null;
// }

// /**
//  * Check if a comment has idea-worthy characteristics beyond keyword matching
//  */
// function isIdeaWorthyByPattern(text) {
//     const lower = text.toLowerCase();
    
//     // Long, detailed comments with specific suggestions
//     if (text.length > 150 && (lower.includes('could') || lower.includes('should') || lower.includes('would'))) {
//         return true;
//     }
    
//     // Comments describing personal experiences or challenges
//     if ((lower.includes('i tried') || lower.includes('i used') || lower.includes('my experience')) && text.length > 80) {
//         return true;
//     }
    
//     // Comments asking for advanced topics
//     if ((lower.includes('advanced') || lower.includes('complex') || lower.includes('deep dive')) && text.length > 50) {
//         return true;
//     }
    
//     // Comments suggesting specific improvements
//     if ((lower.includes('improve') || lower.includes('enhance') || lower.includes('better')) && text.length > 60) {
//         return true;
//     }
    
//     return false;
// }

// /**
//  * Generate specific technical pattern ideas
//  */
// function generateTechnicalIdea(text) {
//     const lower = text.toLowerCase();
//     let specificTopic = extractKeyPhrase(text, ['pattern', 'checkpoint', 'context', 'architecture']);
    
//     return {
//         category: "Technical Pattern",
//         title: `Deep Dive: ${specificTopic || "Advanced LLM Architecture"}`,
//         worthiness: "HIGH (Technical Innovation)",
//         concept: `Mastering ${specificTopic || "Context Management"} in AI Development`,
//         angle: `A comprehensive guide to ${specificTopic || "advanced patterns"} with practical examples and production-ready code. ${summarizeComment(text)}`
//     };
// }

// /**
//  * Generate comparison video ideas
//  */
// function generateComparisonIdea(text) {
//     const comparedItems = extractComparedItems(text);
    
//     return {
//         category: "Competitive Comparison",
//         title: `${comparedItems.item1 || "Tool A"} vs ${comparedItems.item2 || "Tool B"}: Complete Breakdown`,
//         worthiness: "HIGH (Tool Showdown)",
//         concept: `Battle of the ${comparedItems.item1 || "Tools"}: Which One Wins?`,
//         angle: `Detailed comparison of ${comparedItems.item1 || "different approaches"} including use cases, performance, and when to choose each. ${summarizeComment(text)}`
//     };
// }

// /**
//  * Generate tool innovation ideas
//  */
// function generateToolIdea(text) {
//     const toolContext = extractKeyPhrase(text, ['tool', 'automation', 'build', 'create']);
    
//     return {
//         category: "Tool Innovation",
//         title: `Building ${toolContext || "Custom AI Tools"}: From Concept to Production`,
//         worthiness: "HIGH (Feature Expansion)",
//         concept: `Creating Production-Ready ${toolContext || "AI Solutions"}`,
//         angle: `Step-by-step guide to building ${toolContext || "custom tools"} including architecture decisions, common pitfalls, and optimization strategies. ${summarizeComment(text)}`
//     };
// }

// /**
//  * Generate business application ideas
//  */
// function generateBusinessIdea(text) {
//     const businessContext = extractKeyPhrase(text, ['client', 'business', 'money', 'freelance']);
    
//     return {
//         category: "Business Application",
//         title: `Monetizing AI: ${businessContext || "Practical Business Strategies"}`,
//         worthiness: "MEDIUM/HIGH (Practical Value)",
//         concept: `Turning AI Skills into ${businessContext || "Sustainable Income"}`,
//         angle: `Real-world strategies for ${businessContext || "AI-powered business growth"} including case studies, pricing models, and client acquisition. ${summarizeComment(text)}`
//     };
// }

// /**
//  * Generate visual storytelling ideas
//  */
// function generateVisualIdea(text) {
//     const visualContext = extractKeyPhrase(text, ['visual', 'render', 'animation', 'design']);
    
//     return {
//         category: "Visual Storytelling",
//         title: `Visualizing ${visualContext || "Complex Systems"}: The Art of Technical Animation`,
//         worthiness: "MEDIUM (Technical Curiosity)",
//         concept: `Creating Engaging ${visualContext || "Technical Visualizations"}`,
//         angle: `Behind the scenes of ${visualContext || "visual storytelling"} including tools, techniques, and design principles for complex concepts. ${summarizeComment(text)}`
//     };
// }

// /**
//  * Generate growth and productivity ideas
//  */
// function generateGrowthIdea(text) {
//     const growthContext = extractKeyPhrase(text, ['productivity', 'efficiency', 'faster', '10x']);
    
//     return {
//         category: "Growth & Productivity",
//         title: `${growthContext || "Accelerating"} Your Development: ${growthContext ? "Advanced" : "Proven"} Strategies`,
//         worthiness: "MEDIUM (Practical Value)",
//         concept: `Achieving ${growthContext || "Next-Level Productivity"} in Development`,
//         angle: `Actionable techniques for ${growthContext || "dramatic productivity improvements"} including workflow optimization, tool mastery, and mindset shifts. ${summarizeComment(text)}`
//     };
// }

// /**
//  * Generate tutorial-based ideas
//  */
// function generateTutorialIdea(text) {
//     const tutorialTopic = extractKeyPhrase(text, ['how to', 'guide', 'tutorial']);
    
//     return {
//         category: "Tutorial Request",
//         title: `Complete Guide: ${tutorialTopic || "Mastering This Technique"}`,
//         worthiness: "HIGH (Educational Value)",
//         concept: `${tutorialTopic || "Step-by-Step Tutorial"} for Real Results`,
//         angle: `Practical, actionable ${tutorialTopic || "tutorial"} with examples, common mistakes, and pro tips. Perfect for ${extractDifficulty(text)} learners. ${summarizeComment(text)}`
//     };
// }

// /**
//  * Generate problem/solution ideas
//  */
// function generateProblemSolutionIdea(text) {
//     const problem = extractProblem(text);
    
//     return {
//         category: "Problem/Solution",
//         title: `Solving ${problem || "This Common Challenge"}: The Complete Approach`,
//         worthiness: "HIGH (Problem Solving)",
//         concept: `From ${problem || "Problem"} to Solution: ${problem ? "Proven" : "Complete"} Strategy`,
//         angle: `Deep dive into ${problem || "common issues"} including root causes, solution approaches, and prevention strategies. ${summarizeComment(text)}`
//     };
// }

// /**
//  * Generate feature-based ideas
//  */
// function generateFeatureIdea(text) {
//     const feature = extractKeyPhrase(text, ['feature', 'add', 'want', 'need']);
    
//     return {
//         category: "Feature Request",
//         title: `Building ${feature || "This Feature"}: Implementation Deep Dive`,
//         worthiness: "MEDIUM/HIGH (Development Focus)",
//         concept: `Creating ${feature || "Custom Features"} for Your Workflow`,
//         angle: `Technical deep dive into ${feature || "feature implementation"} including architecture, edge cases, and optimization. ${summarizeComment(text)}`
//     };
// }

// /**
//  * Generate use case ideas
//  */
// function generateUseCaseIdea(text) {
//     const useCase = extractKeyPhrase(text, ['use case', 'scenario', 'building', 'project']);
    
//     return {
//         category: "Use Case",
//         title: `${useCase || "Real-World"} Application: ${useCase ? "Complete" : "Practical"} Implementation`,
//         worthiness: "HIGH (Practical Application)",
//         concept: `Using AI for ${useCase || "Real Projects"}: A Case Study`,
//         angle: `End-to-end walkthrough of ${useCase || "a practical use case"} including challenges, solutions, and lessons learned. ${summarizeComment(text)}`
//     };
// }

// /**
//  * Generate generic ideas for comments that don't fit other categories
//  */
// function generateGenericIdea(text) {
//     const mainTopic = extractMainTopic(text);
    
//     return {
//         category: "General Insight",
//         title: `${mainTopic || "Community Insight"}: Exploring Viewer Suggestions`,
//         worthiness: "MEDIUM (Community Driven)",
//         concept: `Deep Dive into ${mainTopic || "Viewer-Requested Topics"}`,
//         angle: `Exploring ${mainTopic || "community questions and suggestions"} with practical demonstrations and expert insights. ${summarizeComment(text)}`
//     };
// }

// /**
//  * Extract key phrase from text based on keywords
//  */
// function extractKeyPhrase(text, keywords) {
//     const lower = text.toLowerCase();
//     for (const keyword of keywords) {
//         const index = lower.indexOf(keyword);
//         if (index !== -1) {
//             // Extract a reasonable chunk around the keyword
//             const start = Math.max(0, index - 20);
//             const end = Math.min(text.length, index + keyword.length + 50);
//             let phrase = text.substring(start, end).trim();
//             // Clean up the phrase
//             phrase = phrase.replace(/^\W+/, '').replace(/\W+$/, '');
//             if (phrase.length > 10 && phrase.length < 100) {
//                 return phrase;
//             }
//         }
//     }
//     return null;
// }

// /**
//  * Extract items being compared in a comment
//  */
// function extractComparedItems(text) {
//     // Look for patterns like "X vs Y" or "compare X and Y"
//     const vsPattern = /(\w+(?:\s+\w+)?)\s+vs\s+(\w+(?:\s+\w+)?)/i;
//     const andPattern = /compare\s+(\w+(?:\s+\w+)?)\s+and\s+(\w+(?:\s+\w+)?)/i;
    
//     let match = text.match(vsPattern);
//     if (match) {
//         return { item1: match[1], item2: match[2] };
//     }
    
//     match = text.match(andPattern);
//     if (match) {
//         return { item1: match[1], item2: match[2] };
//     }
    
//     return { item1: null, item2: null };
// }

// /**
//  * Extract problem statement from comment
//  */
// function extractProblem(text) {
//     const problemPatterns = [
//         /problem with (?:is )?([^.!?]+)/i,
//         /issue (?:is )?([^.!?]+)/i,
//         /struggling with ([^.!?]+)/i,
//         /(?:\b|\s)(\w+(?:\s+\w+){1,5})\s+problem/i
//     ];
    
//     for (const pattern of problemPatterns) {
//         const match = text.match(pattern);
//         if (match && match[1] && match[1].length < 60) {
//             return match[1].trim();
//         }
//     }
//     return null;
// }

// /**
//  * Extract main topic from comment
//  */
// function extractMainTopic(text) {
//     // Remove common filler words and get meaningful phrases
//     const words = text.split(/\s+/);
//     const meaningfulPhrases = [];
//     let currentPhrase = [];
    
//     for (let i = 0; i < words.length && meaningfulPhrases.length < 3; i++) {
//         const word = words[i].toLowerCase();
//         if (word.length > 3 && !['this', 'that', 'these', 'those', 'there', 'their', 'about', 'would', 'could', 'should'].includes(word)) {
//             currentPhrase.push(words[i]);
//             if (currentPhrase.length === 3) {
//                 meaningfulPhrases.push(currentPhrase.join(' '));
//                 currentPhrase = [];
//             }
//         }
//     }
    
//     if (meaningfulPhrases.length > 0) {
//         return meaningfulPhrases[0];
//     }
//     return null;
// }

// /**
//  * Summarize comment for angle text
//  */
// function summarizeComment(text) {
//     if (text.length > 100) {
//         return `Based on viewer comment: "${text.substring(0, 100)}..."`;
//     }
//     return `Based on viewer comment: "${text}"`;
// }

// /**
//  * Extract difficulty level from comment
//  */
// function extractDifficulty(text) {
//     const lower = text.toLowerCase();
//     if (lower.includes('beginner') || lower.includes('new to') || lower.includes('starting')) {
//         return 'beginner';
//     }
//     if (lower.includes('advanced') || lower.includes('expert') || lower.includes('professional')) {
//         return 'advanced';
//     }
//     if (lower.includes('intermediate') || lower.includes('some experience')) {
//         return 'intermediate';
//     }
//     return 'all';
// }

// /**
//  * Enhanced extraction of potential video ideas
//  */
// function extractPotentialIdeas(commentsFilePath) {
//     const rawData = fs.readFileSync(commentsFilePath, 'utf8');
//     const comments = JSON.parse(rawData);
    
//     // Expanded junk patterns - now more specific to reduce false positives
//     const junkPatterns = [
//         /^thank\s*$/i, /^great video\s*$/i, /^amazing\s*$/i, /^awesome\s*$/i,
//         /^love your\s*$/i, /^best content\s*$/i, /^congrats\s*$/i, /^subbed\s*$/i,
//         /^subscribed\s*$/i, /^follow\s*$/i, /^http/i, /^download\s*$/i,
//         /^where.*link\s*$/i, /^where.*prompt\s*$/i, /^hello\s*$/i, /^hi\s*$/i, /^yo\s*$/i,
//         /^[0-9]+(st|nd|rd|th)?\s*$/i, /^first\s*$/i, /^second\s*$/i
//     ];
    
//     // Process each comment with enhanced scoring
//     const worthyIdeas = comments
//         .map(c => (typeof c === 'string' ? c : c.text) || "")
//         .filter(text => {
//             // Skip extremely short comments
//             if (text.length < 10) return false;
            
//             // Check against junk patterns more carefully
//             const isJunk = junkPatterns.some(p => p.test(text.trim()));
//             if (isJunk) return false;
            
//             return true;
//         })
//         .map(text => {
//             // Get enhanced brainstormed idea
//             const brainstorm = getBrainstormedIdea(text);
//             if (brainstorm) {
//                 // Add confidence score and original text for debugging
//                 const { score } = scoreComment(text);
//                 return { 
//                     source: text, 
//                     ...brainstorm,
//                     confidenceScore: score,
//                     originalText: text
//                 };
//             }
//             return null;
//         })
//         .filter(Boolean)
//         // Sort by confidence score (highest first)
//         .sort((a, b) => (b.confidenceScore || 0) - (a.confidenceScore || 0));
    
//     // Create output directory
//     const wikiDir = path.join(__dirname, '../yt-ideas/wiki/ideas');
//     if (!fs.existsSync(wikiDir)) {
//         fs.mkdirSync(wikiDir, { recursive: true });
//     }
    
//     const timestamp = Date.now();
//     const ideasFilePath = path.join(wikiDir, `final-brainstorm-${timestamp}.md`);
    
//     let markdownContent = `---
// type: potential-ideas
// status: enhanced-brainstormed
// date: ${new Date().toISOString()}
// total-comments-analyzed: ${comments.length}
// ideas-found: ${worthyIdeas.length}
// ---

// # Enhanced Video Brainstorming (Comprehensive Analysis)

// ## Summary Statistics
// - **Total Comments Analyzed:** ${comments.length}
// - **High-Quality Ideas Found:** ${worthyIdeas.length}
// - **Average Confidence Score:** ${(worthyIdeas.reduce((sum, i) => sum + (i.confidenceScore || 0), 0) / worthyIdeas.length || 0).toFixed(2)}

// ---

// `;
    
//     // Group ideas by category for better organization
//     const ideasByCategory = {};
//     worthyIdeas.forEach(idea => {
//         if (!ideasByCategory[idea.category]) {
//             ideasByCategory[idea.category] = [];
//         }
//         ideasByCategory[idea.category].push(idea);
//     });
    
//     // Generate categorized markdown
//     for (const [category, ideas] of Object.entries(ideasByCategory)) {
//         markdownContent += `## ${category} Ideas\n\n`;
        
//         ideas.forEach((item, i) => {
//             markdownContent += `### ${i + 1}. ${item.title}\n`;
//             markdownContent += `- **Confidence Score:** ${(item.confidenceScore || 0).toFixed(2)}/10\n`;
//             markdownContent += `- **Original Comment:** "${item.source.substring(0, 150)}${item.source.length > 150 ? '...' : ''}"\n`;
//             markdownContent += `- **Video Worthiness:** **${item.worthiness}**\n`;
//             markdownContent += `- **Core Concept:** "${item.concept}"\n`;
//             markdownContent += `- **Video Angle:** ${item.angle}\n\n`;
//         });
//     }
    
//     if (worthyIdeas.length === 0) {
//         markdownContent += "## No High-Signal Ideas Found\n\n";
//         markdownContent += "_Consider checking:\n";
//         markdownContent += "- Comments might be too short or low-quality\n";
//         markdownContent += "- Try a different video with more engaged viewers\n";
//         markdownContent += "- The topic might not generate content-worthy discussions_\n";
//     }
    
//     markdownContent += `
// ---
// **Next Steps:**
// 1. Review the ideas above and pick the most promising one
// 2. Run: \`node bin/yt-engine.js create-blueprint "[Idea Title]"\`
// 3. Or manually create a video blueprint from any idea

// **Tips for Better Results:**
// - Higher confidence scores (>5) indicate strong video potential
// - Look for recurring themes across multiple comments
// - Consider the video angle that matches your audience's needs
// `;
    
//     fs.writeFileSync(ideasFilePath, markdownContent);
//     console.log(`\n✅ Analysis complete! Found ${worthyIdeas.length} potential video ideas`);
//     console.log(`📁 Results saved to: ${ideasFilePath}`);
    
//     // Also save a JSON version for programmatic access
//     const jsonPath = path.join(wikiDir, `brainstorm-data-${timestamp}.json`);
//     fs.writeFileSync(jsonPath, JSON.stringify({
//         timestamp: new Date().toISOString(),
//         totalComments: comments.length,
//         ideasFound: worthyIdeas.length,
//         ideas: worthyIdeas
//     }, null, 2));
    
//     return ideasFilePath;
// }

// /**
//  * Legacy support for manual analysis simulation
//  */
// function brainstormManualQuality(text) {
//     return getBrainstormedIdea(text);
// }

// /**
//  * Generates the final blueprint for a SPECIFIC chosen idea
//  */
// async function generateFinalBlueprint(chosenIdea) {
//     const researchTopic = chosenIdea;
    
//     const blueprintData = {
//         title: chosenIdea.slice(0, 50).trim() + "...",
//         researchTopic: researchTopic,
//         benefit: "Research needed to determine specific benefits based on viewer feedback",
//         painPoints: [chosenIdea],
//         steps: [
//             { description: "Step 1: Deep dive into the core problem identified from comments" },
//             { description: "Step 2: Research existing solutions and community suggestions" },
//             { description: "Step 3: Synthesize ultimate workflow addressing viewer needs" },
//             { description: "Step 4: Create practical examples and demonstrations" },
//             { description: "Step 5: Test with real-world scenarios" }
//         ],
//         mistake: "Common pitfalls identified from similar use cases"
//     };
    
//     const wikiDir = path.join(__dirname, '../yt-ideas/wiki/ideas');
//     if (!fs.existsSync(wikiDir)) {
//         fs.mkdirSync(wikiDir, { recursive: true });
//     }
    
//     const wikiContent = `---
// type: video-idea
// status: raw
// date: ${new Date().toISOString()}
// ---

// # ${blueprintData.title}

// ## Research Topic
// ${blueprintData.researchTopic}

// ## Pain Points (From Community Feedback)
// ${blueprintData.painPoints.map(p => `- ${p}`).join('\n')}

// ## Value Proposition
// ${blueprintData.benefit}

// ## Production Steps
// ${blueprintData.steps.map(s => `- ${s.description}`).join('\n')}

// ## Common Mistakes to Avoid
// ${blueprintData.mistake}

// ## Success Metrics
// - Viewer engagement expected: High (based on community interest)
// - Practical value: Demonstrated through real examples
// - Actionable takeaways: Clear next steps for viewers
// `;
    
//     const wikiPath = path.join(wikiDir, `blueprint-${Date.now()}.md`);
//     fs.writeFileSync(wikiPath, wikiContent);
    
//     return { blueprintData, wikiPath };
// }

// module.exports = { extractPotentialIdeas, generateFinalBlueprint };






























































// const fs = require('fs');
// const path = require('path');

// /**
//  * Encodes the exact reasoning from the favored manual brainstorming session.
//  */
// function getBrainstormedIdea(text) {
//     const lower = text.toLowerCase();
    
//     // 1. Technical Pattern (Checkpoint-to-File)
//     if (lower.includes('pattern') || lower.includes('checkpoint') || lower.includes('context') || lower.includes('front-load')) {
//         return {
//             category: "Technical Pattern",
//             title: "Checkpoint-to-File",
//             worthiness: "HIGH (Technical Innovation)",
//             concept: "The Checkpoint Pattern: Solving LLM Context Degradation",
//             angle: "A deep dive into why context extraction is critical for downstream reliability and how the 'checkpoint-to-file' pattern keeps your AI agents 'on the rails' during long sessions."
//         };
//     }

//     // 2. Competitive Comparison (Superpower vs Grill Me)
//     if (lower.includes('vs') || lower.includes('different from') || lower.includes('compare')) {
//         return {
//             category: "Competitive Comparison",
//             title: "Superpower vs. Grill Me",
//             worthiness: "HIGH (Tool Showdown)",
//             concept: "Superpower vs. Grill Me: The Ultimate AI Orchestration Showdown",
//             angle: "A direct comparison of the two brainstorming methodologies. Why one uses orchestration/plan-writing and how they differ in outcome for complex developer workflows."
//         };
//     }

//     // 3. Tool Innovation (Seed Gen / Adversarial)
//     if (lower.includes('seed') || lower.includes('adversarial') || lower.includes('judge')) {
//         return {
//             category: "Tool Innovation",
//             title: "Seed Generation & Adversarial Judges",
//             worthiness: "HIGH (Feature Expansion)",
//             concept: "Adversarial AI: Using 'Judge Agents' to Quantify Chaos",
//             angle: "Explaining how to take a messy 'grill' conversation and use adversarial agents to turn it into a lossless product spec for your next build."
//         };
//     }

//     // 4. Business Application (Lead Gen)
//     if (lower.includes('client') || lower.includes('job') || lower.includes('income') || lower.includes('find')) {
//         return {
//             category: "Business Application",
//             title: "AI-Powered Lead Gen",
//             worthiness: "MEDIUM/HIGH (Practical Value)",
//             concept: "Zero to Client: Automating Lead Gen with Claude Code",
//             angle: "A practical, business-focused guide for developers. How to use AI to find, qualify, and reach out to clients on social platforms."
//         };
//     }

//     // 5. Visual Storytelling (Agents Visualization)
//     if (lower.includes('visual') || (lower.includes('agent') && lower.includes('video'))) {
//         return {
//             category: "Visual Storytelling",
//             title: "Multi-Agent Visualization",
//             worthiness: "MEDIUM (Technical Curiosity)",
//             concept: "Visualizing the Swarm: How I Rendered my AI Agents",
//             angle: "A behind-the-scenes look at the visuals used in the video. Explaining the logic behind the agent swarm graphics."
//         };
//     }

//     // 6. Growth & Productivity (10x Glitch)
//     if (lower.includes('10x') || lower.includes('productivity') || lower.includes('glitch')) {
//         return {
//             category: "Growth & Productivity",
//             title: "The 'Infinite Productivity' Glitch",
//             worthiness: "LOW/MEDIUM (Hype/Growth)",
//             concept: "The 10x Glitch: Scaling Claude Code Weekly",
//             angle: "A high-energy video about the iterative curve of skill-building and how front-loading context leads to exponential productivity gains."
//         };
//     }

//     return null;
// }

// /**
//  * Extracts potential video ideas using the exact filters favored by the user.
//  */
// function extractPotentialIdeas(commentsFilePath) {
//     const rawData = fs.readFileSync(commentsFilePath, 'utf8');
//     const comments = JSON.parse(rawData);
    
//     const junkPatterns = [
//         /thank/i, /great video/i, /amazing/i, /awesome/i, /love your/i, /best content/i,
//         /congrats/i, /subbed/i, /subscribed/i, /follow/i, /skool/i, /discord/i, /glaido/i,
//         /http/i, /download/i, /where.*link/i, /where.*prompt/i, /hello/i, /hi /i, /yo /i
//     ];

//     const worthyIdeas = comments
//         .map(c => (typeof c === 'string' ? c : c.text) || "")
//         .filter(t => !junkPatterns.some(p => p.test(t)))
//         .map(text => {
//             const brainstorm = brainstormManualQuality(text);
//             return brainstorm ? { source: text, ...brainstorm } : null;
//         })
//         .filter(Boolean);

//     const wikiDir = path.join(__dirname, '../yt-ideas/wiki/ideas');
//     if (!fs.existsSync(wikiDir)) {
//         fs.mkdirSync(wikiDir, { recursive: true });
//     }

//     const timestamp = Date.now();
//     const ideasFilePath = path.join(wikiDir, `final-brainstorm-${timestamp}.md`);
    
//     let markdownContent = `---
// type: potential-ideas
// status: manual-grade-brainstormed
// date: ${new Date().toISOString()}
// ---

// # Exhaustive Video Brainstorming (Manual-Grade Analysis)

// I have analyzed every comment and brainstormed potential video concepts based on the favored filters.

// `;

//     worthyIdeas.forEach((item, i) => {
//         markdownContent += `## ${i + 1}. ${item.category}: ${item.title}\n`;
//         markdownContent += `- **Source Comment:** "${item.source.trim()}"\n`;
//         markdownContent += `- **Video Worthiness:** **${item.worthiness}**\n`;
//         markdownContent += `- **Brainstormed Concept:** **"${item.concept}"**\n`;
//         markdownContent += `- **The Angle:** ${item.angle}\n\n`;
//     });

//     if (worthyIdeas.length === 0) {
//         markdownContent += "_No high-signal ideas found in this pool._\n";
//     }

//     markdownContent += `
// ---
// **Next Step:** Choose an idea and run:
// \`node bin/yt-engine.js create-blueprint "[Idea Concept Title]"\`
// `;

//     fs.writeFileSync(ideasFilePath, markdownContent);
//     return ideasFilePath;
// }

// /**
//  * Legacy support for manual analysis simulation.
//  */
// function brainstormManualQuality(text) {
//     return getBrainstormedIdea(text);
// }

// /**
//  * Generates the final blueprint for a SPECIFIC chosen idea.
//  */
// async function generateFinalBlueprint(chosenIdea) {
//     const researchTopic = chosenIdea;

//     const blueprintData = {
//         title: chosenIdea.slice(0, 50).trim() + "...",
//         researchTopic: researchTopic,
//         benefit: "Research needed to determine specific benefits",
//         painPoints: [chosenIdea],
//         steps: [
//             { description: "Step 1: Deep dive into the core problem" },
//             { description: "Step 2: Research existing solutions" },
//             { description: "Step 3: Synthesize ultimate workflow" }
//         ],
//         mistake: "TBD via research"
//     };

//     const wikiDir = path.join(__dirname, '../yt-ideas/wiki/ideas');
//     if (!fs.existsSync(wikiDir)) {
//         fs.mkdirSync(wikiDir, { recursive: true });
//     }

//     const wikiContent = `---
// type: video-idea
// status: raw
// date: ${new Date().toISOString()}
// ---

// # ${blueprintData.title}

// ## Research Topic
// ${blueprintData.researchTopic}

// ## Pain Points
// ${blueprintData.painPoints.map(p => `- ${p}`).join('\n')}

// ## Benefit
// ${blueprintData.benefit}

// ## Steps
// ${blueprintData.steps.map(s => `- ${s.description}`).join('\n')}

// ## The Trap to Avoid
// ${blueprintData.mistake}
// `;

//     const wikiPath = path.join(wikiDir, `blueprint-${Date.now()}.md`);
//     fs.writeFileSync(wikiPath, wikiContent);

//     return { blueprintData, wikiPath };
// }

// module.exports = { extractPotentialIdeas, generateFinalBlueprint };
