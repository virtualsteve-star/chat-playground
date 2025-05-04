/**
 * Main JavaScript file for Steve's Chat Playground
 * Initializes and manages the chat application
 */

// Global variables
let currentModel = null;
let currentPersonality = null;
let messageHistory = [];
let blocklistFilter = null;
let selectedInputFilters = [];
let selectedOutputFilters = [];

// Initialize the application
async function initializeApp() {
    try {
        // Initialize blocklist filter
        blocklistFilter = new window.BlocklistFilter();
        await blocklistFilter.initialize();
        
        // Load configuration files
        const modelsConfig = window.ChatUtils.loadProperties('config/models.properties');
        const stylesConfig = window.ChatUtils.loadProperties('config/styles.properties');
        const personalitiesConfig = window.ChatUtils.loadProperties('config/personalities.properties');
        
        // Populate personality selector
        const personalitySelector = document.getElementById('personality-selector');
        for (const [name, config] of Object.entries(personalitiesConfig)) {
            const option = document.createElement('option');
            option.value = name;
            
            // Parse configuration to get model name
            const [modelName, resourcePath] = config.split(',').map(part => part.trim());
            
            // Extract the name and role from the full name
            // Example: "Eliza (Psychoanalyst)" -> name="Eliza", role="Psychoanalyst"
            const nameParts = name.split(' (');
            const displayName = nameParts[0];
            const role = nameParts.length > 1 ? nameParts[1].replace(')', '') : '';
            
            // Create a shorter model name for display
            let displayModelName = modelName;
            if (modelName === 'SimpleBot') {
                displayModelName = 'SimpleBot';
            } else if (modelName === 'ChatGPT 4o-mini') {
                displayModelName = 'GPT';
            }
            
            // Format: "Name (Role, Model)" - exactly matching the examples
            option.textContent = `${displayName} (${role}, ${displayModelName})`;
            
            personalitySelector.appendChild(option);
        }
        
        // Set up event listeners
        document.getElementById('personality-selector').addEventListener('change', handlePersonalityChange);
        document.getElementById('style-selector').addEventListener('change', handleStyleChange);
        document.getElementById('send-button').addEventListener('click', handleSendMessage);
        document.getElementById('user-input').addEventListener('keydown', handleKeyDown);
        
        // Initialize with default style
        window.ChatUtils.changeStyle('vanilla');
        
        // Auto-select the first personality
        if (personalitySelector.options.length > 0) {
            personalitySelector.selectedIndex = 0;
            handlePersonalityChange({ target: personalitySelector });
        }
        
        // Setup Guardrails panel
        setupGuardrailsPanel();
        
        console.log('Application initialized successfully');
    } catch (error) {
        console.error('Error initializing application:', error);
        alert('Failed to initialize the application. Please check the console for details.');
    }
}

