// server.js
// Import necessary modules and configurations for the server setup
import express from 'express';
import bodyParser from 'body-parser';
import 'dotenv/config'; // Loads environment variables from a .env file into process.env
import OpenAI from "openai";

// Import custom modules for routing and logging
import router from './routes/routes.js'; 
import logger from './logger.js';
import config from './config.js';

// Initialize the Express app
const app = express();
const PORT = config.port || 3000;

// Configure Express app settings and middleware.
// Set EJS as the view engine for rendering views.
app.set('view engine', 'ejs');
// Serve static files from the 'public' directory.
app.use(express.static('public'));
// Parse incoming JSON requests and add the parsed data to 'req.body'
app.use(bodyParser.json());
// Parse incoming URL-encoded requests and add the parsed data to `req.body`.
app.use(bodyParser.urlencoded({ extended: true }));

// Register the router middleware for handling routes.
app.use('/', router);

// Initialize the OpenAI API client with API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})
// Start the server and log the listening port.
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

/**
 * Section for GPT Assistants Initialization
 * This section initializes variables for chat, task, and slide generation assistants along with their threads
 * and role seeds, based on configuration settings.
 */

let chatAssistant = null;
let taskAssistant = null;
let slideGenAssistant = null;

let chatThread = null;
let taskThread = null;
let slideGenThread = null;

let roleSeedsChat = "";
let roleSeedsTask = "";
let roleSeedsSlideGen = "";

// Configure role or seed words based on the prompt strategy
switch (config['prompt_strategy']) {
  case "role":
    roleSeedsChat = config['role_chat'];
    roleSeedsTask = config['role_task'];
    roleSeedsSlideGen = config['role_slide_gen'];
    break;
  case "seed_word":
    roleSeedsChat = config['seed_words_chat'];
    roleSeedsTask = config['seed_words_task'];
    roleSeedsSlideGen = config['seed_words_slide_gen'];
    break;
  default:
    break;
}

/**
 * Initializes GPT assistants for chat, task management, and slide generation based on the provided category.
 * It sets up each assistant with specific instructions and configurations, then creates threads for operations.
 * 
 * @param {Request} req - The request object, containing the category within the body.
 * @param {Response} res - The response object used to send back the initialization status.
*/
app.post('/initAssistants', async (req,res) => {   
  // Extract the general discipline from the request body.
  const topic =  req.body.category;
  const promptType = req.body.promptType;
  
  switch (promptType) {
    case "role":
      roleSeedsChat = config['role_chat'];
      roleSeedsTask = config['role_task'];
      roleSeedsSlideGen = config['role_slide_gen'];
      break;
    case "seed_word":
      roleSeedsChat = config['seed_words_chat'];
      roleSeedsTask = config['seed_words_task'];
      roleSeedsSlideGen = config['seed_words_slide_gen'];
      break;
    default:
      break;
  }

  // Environment variable for the GPT model.
  const model = process.env.GPT_MODELL;
  // Initialize the chat assistant
  chatAssistant = await openai.beta.assistants.create({
    name: topic + " Tutor (Chat)",
    instructions: roleSeedsChat.replace(/\[\[general discipline\]\]/g, topic),
    tools: [{ type: "code_interpreter" }],
    model: model
  });
  // Initialize the task assistant
  taskAssistant = await openai.beta.assistants.create({
    name: topic + " Tutor (Task)",
    instructions: roleSeedsTask.replace(/\[\[general discipline\]\]/g, topic),
    tools: [{ type: "code_interpreter" }],
    model: model
  });
  // initialise the slide generating assistant
  slideGenAssistant = await openai.beta.assistants.create({
    name: topic + " Tutor (SlideGen)",
    instructions: roleSeedsSlideGen.replace(/\[\[general discipline\]\]/g, topic),
    tools: [{ type: "code_interpreter" }],
    model: model
  });

  // Create new Threads for each assistant's operations.
  chatThread = await openai.beta.threads.create();
  taskThread = await openai.beta.threads.create();
  slideGenThread = await openai.beta.threads.create();  

  // finishing initialisation
  res.json({status: 'done'});
});

/**
 * Processes a message within a given assistant thread, initializing the assistant if necessary.
 * This function sends a user message to a specific thread, processes it using an assistant,
 * and waits for the completion of the processing to retrieve the result.
 * 
 * @param {string} message - The user message to be processed.
 * @param {Object|null} thread - The thread object where the message is to be added; may be null initially.
 * @param {Object|null} assistant - The assistant object to process the message; may be null initially.
 * @param {string} threadInstruction - Specific instructions for the assistant within the thread.
 * @returns {Promise<string>} The processed message result from the assistant.
*/
const processAssistantThread = async (message, thread, assistant, threadInstruction, promptType) => {
  // Add the user message to the thread.  
  await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: message
  });

  // Process the new message in the thread with the assistant.
  const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistant.id,
      instructions: threadInstruction
  });

  // Function to wait for the completion of the message processing.
  const waitForCompletion = async () => {
    const runState = await openai.beta.threads.runs.retrieve(thread.id, run.id);

    if (runState.status === "completed") {
      // Retrieve and return the latest message content when processing is complete.
      const messages = await openai.beta.threads.messages.list(thread.id);
      if(messages.data[0].content[0] != []) {
        if(process.env.LOGGING_ENABLED) {    
          logger.info({
            message: message,
            answer: messages.data[0].content[0].text.value,
            promptType: promptType
          });
        }

        return messages.data[0].content[0].text.value;
      } else {
        return "Error processing your message";
      }
    } else {
      // Wait for 0.5 seconds before checking the run state again.
      await new Promise(resolve => setTimeout(resolve, 500)); 
      // Recursively call itself until processing is completed.
      return waitForCompletion(); 
    }
  };

  return waitForCompletion();
}

/**
 * Handles incoming requests to the chat assistant endpoint.
*/
app.post('/chatAssistant', async (req,res) => {
  // Retrieve the chat prompt instructions from the configuration.
  const threadInstruction = config.chat_prompt;
  
  // Process the message through the chat assistant and await the response.
  const response = await processAssistantThread(
    threadInstruction + "\n\n" + req.body.message, 
    chatThread, chatAssistant, threadInstruction,
    req.body.promptType
  );
  
  // Send the processed response back to the client.
  res.json({ message: response});
});

/**
 * Handles incoming requests to the task assistant endpoint.
*/
app.post('/taskAssistant', async (req,res) => {
  // Retrieve the task prompt instructions from the configuration.
  const threadInstruction = config.task_eva_prompt;

  // Process the message through the task assistant and await the response.
  const response = await processAssistantThread(
    threadInstruction + "\n\n" + req.body.message, 
    taskThread, taskAssistant, threadInstruction,
    req.body.promptType
  );
  
  // Send the processed response back to the client.
  res.json({ message: response});
});

/**
 * Handles incoming requests to the slide generation assistant endpoint.
*/
app.post('/slideGenAssistant', async (req,res) => {
  // Retrieve the slide generation prompt instructions from the configuration.
  const threadInstruction = config.slide_gen_prompt;

  // Process the message through the slide generation assistant and await the response.
  const response = await processAssistantThread(
    threadInstruction + "\n\n" + req.body.message, 
    slideGenThread, slideGenAssistant, threadInstruction,
    req.body.promptType
  );
  
  // Send the processed response back to the client.
  res.json({ message: response});
});