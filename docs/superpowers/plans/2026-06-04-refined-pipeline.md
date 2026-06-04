# YouTube Idea Engine: Refined Selective Pipeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refine the pipeline to scrape all comments, use LLM to select ONE worthy idea, trigger automatic `autoresearch`, and generate the final presentation based on research results.

**Architecture:** 
1. `Scrape` (Full pool) -> 
2. `Filter/Select` (LLM picks one idea) -> 
3. `Autoresearch` (Deep dive into the problem) -> 
4. `Presentation` (Generation based on research).

**Tech Stack:** Node.js, Python, Obsidian, Autoresearch Skill.

---

### Task 1: Update Scraper for Larger Pool

**Files:**
- Modify: `scripts/scrape_comments.py`

- [ ] **Step 1: Increase comment limit to 200 for better selection pool**
Modify `scrape_comments` default limit to 200.

- [ ] **Step 2: Commit**
```bash
git add scripts/scrape_comments.py
git commit -m "feat: increase scraper limit to 200 for better selection pool"
```

---

### Task 2: Implement Selective Idea Synthesis

**Files:**
- Modify: `src/synthesis.js`

- [ ] **Step 1: Update synthesis to pick ONE "worthy" idea**
For now, we'll simulate the "selection" by picking a high-quality comment or a synthetic prompt. In Task 5 (Integration), I will instruct the agent to use its own LLM capability to perform this selection when the CLI runs.

- [ ] **Step 2: Add `researchTopic` to the returned blueprint**
Ensure the `synthesize` function returns a `researchTopic` string.

---

### Task 3: Automatic Research & Presentation Generation

**Files:**
- Modify: `bin/yt-engine.js`

- [ ] **Step 1: Integrate `autoresearch` skill call**
In the CLI `generate` command, after `synthesize`:
1. Extract the `researchTopic`.
2. Automatically trigger `/autoresearch [topic]`. *Note: Since we are in a CLI, I will simulate this by asking the user to run it or using a sub-agent to perform the research if possible.* Actually, per user request, it should be "automatic".

- [ ] **Step 2: Update presentation generator to use research data**
Modify `src/generator.js` to handle richer data from the research.

---

### Task 4: Final Integration & E2E Verification

- [ ] **Step 1: Wire the new flow: Scrape -> Select -> Research -> Generate**
- [ ] **Step 2: Run verification**
- [ ] **Step 3: Commit**
```bash
git commit -m "feat: implement refined selective pipeline with deep research"
```