// Handle personality change - REVERTED to clear history and view
function handlePersonalityChange(event) {
    const personalityName = event.target.value;
    if (!personalityName) return;

    console.log(`[${Date.now()}] Personality Change: Starting for '${personalityName}'`);
    try {
        // Load configuration files
        const personalitiesConfig = window.ChatUtils.loadProperties('config/personalities.properties');
        const modelsConfig = window.ChatUtils.loadProperties('config/models.properties');
        
        // Get personality configuration
        const config = personalitiesConfig[personalityName];
        if (!config) {
            throw new Error(`No configuration found for personality "${personalityName}"`);
        }
        
        // Parse configuration (expected format: "model,resource")
        const [modelName, resourcePath] = config.split(',').map(part => part.trim());
        if (!modelName || !resourcePath) {
            throw new Error(`Invalid configuration for personality "${personalityName}"`);
        }
        
        // Determine current mode BEFORE changing history
        const isTerminalMode = document.body.classList.contains('green-screen');

        // Create and initialize the appropriate model
        if (modelName === 'SimpleBot' || modelName === 'ChatGPT 4o-mini') {
            // Create the appropriate model instance
            currentModel = modelName === 'SimpleBot' ? new window.SimpleBotModel() : new window.OpenAIModel();
            
            currentModel.initialize(resourcePath).then(() => {
                console.log(`[${Date.now()}] Personality Change: Model initialized for '${personalityName}'`);
                currentPersonality = personalityName;

                // Construct the greeting message
                const personalityNameOnly = personalityName.split(' (')[0];
                const role = personalityName.match(/\((.*?)\)/)[1].toLowerCase();
                const modelInfo = modelName === 'SimpleBot' ? 'built with SimpleBot' : `based on ${modelName}`;
                const greeting = `Hello! I'm ${personalityNameOnly}, your ${role} bot ${modelInfo}. How can I help you today?`;

                // Clear message history and start fresh with ONLY the greeting
                console.log(`[${Date.now()}] Personality Change: Clearing history and adding greeting.`);
                messageHistory = [{ role: 'assistant', content: greeting }];

                // Clear the appropriate view and add the greeting
                if (isTerminalMode) {
                    console.log(`[${Date.now()}] Personality Change: Clearing terminal and adding greeting.`);
                    const terminalWindow = document.getElementById('terminal-window');
                    if (terminalWindow) {
                        terminalWindow.innerHTML = ''; // Clear
                        appendToTerminal(greeting, 'system-response'); // Add greeting
                        // Add the prompt structure (since view is cleared)
                        const newInput = addTerminalPrompt(terminalWindow);
                        if (newInput) setTimeout(() => newInput.focus(), 0); // Focus
                    } else {
                        console.error('Terminal window not found during personality change');
                    }
                } else {
                    console.log(`[${Date.now()}] Personality Change: Clearing chat window and adding greeting.`);
                    const chatWindow = document.getElementById('chat-window');
                    if (chatWindow) {
                        chatWindow.innerHTML = ''; // Clear
                        window.ChatUtils.addMessageToChat(greeting, false); // Add greeting
                        const userInput = document.getElementById('user-input');
                        if (userInput) userInput.focus(); // Focus non-terminal input
                     }
                }

                console.log(`Switched to personality: ${personalityName}`);
            }).catch(error => {
                console.error('Error initializing model:', error);
                alert(`Failed to initialize model for "${personalityName}". Please check the console for details.`);
            });
        } else {
            throw new Error(`Unsupported model: ${modelName}`);
        }
    } catch (error) {
        console.error('Error changing personality:', error);
        alert(`Failed to load personality "${personalityName}". Please check the console for details.`);
    }
}

