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
        
        // Setup Preferences panel
        setupPreferencesPanel();
    } catch (error) {
        console.error('Error initializing application:', error);
        alert('Failed to initialize the application. Please check the console for details.');
    }
}

// Handle personality change - REVERTED to clear history and view
async function handlePersonalityChange(event) {
    const personalityName = event.target.value;
    if (!personalityName) return;

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

        // --- NEW: Check for OpenAI key immediately if GPT model selected ---
        const isGPT = (modelName === 'ChatGPT 4o-mini');
        if (isGPT) {
            // Get key from localStorage using the proper getApiKey function
            const key = window.ChatUtils.getApiKey('openai');
            if (!key) {
                alert('A valid OpenAI API key is required to use this personality. Please add your API key in Preferences.');
                return;
            }
            // Proceed with model initialization with the key
            await doModelInit(key);
        } else {
            // Proceed with model initialization for non-GPT models
            await doModelInit();
        }

        // --- Model initialization logic extracted for reuse ---
        async function doModelInit(apiKey = null) {
            if (modelName === 'SimpleBot' || modelName === 'ChatGPT 4o-mini') {
                // Create the appropriate model instance
                currentModel = modelName === 'SimpleBot' ? new window.SimpleBotModel() : new window.OpenAIModel();
                currentModel.initialize(resourcePath, apiKey).then(() => {
                    currentPersonality = personalityName;

                    // Construct the greeting message
                    const personalityNameOnly = personalityName.split(' (')[0];
                    const role = personalityName.match(/\((.*?)\)/)[1].toLowerCase();
                    const modelInfo = modelName === 'SimpleBot' ? 'built with SimpleBot' : `based on ${modelName}`;
                    const greeting = `Hello! I'm ${personalityNameOnly}, your ${role} bot ${modelInfo}. How can I help you today?`;

                    // Clear message history and start fresh with ONLY the greeting
                    messageHistory.length = 0;
                    messageHistory.push({ role: 'assistant', content: greeting });

                    // Clear the appropriate view and add the greeting
                    if (isTerminalMode) {
                        TerminalUI.showTerminalUI();
                        TerminalUI.initializeTerminalUI({
                            getModel: () => currentModel,
                            getMessageHistory: () => messageHistory
                        });
                        TerminalUI.redrawTerminalHistory();
                    } else {
                        const chatWindow = document.getElementById('chat-window');
                        if (chatWindow) {
                            chatWindow.innerHTML = ''; // Clear
                            window.ChatUtils.addMessageToChat(greeting, false); // Add greeting
                            const userInput = document.getElementById('user-input');
                            if (userInput) userInput.focus(); // Focus non-terminal input
                        }
                    }
                }).catch(error => {
                    console.error('Error initializing model:', error);
                    alert(`Failed to initialize model for "${personalityName}". Please check the console for details.`);
                });
            } else {
                throw new Error(`Unsupported model: ${modelName}`);
            }
        }
        // --- End model init logic ---
    } catch (error) {
        console.error('Error changing personality:', error);
        alert(`Failed to load personality "${personalityName}". Please check the console for details.`);
    }
}

