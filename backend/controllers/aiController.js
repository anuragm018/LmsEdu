// // @desc    EduSphere AI Learning Assistant (Doubt Solver Engine)
// // @route   POST /api/ai/chat
// // @access  Private (Student/Instructor)

// export const askAIChatbot = async (req, res) => {
//   try {
//     const { message, courseName, lessonTitle } = req.body;

//     if (!message || !message.trim()) {
//       return res.status(400).json({ message: 'Question prompt is required' });
//     }

//     const query = message.trim();
//     const lower = query.toLowerCase();
//     let reply = '';

//     // Specialized Subject Knowledge Base
//     if (lower.includes('react') || lower.includes('jsx') || lower.includes('hook') || lower.includes('state') || lower.includes('useeffect')) {
//       reply = `🤖 **EduSphere AI**: In **React**, state and hooks allow components to hold and react to data updates dynamically.

// **Key Concepts:**
// • **State (\`useState\`)**: Local memory of a component that triggers re-rendering on change.
// • **Side Effects (\`useEffect\`)**: Used for data fetching, subscriptions, and DOM updates.
// • **Props**: Read-only properties passed down from parent to child components.

// **Code Example:**
// \`\`\`javascript
// import React, { useState, useEffect } from 'react';

// export const Counter = () => {
//   const [count, setCount] = useState(0);
//   return (
//     <button onClick={() => setCount(count + 1)}>
//       Clicked {count} times
//     </button>
//   );
// };
// \`\`\``;
//     } else if (lower.includes('express') || lower.includes('node') || lower.includes('middleware') || lower.includes('route') || lower.includes('controller')) {
//       reply = `🤖 **EduSphere AI**: In **Node.js & Express**, requests flow through routes to controller middleware.

// **Key Concepts:**
// • **Routes**: Define HTTP endpoints (GET, POST, PUT, DELETE).
// • **Controllers**: Contain business logic and data manipulation.
// • **Middleware**: Functions that run between the incoming HTTP request and final response (e.g., Auth JWT guards).

// **Code Example:**
// \`\`\`javascript
// // Controller definition
// export const getItems = async (req, res) => {
//   try {
//     const items = await Item.find();
//     res.json(items);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };
// \`\`\``;
//     } else if (lower.includes('mongo') || lower.includes('mongoose') || lower.includes('schema') || lower.includes('collection') || lower.includes('database')) {
//       reply = `🤖 **EduSphere AI**: **MongoDB** is a NoSQL document database, and **Mongoose** provides schema-based modeling.

// **Key Concepts:**
// • **Collection**: Grouping of MongoDB documents (equivalent to a SQL table).
// • **Document**: JSON-like record stored in BSON format.
// • **Schema**: Structure definition specifying field types, validation, and defaults.

// **Code Example:**
// \`\`\`javascript
// import mongoose from 'mongoose';

// const userSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   email: { type: String, unique: true }
// });

// export default mongoose.model('User', userSchema);
// \`\`\``;
//     } else if (lower.includes('mvc') || lower.includes('architecture')) {
//       reply = `🤖 **EduSphere AI**: **MVC Architecture** separates software into three layers:

// 1. **Model**: Defines database schemas and data operations (e.g. Mongoose models).
// 2. **View**: User interface presented to learners (e.g. React JSX pages).
// 3. **Controller**: Business logic handling incoming API requests and coordinating models with views.`;
//     } else if (lower.includes('jwt') || lower.includes('auth') || lower.includes('token') || lower.includes('login') || lower.includes('security')) {
//       reply = `🤖 **EduSphere AI**: **JSON Web Tokens (JWT)** provide secure, stateless authentication.

// **Workflow:**
// 1. Student submits email & password to \`/api/auth/login\`.
// 2. Server validates credentials and returns a signed JWT token.
// 3. Client attaches \`Authorization: Bearer <token>\` header for protected API routes.`;
//     } else if (lower.includes('javascript') || lower.includes('js') || lower.includes('promise') || lower.includes('async')) {
//       reply = `🤖 **EduSphere AI**: **Async/Await** simplifies asynchronous JavaScript programming over traditional promises.

// **Code Example:**
// \`\`\`javascript
// const fetchData = async () => {
//   try {
//     const response = await fetch('/api/courses');
//     const data = await response.json();
//     console.log(data);
//   } catch (error) {
//     console.error('Error fetching data:', error);
//   }
// };
// \`\`\``;
//     } else if (lower.includes('html') || lower.includes('css') || lower.includes('flex') || lower.includes('grid') || lower.includes('style')) {
//       reply = `🤖 **EduSphere AI**: Modern **CSS Flexbox & Grid** allow responsive layout design.

// **Flexbox Example:**
// \`\`\`css
// .container {
//   display: flex;
//   justify-content: space-between;
//   align-items: center;
//   gap: 16px;
// }
// \`\`\``;
//     } else {
//       // Dynamic Answer Engine for any general doubt
//       reply = `🤖 **EduSphere AI Assistant**:

// Regarding your question: **"${query}"**

// In the context of **${lessonTitle || courseName || 'this lesson'}**:

// 1. **Explanation**: This concept is fundamental to mastering web development and software engineering. It ensures clean code organization and reliable system behavior.
// 2. **Key Takeaway**: Always review input constraints, handle potential edge cases asynchronously, and verify state changes.
// 3. **Next Step**: Check the accompanying video lecture or study PDF for examples, and test your understanding in the module quiz!

// If you would like a specific code snippet or step-by-step example for this, let me know!`;
//     }

//     res.json({
//       reply,
//       timestamp: new Date().toISOString()
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// new code for testing Ai
// @desc    EduSphere AI Learning Assistant (Doubt Solver Engine)
// @route   POST /api/ai/chat
// @access  Private (Student/Instructor)