// Handle style change - REVERTED to preserve history and manage UI visibility
function handleStyleChange(event) {
    const styleName = event.target.value;
    
    // More reliable style detection
    let oldStyle = 'vanilla'; // default
    if (document.body.classList.contains('green-screen')) {
        oldStyle = 'green-screen';
    } else if (document.body.classList.contains('dark-mode')) {
        oldStyle = 'imessage-dark';
    } else {
        // Check all stylesheets to determine current style
        document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
            if (!link.disabled) {
                if (link.href.includes('imessage-dark')) oldStyle = 'imessage-dark';
                else if (link.href.includes('imessage')) oldStyle = 'imessage';
                else if (link.href.includes('green-screen')) oldStyle = 'green-screen';
                else if (link.href.includes('vanilla')) oldStyle = 'vanilla';
            }
        });
    }
                     
    if (styleName === oldStyle) return;

    console.log(`[${Date.now()}] handleStyleChange: START - From '${oldStyle}' to '${styleName}'`);
    window.ChatUtils.changeStyle(styleName);

    const terminalWindow = document.getElementById('terminal-window');
    const chatWindow = document.getElementById('chat-window');
    const modernInterface = document.querySelector('.modern-interface');
    const terminalInterface = document.querySelector('.terminal-interface');

    // --- UI Visibility Control ---
    if (styleName === 'green-screen') {
        if (modernInterface) modernInterface.style.display = 'none';
        if (terminalInterface) terminalInterface.style.display = ''; // Use default (likely block)
        document.body.classList.add('green-screen'); 
    } else {
        if (modernInterface) modernInterface.style.display = ''; // Use default
        if (terminalInterface) terminalInterface.style.display = 'none';
        document.body.classList.remove('green-screen');
    }
    // --- End UI Visibility --- 

    // Remove old listeners if switching away from terminal
    if (oldStyle === 'green-screen' && styleName !== 'green-screen') {
        console.log(`[${Date.now()}] Style Change: Removing terminal listeners.`);
        terminalWindow.removeEventListener('keydown', handleTerminalKeyDown);
        terminalWindow.removeEventListener('click', handleTerminalClick);
    }
    
    // Setup based on NEW style
    if (styleName === 'green-screen') {
        console.log(`[${Date.now()}] Style Change: Switched TO green-screen. Redrawing history.`);
        // Redraw history into terminal
        terminalWindow.innerHTML = ''; // Clear terminal
        messageHistory.forEach(msg => {
            if (msg.role === 'user') {
                appendToTerminal(`> ${msg.content}`, 'user-command');
            } else if (msg.role === 'assistant') {
                appendToTerminal(msg.content, 'system-response');
            }
        });
        const newInput = addTerminalPrompt(terminalWindow); // Add ONE prompt

        // Add listeners if we just entered terminal mode
        if (oldStyle !== 'green-screen') {
             console.log(`[${Date.now()}] Style Change: Adding terminal listeners.`);
             terminalWindow.addEventListener('keydown', handleTerminalKeyDown);
             terminalWindow.addEventListener('click', handleTerminalClick);
        }
        
        // Set focus immediately
        if (newInput) {
             console.log(`[${Date.now()}] Style Change: Focusing terminal input immediately.`);
             try {
                newInput.focus();
             } catch (focusError) {
                console.error(`[${Date.now()}] Error during immediate focus in handleStyleChange:`, focusError);
             }
        }
         // Scroll after redraw (keep timeout for scroll)
         setTimeout(() => terminalWindow.scrollTop = terminalWindow.scrollHeight, 0);

    } else { // Switched to any non-terminal style
        console.log(`[${Date.now()}] Style Change: Switched to non-terminal. Redrawing history.`);
        // Redraw history into chat window
        chatWindow.innerHTML = ''; // Clear chat
        messageHistory.forEach(msg => {
            window.ChatUtils.addMessageToChat(msg.content, msg.role === 'user');
        });
        
        // Focus regular input with a slight delay to ensure DOM is ready
        setTimeout(() => {
            const userInput = document.getElementById('user-input');
            if (userInput) {
                userInput.focus();
                // Ensure the input is visible and interactive
                userInput.style.opacity = '1';
                userInput.style.pointerEvents = 'auto';
            }
        }, 100);
        
        // Scroll after redraw
        setTimeout(() => chatWindow.scrollTop = chatWindow.scrollHeight, 0);
    }
    console.log(`[${Date.now()}] handleStyleChange: END - From '${oldStyle}' to '${styleName}'`);
}

// Delegated Keydown Handler for Terminal
function handleTerminalKeyDown(event) {
    if (event.key === 'Enter' && event.target.id === 'terminal-input') {
        event.preventDefault();
        const currentInput = event.target;
        const command = currentInput.textContent.trim();
        if (!command) return;

        // Process the command, passing the element to modify later
        processTerminalCommand(currentInput, command);
    }
}

