<!-- SPDX-License-Identifier: MIT OR Apache-2.0 -->
<!-- SPDX-FileCopyrightText: 2025 Kaldor Community Manufacturing Platform Contributors -->

# CLAUDE.md

This file provides guidance for working with Claude Code on the Kaldor IIoT project.

## Project Overview

**Kaldor IIoT** is the design repository for the Kaldor loom's BBW (Back Beam Width) board, an Industrial Internet of Things (IIoT) implementation.

## Repository Structure

```
Kaldor-IIoT/
├── .github/
│   └── workflows/
│       └── deploy-now.yaml    # IONOS deployment workflow
├── .deploy-now/               # IONOS deployment configuration
├── dist/                      # Build output directory
├── .gitignore
├── .gitattributes
├── README.md
└── CLAUDE.md                  # This file
```

## Working with Claude Code

### Getting Started

When working on this project with Claude Code, you can ask for help with:

- **Code Review**: "Review the changes I made to [file]"
- **Implementation**: "Add a new feature to [component]"
- **Debugging**: "Help me fix this error in [file]"
- **Documentation**: "Generate documentation for [module]"
- **Testing**: "Write tests for [functionality]"

### Development Workflow

1. **Feature Branches**: Always work on feature branches
   - Claude Code creates branches with format: `claude/[description]-[session-id]`
   - Never push directly to main/master

2. **Commits**: Claude Code will help with:
   - Writing clear commit messages
   - Staging appropriate files
   - Following git best practices

3. **Pull Requests**: Ask Claude to create PRs with:
   - Descriptive titles and summaries
   - Test plans and checklists
   - Reference to related issues

### Deployment

This project uses **IONOS Deploy Now** for automatic deployment:

- **Trigger**: Pushes to any branch and manual workflow dispatch
- **Build Output**: `dist/` folder
- **Configuration**: See `.github/workflows/deploy-now.yaml`

Required secrets:
- `IONOS_API_KEY`
- `IONOS_PROJECT_ID`

### Common Tasks

#### Adding New Features
```
"Add a new [component] that does [functionality]"
```

#### Running Tests
```
"Run the test suite and fix any failures"
```

#### Code Review
```
"Review my recent changes and suggest improvements"
```

#### Documentation
```
"Update documentation for [feature]"
```

### Best Practices

1. **Ask Before Creating Files**: Claude prefers editing existing files over creating new ones
2. **Commit Often**: Make incremental commits with clear messages
3. **Test Before Pushing**: Ensure changes work before pushing
4. **Security**: Claude checks for common vulnerabilities (XSS, SQL injection, etc.)

### Project-Specific Guidelines

#### IIoT Development
- Focus on reliability and real-time performance
- Consider industrial environment constraints
- Document hardware interfaces clearly
- Test edge cases and error handling

#### Loom BBW Board
- Maintain compatibility with existing hardware
- Document pin assignments and connections
- Consider timing constraints
- Test under various operating conditions

## Getting Help

### Claude Code Documentation
- [Official Docs](https://docs.claude.com/en/docs/claude-code)
- Use `/help` command in Claude Code CLI

### Project Help
Ask Claude for:
- "Explain how [component] works"
- "What's the purpose of [file]?"
- "How do I test [feature]?"
- "Show me examples of [pattern] in this codebase"

## Task Management

Claude Code uses a task tracking system:
- Tasks are broken down into manageable steps
- Progress is tracked in real-time
- You can ask "What's the status?" at any time

## Tips for Effective Collaboration

1. **Be Specific**: "Add error handling to the sensor module" vs "Improve code"
2. **Provide Context**: Share error messages, logs, or screenshots
3. **Iterate**: Start with a plan, then implement incrementally
4. **Review Together**: Ask Claude to explain changes before committing

## Version Control

### Branch Naming
- Feature: `claude/feature-name-[session-id]`
- Fix: `claude/fix-description-[session-id]`
- Docs: `claude/docs-update-[session-id]`

### Commit Message Format
```
<type>: <short summary>

<detailed description if needed>
```

Types: feat, fix, docs, refactor, test, chore

## Notes

- Claude Code runs in a sandboxed environment
- All file operations are tracked and can be reviewed
- Claude follows security best practices
- Changes are never pushed without explicit confirmation

---

Last Updated: 2025-11-21
