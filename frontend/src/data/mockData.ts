import type { Block } from '../types';

export const mockLessonBlocks: Block[] = [
  {
    type: 'theory_markdown',
    content: `# Welcome to Spring Boot Basics
    
Spring Boot makes it easy to create stand-alone, production-grade Spring based Applications that you can "just run".

### Key Features
* **Auto-configuration**: Attempts to automatically configure your Spring application based on the jar dependencies that you have added.
* **Standalone**: You can run Spring Boot applications using \`java -jar\` or via the bundled application server (Tomcat, Jetty).
* **Opinionated**: Takes an opinionated view of the Spring platform to make setup easier.

Let's test what you've learned so far on the right panel!`
  },
  {
    type: 'interactive_fill_blank',
    questionText: 'Spring Boot applications can be run standalone using the {1} command.',
    correctAnswers: {
      '1': 'java -jar'
    },
    hints: ['Think about standard executable Java archives.']
  },
  {
    type: 'theory_markdown',
    content: `# Understanding Dependency Injection

Dependency Injection (DI) is a core concept in Spring. It allows the creation of dependent objects outside of a class and provides those objects to a class through different ways.

Instead of a class creating its own dependencies, the dependencies are "injected" at runtime, usually by the Spring IoC (Inversion of Control) container.

### Benefits of DI
- Loose coupling
- Easier testing
- Better modularity`
  },
  {
    type: 'interactive_scenario',
    scenarioDescription: 'You have a UserService that needs to connect to a Database. How should you design this using Dependency Injection?',
    options: [
      { id: 'a', text: 'Instantiate DatabaseConnection inside UserService constructor with `new DatabaseConnection()`', isCorrect: false },
      { id: 'b', text: 'Pass DatabaseConnection as a parameter to the UserService constructor', isCorrect: true },
      { id: 'c', text: 'Make DatabaseConnection a static global variable', isCorrect: false }
    ],
    explanation: 'Passing dependencies via constructor is constructor-based Dependency Injection. It promotes loose coupling and makes testing UserService much easier by allowing you to pass a mock database connection.'
  },
  {
    type: 'theory_markdown',
    content: `# Congratulations!
    
You have completed this short introductory lesson. You have demonstrated an understanding of:
- Spring Boot core concepts
- Dependency Injection

**Great job!** You can now move on to the next chapter.`
  }
];