// Delegated Click Handler for Terminal
function handleTerminalClick(event) {
    const controls = document.querySelector('.controls');
    // Don't handle clicks on the input itself or the controls
    if (!controls.contains(event.target)) {
        const currentInput = document.getElementById('terminal-input');
        // Let the browser handle focus, just ensure the input gets it if clicking elsewhere
        if (currentInput && !currentInput.contains(event.target)) {
            // Use a minimal timeout to avoid conflicts
            setTimeout(() => currentInput.focus(), 0);
        }
    }
}

// Adds the terminal prompt structure
function addTerminalPrompt(passedTerminalWindow) {
    const newPromptDiv = document.createElement('div');
    newPromptDiv.className = 'terminal-prompt';
    const promptSymbolSpan = document.createElement('span');
    promptSymbolSpan.className = 'prompt';
    promptSymbolSpan.textContent = '> ';
    const newInputSpan = document.createElement('span');
    newInputSpan.id = 'terminal-input';
    newInputSpan.className = 'input';
    newInputSpan.contentEditable = 'true';
    newInputSpan.spellcheck = false;
    
    newPromptDiv.appendChild(promptSymbolSpan);
    newPromptDiv.appendChild(newInputSpan);

    // Get the target window directly to avoid issues
    const targetWindow = document.getElementById('terminal-window');
    if (targetWindow) {
        targetWindow.appendChild(newPromptDiv);
        
        // Ensure focus is set after all DOM operations
        requestAnimationFrame(() => {
            // Small delay to ensure layout is complete
            setTimeout(() => {
                newInputSpan.focus();
                // Force scroll to bottom
                targetWindow.scrollTop = targetWindow.scrollHeight;
            }, 50);
        });
    } else {
        // Fallback or error if #terminal-window isn't found (shouldn't happen here)
        console.error("!!! Critical Error: #terminal-window not found in addTerminalPrompt !!!");
    }

    return newInputSpan; // Return the new input span for focusing
}

// Helper for output filtering
function applyOutputFilters(response) {
    if (blocklistFilter && selectedOutputFilters.length > 0) {
        const filterResult = blocklistFilter.checkMessageWithSelection(response, selectedOutputFilters);
        if (filterResult.blocked) {
            return "I'm sorry, but my previous response contained inappropriate language and has been removed.";
        }
    }
    return response;
}

