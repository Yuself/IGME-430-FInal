# Archive Guard RPG Final Documentation

## Project Purpose

Archive Guard RPG is a dialogue-based web app built with React, Express, MongoDB, Redis, and Handlebars. The user logs in, talks to an archive guard NPC, and compares two conversation modes: a baseline mode and a structured mode. The goal is to test whether a lightly controlled NPC, with tracked attitude and objective values, feels more consistent than a basic chatbot-style response.

The app also saves completed conversations, lets users review the quality of a conversation, and allows them to view their own saved history later. The project is meant to be a small RPG-style prototype, but it also includes the account, session, storage, and documentation requirements of the course project.

## React Usage and Components

The React code is in the client folder and is bundled by webpack into the hosted assets folder.

client/login.jsx handles the login and signup forms. client/app.jsx contains the main logged-in app, including the home section, chat interface, NPC status panel, conversation review, account status, premium demo controls, and password change form. client/history.jsx renders the saved conversation history page. client/helper.js contains shared helper functions for form submission and error messages.

The main React components include Navbar, HomeSection, ModeToggle, NPCStatusPanel, MessageList, MessageInput, ChatSection, AccountSection, HowItWorksSection, AboutSection, ConversationList, ConversationDetail, HistoryPage, LoginWindow, and SignupWindow. These components are used for dynamic page behavior, form handling, chat updates, account status updates, and saved conversation display.

## MongoDB Data Stored

The app stores two main Mongoose models.

The Account model stores the username, hashed password, premium tier, premium expiration date, and account creation date. Passwords are stored as bcrypt hashes. The premium fields support the proof-of-concept subscription model.

The Conversation model stores saved chat records. Each conversation belongs to one account. It stores the conversation title, selected mode, debug visibility, messages, final NPC attitude and objective, turn count, review scores, issue flags, optional notes, and timestamps.

Sessions store the logged-in account object in req.session.account. This is used to protect pages and to make sure users only access their own saved conversations.

## Profit Model

Archive Guard RPG uses a proof-of-concept premium subscription model. From the account page, a logged-in user can activate a demo premium plan for an hourly, daily, weekly, or monthly duration. The server saves the selected plan and expiration date on the user account.

The project does not collect payment information. The point of the feature is to show how the app could support premium account tiers without implementing real billing for this class project. Users can activate a plan, see their premium status, see when it expires, and cancel back to the free state.

## What Went Right

The account system fit well with the rest of the app. Once the login and session middleware were working, I could protect the main app, account page, chat routes, and history routes without repeating the same login checks everywhere. Saving conversations also worked well because each conversation is tied to the current account, so the history page can show only the logged-in user’s records.

The baseline and structured chat modes became the strongest part of the project. Baseline mode gives a simpler guard response, while structured mode tracks the guard’s attitude and objective so the NPC has a clearer role. I also added fallback responses when Ollama is unavailable, which made the chat more reliable during testing.

## What Went Wrong

The project grew larger than I expected. It started from a course starter structure, but the final version needed to become its own app with a new theme, new routes, conversation storage, account management, a premium demo, password changes, and endpoint documentation. Cleaning out the old starter references also took more time than I expected because names could appear in routes, templates, assets, bundled files, and visible page text.

The local model connection also created some uncertainty. Ollama worked during local testing, but a deployed version would need a reachable model endpoint or would need to rely on the fallback responses. This made me think more carefully about how much of the app should depend on an external service being available.

## What Was Learned

I learned how the main parts of a full-stack Express project connect to each other. Express handles the routes, Handlebars serves the page shells, React controls the interactive frontend, MongoDB stores users and conversations, Redis keeps sessions persistent, and webpack bundles the client files.

I also learned that a working feature is not the same as a finished feature. The chat could run before the project was ready to submit, but the final app also needed password change, premium account state, clear routing, 404 handling, documentation, build scripts, and consistent branding. The final cleanup was just as important as the first working version.

The NPC system also taught me that an LLM character needs boundaries. A model can generate a reply, but a game NPC needs a role, a goal, and some state to make the interaction feel intentional. The structured mode was my attempt to keep the guard closer to the archive scenario instead of letting the conversation feel like a general chatbot.

## Future Improvements

If I continued this project, I would connect the premium system to a real payment processor and add clearer limits for free accounts. I would also add automated tests for route validation, login redirects, and conversation ownership checks.

For the chat system, I would improve the structured mode by adding more world state, such as whether the player has gained trust, found a clue, or attempted to force entry. I would also add delete and export options for saved conversations.

For deployment, I would write clearer setup instructions for MongoDB, Redis, session secrets, and the model endpoint.

## Above and Beyond

The project goes beyond a basic account app by making the chat interaction the center of the experience. Users can compare baseline and structured NPC behavior, save completed conversations, and review the conversation afterward.

The history page, review fields, Ollama-backed response path, fallback response system, and premium account-state demo all add functionality beyond a simple login-and-save-data app. These features support the RPG concept instead of existing only as separate technical requirements.

## Borrowed Code and Code Fragments

This project began from the IGME 430 DomoMaker course starter structure. I used the starter mainly for the login, signup, session, routing, Mongoose, Handlebars, webpack, and React bundling patterns.

