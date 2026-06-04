# YouTube Idea Engine: LLM Wiki

Mode: Hybrid (Research + Project)
Purpose: Optimized YouTube idea generation, research, and production tracking.
Owner: User
Created: 2026-06-04

## Structure

- `wiki/ideas/`: Raw video ideas and brainstorming
- `wiki/production/`: Scripts, titles, thumbnails, and workflow status
- `wiki/intel/`: Competitor analysis and niche trends
- `wiki/concepts/`: Content strategies and storytelling frameworks
- `wiki/entities/`: Brands, creators, and tools
- `wiki/sources/`: Research papers, articles, and data
- `wiki/questions/`: Synthesis and audience Q&A mapping

## Conventions

- All notes use YAML frontmatter: type, status, created, updated, tags (minimum)
- Wikilinks use [[Note Name]] format: filenames are unique, no paths needed
- .raw/ contains source documents: never modify them
- wiki/index.md is the master catalog: update on every ingest
- wiki/log.md is append-only: never edit past entries
- New log entries go at the TOP of the file

## Operations

- Ingest: drop source in .raw/, say "ingest [filename]"
- Query: ask any question: Claude reads index first, then drills in
- Research: say "/autoresearch [topic]" to find content gaps
- Save: say "/save" to file current brainstorming sessions
- Lint: say "lint the wiki" to run a health check