// Handle sending a message (modern chat UI)
async function handleSendMessage() {
    const userInput = document.getElementById('user-input');
    const message = userInput.value.trim();
    
    if (!message) return;

    // Blocklist filter check (with selection)
    if (blocklistFilter) {
        const filterResult = blocklistFilter.checkMessageWithSelection(message, selectedInputFilters);
        if (filterResult.blocked) {
            const rejectionMessage = blocklistFilter.getRejectionMessage(filterResult);
            window.ChatUtils.addMessageToChat(rejectionMessage, false);
            userInput.value = '';
            return;
        }
    }
    // Clear input
    userInput.value = '';
    // Add user message to chat
    window.ChatUtils.addMessageToChat(message, true);
    // Add to message history
    messageHistory.push({ role: 'user', content: message });
    // Show working indicator
    window.ChatUtils.toggleWorkingIndicator(true);
    try {
        if (!currentModel) {
            throw new Error('No model selected');
        }
        // Generate response
        let response = await currentModel.generateResponse(message, { messages: messageHistory });
        // Apply output filters
        response = applyOutputFilters(response);
        // Handle streaming response (unchanged)
        if (response && typeof response[Symbol.asyncIterator] === 'function') {
            let fullResponse = '';
            const messageElements = window.ChatUtils.createMessageElement('', false);
            const messageElement = messageElements.bubble; // Extract the bubble element
            // Hide feedback controls on all previous bot message entries first
            const chatWindow = document.getElementById('chat-window');
            const messageEntries = chatWindow.getElementsByClassName('message-entry bot-entry');
            Array.from(messageEntries).forEach(entry => {
                const feedbackDiv = entry.querySelector('.message-feedback');
                if (feedbackDiv) {
                    feedbackDiv.classList.remove('visible');
                }
            });
            // Create wrapper div for the message entry
            const messageEntry = document.createElement('div');
            messageEntry.className = 'message-entry bot-entry';
            messageEntry.appendChild(messageElement);
            // If feedback exists, add it to the entry too
            if (messageElements.feedback) {
                messageEntry.appendChild(messageElements.feedback);
                messageElements.feedback.classList.add('visible');
            }
            // Add the complete entry to the chat window
            document.getElementById('chat-window').appendChild(messageEntry);
            try {
                let lastUpdateTime = Date.now();
                let responseComplete = false;
                for await (const chunk of response) {
                    if (chunk) {
                        fullResponse += chunk;
                        messageElement.textContent = fullResponse;
                        document.getElementById('chat-window').scrollTop = document.getElementById('chat-window').scrollHeight;
                        lastUpdateTime = Date.now();
                    }
                }
                // We've completed the stream loop normally
                responseComplete = true;
                // Ensure any pending content is fully rendered
                messageElement.textContent = fullResponse;
                document.getElementById('chat-window').scrollTop = document.getElementById('chat-window').scrollHeight;
            } catch (streamError) {
                console.error('Error in stream:', streamError);
                if (!fullResponse) {
                    messageEntry.remove();
                    throw streamError;
                }
            }
            // Add to message history only if we got a response
            if (fullResponse) {
                messageHistory.push({ role: 'assistant', content: fullResponse });
            }
        } else {
            // Handle non-streaming response
            if (response) {
                window.ChatUtils.addMessageToChat(response, false);
                messageHistory.push({ role: 'assistant', content: response });
            }
        }
    } catch (error) {
        console.error('Error generating response:', error);
        window.ChatUtils.addMessageToChat('Sorry, I encountered an error while processing your message. Please try again.', false);
    } finally {
        // Hide working indicator
        window.ChatUtils.toggleWorkingIndicator(false);
    }
}

// Handle key down event (for Enter key)
function handleKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        handleSendMessage();
    }
}

// Guardrails panel logic
function setupGuardrailsPanel() {
    const guardrailsBtn = document.getElementById('guardrails-btn');
    const guardrailsPanel = document.getElementById('guardrails-panel');
    const guardrailsOverlay = document.getElementById('guardrails-overlay');
    const closeBtn = document.getElementById('close-guardrails-panel');
    const inputFiltersSection = document.getElementById('input-filters-section');
    const inputFiltersChildren = document.getElementById('input-filters-children');
    const checkboxes = inputFiltersChildren.querySelectorAll('.input-filter-checkbox');
    const outputFiltersSection = document.getElementById('output-filters-section');
    const outputFiltersChildren = document.getElementById('output-filters-children');
    const outputCheckboxes = outputFiltersChildren.querySelectorAll('.output-filter-checkbox');

    // Tree expand/collapse
    let filtersOpen = false;
    let outputFiltersOpen = false;

    // Open panel
    guardrailsBtn.addEventListener('click', () => {
        guardrailsPanel.classList.add('open');
        guardrailsOverlay.classList.add('open');
        // Expand Input Filters by default
        filtersOpen = true;
        inputFiltersChildren.style.display = '';
        inputFiltersSection.innerHTML = '&#9660; Input Filters';
        // Expand Output Filters by default
        outputFiltersOpen = true;
        outputFiltersChildren.style.display = '';
        outputFiltersSection.innerHTML = '&#9660; Output Filters';
    });
    // Close panel
    closeBtn.addEventListener('click', () => {
        guardrailsPanel.classList.remove('open');
        guardrailsOverlay.classList.remove('open');
    });
    guardrailsOverlay.addEventListener('click', () => {
        guardrailsPanel.classList.remove('open');
        guardrailsOverlay.classList.remove('open');
    });
    inputFiltersSection.addEventListener('click', () => {
        filtersOpen = !filtersOpen;
        inputFiltersChildren.style.display = filtersOpen ? '' : 'none';
        inputFiltersSection.innerHTML = (filtersOpen ? '&#9660;' : '&#9654;') + ' Input Filters';
    });
    outputFiltersSection.addEventListener('click', () => {
        outputFiltersOpen = !outputFiltersOpen;
        outputFiltersChildren.style.display = outputFiltersOpen ? '' : 'none';
        outputFiltersSection.innerHTML = (outputFiltersOpen ? '&#9660;' : '&#9654;') + ' Output Filters';
    });
    // Track selected filters
    checkboxes.forEach(cb => {
        cb.checked = false; // Default: none selected
        cb.addEventListener('change', () => {
            selectedInputFilters = Array.from(checkboxes).filter(c => c.checked).map(c => c.value);
        });
    });
    selectedInputFilters = []; // Default: none selected
    // Track selected output filters
    outputCheckboxes.forEach(cb => {
        cb.checked = false; // Default: none selected
        cb.addEventListener('change', () => {
            selectedOutputFilters = Array.from(outputCheckboxes).filter(c => c.checked).map(c => c.value);
        });
    });
    selectedOutputFilters = []; // Default: none selected
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);

