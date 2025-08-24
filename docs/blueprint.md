# **App Name**: EduSpark AI

## Core Features:

- User Authentication: User authentication with registration, login, and session persistence (simulated using localStorage).
- Protected Routes: Protected routes to ensure only authenticated users can access the main application and activity details.
- Activity Generation: Generate three distinct offline educational activities, given a lesson name, computational thinking concept, subject area, and grade level. The output includes: a creative name, learning objective, simple materials list, step-by-step instructions, and a reflection question.
- AI Consultation: Users can ask questions, and the tool responds using the lesson context (if available) or general knowledge about computational thinking.
- Conversational UI: A chat-style interface guides users through specifying activity parameters (lesson name, concept, subject, grade).  Allows edits of the activity parameters during interaction.
- Activity Cards: Display generated activities as summarized cards within the chat, with navigation to a detailed view.
- Activity History: Keep the most recent 10 activities in local storage so users can easily go back and review past activities.

## Style Guidelines:

- Primary color: Soft blue (#75A9FF) to convey trust and serenity.
- Background color: Light grey (#F0F4F8), a desaturated version of the primary color, providing a clean and neutral backdrop.
- Accent color: Light purple (#B28DFF), an analogous hue to the primary color that creates contrast while remaining harmonious.
- Font pairing: 'Space Grotesk' (sans-serif) for headlines and 'Inter' (sans-serif) for body text.
- Code font: 'Source Code Pro' for displaying code snippets.
- Use simple, clear icons from ShadCN UI that align with educational topics.
- Subtle transitions and animations to provide feedback and guide the user through the application.