The final app was significantly changed from that starter. The Domo model, controller, routes, images, and visible references were removed. I added the Archive Guard RPG interface, chat controller, conversation model, saved history page, review data, password change flow, premium demo state, themed 404 page, and updated documentation.

I did not intentionally copy outside tutorial snippets beyond the course starter structure and normal use of library APIs such as Express, React, Mongoose, bcrypt, Redis, and webpack.

## Testing and Verification

I tested the project locally with npm.cmd run build and npm.cmd test. Both passed. Webpack compiled the app, login, and history bundles successfully. ESLint reported zero errors, with seven existing no-console warnings in server/controllers/Chat.js.

I also tested local baseline and structured chat calls with Ollama, and both modes returned responses successfully during testing.

## Deployment Notes

The deployed app needs MongoDB and Redis connection variables, along with SESSION_SECRET. The local .env file should stay ignored and should not be submitted.

Ollama is used for local testing unless OLLAMA_URL and OLLAMA_MODEL are configured for a compatible hosted endpoint. If the model service is unavailable, the chat controller uses fallback responses so the app can still run.

## Endpoint Documentation

Middleware names refer to server/middleware/index.js.

### GET /login

Middleware: requiresSecure, requiresLogout

Renders the login page for logged-out users. In production, insecure requests are redirected to HTTPS. Logged-in users are redirected to /app.

Params: none

Return type: HTML page or redirect

Status codes: 200, 302

### POST /login

Middleware: requiresSecure, requiresLogout

Authenticates an account, stores the account API object in the session, and returns the app redirect target.

Body params: username, pass

Return type: JSON

Status codes: 200, 302, 400, 401, 500

### POST /signup

Middleware: requiresSecure, requiresLogout

Creates a new account after validating the username, password, and password confirmation. The password is hashed before the account is saved. The new account is stored in the session after signup.

Body params: username, pass, pass2

Return type: JSON

Status codes: 200, 302, 400, 500

### POST /changePassword

Middleware: requiresLogin

Allows a logged-in user to change their password. The route checks the current password, validates the new password, hashes the new password, saves it, and refreshes the session account object.

Body params: currentPass, newPass, newPass2

Return type: JSON

Status codes: 200, 302, 400, 401, 500

### GET /accountStatus

Middleware: requiresLogin

Returns the logged-in user’s username and premium status. If the premium date has expired, the account is treated as free.

Params: none

Return type: JSON

Status codes: 200, 302, 404, 500

### POST /activatePremium

Middleware: requiresLogin

Activates a demo premium plan and saves the selected tier and expiration date on the account.

Body params: plan. Valid plans are hourly, daily, weekly, and monthly.

Return type: JSON

Status codes: 200, 302, 400, 404, 500

### POST /cancelPremium

Middleware: requiresLogin

Cancels the demo premium status and returns the account to the free state.

Params: none

Return type: JSON

Status codes: 200, 302, 404, 500

### GET /logout

Middleware: requiresLogin

Destroys the current session and redirects the user to the login page.

Params: none

Return type: redirect

Status codes: 302

### GET /app

Middleware: requiresLogin

Renders the main logged-in React app page.

Params: none

Return type: HTML page or redirect

Status codes: 200, 302

### GET /maker

Middleware: requiresLogin

Legacy redirect to /app.

Params: none

Return type: redirect

Status codes: 302

### POST /chat

Middleware: requiresLogin

Receives a player message and selected chat mode. Baseline mode builds a simpler NPC prompt. Structured mode derives NPC state and builds a more controlled prompt. The controller tries to use the configured Ollama endpoint and falls back to local template responses if generation fails.

Body params: message, mode

Return type: JSON

Status codes: 200, 302, 400

Environment notes: OLLAMA_URL and OLLAMA_MODEL can be used to configure the model endpoint.

### POST /saveConversation

Middleware: requiresLogin

Saves a completed conversation for the logged-in account. The route validates the mode and message array before storing the conversation.

Body params: title, mode, debugVisible, messages, finalAttitude, finalObjective, turnCount, review

Return type: JSON

Status codes: 201, 302, 400, 500

### GET /history

Middleware: requiresLogin

Renders the logged-in conversation history page.

Params: none

Return type: HTML page or redirect

Status codes: 200, 302

### GET /getConversations

Middleware: requiresLogin

Returns the logged-in user’s saved conversations, sorted by most recently updated.

Params: none

Return type: JSON

Status codes: 200, 302, 500

### GET /getConversationById

Middleware: requiresLogin

Returns one saved conversation only if it belongs to the logged-in user.

Query params: id

Return type: JSON

Status codes: 200, 302, 400, 404, 500

### GET /

Middleware: requiresSecure, requiresLogout

Renders the login page for logged-out users. Logged-in users are redirected to /app.

Params: none

Return type: HTML page or redirect

Status codes: 200, 302

### Unmatched Routes

Middleware: none

Unknown API-style requests return a JSON error. Unknown HTML page requests render the themed 404 page.

Params: none

Return type: JSON or HTML page

Status codes: 404