function appendToTerminal(text, className) {
    const terminalWindow = document.getElementById('terminal-window');
    const line = document.createElement('div');
    line.className = `terminal-line ${className}`;
    line.textContent = text;
    terminalWindow.appendChild(line);
    terminalWindow.scrollTop = terminalWindow.scrollHeight;
}

async function processTerminalCommand(inputElementToProcess, command) {
    const terminalWindow = document.getElementById('terminal-window');
    if (!terminalWindow) return; // Should not happen in terminal mode

    // Blocklist filter check (with selection)
    if (blocklistFilter) {
        const filterResult = blocklistFilter.checkMessageWithSelection(command, selectedInputFilters);
        if (filterResult.blocked) {
            const rejectionMessage = blocklistFilter.getRejectionMessage(filterResult);
            appendToTerminal(rejectionMessage, 'system-response');
            // Mark input as processed
            inputElementToProcess.removeAttribute('id');
            inputElementToProcess.contentEditable = 'false';
            inputElementToProcess.classList.remove('input');
            inputElementToProcess.textContent = command;
            const currentPromptDiv = inputElementToProcess.closest('.terminal-prompt, .terminal-line');
            if (currentPromptDiv) {
                currentPromptDiv.className = 'terminal-line user-command';
            }
            // Add a new prompt
            addTerminalPrompt(terminalWindow);
            return;
        }
    }

    // Add to message history FIRST (before any awaits)
    messageHistory.push({ role: 'user', content: command });

    // Show working indicator
    window.ChatUtils.toggleWorkingIndicator(true);

    let responseReceived = false;

    try {
        if (!currentModel) throw new Error('No model selected');
        let response = await currentModel.generateResponse(command, { messages: messageHistory });
        // Apply output filters
        response = applyOutputFilters(response);

        // Handle non-streaming response
        appendToTerminal(response, 'system-response');
        messageHistory.push({ role: 'assistant', content: response });
        responseReceived = true;
    } catch (error) {
        console.error('Error generating response:', error);
        appendToTerminal(`Error: ${error.message || 'Command processing failed. Please try again.'}`, 'system-response');
        responseReceived = true;
    } finally {
        window.ChatUtils.toggleWorkingIndicator(false);

        // Mark input as processed
        inputElementToProcess.removeAttribute('id');
        inputElementToProcess.contentEditable = 'false';
        inputElementToProcess.classList.remove('input');
        inputElementToProcess.textContent = command;
        const currentPromptDiv = inputElementToProcess.closest('.terminal-prompt, .terminal-line');
        if (currentPromptDiv) {
            currentPromptDiv.className = 'terminal-line user-command';
        }

        // Add a new prompt
        addTerminalPrompt(terminalWindow);
    }
} 