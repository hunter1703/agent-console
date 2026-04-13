'use client'

import { MarkdownRenderer } from '@/components/markdown/MarkdownRenderer'
import { motion } from 'framer-motion'
import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'
import { useEffect, useState } from 'react'

const demoContent = `
# Markdown Renderer Demo

This page demonstrates all the markdown rendering capabilities implemented in Phase 11.

## Typography & Text Formatting

This is a paragraph with **bold text**, *italic text*, and ***bold italic text***. You can also use ~~strikethrough~~ text.

Here's another paragraph with some inline code: \`const x = 1\`. Notice how it has a subtle background and uses a monospace font.

### Smaller Heading (H3)

#### Even Smaller Heading (H4)

Regular paragraph text with proper line height and spacing for optimal readability.

---

## Lists

### Unordered Lists

- First item
- Second item with more text to show wrapping behavior
- Third item
  - Nested item 1
  - Nested item 2
    - Deeply nested item
- Fourth item

### Ordered Lists

1. First step
2. Second step
3. Third step
   1. Sub-step A
   2. Sub-step B
4. Fourth step

---

## Code Blocks

### JavaScript Example

\`\`\`javascript
// Fibonacci sequence generator
function* fibonacci() {
  let [prev, curr] = [0, 1]
  
  while (true) {
    yield curr
    ;[prev, curr] = [curr, prev + curr]
  }
}

// Get first 10 Fibonacci numbers
const fib = fibonacci()
const numbers = Array.from({ length: 10 }, () => fib.next().value)
console.log(numbers) // [1, 1, 2, 3, 5, 8, 13, 21, 34, 55]
\`\`\`

### TypeScript Example

\`\`\`typescript
interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'user' | 'guest'
}

async function fetchUser(id: string): Promise<User> {
  const response = await fetch(\`/api/users/\${id}\`)
  
  if (!response.ok) {
    throw new Error(\`Failed to fetch user: \${response.statusText}\`)
  }
  
  return response.json()
}

// Usage
const user = await fetchUser('123')
console.log(\`Hello, \${user.name}!\`)
\`\`\`

### Python Example

\`\`\`python
def quicksort(arr):
    """
    Quicksort algorithm implementation
    Time complexity: O(n log n) average case
    """
    if len(arr) <= 1:
        return arr
    
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    
    return quicksort(left) + middle + quicksort(right)

# Example usage
numbers = [3, 6, 8, 10, 1, 2, 1]
sorted_numbers = quicksort(numbers)
print(sorted_numbers)  # [1, 1, 2, 3, 6, 8, 10]
\`\`\`

---

## Blockquotes

> This is a blockquote with a primary color accent on the left border.
> It uses italic text and a surface background for subtle emphasis.
>
> Blockquotes can span multiple paragraphs and maintain consistent styling throughout.

> **Pro Tip:** Blockquotes are great for highlighting important information, quotes, or tips.

---

## Links

Here are some example links:

- [Internal link](#typography--text-formatting)
- [External link to GitHub](https://github.com)
- [External link to React](https://react.dev)

Notice how external links show a small icon to indicate they open in a new tab.

---

## Tables

### Simple Table

| Feature | Status | Priority |
|---------|--------|----------|
| Markdown Renderer | ✅ Complete | High |
| Code Highlighting | ✅ Complete | High |
| Math Rendering | ✅ Complete | Medium |
| Mermaid Diagrams | ✅ Complete | Medium |

### Aligned Table

| Left Aligned | Center Aligned | Right Aligned |
|:-------------|:--------------:|--------------:|
| Text | Text | Text |
| More text | More text | More text |
| Even more | Even more | Even more |

### Complex Table

| Component | Description | Features |
|-----------|-------------|----------|
| MarkdownRenderer | Main component | GFM, Math, Plugins |
| CodeBlock | Syntax highlighting | Shiki, Copy button, Theme matching |
| InlineCode | Inline code styling | Monospace, Subtle background |
| Blockquote | Quote styling | Primary accent, Surface background |
| Table | Table rendering | Hover effects, Alignment support |
| Link | Link styling | External icons, Hover animations |

---

## Math Rendering (KaTeX)

### Inline Math

The quadratic formula is $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$ and it's used to solve quadratic equations.

Einstein's famous equation is $E = mc^2$, which relates energy and mass.

### Block Math

$$
\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
$$

$$
\\sum_{n=1}^{\\infty} \\frac{1}{n^2} = \\frac{\\pi^2}{6}
$$

$$
\\begin{bmatrix}
a & b \\\\
c & d
\\end{bmatrix}
\\begin{bmatrix}
x \\\\
y
\\end{bmatrix}
=
\\begin{bmatrix}
ax + by \\\\
cx + dy
\\end{bmatrix}
$$

---

## Mermaid Diagrams

### Flowchart

\`\`\`mermaid
graph TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Debug]
    D --> E[Fix bugs]
    E --> B
    C --> F[Deploy]
    F --> G[End]
\`\`\`

### Sequence Diagram

\`\`\`mermaid
sequenceDiagram
    participant User
    participant Browser
    participant Server
    participant Database
    
    User->>Browser: Enter URL
    Browser->>Server: HTTP Request
    Server->>Database: Query data
    Database-->>Server: Return results
    Server-->>Browser: HTTP Response
    Browser-->>User: Display page
\`\`\`

### Class Diagram

\`\`\`mermaid
classDiagram
    class Animal {
        +String name
        +int age
        +makeSound()
    }
    class Dog {
        +String breed
        +bark()
    }
    class Cat {
        +String color
        +meow()
    }
    Animal <|-- Dog
    Animal <|-- Cat
\`\`\`

---

## Mixed Content Example

Here's a real-world example combining multiple markdown features:

### Building a REST API

When building a REST API, you need to consider several factors:

1. **Authentication & Authorization**
   - Use JWT tokens for stateless auth
   - Implement role-based access control (RBAC)
   - Always validate tokens on protected routes

2. **Error Handling**
   - Return consistent error responses
   - Use appropriate HTTP status codes
   - Include helpful error messages

3. **Performance**
   - Implement caching strategies
   - Use pagination for large datasets
   - Optimize database queries

> **Important:** Always sanitize user input to prevent XSS and SQL injection attacks!

Here's a simple Express.js example:

\`\`\`javascript
const express = require('express')
const app = express()

app.use(express.json())

// GET endpoint
app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await db.users.findById(req.params.id)
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    res.json(user)
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

// POST endpoint
app.post('/api/users', async (req, res) => {
  try {
    const { name, email } = req.body
    
    // Validation
    if (!name || !email) {
      return res.status(400).json({ error: 'Missing required fields' })
    }
    
    const user = await db.users.create({ name, email })
    res.status(201).json(user)
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.listen(3000, () => {
  console.log('Server running on port 3000')
})
\`\`\`

### API Response Format

| Status Code | Meaning | Example |
|-------------|---------|---------|
| 200 | Success | \`{ "data": {...} }\` |
| 201 | Created | \`{ "data": {...}, "id": "123" }\` |
| 400 | Bad Request | \`{ "error": "Invalid input" }\` |
| 404 | Not Found | \`{ "error": "Resource not found" }\` |
| 500 | Server Error | \`{ "error": "Internal error" }\` |

For more information, check out the [Express.js documentation](https://expressjs.com).

---

## Conclusion

This demo showcases all the markdown rendering capabilities:

- ✅ Headings (H1-H6)
- ✅ Text formatting (bold, italic, strikethrough)
- ✅ Lists (ordered, unordered, nested)
- ✅ Code blocks with syntax highlighting
- ✅ Inline code
- ✅ Blockquotes
- ✅ Links (internal and external)
- ✅ Tables with alignment
- ✅ Math equations (inline and block)
- ✅ Mermaid diagrams
- ✅ HTML sanitization

All components follow the design system with proper spacing, typography, and smooth animations! 🎉
`