// Handle style change - REVERTED to preserve history and manage UI visibility
function handleStyleChange(event) {
    const styleName = event.target.value;
    let oldStyle = 'vanilla';
    if (document.body.classList.contains('green-screen')) {
        oldStyle = 'green-screen';
    } else if (document.body.classList.contains('dark-mode')) {
        oldStyle = 'imessage-dark';
    } else {
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
    window.ChatUtils.changeStyle(styleName);
    const modernInterface = document.querySelector('.modern-interface');
    const terminalInterface = document.querySelector('.terminal-interface');
    if (styleName === 'green-screen') {
        if (modernInterface) modernInterface.style.display = 'none';
        TerminalUI.showTerminalUI();
        TerminalUI.initializeTerminalUI({
            getModel: () => currentModel,
            getMessageHistory: () => messageHistory
        });
        TerminalUI.redrawTerminalHistory();
    } else {
        if (modernInterface) modernInterface.style.display = '';
        TerminalUI.hideTerminalUI();
        TerminalUI.teardownTerminalUI();
        // Redraw chat window
        const chatWindow = document.getElementById('chat-window');
        chatWindow.innerHTML = '';
        messageHistory.forEach(msg => {
            window.ChatUtils.addMessageToChat(msg.content, msg.role === 'user');
        });
        setTimeout(() => {
            const userInput = document.getElementById('user-input');
            if (userInput) {
                userInput.focus();
                userInput.style.opacity = '1';
                userInput.style.pointerEvents = 'auto';
            }
        }, 100);
        setTimeout(() => chatWindow.scrollTop = chatWindow.scrollHeight, 0);
    }
}

// Helper for OpenAI Moderation rejection message (output)
function getOpenAIModerationOutputRejection(reason, probability) {
    const cat = reason === 'openai_sex' ? 'sexual content' : 'violent content';
    const percent = probability ? Math.round(probability * 100) : '?';
    return `I'm sorry, but my previous response contained inappropriate language and has been removed (OpenAI flagged as ${cat} with ${percent}% probability).`;
}

// Helper for output filtering (now async)
async function applyOutputFilters(response) {
    // Blocklist output filters
    if (blocklistFilter && selectedOutputFilters.length > 0) {
        const filterResult = blocklistFilter.checkMessageWithSelection(response, selectedOutputFilters.filter(f => f === 'sex' || f === 'violence'));
        if (filterResult.blocked) {
            return "I'm sorry, but my previous response contained inappropriate language and has been removed.";
        }
    }
    // OpenAI Moderation output filters
    if (selectedOutputFilters.includes('openai_sex') || selectedOutputFilters.includes('openai_violence')) {
        const openAIFilter = new window.OpenAIModerationFilter();
        const checkSex = selectedOutputFilters.includes('openai_sex');
        const checkViolence = selectedOutputFilters.includes('openai_violence');
        const modResult = await openAIFilter.check(response, { checkSex, checkViolence });
        if (modResult.blocked) {
            let rejectionMessage = '';
            if (modResult.reason === 'no_api_key') {
                rejectionMessage = 'OpenAI API key is required for this output filter.';
            } else if (modResult.reason === 'api_error') {
                rejectionMessage = 'Error contacting OpenAI Moderation API.';
            } else {
                rejectionMessage = getOpenAIModerationOutputRejection(modResult.reason, modResult.probability);
            }
            return rejectionMessage;
        }
    }
    return response;
}

async function ensureOpenAIApiKey() {
    // Get key directly from localStorage
    return window.ChatUtils.getApiKey ? window.ChatUtils.getApiKey('openai') : null;
}

// Helper for OpenAI Moderation rejection message
function getOpenAIModerationRejection(reason, probability) {
    const cat = reason === 'openai_sex' ? 'sexual content' : 'violent content';
    const percent = probability ? Math.round(probability * 100) : '?';
    return `Sorry, I can't discuss that topic (OpenAI flagged as ${cat} with ${percent}% probability).`;
}

// Handle sending a message (modern chat UI)
async function handleSendMessage() {
    const userInput = document.getElementById('user-input');
    const message = userInput.value.trim();
    
    if (!message) return;

    // OpenAI Moderation filter check (with selection)
    if (selectedInputFilters.includes('openai_sex') || selectedInputFilters.includes('openai_violence')) {
        const openAIFilter = new window.OpenAIModerationFilter();
        const checkSex = selectedInputFilters.includes('openai_sex');
        const checkViolence = selectedInputFilters.includes('openai_violence');
        const modResult = await openAIFilter.check(message, { checkSex, checkViolence });
        if (modResult.blocked) {
            let rejectionMessage = '';
            if (modResult.reason === 'no_api_key') {
                rejectionMessage = 'OpenAI API key is required for this filter.';
            } else if (modResult.reason === 'api_error') {
                rejectionMessage = 'Error contacting OpenAI Moderation API.';
            } else {
                rejectionMessage = getOpenAIModerationRejection(modResult.reason, modResult.probability);
            }
            window.ChatUtils.addMessageToChat(rejectionMessage, false);
            userInput.value = '';
            return;
        }
    }

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
        // Apply output filters (now async)
        response = await applyOutputFilters(response);
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

// Setup Preferences panel
function setupPreferencesPanel() {
    const prefsBtn = document.getElementById('preferences-btn');
    const prefsPanel = document.getElementById('preferences-panel');
    const prefsOverlay = document.getElementById('preferences-overlay');
    const closeBtn = document.getElementById('close-preferences-panel');
    const addKeyBtn = document.getElementById('add-openai-key');
    const clearKeyBtn = document.getElementById('clear-openai-key');
    const keyStatus = document.getElementById('openai-key-status');

    // Update key status display
    function updateKeyStatus() {
        const key = window.ChatUtils.getApiKey('openai');
        const keyStatus = document.getElementById('openai-key-status');
        const clearKeyBtn = document.getElementById('clear-openai-key');
        const addKeyBtn = document.getElementById('add-openai-key');
        
        if (key) {
            keyStatus.textContent = 'Set';
            clearKeyBtn.style.display = 'inline-block';
            addKeyBtn.style.display = 'none';
        } else {
            keyStatus.textContent = 'Not Set';
            clearKeyBtn.style.display = 'none';
            addKeyBtn.style.display = 'inline-block';
        }
    }

    // Open panel
    prefsBtn.addEventListener('click', () => {
        console.log('Opening preferences panel');
        prefsPanel.classList.add('open');
        prefsOverlay.classList.add('open');
        // Re-select the clear key button in case it was added dynamically
        const clearKeyBtn = document.getElementById('clear-openai-key');
        console.log('Clear key button on panel open:', clearKeyBtn);
        updateKeyStatus();
    });

    // Close panel
    closeBtn.addEventListener('click', () => {
        prefsPanel.classList.remove('open');
        prefsOverlay.classList.remove('open');
    });

    prefsOverlay.addEventListener('click', () => {
        prefsPanel.classList.remove('open');
        prefsOverlay.classList.remove('open');
    });

    // Add Key button handler
    addKeyBtn.addEventListener('click', async () => {
        const key = prompt('Please enter your OpenAI API key:');
        if (key) {
            const sanitizedKey = window.ChatUtils.sanitizeOpenAIKey(key);
            if (window.ChatUtils.validateOpenAIKeyFormat(sanitizedKey)) {
                if (await window.ChatUtils.testOpenAIKey(sanitizedKey)) {
                    window.ChatUtils.saveApiKey('openai', sanitizedKey);
                    updateKeyStatus();
                } else {
                    alert('Invalid API key. Please check your key and try again.');
                }
            } else {
                alert('Invalid API key format. Please enter a valid OpenAI API key.');
            }
        }
    });

    // Clear Key button handler
    clearKeyBtn.addEventListener('click', () => {
        window.ChatUtils.saveApiKey('openai', null);
        if (currentModel && currentModel.clearApiKey) {
            currentModel.clearApiKey();
        }
        updateKeyStatus();
    });

    // Initial status update
    updateKeyStatus();
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