# YouTube Idea & Presentation Engine: Design Specification

**Date:** 2026-06-04
**Topic:** YouTube Idea Generation and Psychological Presentation System
**Status:** Draft (Pending Review)

## 1. Overview
A comprehensive system to automate the discovery of YouTube video ideas from competitor comments and trends, synthesize them into research-backed blueprints within an Obsidian Wiki, and generate high-engagement HTML/CSS presentation pages for green-screen video production.

## 2. Architecture & Data Flow

### 2.1. Intake Layer (Input)
- **Primary Input:** YouTube URL (competitor video).
- **Secondary Input:** Keywords for niche trend tracking (Twitter/YouTube).
- **Tools:** `scrapling` (for comment extraction), custom trend-watcher logic.

### 2.2. Processing Layer (Obsidian Wiki "The Brain")
- **Intake Pipeline:**
    1. Scrape comments from URL.
    2. Perform trend research on video topics.
    3. LLM Synthesis: Group comments into Pain Points, Curiosity Gaps, and Social Proof.
- **Blueprint Generation:** Create a note in `wiki/ideas/` with:
    - **Target Audience Frustrations:** (The "Agitator").
    - **Technical Hurdles:** (The "Step-by-Step" focus).
    - **Key Metaphors:** For AI-generated visuals.
- **Research Loop:** Trigger `/autoresearch` on technical hurdles to fill the blueprint with verified facts and code.

### 2.3. Output Layer (Presentation SPA)
- **Format:** Single-page HTML/CSS (Vanilla JS).
- **Framework:** "Retention-Engine" (Hybrid PAS + WWH).
- **Psychological Triggers:**
    - **Pattern Interrupts:** Alternating talent zones (Left/Right) per section.
    - **Open Loops:** Starting with a Curiosity Gap/Problem.
    - **Micro-Rewards:** Visual progress indicator.
    - **Authority Building:** "Common Pitfalls" section.

## 3. Component Details

### 3.1. The "Retention-Engine" Layout Phases
1. **The Hook (PAS - Problem):** Highlight the user frustration identified in comments. Use high-contrast visuals.
2. **The Hero (WWH - What/Why):** Define the tech/feature and its primary benefit.
3. **The Guide (Hero's Journey - How):** Step-by-step technical implementation with AI-generated metaphors.
4. **The Trap (Authority):** "Don't make this mistake" section to build trust.

### 3.2. Technical Stack
- **Backend:** Node.js/Python (CLI tools).
- **Storage:** Local Markdown files (Obsidian Wiki structure).
- **Frontend:** Vanilla HTML/CSS/JS (SPA).
- **Visuals:** AI-generated images via CLI tool based on synthesis metaphors.

## 4. Design for Isolation
- **Scraper Service:** Independent module for comment extraction.
- **Synthesis Engine:** LLM-driven module that only depends on raw text and outputs a structured Markdown blueprint.
- **Presentation Generator:** Takes a Markdown blueprint and outputs a single HTML/CSS/JS file.

## 5. Success Criteria
- [ ] Successfully scrapes 100+ comments from a YouTube URL.
- [ ] Generates a structured Obsidian note with specific "Pain Points".
- [ ] Produces an HTML page following the 4-phase Narrative Layout.
- [ ] Includes dedicated "Talent Zones" for green-screen framing.