export default function MarkdownDemoPage() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-border-subtle bg-surface"
      >
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-[24px] font-semibold text-text-primary">
              Phase 11: Markdown & Rich Content Demo
            </h1>
            <p className="text-[15px] text-text-secondary mt-1">
              Showcasing all markdown rendering capabilities
            </p>
          </div>
          
          {/* Theme Switcher */}
          {mounted && (
            <motion.button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="flex items-center justify-center w-10 h-10 rounded-lg bg-surface-hover hover:bg-surface-elevated border border-border-subtle transition-colors cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun size={18} className="text-primary" />
              ) : (
                <Moon size={18} className="text-primary" />
              )}
            </motion.button>
          )}
        </div>
      </motion.header>

      {/* Content */}
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="max-w-4xl mx-auto px-6 py-8"
      >
        <div className="bg-surface rounded-xl border border-border-subtle p-8">
          <MarkdownRenderer content={demoContent} />
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-8 text-center text-text-tertiary text-[13px]"
        >
          <p>
            Built with React 19, Next.js 16, TypeScript, Tailwind CSS v4, and Framer Motion
          </p>
          <p className="mt-2">
            Components: react-markdown, Shiki, KaTeX, Mermaid, DOMPurify
          </p>
        </motion.div>
      </motion.main>
    </div>
  )
}