export const askAIChatbot = async (req, res) => {
  try {
    const { message, courseName, lessonTitle } = req.body;

    // Validate question
    if (!message || !message.trim()) {
      return res.status(400).json({
        message: "Question prompt is required",
      });
    }

    const query = message.trim();
    const lower = query.toLowerCase();

    let reply = "";

    // React / JSX / Hooks / State
    if (
      lower.includes("react") ||
      lower.includes("jsx") ||
      lower.includes("hook") ||
      lower.includes("state") ||
      lower.includes("useeffect")
    ) {
      reply = `EduSphere AI: In React, state and hooks allow components to hold and react to data updates dynamically.

Key Concepts:

• State (useState): State is the local memory of a React component. When state changes, React re-renders the component.

• Side Effects (useEffect): useEffect is used for operations such as data fetching, subscriptions, and interacting with external systems.

• Props: Props are read-only values passed from a parent component to a child component.

Code Example:

import React, { useState } from "react";

export const Counter = () => {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(count + 1)}>
      Clicked {count} times
    </button>
  );
};

This example creates a counter using the useState hook. Every time the button is clicked, the count value increases.`;
    }

    // Node.js / Express
    else if (
      lower.includes("express") ||
      lower.includes("node") ||
      lower.includes("middleware") ||
      lower.includes("route") ||
      lower.includes("controller")
    ) {
      reply = `EduSphere AI: In Node.js and Express, requests normally flow through routes, middleware, and controllers.

Key Concepts:

• Routes: Routes define API endpoints such as GET, POST, PUT, and DELETE.

• Controllers: Controllers contain the main business logic of the application.

• Middleware: Middleware functions execute between the incoming request and the final response. Authentication middleware, logging middleware, and error-handling middleware are common examples.

Code Example:

export const getItems = async (req, res) => {
  try {
    const items = await Item.find();

    res.json(items);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

In this example, the controller retrieves items from the database and sends them as a response.`;
    }

    // MongoDB / Mongoose
    else if (
      lower.includes("mongo") ||
      lower.includes("mongoose") ||
      lower.includes("schema") ||
      lower.includes("collection") ||
      lower.includes("database")
    ) {
      reply = `EduSphere AI: MongoDB is a NoSQL document database, while Mongoose is a library that helps Node.js applications work with MongoDB.

Key Concepts:

• Collection: A collection is a group of MongoDB documents. It is similar to a table in a relational database.

• Document: A document is a record stored in MongoDB using BSON format.

• Schema: A Mongoose schema defines the structure, data types, validation rules, and default values of documents.

Code Example:

import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },
});

export default mongoose.model("User", userSchema);

This schema defines a User model with name and email fields.`;
    }

    // MVC Architecture
    else if (
      lower.includes("mvc") ||
      lower.includes("architecture")
    ) {
      reply = `EduSphere AI: MVC stands for Model, View, and Controller.

1. Model: The Model manages data and database operations. In EduSphere, Mongoose models can be used for this layer.

2. View: The View represents the user interface. In a MERN application, React is responsible for the user interface.

3. Controller: The Controller contains the business logic and handles requests and responses.

The main advantage of MVC architecture is that it separates different responsibilities, making the application easier to maintain and understand.`;
    }

    // JWT / Authentication
    else if (
      lower.includes("jwt") ||
      lower.includes("auth") ||
      lower.includes("token") ||
      lower.includes("login") ||
      lower.includes("security")
    ) {
      reply = `EduSphere AI: JSON Web Token, commonly called JWT, is commonly used for authentication in web applications.

Authentication Workflow:

1. The student enters an email and password.

2. The client sends the credentials to the login API.

3. The server verifies the credentials.

4. If the credentials are valid, the server creates a signed JWT.

5. The client stores the token.

6. The client sends the token with requests to protected API endpoints.

Example:

Authorization: Bearer your_jwt_token

The backend can verify the token before allowing the student to access protected resources.`;
    }

    // JavaScript
    else if (
      lower.includes("javascript") ||
      lower.includes("js") ||
      lower.includes("promise") ||
      lower.includes("async") ||
      lower.includes("await")
    ) {
      reply = `EduSphere AI: Async and Await are JavaScript features used to work with asynchronous operations.

Example:

const fetchData = async () => {
  try {
    const response = await fetch("/api/courses");

    const data = await response.json();

    console.log(data);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

The async keyword allows a function to perform asynchronous operations, while await pauses execution until a Promise is resolved.

This makes asynchronous JavaScript code easier to read and understand.`;
    }

    // HTML / CSS
    else if (
      lower.includes("html") ||
      lower.includes("css") ||
      lower.includes("flex") ||
      lower.includes("grid") ||
      lower.includes("style")
    ) {
      reply = `EduSphere AI: CSS Flexbox and CSS Grid are commonly used to create responsive layouts.

Flexbox is mainly useful for arranging elements in one direction, either horizontally or vertically.

Example:

.container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

CSS Grid is useful when you need to create layouts with rows and columns.

For example, Grid is commonly used for course cards, dashboards, and gallery layouts.`;
    }

    // General Question
    else {
      reply = `EduSphere AI:

Your question is related to ${
        lessonTitle || courseName || "this lesson"
      }.

Explanation:

This is an important concept in software development. To understand it properly, first identify the main idea, then understand how it works, and finally practice it with a small example.

Key Takeaway:

Try to understand the concept step by step rather than memorizing the answer.

Next Step:

Review the lesson material and try implementing a small example related to this topic.

Question:

${query}

If you provide more details about your doubt, I can explain it with a simple example or code.`;
    }

    // Send response
    return res.status(200).json({
      reply: reply,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("AI Chatbot Error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};