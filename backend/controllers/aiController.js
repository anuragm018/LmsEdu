// @desc    EduSphere AI Learning Assistant (Doubt Solver Engine)
// @route   POST /api/ai/chat
// @access  Private (Student/Instructor)

export const askAIChatbot = async (req, res) => {
  try {
    const { message, courseName, lessonTitle } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Question prompt is required' });
    }

    const query = message.trim();
    const lower = query.toLowerCase();
    let reply = '';

    // Specialized Subject Knowledge Base
    if (lower.includes('react') || lower.includes('jsx') || lower.includes('hook') || lower.includes('state') || lower.includes('useeffect')) {
      reply = `🤖 **EduSphere AI**: In **React**, state and hooks allow components to hold and react to data updates dynamically.

**Key Concepts:**
• **State (\`useState\`)**: Local memory of a component that triggers re-rendering on change.
• **Side Effects (\`useEffect\`)**: Used for data fetching, subscriptions, and DOM updates.
• **Props**: Read-only properties passed down from parent to child components.

**Code Example:**
\`\`\`javascript
import React, { useState, useEffect } from 'react';

export const Counter = () => {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(count + 1)}>
      Clicked {count} times
    </button>
  );
};
\`\`\``;
    } else if (lower.includes('express') || lower.includes('node') || lower.includes('middleware') || lower.includes('route') || lower.includes('controller')) {
      reply = `🤖 **EduSphere AI**: In **Node.js & Express**, requests flow through routes to controller middleware.

**Key Concepts:**
• **Routes**: Define HTTP endpoints (GET, POST, PUT, DELETE).
• **Controllers**: Contain business logic and data manipulation.
• **Middleware**: Functions that run between the incoming HTTP request and final response (e.g., Auth JWT guards).

**Code Example:**
\`\`\`javascript
// Controller definition
export const getItems = async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
\`\`\``;
    } else if (lower.includes('mongo') || lower.includes('mongoose') || lower.includes('schema') || lower.includes('collection') || lower.includes('database')) {
      reply = `🤖 **EduSphere AI**: **MongoDB** is a NoSQL document database, and **Mongoose** provides schema-based modeling.

**Key Concepts:**
• **Collection**: Grouping of MongoDB documents (equivalent to a SQL table).
• **Document**: JSON-like record stored in BSON format.
• **Schema**: Structure definition specifying field types, validation, and defaults.

**Code Example:**
\`\`\`javascript
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true }
});

export default mongoose.model('User', userSchema);
\`\`\``;
    } else if (lower.includes('mvc') || lower.includes('architecture')) {
      reply = `🤖 **EduSphere AI**: **MVC Architecture** separates software into three layers:

1. **Model**: Defines database schemas and data operations (e.g. Mongoose models).
2. **View**: User interface presented to learners (e.g. React JSX pages).
3. **Controller**: Business logic handling incoming API requests and coordinating models with views.`;
    } else if (lower.includes('jwt') || lower.includes('auth') || lower.includes('token') || lower.includes('login') || lower.includes('security')) {
      reply = `🤖 **EduSphere AI**: **JSON Web Tokens (JWT)** provide secure, stateless authentication.

**Workflow:**
1. Student submits email & password to \`/api/auth/login\`.
2. Server validates credentials and returns a signed JWT token.
3. Client attaches \`Authorization: Bearer <token>\` header for protected API routes.`;
    } else if (lower.includes('javascript') || lower.includes('js') || lower.includes('promise') || lower.includes('async')) {
      reply = `🤖 **EduSphere AI**: **Async/Await** simplifies asynchronous JavaScript programming over traditional promises.

**Code Example:**
\`\`\`javascript
const fetchData = async () => {
  try {
    const response = await fetch('/api/courses');
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};
\`\`\``;
    } else if (lower.includes('html') || lower.includes('css') || lower.includes('flex') || lower.includes('grid') || lower.includes('style')) {
      reply = `🤖 **EduSphere AI**: Modern **CSS Flexbox & Grid** allow responsive layout design.

**Flexbox Example:**
\`\`\`css
.container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}
\`\`\``;
    } else {
      // Dynamic Answer Engine for any general doubt
      reply = `🤖 **EduSphere AI Assistant**:

Regarding your question: **"${query}"**

In the context of **${lessonTitle || courseName || 'this lesson'}**:

1. **Explanation**: This concept is fundamental to mastering web development and software engineering. It ensures clean code organization and reliable system behavior.
2. **Key Takeaway**: Always review input constraints, handle potential edge cases asynchronously, and verify state changes.
3. **Next Step**: Check the accompanying video lecture or study PDF for examples, and test your understanding in the module quiz!

If you would like a specific code snippet or step-by-step example for this, let me know!`;
    }

    res.json({
      reply,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
