import { GoogleGenAI } from '@google/genai';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Fallback response generator if GEMINI_API_KEY is missing or fails
 */
const getFallbackReply = (query, courseName, lessonTitle) => {
  const lower = query.toLowerCase();

  if (
    lower.includes("react") ||
    lower.includes("jsx") ||
    lower.includes("hook") ||
    lower.includes("state") ||
    lower.includes("useeffect")
  ) {
    return `🤖 **EduSphere AI**: In **React**, state and hooks allow components to hold and react to data updates dynamically.

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
\`\`\`
*(Tip: Add your free Google Gemini API key to \`backend/.env\` under \`GEMINI_API_KEY\` from https://aistudio.google.com/ to unlock dynamic AI answers!)*`;
  }

  if (
    lower.includes("express") ||
    lower.includes("node") ||
    lower.includes("middleware") ||
    lower.includes("route") ||
    lower.includes("controller")
  ) {
    return `🤖 **EduSphere AI**: In **Node.js & Express**, requests flow through routes to controller middleware.

**Key Concepts:**
• **Routes**: Define HTTP endpoints (GET, POST, PUT, DELETE).
• **Controllers**: Contain business logic and data manipulation.
• **Middleware**: Functions that run between the incoming HTTP request and final response.

**Code Example:**
\`\`\`javascript
export const getItems = async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
\`\`\``;
  }

  if (
    lower.includes("mongo") ||
    lower.includes("mongoose") ||
    lower.includes("schema") ||
    lower.includes("collection") ||
    lower.includes("database")
  ) {
    return `🤖 **EduSphere AI**: **MongoDB** is a NoSQL document database, and **Mongoose** provides schema-based modeling.

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
  }

  return `🤖 **EduSphere AI**:
Regarding your question: **"${query}"** in **${lessonTitle || courseName || "your course"}**:

1. **Explanation**: Break down the concept into smaller parts, understand the logic, and test with small code examples.
2. **Key Takeaway**: Always verify syntax, test edge cases, and inspect runtime data.
3. **Next Step**: Review the accompanying video lecture, and feel free to ask more specific questions or request a code snippet!

*(Note: Add your free Gemini key to \`backend/.env\` under \`GEMINI_API_KEY\` from https://aistudio.google.com/ to get real-time dynamic AI explanations)*`;
};


// @desc    EduSphere AI Learning Assistant (Doubt Solver Engine)
// @route   POST /api/ai/chat
// @access  Public / Private (Student & Instructor)
export const askAIChatbot = async (req, res) => {
  try {
    const { message, courseName, lessonTitle, history, attachment } = req.body;

    // Validate question or attachment
    if ((!message || !message.trim()) && !attachment) {
      return res.status(400).json({
        message: "Question prompt or file attachment is required",
      });
    }

    const query = message ? message.trim() : "Please review and explain this attached document/image to clear my doubt.";
    const apiKey = process.env.GEMINI_API_KEY?.trim();

    // If API key is present, attempt live Google Gemini API call
    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });

        const systemInstruction = `You are "EduSphere AI", an intelligent, patient, and friendly programming and academic tutor inside EduSphere Learning Management System (LMS).
Your purpose is to help students solve doubts, explain software engineering concepts, inspect student code screenshots, analyze attached documents/diagrams, and guide their learning.

Current Context:
${courseName ? `- Course: "${courseName}"` : '- General Course Question'}
${lessonTitle ? `- Current Lesson / Topic: "${lessonTitle}"` : ''}

Response Guidelines:
1. Provide concise, clear, and encouraging responses tailored to students.
2. If the student attaches an image or code screenshot, thoroughly examine the code/error shown in the image and explain how to fix it.
3. If the student attaches a document, summarize the key points and answer any related question.
4. Use clean markdown formatting with bold text, bullet points, and code blocks with syntax highlighting where appropriate.
5. Keep the tone inspiring and supportive. Encourage hands-on practice.`;

        // Format conversation history for Gemini if supplied
        const contents = [];

        if (Array.isArray(history) && history.length > 0) {
          const recentHistory = history.slice(-6);
          recentHistory.forEach((msg) => {
            if (msg.sender === 'user') {
              contents.push({ role: 'user', parts: [{ text: msg.text }] });
            } else if (msg.sender === 'ai') {
              contents.push({ role: 'model', parts: [{ text: msg.text }] });
            }
          });
        }

        // Build parts for the current message
        const currentParts = [{ text: query }];

        // Check if an attachment was sent
        if (attachment && attachment.fileUrl) {
          try {
            // Extract local filename from fileUrl (e.g. .../uploads/chat/123_abc.png)
            const urlObj = new URL(attachment.fileUrl, 'http://localhost');
            const relativePath = urlObj.pathname.replace(/^\/uploads\//, '');
            const localFilePath = path.join(__dirname, '../uploads', relativePath);

            if (fs.existsSync(localFilePath)) {
              const fileBuffer = fs.readFileSync(localFilePath);
              const ext = path.extname(localFilePath).toLowerCase();

              let mimeType = 'text/plain';
              if (['.png'].includes(ext)) mimeType = 'image/png';
              else if (['.jpg', '.jpeg'].includes(ext)) mimeType = 'image/jpeg';
              else if (['.webp'].includes(ext)) mimeType = 'image/webp';
              else if (['.gif'].includes(ext)) mimeType = 'image/gif';
              else if (['.pdf'].includes(ext)) mimeType = 'application/pdf';
              else if (['.txt', '.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.html', '.css', '.json', '.md'].includes(ext)) {
                mimeType = 'text/plain';
              }

              // If text or source code, we can also inject text directly for 100% reliability
              if (['.txt', '.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.html', '.css', '.json', '.md', '.cpp', '.c'].includes(ext)) {
                const textContent = fileBuffer.toString('utf8');
                currentParts.push({
                  text: `\n\n[Attached File: ${attachment.fileName || 'file'}]\n\`\`\`\n${textContent.slice(0, 15000)}\n\`\`\``
                });
              } else {
                // Image or PDF file via inlineData
                currentParts.push({
                  inlineData: {
                    mimeType,
                    data: fileBuffer.toString('base64')
                  }
                });
              }
            }
          } catch (fileErr) {
            console.warn("Could not read attachment file:", fileErr?.message || fileErr);
          }
        }

        // Add user prompt with attachments
        contents.push({ role: 'user', parts: currentParts });

        // Call Gemini (gemini-3.6-flash is the active free model for Google AI Studio)
        const modelsToTry = ['gemini-3.6-flash', 'gemini-2.5-flash', 'gemini-1.5-flash'];
        let replyText = '';

        for (const model of modelsToTry) {
          try {
            const response = await ai.models.generateContent({
              model,
              contents,
              config: {
                systemInstruction,
                temperature: 0.7,
                maxOutputTokens: 1000
              }
            });

            replyText = response?.text?.trim();
            if (replyText) break;
          } catch (modelErr) {
            console.warn(`Model ${model} failed, trying next fallback:`, modelErr?.message || modelErr);
          }
        }

        if (replyText) {
          return res.status(200).json({
            reply: replyText,
            source: 'gemini',
            timestamp: new Date().toISOString()
          });
        }
      } catch (geminiError) {
        console.error("Google Gemini API call failed, falling back to local engine:", geminiError?.message || geminiError);
      }
    }

    // Graceful fallback response if GEMINI_API_KEY is not set or network fails
    const fallbackReply = getFallbackReply(query, courseName, lessonTitle);

    return res.status(200).json({
      reply: fallbackReply,
      source: 'curated_fallback',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("AI Chatbot Controller Error:", error);
    return res.status(500).json({
      message: error.message || "Failed to generate AI response",
    });
  }
};