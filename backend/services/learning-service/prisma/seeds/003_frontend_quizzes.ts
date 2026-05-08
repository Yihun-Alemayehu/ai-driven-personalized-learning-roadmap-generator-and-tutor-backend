import { PrismaClient } from '@prisma/client';

interface QuestionDef {
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface NodeQuizDef {
  slug: string;
  questions: QuestionDef[];
}

const NODE_QUIZZES: NodeQuizDef[] = [
  {
    slug: 'html-fundamentals',
    questions: [
      {
        questionText: 'Which HTML element is the most semantically appropriate for the main navigation links of a page?',
        options: ['<div>', '<nav>', '<section>', '<aside>'],
        correctAnswer: '<nav>',
        explanation: '<nav> is the semantic element for site navigation links.',
      },
      {
        questionText: 'What attribute makes a form input required before submission?',
        options: ['mandatory', 'required', 'validate', 'must'],
        correctAnswer: 'required',
        explanation: 'The "required" boolean attribute prevents form submission if the field is empty.',
      },
      {
        questionText: 'Which ARIA role should be added to a button that opens a modal dialog?',
        options: ['role="link"', 'role="button"', 'aria-haspopup="dialog"', 'aria-expanded="true"'],
        correctAnswer: 'aria-haspopup="dialog"',
        explanation: 'aria-haspopup="dialog" tells assistive technology that activating this element will open a dialog.',
      },
      {
        questionText: 'What is the correct way to embed an SVG icon inline in an HTML document?',
        options: ['<img src="icon.svg">', '<svg>...</svg>', '<embed src="icon.svg">', '<object data="icon.svg">'],
        correctAnswer: '<svg>...</svg>',
        explanation: 'Inline <svg> gives full CSS/JS control and avoids an extra HTTP request.',
      },
    ],
  },
  {
    slug: 'js-fundamentals',
    questions: [
      {
        questionText: 'What does the typeof operator return for null?',
        options: ['"null"', '"undefined"', '"object"', '"boolean"'],
        correctAnswer: '"object"',
        explanation: 'This is a historic JavaScript bug: typeof null === "object".',
      },
      {
        questionText: 'Which keyword creates a block-scoped variable that cannot be reassigned?',
        options: ['var', 'let', 'const', 'static'],
        correctAnswer: 'const',
        explanation: 'const creates a block-scoped binding whose reference cannot be reassigned.',
      },
      {
        questionText: 'What is a closure in JavaScript?',
        options: [
          'A function with no return value',
          'A function that retains access to its outer scope after that scope has returned',
          'A method on the Array prototype',
          'An immediately invoked function expression',
        ],
        correctAnswer: 'A function that retains access to its outer scope after that scope has returned',
        explanation: 'Closures capture variables from the enclosing scope, allowing them to persist.',
      },
      {
        questionText: 'What is the result of 0.1 + 0.2 === 0.3 in JavaScript?',
        options: ['true', 'false', 'NaN', 'undefined'],
        correctAnswer: 'false',
        explanation: 'IEEE 754 floating-point arithmetic causes 0.1 + 0.2 to equal 0.30000000000000004.',
      },
    ],
  },
  {
    slug: 'css-fundamentals',
    questions: [
      {
        questionText: 'Which CSS property controls the space between the content and the border of an element?',
        options: ['margin', 'padding', 'border-spacing', 'gap'],
        correctAnswer: 'padding',
        explanation: 'padding is the space inside the border; margin is outside.',
      },
      {
        questionText: 'Which selector has the highest specificity?',
        options: ['.class', '#id', 'element', ':hover'],
        correctAnswer: '#id',
        explanation: 'ID selectors have specificity (0,1,0,0) — higher than classes (0,0,1,0) or elements (0,0,0,1).',
      },
      {
        questionText: 'What does the CSS cascade determine?',
        options: [
          'The order elements appear in the DOM',
          'Which styles apply when multiple rules target the same element',
          'How animations run in sequence',
          'The inheritance of font properties',
        ],
        correctAnswer: 'Which styles apply when multiple rules target the same element',
        explanation: 'The cascade resolves conflicts by evaluating origin, specificity, and order.',
      },
      {
        questionText: 'How do you apply a style only when the viewport is narrower than 768px?',
        options: [
          '@media (max-width: 768px) { }',
          '@viewport max-width: 768px { }',
          '@screen narrow { }',
          'media="(max-width: 768px)"',
        ],
        correctAnswer: '@media (max-width: 768px) { }',
        explanation: 'The @media rule with max-width applies styles up to the specified breakpoint.',
      },
    ],
  },
  {
    slug: 'git-version-control',
    questions: [
      {
        questionText: 'Which command creates a new branch AND switches to it in one step?',
        options: ['git branch new-feature', 'git checkout -b new-feature', 'git switch new-feature', 'git merge new-feature'],
        correctAnswer: 'git checkout -b new-feature',
        explanation: 'git checkout -b creates a new branch and immediately checks it out.',
      },
      {
        questionText: 'What does git stash do?',
        options: [
          'Permanently deletes uncommitted changes',
          'Saves uncommitted changes to a temporary stack so you can switch branches',
          'Creates a new branch from the current HEAD',
          'Resets the working directory to the last commit',
        ],
        correctAnswer: 'Saves uncommitted changes to a temporary stack so you can switch branches',
        explanation: 'git stash stores your WIP changes so you can restore them later with git stash pop.',
      },
      {
        questionText: 'What is a merge conflict?',
        options: [
          'When two branches have different names',
          'When the same part of a file was changed differently in two branches being merged',
          'When a commit message is missing',
          'When a remote repository is unavailable',
        ],
        correctAnswer: 'When the same part of a file was changed differently in two branches being merged',
        explanation: 'Git cannot automatically reconcile conflicting edits to the same lines.',
      },
      {
        questionText: 'Which command uploads local commits to a remote repository?',
        options: ['git fetch', 'git pull', 'git push', 'git sync'],
        correctAnswer: 'git push',
        explanation: 'git push uploads local branch commits to the specified remote.',
      },
    ],
  },
  {
    slug: 'js-es6-features',
    questions: [
      {
        questionText: 'What does the spread operator (...) do when used in a function call?',
        options: [
          'Creates a copy of the function',
          'Expands an iterable into individual arguments',
          'Binds the function to a new context',
          'Declares a rest parameter',
        ],
        correctAnswer: 'Expands an iterable into individual arguments',
        explanation: 'Math.max(...[1,2,3]) expands the array into three separate arguments.',
      },
      {
        questionText: 'What is the difference between an arrow function and a regular function regarding "this"?',
        options: [
          'Arrow functions have their own "this"',
          'Arrow functions inherit "this" from the surrounding lexical scope',
          'Arrow functions always use the global "this"',
          'There is no difference',
        ],
        correctAnswer: 'Arrow functions inherit "this" from the surrounding lexical scope',
        explanation: 'Arrow functions do not bind their own "this" — they capture it from the enclosing context.',
      },
      {
        questionText: 'How do you export a named function from an ES module?',
        options: [
          'module.exports = { myFn }',
          'export function myFn() {}',
          'exports.myFn = function() {}',
          'define(["myFn"], function() {})',
        ],
        correctAnswer: 'export function myFn() {}',
        explanation: 'ES module named exports use the "export" keyword directly before the declaration.',
      },
      {
        questionText: 'What will const { a, b } = { a: 1, b: 2, c: 3 } result in?',
        options: [
          'a = { a: 1, b: 2 }, b = undefined',
          'a = 1, b = 2',
          'a = 1, b = 2, c = 3',
          'Throws a TypeError',
        ],
        correctAnswer: 'a = 1, b = 2',
        explanation: 'Object destructuring extracts only the named properties; extra properties are ignored.',
      },
    ],
  },
  {
    slug: 'unit-testing',
    questions: [
      {
        questionText: 'What function in Jest wraps related tests together?',
        options: ['test()', 'it()', 'describe()', 'group()'],
        correctAnswer: 'describe()',
        explanation: 'describe() creates a test suite that groups related test cases.',
      },
      {
        questionText: 'How do you mock a module in Jest?',
        options: [
          'import mock from "jest/mock"',
          'jest.mock("./module")',
          'require.mock("./module")',
          'mock.module("./module")',
        ],
        correctAnswer: 'jest.mock("./module")',
        explanation: 'jest.mock() automatically replaces the module with an auto-mocked version.',
      },
      {
        questionText: 'What does expect(value).toBe(other) check?',
        options: [
          'Deep equality of objects',
          'Strict reference/value equality (===)',
          'That value is truthy',
          'That value is an instance of other',
        ],
        correctAnswer: 'Strict reference/value equality (===)',
        explanation: 'toBe uses Object.is() (essentially ===); use toEqual for deep object comparison.',
      },
      {
        questionText: 'What Jest configuration enables code coverage reporting?',
        options: [
          '"coverage": true in package.json',
          '--coverage flag or "collectCoverage": true in jest.config',
          'import coverage from "jest-coverage"',
          'jest --report coverage',
        ],
        correctAnswer: '--coverage flag or "collectCoverage": true in jest.config',
        explanation: 'Running jest --coverage or setting collectCoverage: true generates an Istanbul coverage report.',
      },
    ],
  },
  {
    slug: 'package-management',
    questions: [
      {
        questionText: 'What does the ~ (tilde) version range mean in package.json?',
        options: [
          'Any version compatible with the specified major version',
          'Exact version only',
          'Patch releases only — allows bug fixes but not minor updates',
          'Any version greater than the specified',
        ],
        correctAnswer: 'Patch releases only — allows bug fixes but not minor updates',
        explanation: '~1.2.3 allows >=1.2.3 <1.3.0; the caret ^ allows minor updates.',
      },
      {
        questionText: 'What is the purpose of package-lock.json?',
        options: [
          'To prevent any packages from being installed',
          'To lock the exact versions of all installed dependencies for reproducible builds',
          'To store global npm configuration',
          'To list devDependencies separately from dependencies',
        ],
        correctAnswer: 'To lock the exact versions of all installed dependencies for reproducible builds',
        explanation: 'package-lock.json ensures everyone on the team installs identical dependency trees.',
      },
      {
        questionText: 'Which command installs a package as a development dependency?',
        options: ['npm install pkg', 'npm install --save-dev pkg', 'npm install --global pkg', 'npm add --dev pkg'],
        correctAnswer: 'npm install --save-dev pkg',
        explanation: '--save-dev (or -D) adds the package to devDependencies in package.json.',
      },
      {
        questionText: 'What does npx do differently from npm?',
        options: [
          'npx only works with global packages',
          'npx executes a package binary without permanently installing it',
          'npx installs packages faster than npm',
          'npx is an alias for npm publish',
        ],
        correctAnswer: 'npx executes a package binary without permanently installing it',
        explanation: 'npx downloads and runs the package temporarily, useful for one-time CLI tools.',
      },
    ],
  },
  {
    slug: 'dom-manipulation',
    questions: [
      {
        questionText: 'Which method selects all elements matching a CSS selector?',
        options: ['document.getElementById()', 'document.querySelector()', 'document.querySelectorAll()', 'document.getElements()'],
        correctAnswer: 'document.querySelectorAll()',
        explanation: 'querySelectorAll returns a static NodeList of all matching elements.',
      },
      {
        questionText: 'What is event delegation?',
        options: [
          'Assigning events to multiple elements at once',
          'Attaching a listener to a parent element to handle events from its children via bubbling',
          'Preventing default browser behaviour',
          'Creating custom DOM events',
        ],
        correctAnswer: 'Attaching a listener to a parent element to handle events from its children via bubbling',
        explanation: 'Delegation uses event bubbling so one listener handles many children, including dynamically added ones.',
      },
      {
        questionText: 'Which method creates a new DOM element?',
        options: ['document.newElement()', 'document.createElement()', 'Node.create()', 'DOM.make()'],
        correctAnswer: 'document.createElement()',
        explanation: 'document.createElement("div") creates a new detached <div> element.',
      },
      {
        questionText: 'How do you stop an event from bubbling up the DOM?',
        options: ['event.preventDefault()', 'event.stopPropagation()', 'event.cancel()', 'event.halt()'],
        correctAnswer: 'event.stopPropagation()',
        explanation: 'stopPropagation prevents the event from travelling further up the DOM tree.',
      },
    ],
  },
  {
    slug: 'css-flexbox',
    questions: [
      {
        questionText: 'Which property makes a container a flex container?',
        options: ['flex: 1', 'display: flex', 'position: flex', 'layout: flex'],
        correctAnswer: 'display: flex',
        explanation: 'Setting display: flex on a container enables Flexbox for its direct children.',
      },
      {
        questionText: 'What does justify-content control in a flex container?',
        options: [
          'Alignment along the cross axis',
          'Alignment along the main axis',
          'The size of flex items',
          'The wrapping behavior',
        ],
        correctAnswer: 'Alignment along the main axis',
        explanation: 'justify-content distributes space along the main axis (row by default).',
      },
      {
        questionText: 'What does flex: 1 mean?',
        options: [
          'The item takes up exactly 1px',
          'The item does not grow or shrink',
          'The item grows and shrinks to fill available space equally',
          'The item has order: 1',
        ],
        correctAnswer: 'The item grows and shrinks to fill available space equally',
        explanation: 'flex: 1 is shorthand for flex-grow: 1, flex-shrink: 1, flex-basis: 0%.',
      },
      {
        questionText: 'Which property reverses the direction of a flex container\'s main axis?',
        options: ['flex-direction: reverse', 'flex-direction: row-reverse', 'align-items: reverse', 'order: -1'],
        correctAnswer: 'flex-direction: row-reverse',
        explanation: 'row-reverse places flex items from right to left; column-reverse stacks them bottom to top.',
      },
    ],
  },
  {
    slug: 'css-grid',
    questions: [
      {
        questionText: 'What unit represents a fraction of the available space in a grid track?',
        options: ['%', 'vw', 'fr', 'auto'],
        correctAnswer: 'fr',
        explanation: 'The fr unit distributes remaining space proportionally among grid tracks.',
      },
      {
        questionText: 'How do you place a grid item in columns 2 through 4?',
        options: ['grid-column: 2 / 4', 'grid-column: 2 span 4', 'column-start: 2; column-end: 4', 'grid-area: 2 / 4'],
        correctAnswer: 'grid-column: 2 / 4',
        explanation: 'grid-column: 2 / 4 means "start at line 2, end at line 4" (spans two columns).',
      },
      {
        questionText: 'What does grid-template-areas allow you to do?',
        options: [
          'Define named regions of the grid for semantic placement',
          'Limit the number of columns in the grid',
          'Set the gap between grid items',
          'Create implicit grid tracks',
        ],
        correctAnswer: 'Define named regions of the grid for semantic placement',
        explanation: 'Named areas allow placing items with grid-area: header instead of line numbers.',
      },
      {
        questionText: 'What is the difference between auto-fill and auto-fit in repeat()?',
        options: [
          'auto-fill is for rows, auto-fit is for columns',
          'auto-fit collapses empty tracks to 0; auto-fill keeps empty tracks',
          'There is no difference',
          'auto-fill is faster than auto-fit',
        ],
        correctAnswer: 'auto-fit collapses empty tracks to 0; auto-fill keeps empty tracks',
        explanation: 'auto-fit allows items to stretch and fill remaining space; auto-fill preserves empty columns.',
      },
    ],
  },
  {
    slug: 'web-accessibility',
    questions: [
      {
        questionText: 'What minimum contrast ratio does WCAG 2.1 AA require for normal text?',
        options: ['2:1', '3:1', '4.5:1', '7:1'],
        correctAnswer: '4.5:1',
        explanation: 'WCAG 2.1 Level AA requires a 4.5:1 contrast ratio for text smaller than 18pt (or 14pt bold).',
      },
      {
        questionText: 'Which ARIA attribute announces live content updates to screen readers?',
        options: ['aria-hidden', 'aria-live', 'aria-label', 'aria-atomic'],
        correctAnswer: 'aria-live',
        explanation: 'aria-live="polite" or "assertive" tells screen readers to announce updates automatically.',
      },
      {
        questionText: 'What HTML attribute provides a text alternative for an image?',
        options: ['title', 'caption', 'alt', 'label'],
        correctAnswer: 'alt',
        explanation: 'The alt attribute provides text that screen readers announce in place of the image.',
      },
      {
        questionText: 'Which element should be used to associate a label with a form control?',
        options: [
          '<span> with an onclick handler',
          '<label> with a for attribute matching the input id',
          '<p> above the input',
          '<div> wrapping the input',
        ],
        correctAnswer: '<label> with a for attribute matching the input id',
        explanation: 'The for attribute links the label to the control\'s id, enabling click-to-focus and screen reader association.',
      },
    ],
  },
  {
    slug: 'async-javascript',
    questions: [
      {
        questionText: 'What does async/await syntactic sugar build on top of?',
        options: ['Callbacks', 'Generators', 'Promises', 'EventEmitter'],
        correctAnswer: 'Promises',
        explanation: 'async functions always return a Promise; await pauses execution until the Promise resolves.',
      },
      {
        questionText: 'Where is the microtask queue processed relative to the macrotask queue?',
        options: [
          'After each macrotask, before the next one',
          'Before any macrotask',
          'After all macrotasks are done',
          'In parallel with macrotasks',
        ],
        correctAnswer: 'After each macrotask, before the next one',
        explanation: 'The event loop drains the microtask queue completely after each macrotask.',
      },
      {
        questionText: 'Which Promise combinator returns as soon as the first promise settles?',
        options: ['Promise.all()', 'Promise.allSettled()', 'Promise.race()', 'Promise.any()'],
        correctAnswer: 'Promise.race()',
        explanation: 'Promise.race() resolves or rejects with the first settled promise, whether fulfilled or rejected.',
      },
      {
        questionText: 'How do you handle errors thrown inside an async function?',
        options: [
          'Use .catch() on the returned promise or try/catch inside the async function',
          'Use window.onerror',
          'Pass an error callback as the first argument',
          'Async functions cannot throw errors',
        ],
        correctAnswer: 'Use .catch() on the returned promise or try/catch inside the async function',
        explanation: 'Errors in async functions cause the returned promise to reject; catch them with try/catch or .catch().',
      },
    ],
  },
  {
    slug: 'typescript-fundamentals',
    questions: [
      {
        questionText: 'What is the difference between an interface and a type alias in TypeScript?',
        options: [
          'Interfaces are faster at compile time',
          'Type aliases can represent primitives and unions; interfaces are extendable and declaration-mergeable',
          'There is no difference',
          'Interfaces can only describe objects with methods',
        ],
        correctAnswer: 'Type aliases can represent primitives and unions; interfaces are extendable and declaration-mergeable',
        explanation: 'Both can describe object shapes, but type aliases handle union/intersection types; interfaces support declaration merging.',
      },
      {
        questionText: 'What does the "unknown" type require before use?',
        options: [
          'Nothing — it behaves like any',
          'A type assertion or type guard before operations on it',
          'An explicit cast to string',
          'It cannot be assigned to variables',
        ],
        correctAnswer: 'A type assertion or type guard before operations on it',
        explanation: '"unknown" is the type-safe counterpart to "any" — you must narrow it before use.',
      },
      {
        questionText: 'What does the ? operator mean in a TypeScript property definition like { name?: string }?',
        options: [
          'The property can be null but not undefined',
          'The property is optional — it may be omitted or undefined',
          'The property is read-only',
          'The property uses optional chaining',
        ],
        correctAnswer: 'The property is optional — it may be omitted or undefined',
        explanation: 'A question mark makes the property optional in the type, allowing the key to be absent.',
      },
      {
        questionText: 'What is a generic type in TypeScript?',
        options: [
          'A type that applies to all JavaScript primitives',
          'A placeholder type that is resolved when the function or class is instantiated',
          'A type imported from a third-party library',
          'A type alias with no properties',
        ],
        correctAnswer: 'A placeholder type that is resolved when the function or class is instantiated',
        explanation: 'Generics like <T> allow writing reusable code that works with multiple types while preserving type safety.',
      },
    ],
  },
  {
    slug: 'web-security-basics',
    questions: [
      {
        questionText: 'What is a Cross-Site Scripting (XSS) attack?',
        options: [
          'Stealing cookies by sniffing network traffic',
          'Injecting malicious scripts into a web page viewed by other users',
          'Forging HTTP requests from a victim\'s browser',
          'Exploiting SQL database queries',
        ],
        correctAnswer: 'Injecting malicious scripts into a web page viewed by other users',
        explanation: 'XSS allows attackers to execute JavaScript in victims\' browsers via unsanitised user input.',
      },
      {
        questionText: 'What does a Content Security Policy (CSP) header do?',
        options: [
          'Encrypts all page content',
          'Restricts which sources the browser can load scripts, styles, and other resources from',
          'Prevents SQL injection attacks',
          'Validates user input on the server',
        ],
        correctAnswer: 'Restricts which sources the browser can load scripts, styles, and other resources from',
        explanation: 'CSP is a browser mechanism that mitigates XSS by whitelisting trusted resource origins.',
      },
      {
        questionText: 'What is a CSRF attack?',
        options: [
          'Injecting code into a database query',
          'Tricking a user\'s browser into making an authenticated request to a site without their knowledge',
          'Intercepting network traffic between client and server',
          'Guessing weak passwords through brute force',
        ],
        correctAnswer: 'Tricking a user\'s browser into making an authenticated request to a site without their knowledge',
        explanation: 'CSRF exploits the fact that browsers automatically attach cookies to requests, allowing forged actions.',
      },
      {
        questionText: 'What does CORS stand for, and what does it protect?',
        options: [
          'Cross-Origin Resource Sharing — allows/restricts cross-domain HTTP requests',
          'Content Origin Response Security — encrypts API responses',
          'Cookie Origin Request Safety — validates cookie domains',
          'Cross-Origin Request Signing — authenticates API consumers',
        ],
        correctAnswer: 'Cross-Origin Resource Sharing — allows/restricts cross-domain HTTP requests',
        explanation: 'CORS is a browser policy that controls which origins can read responses from your API.',
      },
    ],
  },
  {
    slug: 'build-tools-vite',
    questions: [
      {
        questionText: 'What makes Vite\'s dev server significantly faster than webpack in development?',
        options: [
          'It pre-bundles everything on startup',
          'It uses native ES modules in the browser, transforming only files on demand',
          'It uses multiple CPU cores for compilation',
          'It caches builds in a cloud service',
        ],
        correctAnswer: 'It uses native ES modules in the browser, transforming only files on demand',
        explanation: 'Vite serves source files as ES modules and transforms only what the browser actually requests.',
      },
      {
        questionText: 'How do you access an environment variable in Vite client code?',
        options: [
          'process.env.MY_VAR',
          'import.meta.env.VITE_MY_VAR',
          'window.env.MY_VAR',
          'env.get("MY_VAR")',
        ],
        correctAnswer: 'import.meta.env.VITE_MY_VAR',
        explanation: 'Vite exposes env variables prefixed with VITE_ via import.meta.env at build time.',
      },
      {
        questionText: 'Which file configures Vite?',
        options: ['vite.config.ts', 'webpack.config.js', '.viterc', 'build.config.ts'],
        correctAnswer: 'vite.config.ts',
        explanation: 'Vite reads vite.config.ts (or .js/.mjs) from the project root for configuration.',
      },
      {
        questionText: 'What is HMR in the context of Vite?',
        options: [
          'Hypertext Module Resolution',
          'Hot Module Replacement — live updates without a full page reload',
          'HTTP Method Routing',
          'Hierarchical Module Registry',
        ],
        correctAnswer: 'Hot Module Replacement — live updates without a full page reload',
        explanation: 'HMR pushes module updates to the browser and patches them in place, preserving application state.',
      },
    ],
  },
  {
    slug: 'responsive-design',
    questions: [
      {
        questionText: 'What does "mobile-first" CSS mean?',
        options: [
          'Build the mobile app before the web app',
          'Write base styles for small screens and add complexity at larger breakpoints with min-width queries',
          'Use max-width media queries to hide content on mobile',
          'Optimize images specifically for mobile networks',
        ],
        correctAnswer: 'Write base styles for small screens and add complexity at larger breakpoints with min-width queries',
        explanation: 'Mobile-first starts minimal and progressively enhances for wider screens.',
      },
      {
        questionText: 'Which CSS unit represents 1% of the viewport width?',
        options: ['em', '%', 'vw', 'vh'],
        correctAnswer: 'vw',
        explanation: '1vw = 1% of the viewport width; 1vh = 1% of the viewport height.',
      },
      {
        questionText: 'What is a fluid grid layout?',
        options: [
          'A fixed-column grid using pixel widths',
          'A layout that uses percentage-based widths so columns resize with the viewport',
          'A grid with animated transitions between breakpoints',
          'A layout that uses CSS Grid with fr units only',
        ],
        correctAnswer: 'A layout that uses percentage-based widths so columns resize with the viewport',
        explanation: 'Fluid grids scale columns proportionally rather than jumping between fixed sizes.',
      },
      {
        questionText: 'What does the <meta name="viewport"> tag do?',
        options: [
          'Sets the browser default font size',
          'Instructs mobile browsers to use the device width instead of a virtual desktop width',
          'Enables CSS animations on mobile',
          'Prevents zooming on all devices',
        ],
        correctAnswer: 'Instructs mobile browsers to use the device width instead of a virtual desktop width',
        explanation: 'Without this tag, mobile browsers render at a ~980px virtual width and scale down.',
      },
    ],
  },
  {
    slug: 'tailwind-css',
    questions: [
      {
        questionText: 'How does Tailwind remove unused CSS classes in production?',
        options: [
          'It never adds unused classes in the first place',
          'It scans content files and purges classes not found there using its JIT engine',
          'You manually delete unused classes from the output',
          'It uses a PostCSS plugin called PurgeCSS separately',
        ],
        correctAnswer: 'It scans content files and purges classes not found there using its JIT engine',
        explanation: 'Tailwind\'s JIT compiler generates only the classes found in your templates, keeping bundles tiny.',
      },
      {
        questionText: 'Which Tailwind class adds a 1rem top and bottom padding?',
        options: ['p-4', 'py-4', 'px-4', 'pt-4'],
        correctAnswer: 'py-4',
        explanation: 'py-{n} applies padding to the top and bottom (y-axis); px-{n} applies it to left and right.',
      },
      {
        questionText: 'How do you apply a Tailwind style only on hover?',
        options: ['hover-bg-blue-500', 'hover:bg-blue-500', ':hover bg-blue-500', 'bg-blue-500:hover'],
        correctAnswer: 'hover:bg-blue-500',
        explanation: 'Tailwind uses variant: prefix notation; hover:, focus:, sm:, etc.',
      },
      {
        questionText: 'Where do you extend Tailwind\'s default color palette?',
        options: [
          'In a separate colors.css file',
          'In the extend.colors section of tailwind.config.js',
          'By overwriting the @tailwind base layer',
          'In a .tailwindrc file',
        ],
        correctAnswer: 'In the extend.colors section of tailwind.config.js',
        explanation: 'The extend key merges your custom values with the defaults rather than replacing them.',
      },
    ],
  },
  {
    slug: 'react-fundamentals',
    questions: [
      {
        questionText: 'What is JSX?',
        options: [
          'A separate templating language compiled to HTML',
          'A syntax extension for JavaScript that looks like HTML and compiles to React.createElement calls',
          'A CSS-in-JS library bundled with React',
          'The name of React\'s virtual DOM library',
        ],
        correctAnswer: 'A syntax extension for JavaScript that looks like HTML and compiles to React.createElement calls',
        explanation: 'JSX is syntactic sugar; Babel transforms it into nested React.createElement() calls.',
      },
      {
        questionText: 'What hook manages local state in a functional component?',
        options: ['useEffect', 'useRef', 'useState', 'useReducer'],
        correctAnswer: 'useState',
        explanation: 'useState returns a state variable and its setter function.',
      },
      {
        questionText: 'What triggers a React component to re-render?',
        options: [
          'Any variable change inside the component',
          'State or props changes, or a parent re-render',
          'Only explicit calls to forceUpdate()',
          'DOM mutations detected by a MutationObserver',
        ],
        correctAnswer: 'State or props changes, or a parent re-render',
        explanation: 'React re-renders when useState/useReducer state changes, props change, or the parent re-renders.',
      },
      {
        questionText: 'What is the purpose of the key prop in a list of React elements?',
        options: [
          'It applies a unique CSS class to each item',
          'It helps React identify which items changed, were added, or removed during reconciliation',
          'It is required for the component to compile',
          'It prevents the component from unmounting',
        ],
        correctAnswer: 'It helps React identify which items changed, were added, or removed during reconciliation',
        explanation: 'Stable, unique keys allow React\'s diffing algorithm to reuse DOM nodes efficiently.',
      },
    ],
  },
  {
    slug: 'api-integration',
    questions: [
      {
        questionText: 'What is the purpose of the fetch API\'s second argument?',
        options: [
          'It specifies the response format',
          'It passes request options such as method, headers, and body',
          'It sets a timeout for the request',
          'It provides an abort signal only',
        ],
        correctAnswer: 'It passes request options such as method, headers, and body',
        explanation: 'The init object lets you set method, headers, body, credentials, signal, etc.',
      },
      {
        questionText: 'What HTTP status code indicates a successfully created resource?',
        options: ['200', '201', '204', '302'],
        correctAnswer: '201',
        explanation: '201 Created is the standard response for a successful POST that creates a new resource.',
      },
      {
        questionText: 'Why do you need to call response.json() after a fetch() call?',
        options: [
          'fetch() returns HTML by default and needs conversion',
          'The Response body is a ReadableStream; .json() reads and parses it',
          'JSON parsing is asynchronous and needs to be awaited separately',
          'Both B and C are correct',
        ],
        correctAnswer: 'Both B and C are correct',
        explanation: 'Response.json() reads the stream and parses JSON; it returns a Promise because reading streams is async.',
      },
      {
        questionText: 'What does the Authorization: Bearer <token> header convey?',
        options: [
          'Basic authentication credentials',
          'A JWT or OAuth access token for authenticating the request',
          'The API key for rate limiting',
          'A session cookie replacement',
        ],
        correctAnswer: 'A JWT or OAuth access token for authenticating the request',
        explanation: 'Bearer tokens are commonly used with JWT or OAuth 2.0 for stateless API authentication.',
      },
    ],
  },
  {
    slug: 'progressive-web-apps',
    questions: [
      {
        questionText: 'What is a service worker?',
        options: [
          'A Node.js background process',
          'A JavaScript script that runs in a separate thread and can intercept network requests',
          'A dedicated web worker for UI rendering',
          'A browser built-in caching mechanism',
        ],
        correctAnswer: 'A JavaScript script that runs in a separate thread and can intercept network requests',
        explanation: 'Service workers act as a proxy between the browser and network, enabling offline support and push notifications.',
      },
      {
        questionText: 'Which Web App Manifest property sets the app name on the home screen?',
        options: ['title', 'name', 'short_name', 'app_name'],
        correctAnswer: 'short_name',
        explanation: 'short_name is used on the home screen icon; name is the full app name in install prompts.',
      },
      {
        questionText: 'What cache strategy serves content from cache first, falling back to network?',
        options: ['Network First', 'Cache First', 'Stale While Revalidate', 'Network Only'],
        correctAnswer: 'Cache First',
        explanation: 'Cache First returns the cached response immediately and only goes to the network if the cache misses.',
      },
      {
        questionText: 'What must a PWA have to be installable on a mobile device?',
        options: [
          'A native mobile app wrapper',
          'A registered service worker, a Web App Manifest with required fields, and served over HTTPS',
          'An Apple Developer account',
          'A React Native entry point',
        ],
        correctAnswer: 'A registered service worker, a Web App Manifest with required fields, and served over HTTPS',
        explanation: 'Browsers require these three criteria before showing the install prompt.',
      },
    ],
  },
  {
    slug: 'cli-tools',
    questions: [
      {
        questionText: 'What does the pipe operator (|) do in shell commands?',
        options: [
          'Runs two commands in parallel',
          'Passes the output of one command as the input to the next',
          'Redirects output to a file',
          'Terminates a running process',
        ],
        correctAnswer: 'Passes the output of one command as the input to the next',
        explanation: 'e.g., ls | grep ".js" filters the output of ls through grep.',
      },
      {
        questionText: 'Which command prints the current working directory?',
        options: ['cd', 'ls', 'pwd', 'dir'],
        correctAnswer: 'pwd',
        explanation: 'pwd (print working directory) outputs the absolute path of the current directory.',
      },
      {
        questionText: 'How do you make a shell script executable?',
        options: [
          'Add #!/bin/bash at the top',
          'Run chmod +x script.sh',
          'Rename it to script.exe',
          'Both A and B are required',
        ],
        correctAnswer: 'Both A and B are required',
        explanation: 'The shebang line specifies the interpreter; chmod +x grants execute permission to the OS.',
      },
      {
        questionText: 'What does the > operator do in a shell command?',
        options: [
          'Compares two values',
          'Redirects stdout to a file, overwriting it',
          'Appends stdout to a file',
          'Pipes output to another command',
        ],
        correctAnswer: 'Redirects stdout to a file, overwriting it',
        explanation: '> overwrites the file; >> appends to it.',
      },
    ],
  },
  {
    slug: 'react-hooks',
    questions: [
      {
        questionText: 'What is the purpose of the dependency array in useEffect?',
        options: [
          'It lists all variables the effect should ignore',
          'It controls when the effect re-runs — the effect only re-runs when listed values change',
          'It prevents the effect from running on the first render',
          'It is required for the component to mount',
        ],
        correctAnswer: 'It controls when the effect re-runs — the effect only re-runs when listed values change',
        explanation: 'An empty array [] means run once; omitting it means run after every render.',
      },
      {
        questionText: 'What does useCallback return?',
        options: [
          'The result of calling the provided function',
          'A memoized version of the function that only changes if dependencies change',
          'A ref to the function',
          'A Promise that resolves when the callback completes',
        ],
        correctAnswer: 'A memoized version of the function that only changes if dependencies change',
        explanation: 'useCallback prevents unnecessary re-creation of functions, useful when passing callbacks to memoized children.',
      },
      {
        questionText: 'What is the difference between useRef and useState?',
        options: [
          'useRef holds DOM references only; useState holds any value',
          'Changing a useRef value does not trigger a re-render; changing state does',
          'useRef is async; useState is synchronous',
          'useRef can only hold string values',
        ],
        correctAnswer: 'Changing a useRef value does not trigger a re-render; changing state does',
        explanation: 'useRef is a mutable container; mutating .current never causes React to re-render the component.',
      },
      {
        questionText: 'What is a custom hook?',
        options: [
          'A hook provided by a third-party library',
          'A JavaScript function whose name starts with "use" that can call other hooks',
          'A method on a class component',
          'A hook that only works in production builds',
        ],
        correctAnswer: 'A JavaScript function whose name starts with "use" that can call other hooks',
        explanation: 'Custom hooks extract reusable stateful logic from components without changing the component hierarchy.',
      },
    ],
  },
  {
    slug: 'react-router',
    questions: [
      {
        questionText: 'Which hook returns the current URL parameters from a dynamic route like /users/:id?',
        options: ['useLocation', 'useParams', 'useNavigate', 'useRouteMatch'],
        correctAnswer: 'useParams',
        explanation: 'useParams returns an object of key/value pairs from the dynamic segments of the current URL.',
      },
      {
        questionText: 'What is the purpose of the <Outlet /> component in React Router v6?',
        options: [
          'It marks where the root route renders',
          'It renders the matched child route inside a parent route component',
          'It provides a navigation context to the entire app',
          'It replaces <Switch> from React Router v5',
        ],
        correctAnswer: 'It renders the matched child route inside a parent route component',
        explanation: '<Outlet /> is a placeholder in the parent that renders whichever nested route is matched.',
      },
      {
        questionText: 'What is the difference between <Link> and <NavLink>?',
        options: [
          '<Link> navigates; <NavLink> opens in a new tab',
          '<NavLink> adds an active class/style when its href matches the current URL; <Link> does not',
          '<Link> is for internal navigation; <NavLink> is for external URLs',
          'They are identical',
        ],
        correctAnswer: '<NavLink> adds an active class/style when its href matches the current URL; <Link> does not',
        explanation: '<NavLink> is useful for navigation menus where you want to highlight the current page.',
      },
      {
        questionText: 'Which hook programmatically navigates to a different route?',
        options: ['useHistory', 'useRouter', 'useNavigate', 'useRedirect'],
        correctAnswer: 'useNavigate',
        explanation: 'useNavigate returns a navigate() function; useHistory was the v5 equivalent.',
      },
    ],
  },
  {
    slug: 'form-handling',
    questions: [
      {
        questionText: 'What is a controlled input in React?',
        options: [
          'An input managed by the browser\'s native form API',
          'An input whose value is driven by React state and updated via onChange',
          'An input with a required attribute',
          'An input that uses a third-party validation library',
        ],
        correctAnswer: 'An input whose value is driven by React state and updated via onChange',
        explanation: 'A controlled input reads its value from state and calls setState on every keystroke.',
      },
      {
        questionText: 'What does React Hook Form\'s register() function do?',
        options: [
          'Registers the form with the Redux store',
          'Connects an input element to the form\'s internal tracking without requiring state',
          'Validates the input on every keystroke',
          'Submits the form automatically',
        ],
        correctAnswer: 'Connects an input element to the form\'s internal tracking without requiring state',
        explanation: 'register() returns ref and event handler props that React Hook Form uses to track uncontrolled inputs.',
      },
      {
        questionText: 'Why is React Hook Form more performant than controlled forms in many cases?',
        options: [
          'It uses Web Workers for validation',
          'It uses uncontrolled inputs, so React does not re-render on every keystroke',
          'It batches all DOM updates at once',
          'It skips the virtual DOM diffing step',
        ],
        correctAnswer: 'It uses uncontrolled inputs, so React does not re-render on every keystroke',
        explanation: 'Uncontrolled inputs store values in DOM refs, avoiding state updates and re-renders per keystroke.',
      },
      {
        questionText: 'How should you prevent default browser form submission in React?',
        options: [
          'Set action="" on the form element',
          'Call event.preventDefault() in the onSubmit handler',
          'Use type="button" on the submit button',
          'Wrap the form in a <div>',
        ],
        correctAnswer: 'Call event.preventDefault() in the onSubmit handler',
        explanation: 'event.preventDefault() stops the browser from navigating to the action URL on submit.',
      },
    ],
  },
  {
    slug: 'react-testing',
    questions: [
      {
        questionText: 'What is the guiding principle of React Testing Library?',
        options: [
          'Test implementation details like component state',
          'Test the component the way a user would interact with it',
          'Achieve 100% line coverage',
          'Mock all external dependencies',
        ],
        correctAnswer: 'Test the component the way a user would interact with it',
        explanation: 'RTL encourages querying by accessible roles and text, not internal implementation details.',
      },
      {
        questionText: 'Which query method in RTL is preferred for finding interactive elements?',
        options: ['getByTestId()', 'getByClassName()', 'getByRole()', 'getByAttribute()'],
        correctAnswer: 'getByRole()',
        explanation: 'getByRole() queries by ARIA role, mirroring how assistive technology finds elements.',
      },
      {
        questionText: 'What does userEvent.click() do differently from fireEvent.click()?',
        options: [
          'userEvent.click() is synchronous; fireEvent is async',
          'userEvent simulates a full user interaction sequence (pointerdown, mousedown, click, etc.); fireEvent fires one event',
          'They are identical',
          'userEvent only works in jsdom environments',
        ],
        correctAnswer: 'userEvent simulates a full user interaction sequence (pointerdown, mousedown, click, etc.); fireEvent fires one event',
        explanation: 'userEvent more accurately reflects real user behaviour by dispatching the full event sequence.',
      },
      {
        questionText: 'How do you wait for an async element to appear in RTL?',
        options: [
          'Use setTimeout in the test',
          'Use await findBy* queries, which retry until the element appears or a timeout is reached',
          'Use waitForElement() from v6',
          'Wrap assertions in a Promise',
        ],
        correctAnswer: 'Use await findBy* queries, which retry until the element appears or a timeout is reached',
        explanation: 'findBy* queries are async versions of getBy* that poll until the element appears.',
      },
    ],
  },
  {
    slug: 'component-libraries',
    questions: [
      {
        questionText: 'What is a headless UI component?',
        options: [
          'A component with no visible styling',
          'A component that provides accessible behaviour and state management without imposing styles',
          'A server-side rendered component',
          'A component that renders nothing to the DOM',
        ],
        correctAnswer: 'A component that provides accessible behaviour and state management without imposing styles',
        explanation: 'Headless components (Radix, Headless UI) separate logic from presentation, giving full style control.',
      },
      {
        questionText: 'Which shadcn/ui feature makes it different from traditional component libraries?',
        options: [
          'It uses a CDN instead of npm',
          'Components are copied directly into your project and are fully customizable',
          'It requires a paid license',
          'It only works with Next.js',
        ],
        correctAnswer: 'Components are copied directly into your project and are fully customizable',
        explanation: 'shadcn/ui\'s CLI copies component source code into your repo — you own the code and can modify it.',
      },
      {
        questionText: 'How do you override a Material UI component\'s default styles with Tailwind classes?',
        options: [
          'Set the className prop on the MUI component',
          'Use sx={{ ... }} with Tailwind class names',
          'It is not possible to mix MUI and Tailwind',
          'Edit the MUI source code',
        ],
        correctAnswer: 'Set the className prop on the MUI component',
        explanation: 'MUI components accept a className prop; combined with Tailwind and the important configuration, you can override defaults.',
      },
      {
        questionText: 'What is the main trade-off of using a full component library like MUI?',
        options: [
          'They are slower than hand-written components',
          'Heavy bundle size and opinionated styling that can be hard to customise deeply',
          'They do not support TypeScript',
          'They only work with class components',
        ],
        correctAnswer: 'Heavy bundle size and opinionated styling that can be hard to customise deeply',
        explanation: 'Component libraries trade bundle weight and potential style conflicts for development speed.',
      },
    ],
  },
  {
    slug: 'css-in-js',
    questions: [
      {
        questionText: 'What is a tagged template literal in styled-components?',
        options: [
          'A regular string template with backticks',
          'A function call where the function receives the template string parts and interpolations',
          'A JSX attribute for applying styles',
          'A Babel plugin syntax',
        ],
        correctAnswer: 'A function call where the function receives the template string parts and interpolations',
        explanation: 'styled.div`color: red` calls styled.div with the template string, enabling dynamic CSS interpolation.',
      },
      {
        questionText: 'How do styled-components inject styles into the document?',
        options: [
          'They generate .css files at build time',
          'They inject unique class names into <style> tags at runtime',
          'They use inline styles on every element',
          'They use the CSSOM directly via JavaScript',
        ],
        correctAnswer: 'They inject unique class names into <style> tags at runtime',
        explanation: 'Styled-components generates unique class names and injects the corresponding CSS into a <style> tag in the head.',
      },
      {
        questionText: 'What is the purpose of ThemeProvider in styled-components?',
        options: [
          'It renders a theme selector UI automatically',
          'It passes a theme object via React Context so all styled components can access design tokens',
          'It switches between light and dark mode',
          'It loads theme CSS files lazily',
        ],
        correctAnswer: 'It passes a theme object via React Context so all styled components can access design tokens',
        explanation: 'ThemeProvider makes the theme accessible in any styled component via the props.theme object.',
      },
      {
        questionText: 'What is the main criticism of CSS-in-JS at runtime?',
        options: [
          'It does not support media queries',
          'It generates styles at runtime, adding JS execution overhead and increasing bundle size',
          'It breaks server-side rendering',
          'It requires PostCSS to function',
        ],
        correctAnswer: 'It generates styles at runtime, adding JS execution overhead and increasing bundle size',
        explanation: 'Runtime CSS-in-JS serialises styles in the browser, which can affect performance — a reason some prefer build-time solutions.',
      },
    ],
  },
  {
    slug: 'state-management-context',
    questions: [
      {
        questionText: 'What triggers a re-render of all Context consumers?',
        options: [
          'Any state change anywhere in the app',
          'When the context value reference changes (i.e., the Provider\'s value prop changes)',
          'Only when the Provider component unmounts and remounts',
          'When the consumer\'s own state changes',
        ],
        correctAnswer: 'When the context value reference changes (i.e., the Provider\'s value prop changes)',
        explanation: 'All consumers re-render whenever the value object reference changes, which is why you should memoize it.',
      },
      {
        questionText: 'What does useReducer offer over useState for complex state?',
        options: [
          'It is faster at runtime',
          'It centralises state transition logic in a pure reducer function, making updates predictable and testable',
          'It allows state to persist across page reloads',
          'It automatically batches multiple state updates',
        ],
        correctAnswer: 'It centralises state transition logic in a pure reducer function, making updates predictable and testable',
        explanation: 'A reducer is a pure function (state, action) => newState, which is easy to unit-test independently.',
      },
      {
        questionText: 'When should you NOT use Context for state management?',
        options: [
          'For user authentication state',
          'For high-frequency updates like mouse position or animation frames',
          'For theme settings',
          'For the current logged-in user\'s profile',
        ],
        correctAnswer: 'For high-frequency updates like mouse position or animation frames',
        explanation: 'Every context update re-renders all consumers; high-frequency updates cause performance issues.',
      },
      {
        questionText: 'How do you prevent unnecessary re-renders when splitting contexts?',
        options: [
          'Use a single large context object',
          'Split one large context into multiple focused contexts so consumers only re-render when their slice changes',
          'Wrap all consumers in React.memo',
          'Use useCallback on the context value',
        ],
        correctAnswer: 'Split one large context into multiple focused contexts so consumers only re-render when their slice changes',
        explanation: 'Context splitting minimises the blast radius of state changes by keeping concerns separate.',
      },
    ],
  },
  {
    slug: 'state-management-redux',
    questions: [
      {
        questionText: 'What is a Redux slice?',
        options: [
          'A portion of the global state with its associated reducers and action creators',
          'A middleware that logs actions',
          'A selector function for derived state',
          'A code-split chunk of the Redux store',
        ],
        correctAnswer: 'A portion of the global state with its associated reducers and action creators',
        explanation: 'createSlice() from Redux Toolkit groups the state shape, reducers, and auto-generated action creators together.',
      },
      {
        questionText: 'How does RTK Query differ from createAsyncThunk?',
        options: [
          'They are identical in functionality',
          'RTK Query is a full data-fetching and caching solution; createAsyncThunk handles only one async action at a time',
          'createAsyncThunk is for REST; RTK Query is for GraphQL only',
          'RTK Query requires a separate npm package',
        ],
        correctAnswer: 'RTK Query is a full data-fetching and caching solution; createAsyncThunk handles only one async action at a time',
        explanation: 'RTK Query manages caching, invalidation, polling, and loading states automatically.',
      },
      {
        questionText: 'What is the Redux principle of a single source of truth?',
        options: [
          'All API responses must come from a single endpoint',
          'The entire application state lives in a single store object',
          'Components can only read state, never write it',
          'All reducers must live in one file',
        ],
        correctAnswer: 'The entire application state lives in a single store object',
        explanation: 'Having one store makes state predictable, debuggable, and easy to serialize.',
      },
      {
        questionText: 'What does Immer (used inside Redux Toolkit) allow you to do?',
        options: [
          'Import CSS modules in reducers',
          'Write reducers that appear to mutate state directly, while producing immutable updates under the hood',
          'Cache API responses in the Redux store',
          'Share state between Redux and React Context',
        ],
        correctAnswer: 'Write reducers that appear to mutate state directly, while producing immutable updates under the hood',
        explanation: 'Immer uses Proxy objects to intercept mutations and produce a new immutable state tree.',
      },
    ],
  },
  {
    slug: 'advanced-react-patterns',
    questions: [
      {
        questionText: 'What is the compound component pattern?',
        options: [
          'A pattern where a parent component manages shared state and child components consume it implicitly',
          'A pattern for composing multiple higher-order components',
          'A pattern using render props to inject state',
          'A pattern for code-splitting components lazily',
        ],
        correctAnswer: 'A pattern where a parent component manages shared state and child components consume it implicitly',
        explanation: 'Examples: <Select><Option/></Select> — the parent owns state; children communicate through Context.',
      },
      {
        questionText: 'What is a Higher-Order Component (HOC)?',
        options: [
          'A component that is rendered inside a portal',
          'A function that takes a component and returns a new enhanced component',
          'A component with a higher z-index',
          'A component that uses Suspense for lazy loading',
        ],
        correctAnswer: 'A function that takes a component and returns a new enhanced component',
        explanation: 'HOCs like withAuth(Component) wrap a component to add cross-cutting concerns without modifying the original.',
      },
      {
        questionText: 'What does React.lazy() do?',
        options: [
          'Delays a component\'s first render by one frame',
          'Dynamically imports a component and splits it into a separate bundle',
          'Renders a component only when it enters the viewport',
          'Memoizes a component to skip re-renders',
        ],
        correctAnswer: 'Dynamically imports a component and splits it into a separate bundle',
        explanation: 'React.lazy() combined with Suspense enables code-splitting at the component level.',
      },
      {
        questionText: 'What problem do render props solve?',
        options: [
          'Sharing stateful logic between components without inheritance',
          'Preventing unnecessary re-renders',
          'Accessing the DOM imperatively',
          'Managing global application state',
        ],
        correctAnswer: 'Sharing stateful logic between components without inheritance',
        explanation: 'A render prop passes a function as a prop that returns JSX, letting the consumer decide what to render with shared logic.',
      },
    ],
  },
  {
    slug: 'data-visualization',
    questions: [
      {
        questionText: 'Which Recharts component is required to wrap all other Recharts components?',
        options: ['<Chart>', '<ResponsiveContainer>', '<ComposedChart>', '<ChartWrapper>'],
        correctAnswer: '<ResponsiveContainer>',
        explanation: '<ResponsiveContainer> measures its parent\'s size and passes width/height to its child chart.',
      },
      {
        questionText: 'What is a D3 scale?',
        options: [
          'A CSS transform for zooming SVG elements',
          'A function that maps input data values to output visual values like pixel positions or colours',
          'A grid overlay for aligning chart elements',
          'A D3 plugin for animating transitions',
        ],
        correctAnswer: 'A function that maps input data values to output visual values like pixel positions or colours',
        explanation: 'Scales like scaleLinear() convert domain values (data) to range values (pixels).',
      },
      {
        questionText: 'What is the challenge of integrating D3 with React\'s rendering model?',
        options: [
          'D3 cannot render SVG elements',
          'D3 manipulates the DOM directly, conflicting with React\'s virtual DOM management of the same nodes',
          'D3 requires class components',
          'D3 animations are incompatible with React\'s event system',
        ],
        correctAnswer: 'D3 manipulates the DOM directly, conflicting with React\'s virtual DOM management of the same nodes',
        explanation: 'Common solutions: let React own the DOM (use D3 only for math), or isolate D3 in a useEffect with a ref.',
      },
      {
        questionText: 'What Recharts component renders a tooltip on hover?',
        options: ['<Legend>', '<Tooltip>', '<CartesianGrid>', '<Brush>'],
        correctAnswer: '<Tooltip>',
        explanation: '<Tooltip> automatically shows data values when a user hovers over a data point.',
      },
    ],
  },
  {
    slug: 'performance-optimization',
    questions: [
      {
        questionText: 'What does React.memo() do?',
        options: [
          'Memoizes the return value of a function call',
          'Wraps a functional component to skip re-rendering if props have not shallowly changed',
          'Provides a cache for useEffect calls',
          'Inlines styles to avoid CSS class lookups',
        ],
        correctAnswer: 'Wraps a functional component to skip re-rendering if props have not shallowly changed',
        explanation: 'React.memo() performs a shallow prop comparison; if props are the same, React reuses the last render.',
      },
      {
        questionText: 'What Core Web Vital measures the time until the largest visible content element is rendered?',
        options: ['FID', 'CLS', 'LCP', 'INP'],
        correctAnswer: 'LCP',
        explanation: 'Largest Contentful Paint (LCP) measures loading performance; a good score is under 2.5s.',
      },
      {
        questionText: 'What is code splitting?',
        options: [
          'Breaking a large CSS file into smaller files',
          'Splitting a JavaScript bundle into smaller chunks loaded on demand',
          'Separating server and client code',
          'Distributing code across multiple CDN nodes',
        ],
        correctAnswer: 'Splitting a JavaScript bundle into smaller chunks loaded on demand',
        explanation: 'Code splitting reduces initial load time by loading only the code needed for the current page.',
      },
      {
        questionText: 'Which Next.js Image component property is most important for preventing layout shift (CLS)?',
        options: ['src', 'alt', 'priority', 'width and height'],
        correctAnswer: 'width and height',
        explanation: 'Declaring width and height lets the browser reserve space before the image loads, preventing layout shift.',
      },
    ],
  },
  {
    slug: 'frontend-auth',
    questions: [
      {
        questionText: 'Where is the safest place to store JWTs in a browser?',
        options: [
          'localStorage',
          'sessionStorage',
          'An HttpOnly, Secure, SameSite=Strict cookie',
          'A global JavaScript variable',
        ],
        correctAnswer: 'An HttpOnly, Secure, SameSite=Strict cookie',
        explanation: 'HttpOnly cookies are inaccessible to JavaScript, protecting against XSS token theft.',
      },
      {
        questionText: 'What is a refresh token used for?',
        options: [
          'Reloading the page without losing state',
          'Obtaining a new short-lived access token without requiring the user to log in again',
          'Refreshing the user\'s profile from the server',
          'Invalidating all active sessions for a user',
        ],
        correctAnswer: 'Obtaining a new short-lived access token without requiring the user to log in again',
        explanation: 'Refresh tokens are long-lived; they are exchanged for new access tokens when the current one expires.',
      },
      {
        questionText: 'What is the OAuth 2.0 Authorization Code flow with PKCE designed to protect against?',
        options: [
          'SQL injection attacks',
          'Interception of the authorization code by a malicious app on the same device',
          'CSRF attacks on the OAuth provider',
          'Brute-force password attacks',
        ],
        correctAnswer: 'Interception of the authorization code by a malicious app on the same device',
        explanation: 'PKCE (Proof Key for Code Exchange) ensures only the app that initiated the flow can exchange the code for tokens.',
      },
      {
        questionText: 'How do you implement a protected route in React Router v6?',
        options: [
          'Add role="protected" to the <Route> element',
          'Wrap the route element in a component that checks auth state and redirects to login if unauthenticated',
          'Use the secure prop on <Route>',
          'Configure route guards in vite.config.ts',
        ],
        correctAnswer: 'Wrap the route element in a component that checks auth state and redirects to login if unauthenticated',
        explanation: 'A common pattern: <RequireAuth> checks the auth context and renders <Navigate to="/login"> if not authenticated.',
      },
    ],
  },
  {
    slug: 'static-site-generation',
    questions: [
      {
        questionText: 'What does getStaticProps do in Next.js?',
        options: [
          'Fetches data on every request at runtime',
          'Fetches data at build time and passes it as props to the page component',
          'Generates static CSS for the page',
          'Exports a static HTML file for deployment',
        ],
        correctAnswer: 'Fetches data at build time and passes it as props to the page component',
        explanation: 'getStaticProps runs during next build; the result is serialized and sent as props to the page.',
      },
      {
        questionText: 'What is Incremental Static Regeneration (ISR)?',
        options: [
          'Regenerating all static pages on every deploy',
          'Re-building individual static pages in the background after a specified revalidation interval',
          'Generating pages lazily when first visited',
          'A caching layer provided by Vercel only',
        ],
        correctAnswer: 'Re-building individual static pages in the background after a specified revalidation interval',
        explanation: 'ISR allows stale-while-revalidate behavior: serve the cached page instantly while regenerating it in the background.',
      },
      {
        questionText: 'What does getStaticPaths return?',
        options: [
          'A list of all file paths in the project',
          'An object with paths (the dynamic route params to pre-render) and fallback strategy',
          'The base URL of the site',
          'A redirect map for old URLs',
        ],
        correctAnswer: 'An object with paths (the dynamic route params to pre-render) and fallback strategy',
        explanation: 'getStaticPaths tells Next.js which dynamic pages to pre-render at build time.',
      },
      {
        questionText: 'What is the main advantage of SSG over SSR?',
        options: [
          'SSG pages can access databases at request time',
          'SSG pages are served as static files from a CDN — no server runtime required for rendering',
          'SSG pages are always more up-to-date',
          'SSG supports real-time data without polling',
        ],
        correctAnswer: 'SSG pages are served as static files from a CDN — no server runtime required for rendering',
        explanation: 'Static files are cheap to serve, scale infinitely, and have very low TTFB.',
      },
    ],
  },
  {
    slug: 'server-side-rendering',
    questions: [
      {
        questionText: 'What is the main SEO benefit of SSR over pure client-side rendering?',
        options: [
          'SSR pages load faster on mobile',
          'Search engine crawlers receive fully rendered HTML instead of an empty shell requiring JavaScript execution',
          'SSR avoids the need for a sitemap',
          'SSR removes the need for meta tags',
        ],
        correctAnswer: 'Search engine crawlers receive fully rendered HTML instead of an empty shell requiring JavaScript execution',
        explanation: 'While Googlebot can render JavaScript, SSR ensures all crawlers see complete content immediately.',
      },
      {
        questionText: 'What is hydration in the context of SSR?',
        options: [
          'Adding water to a dehydrated data structure',
          'The process where the browser\'s React attaches event listeners to the server-rendered HTML',
          'Fetching data on the client after the server renders',
          'Compressing server responses with gzip',
        ],
        correctAnswer: 'The process where the browser\'s React attaches event listeners to the server-rendered HTML',
        explanation: 'Hydration makes static server HTML interactive by matching it with the React component tree.',
      },
      {
        questionText: 'What is a React Server Component (RSC)?',
        options: [
          'A component that only runs on Node.js and never sends JavaScript to the client',
          'A component rendered on the server that ships zero JavaScript to the client for its own execution',
          'A component that uses SSE for real-time updates',
          'A Suspense boundary for server-fetched data',
        ],
        correctAnswer: 'A component rendered on the server that ships zero JavaScript to the client for its own execution',
        explanation: 'RSCs can access the filesystem and databases directly, and their code is never included in the client bundle.',
      },
      {
        questionText: 'What does a hydration mismatch error mean?',
        options: [
          'The server and client rendered different HTML for the same component',
          'The page ran out of memory during hydration',
          'A network request failed during hydration',
          'The component is not compatible with SSR',
        ],
        correctAnswer: 'The server and client rendered different HTML for the same component',
        explanation: 'React expects server and client output to match exactly; differences cause a hydration error.',
      },
    ],
  },
  {
    slug: 'seo-fundamentals',
    questions: [
      {
        questionText: 'Which HTML element defines the title shown in browser tabs and search results?',
        options: ['<h1>', '<meta name="title">', '<title>', '<head>'],
        correctAnswer: '<title>',
        explanation: 'The <title> tag in <head> sets the page title used by browsers, search engines, and social sharing.',
      },
      {
        questionText: 'What does the Open Graph protocol add to a web page?',
        options: [
          'Structured data for product listings',
          'Metadata that controls how the page appears when shared on social media platforms',
          'An alternative sitemap format',
          'A microformat for contact information',
        ],
        correctAnswer: 'Metadata that controls how the page appears when shared on social media platforms',
        explanation: 'Open Graph meta tags (og:title, og:image, etc.) define the title, description, and image for social link previews.',
      },
      {
        questionText: 'What is JSON-LD used for in SEO?',
        options: [
          'Linking JSON files to CSS stylesheets',
          'Embedding structured data (schema.org vocabulary) in a <script> tag for search engine rich results',
          'Lazy-loading JSON data',
          'Defining API response shapes for crawlers',
        ],
        correctAnswer: 'Embedding structured data (schema.org vocabulary) in a <script> tag for search engine rich results',
        explanation: 'JSON-LD structured data enables Google rich results like ratings, FAQs, and breadcrumbs in search.',
      },
      {
        questionText: 'Which Core Web Vital measures layout stability?',
        options: ['LCP', 'INP', 'FID', 'CLS'],
        correctAnswer: 'CLS',
        explanation: 'Cumulative Layout Shift (CLS) measures unexpected visual movement; a good score is below 0.1.',
      },
    ],
  },
  {
    slug: 'typescript-react',
    questions: [
      {
        questionText: 'How do you type a functional component\'s props in TypeScript?',
        options: [
          'function MyComponent(props: Object)',
          'const MyComponent: React.FC<Props> = (props) => ... or function MyComponent(props: Props)',
          'interface Props extends HTMLElement',
          'type Props = React.Component',
        ],
        correctAnswer: 'const MyComponent: React.FC<Props> = (props) => ... or function MyComponent(props: Props)',
        explanation: 'Both patterns work; explicit props typing with an interface or type alias is the most common approach.',
      },
      {
        questionText: 'What TypeScript type should you use for a React click event handler on a button?',
        options: [
          'MouseEvent',
          'React.MouseEvent<HTMLButtonElement>',
          'Event<MouseEvent>',
          'HTMLEvent<MouseEvent>',
        ],
        correctAnswer: 'React.MouseEvent<HTMLButtonElement>',
        explanation: 'React wraps native events in SyntheticEvent; the generic parameter specifies the element type.',
      },
      {
        questionText: 'What does the NonNullable<T> utility type do?',
        options: [
          'Makes all properties of T required',
          'Removes null and undefined from type T',
          'Makes T read-only',
          'Converts T to a partial type',
        ],
        correctAnswer: 'Removes null and undefined from type T',
        explanation: 'NonNullable<string | null | undefined> produces string — useful after null checks.',
      },
      {
        questionText: 'How do you type a custom hook that returns a value and a setter?',
        options: [
          'Return type is auto-inferred, no annotation needed',
          'Use a tuple return type: [T, (value: T) => void]',
          'Use an object return type: { value: T, setValue: Function }',
          'Both B and C are valid approaches',
        ],
        correctAnswer: 'Both B and C are valid approaches',
        explanation: 'Tuples match useState\'s pattern; objects are more readable when returning many values.',
      },
    ],
  },
  {
    slug: 'frontend-architecture',
    questions: [
      {
        questionText: 'What is feature-sliced design (FSD)?',
        options: [
          'A UI testing methodology',
          'An architectural methodology that organises code by features/pages with strict layer boundaries',
          'A CSS methodology for naming classes',
          'A micro-frontend framework',
        ],
        correctAnswer: 'An architectural methodology that organises code by features/pages with strict layer boundaries',
        explanation: 'FSD defines layers (app, pages, features, entities, shared) with one-directional dependency rules.',
      },
      {
        questionText: 'What does the Facade pattern achieve in frontend architecture?',
        options: [
          'It wraps complex subsystem APIs behind a simpler interface (e.g., a custom hook)',
          'It renders UI components behind an authentication wall',
          'It caches API responses in memory',
          'It provides a central event bus for component communication',
        ],
        correctAnswer: 'It wraps complex subsystem APIs behind a simpler interface (e.g., a custom hook)',
        explanation: 'A useCart() hook that hides Redux dispatches and selectors is a facade over the state management subsystem.',
      },
      {
        questionText: 'Why should UI components be separated from business logic?',
        options: [
          'To reduce bundle size',
          'So components can be tested and reused independently, and business logic can change without affecting the UI',
          'To comply with accessibility standards',
          'To enable server-side rendering',
        ],
        correctAnswer: 'So components can be tested and reused independently, and business logic can change without affecting the UI',
        explanation: 'Separation of concerns makes each layer independently testable and swappable.',
      },
      {
        questionText: 'What problem does a "God Component" antipattern cause?',
        options: [
          'It is too fast and causes rendering issues',
          'It mixes too many concerns, making it hard to test, reuse, and maintain',
          'It prevents TypeScript inference',
          'It conflicts with React\'s reconciliation algorithm',
        ],
        correctAnswer: 'It mixes too many concerns, making it hard to test, reuse, and maintain',
        explanation: 'A God Component that handles data fetching, business logic, and complex rendering is the opposite of SRP.',
      },
    ],
  },
  {
    slug: 'micro-frontends',
    questions: [
      {
        questionText: 'What is Module Federation in Webpack 5?',
        options: [
          'A way to lazy-load node_modules',
          'A mechanism that allows a JavaScript application to dynamically load code from another independently deployed app',
          'A plugin for splitting CSS into separate files',
          'A method for sharing Redux state between tabs',
        ],
        correctAnswer: 'A mechanism that allows a JavaScript application to dynamically load code from another independently deployed app',
        explanation: 'Module Federation enables micro-frontends to share components and state at runtime across deployment boundaries.',
      },
      {
        questionText: 'What is the main drawback of micro-frontend architecture?',
        options: [
          'It is not possible to share design systems',
          'Increased operational complexity — each app has its own CI/CD pipeline, versioning, and potential duplication',
          'Micro-frontends cannot be deployed to CDNs',
          'They require a monorepo structure',
        ],
        correctAnswer: 'Increased operational complexity — each app has its own CI/CD pipeline, versioning, and potential duplication',
        explanation: 'Micro-frontends trade deployment flexibility for increased team coordination and infrastructure overhead.',
      },
      {
        questionText: 'How do micro-frontends typically communicate with each other?',
        options: [
          'Direct function calls between apps',
          'Custom events on window, shared state via URL, or a shared event bus',
          'Shared Redux store injected at build time',
          'They cannot communicate — full isolation is required',
        ],
        correctAnswer: 'Custom events on window, shared state via URL, or a shared event bus',
        explanation: 'Loose coupling between micro-frontends is maintained by using browser-native communication mechanisms.',
      },
      {
        questionText: 'What is a "shell" app in micro-frontend architecture?',
        options: [
          'A backend BFF for the frontend',
          'The host application that composes and orchestrates micro-frontend modules',
          'A static site that redirects to each micro-app',
          'A containerization layer for each frontend',
        ],
        correctAnswer: 'The host application that composes and orchestrates micro-frontend modules',
        explanation: 'The shell handles routing, shared layout, authentication, and loads the appropriate micro-frontends.',
      },
    ],
  },
  {
    slug: 'fullstack-integration',
    questions: [
      {
        questionText: 'What is the purpose of a BFF (Backend for Frontend)?',
        options: [
          'A database dedicated to frontend data',
          'A server layer tailored to the specific needs of one frontend, aggregating multiple microservices',
          'A CDN optimised for frontend assets',
          'A test harness for frontend-backend contract testing',
        ],
        correctAnswer: 'A server layer tailored to the specific needs of one frontend, aggregating multiple microservices',
        explanation: 'A BFF reduces the number of round trips and shapes API responses specifically for its consuming frontend.',
      },
      {
        questionText: 'What does a CI/CD pipeline for a Next.js app typically include?',
        options: [
          'Only manual QA steps',
          'Automated lint, type check, tests, build, and deployment triggered on each push',
          'Only a Docker build step',
          'Database migrations run before every commit',
        ],
        correctAnswer: 'Automated lint, type check, tests, build, and deployment triggered on each push',
        explanation: 'A full CI/CD pipeline automates quality gates and deployment, reducing manual errors.',
      },
      {
        questionText: 'What is the purpose of environment variables in a full-stack deployment?',
        options: [
          'To make the code run faster',
          'To separate configuration (API URLs, secrets) from code so the same build can run in multiple environments',
          'To store user data between sessions',
          'To configure browser extensions',
        ],
        correctAnswer: 'To separate configuration (API URLs, secrets) from code so the same build can run in multiple environments',
        explanation: 'The Twelve-Factor App methodology recommends storing config in the environment.',
      },
      {
        questionText: 'What does end-to-end testing verify in a full-stack app?',
        options: [
          'Individual unit behaviour in isolation',
          'The entire user flow from the browser through the frontend, API, and database',
          'Database schema migrations',
          'TypeScript type correctness',
        ],
        correctAnswer: 'The entire user flow from the browser through the frontend, API, and database',
        explanation: 'E2E tests (Playwright, Cypress) simulate real user interactions against a running full-stack environment.',
      },
    ],
  },
];

export async function seedFrontendQuizzes(prisma: PrismaClient) {
  const domain = await prisma.domain.findUnique({ where: { slug: 'frontend-development' } });
  if (!domain) throw new Error('Domain frontend-development not found');

  const ontologyVersion = await prisma.ontologyVersion.findFirst({
    where: { domainId: domain.id, status: 'published' },
    orderBy: { versionNumber: 'desc' },
  });
  if (!ontologyVersion) throw new Error('No published ontology version for frontend-development');

  // Check if already seeded
  const existingQuiz = await prisma.quiz.findFirst({
    where: { node: { ontologyVersionId: ontologyVersion.id } },
  });
  if (existingQuiz) {
    console.log('Frontend quizzes already seeded — skipping');
    return;
  }

  let quizCount = 0;
  let questionCount = 0;

  for (const nodeQuiz of NODE_QUIZZES) {
    const node = await prisma.learningNode.findFirst({
      where: { ontologyVersionId: ontologyVersion.id, slug: nodeQuiz.slug },
    });
    if (!node) {
      console.warn(`Node not found: ${nodeQuiz.slug} — skipping`);
      continue;
    }

    const quiz = await prisma.quiz.create({
      data: {
        nodeId: node.id,
        isMicroQuiz: false,
        generatedBy: 'seed',
      },
    });

    for (let i = 0; i < nodeQuiz.questions.length; i++) {
      const q = nodeQuiz.questions[i];
      await prisma.quizQuestion.create({
        data: {
          quizId: quiz.id,
          questionType: 'multiple_choice',
          questionText: q.questionText,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          orderIndex: i + 1,
        },
      });
      questionCount++;
    }

    quizCount++;
  }

  console.log(`Seeded ${quizCount} quizzes with ${questionCount} questions for Frontend Development`);
}
