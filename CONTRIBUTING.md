# Contributing to Kaldor IIoT

Thank you for considering contributing to Kaldor IIoT! This document provides guidelines for contributing to the project.

## Code of Conduct

Be respectful, professional, and collaborative.

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in Issues
2. Create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - System information
   - Screenshots if applicable

### Suggesting Features

1. Check existing feature requests
2. Create a new issue with:
   - Clear description of the feature
   - Use cases and benefits
   - Possible implementation approach

### Pull Requests

1. **Fork the repository**
2. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**:
   - Follow the coding style
   - Add tests
   - Update documentation
4. **Test your changes**:
   ```bash
   npm test
   ```
5. **Commit with clear messages**:
   ```bash
   git commit -m "feat: add new monitoring widget"
   ```
6. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```
7. **Create Pull Request**

## Development Guidelines

### Coding Standards

**JavaScript/TypeScript**
- Use ES6+ features
- Follow ESLint configuration
- Add JSDoc comments for functions
- Maximum line length: 100 characters

**Python**
- Follow PEP 8
- Use type hints
- Add docstrings
- Format with Black

**C++ (Firmware)**
- Follow Google C++ Style Guide
- Use meaningful variable names
- Add comments for complex logic

### Commit Messages

Follow Conventional Commits:

```
<type>(<scope>): <subject>

<body>

<footer>
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

Examples:
```
feat(dashboard): add real-time chart widget
fix(api): resolve memory leak in MQTT handler
docs(readme): update installation instructions
```

### Testing

All code must include tests:

- **Unit tests**: Test individual functions
- **Integration tests**: Test component interactions
- **E2E tests**: Test complete workflows

Run tests before submitting:
```bash
npm test
npm run test:integration
```

### Documentation

Update documentation for:
- New features
- API changes
- Configuration options
- Breaking changes

## Project Structure

See [ARCHITECTURE.md](ARCHITECTURE.md) for detailed structure.

## Questions?

Contact the team:
- Email: dev@kaldor-iiot.example.com
- GitHub Discussions
- Slack: #kaldor-iiot-dev

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.
