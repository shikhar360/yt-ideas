# YouTube Idea Engine: Next.js Transition Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace `presentation.html` with a Next.js app and minimalist styling.

**Architecture:** CLI saves data to JSON -> Next.js app reads and renders.

---

### Task 1: CLI Refactoring
- [ ] **Step 1: Remove `src/generator.js` and `templates/presentation.html`**
- [ ] **Step 2: Update `bin/yt-engine.js`**
    - Update `build` command to save results to `presentation/data/latest.json` instead of generating HTML.
- [ ] **Step 3: Commit**

### Task 2: Next.js Scaffolding
- [ ] **Step 1: Initialize Next.js app**
    - Create `presentation/` directory.
    - Run `pnpm create next-app presentation --typescript --tailwind --eslint`.
- [ ] **Step 2: Configure Tailwind with Minimalist Palette**
    - Set stone, lime, pink, blue, amber, yellow in `tailwind.config.ts`.
- [ ] **Step 3: Commit**

### Task 3: Presentation UI Implementation
- [ ] **Step 1: Create Layout Components**
    - Implement Phase sections (Hook, Hero, Guide, Trap) with Talent Zones.
    - Use black/stone backgrounds and white text.
- [ ] **Step 2: Implement Data Fetching**
    - Read `data/latest.json` in the Next.js app.
- [ ] **Step 3: Commit**

### Task 4: Integration Test
- [ ] **Step 1: Run full pipeline and verify `presentation/data/latest.json` exists.**
- [ ] **Step 2: Start Next.js and verify UI.**
- [ ] **Step 3: Commit**
