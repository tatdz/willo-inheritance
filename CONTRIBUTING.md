# Contributing to Willo

Thank you for your interest in contributing to Willo! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites
- Node.js 20+ and npm
- PostgreSQL database
- MetaMask or compatible Web3 wallet
- Basic knowledge of React, TypeScript, and blockchain concepts

### Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/your-username/willo-inheritance.git
   cd willo-inheritance
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## 📋 Development Guidelines

### Code Style
- Use TypeScript for all new code
- Follow existing code formatting (Prettier configuration)
- Use meaningful variable and function names
- Add JSDoc comments for complex functions
- Keep components focused and single-purpose

### Component Structure
```typescript
// Use this structure for new React components
interface ComponentProps {
  // Define props with clear types
}

export function ComponentName({ prop1, prop2 }: ComponentProps) {
  // Component logic here
  return (
    // JSX here
  );
}
```

### Database Changes
- Use Drizzle ORM for all database operations
- Update `shared/schema.ts` for schema changes
- Run `npm run db:push` to apply changes
- Never write raw SQL migrations

### API Routes
- Follow RESTful conventions
- Use appropriate HTTP methods and status codes
- Validate input with Zod schemas
- Handle errors gracefully

## 🧪 Testing

### Running Tests
```bash
npm test                    # Run all tests
npm run test:watch         # Run tests in watch mode
npm run test:coverage      # Run tests with coverage
```

### Writing Tests
- Write unit tests for utility functions
- Write integration tests for API endpoints
- Write component tests for React components
- Mock external dependencies appropriately

## 🔗 Smart Contract Development

### Setup
```bash
npm install -D hardhat @nomicfoundation/hardhat-toolbox
```

### Testing Contracts
```bash
npx hardhat test
npx hardhat coverage
```

### Deployment
```bash
npx hardhat deploy --network chiliz
```

## 📝 Documentation

### Code Documentation
- Add JSDoc comments for public functions
- Update README.md for significant changes
- Document API endpoints in CONTRIBUTING.md

### Commit Messages
Use conventional commit format:
```
feat: add real-time price tracking
fix: resolve wallet connection issue
docs: update API documentation
test: add portfolio calculation tests
```

## 🐛 Bug Reports

### Before Submitting
- Check existing issues
- Reproduce the bug consistently
- Test with latest version

### Bug Report Template
```markdown
**Bug Description**
Clear description of the bug

**Steps to Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What should happen

**Screenshots**
If applicable

**Environment**
- OS: [e.g. iOS]
- Browser: [e.g. chrome, safari]
- Wallet: [e.g. MetaMask]
- Version: [e.g. 1.0.0]
```

## ✨ Feature Requests

### Feature Request Template
```markdown
**Feature Description**
Clear description of the feature

**Use Case**
Why is this feature needed?

**Proposed Solution**
How should it work?

**Alternatives Considered**
Other approaches considered

**Additional Context**
Any other relevant information
```

## 📦 Pull Request Process

### Before Submitting
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Add tests if applicable
5. Ensure all tests pass
6. Update documentation
7. Commit with conventional commit format

### Pull Request Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] Added new tests
- [ ] Updated existing tests

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or noted)
```

## 🏗 Architecture Guidelines

### Frontend Architecture
- Keep components small and focused
- Use custom hooks for complex logic
- Implement proper error boundaries
- Use TypeScript strictly

### Backend Architecture
- Keep routes thin, business logic in services
- Use proper error handling
- Validate all inputs
- Follow RESTful principles

### Database Design
- Use meaningful table and column names
- Implement proper foreign key relationships
- Consider performance implications
- Document schema changes

## 🔐 Security Considerations

### Smart Contract Security
- Follow OpenZeppelin patterns
- Implement proper access controls
- Use safe math operations
- Test extensively before deployment

### Web Application Security
- Validate all user inputs
- Use HTTPS in production
- Implement proper CORS policies
- Secure API endpoints

### Wallet Integration
- Never store private keys
- Use established wallet libraries
- Implement proper error handling
- Test with multiple wallet types

## 📞 Getting Help

### Communication Channels
- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and ideas
- **Discord**: Real-time community chat
- **Email**: security@willo.app for security issues

### Code Review Process
1. Submit pull request
2. Automated tests run
3. Team member reviews code
4. Address feedback if any
5. Merge after approval

## 🎯 Project Priorities

### High Priority
- Smart contract security and auditing
- User experience improvements
- Performance optimizations
- Test coverage improvements

### Medium Priority
- Additional blockchain support
- Mobile application
- Enhanced analytics
- Partnership integrations

### Low Priority
- UI/UX enhancements
- Additional token support
- Advanced features
- Documentation improvements

## 📊 Development Metrics

### Code Quality
- Maintain >80% test coverage
- Zero ESLint errors
- TypeScript strict mode
- Performance budget compliance

### Performance Targets
- Page load < 3 seconds
- API response < 500ms
- Real-time updates < 30 seconds
- Mobile-first responsive design

## 🏆 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Community Discord
- Annual contributor list

## 📄 License

By contributing to Willo, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Willo! Together, we're building the future of digital inheritance for the sports fan community. 🚀