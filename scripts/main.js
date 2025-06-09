/**
 * Main JavaScript file for Steve's Chat Playground
 * Initializes and manages the chat application
 */

// Clear any existing keys from old storage
try {
    localStorage.removeItem('openai');
} catch (error) {
    console.error('Error clearing old API keys:', error);
}

// Register the OpenAI chat API key before any access
window.apiKeyManager.register({
    id: 'openai.chat',
    provider: 'openai',
    label: 'OpenAI (Chat)'
});

// Global variables
let currentModel = null;
let currentPersonality = null;
let messageHistory = [];
let blocklistFilter = null;
let promptInjectionFilter = null;
let selectedInputFilters = [];
let selectedOutputFilters = [];
let openaiPromptInjectionFilter = null;
let codeOutputFilter = null;
let inputLengthFilter = null;
let rateLimitFilter = null;

// Initialize the application
async function initializeApp() {
    try {
        // Initialize filters
        inputLengthFilter = new window.InputLengthFilter();
        await inputLengthFilter.initialize();
        rateLimitFilter = new window.RateLimitFilter();
        await rateLimitFilter.initialize();
        
        blocklistFilter = new window.BlocklistFilter();
        await blocklistFilter.initialize();
        
        promptInjectionFilter = new window.PromptInjectionFilter();
        await promptInjectionFilter.initialize();
        promptInjectionFilter.setThreshold(10); // Lower threshold so critical rules block
        
        openaiPromptInjectionFilter = new window.OpenAIPromptInjectionFilter();
        
        codeOutputFilter = new window.CodeOutputFilter();
        await codeOutputFilter.initialize();
        
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

        // --- About panel logic ---
        const aboutBtn = document.getElementById('about-btn');
        const aboutPanel = document.getElementById('about-panel');
        const aboutOverlay = document.getElementById('about-overlay');
        const closeAboutBtn = document.getElementById('close-about-panel');
        if (aboutBtn && aboutPanel && aboutOverlay && closeAboutBtn) {
            aboutBtn.addEventListener('click', () => {
                aboutPanel.classList.add('open');
                aboutOverlay.classList.add('open');
            });
            closeAboutBtn.addEventListener('click', () => {
                aboutPanel.classList.remove('open');
                aboutOverlay.classList.remove('open');
            });
            aboutOverlay.addEventListener('click', () => {
                aboutPanel.classList.remove('open');
                aboutOverlay.classList.remove('open');
            });
        }

        // --- Custom Style Switcher Dropdown Logic ---
        const styleSwitcherBtn = document.getElementById('style-switcher-btn');
        const styleMenu = document.getElementById('style-menu');
        if (styleSwitcherBtn && styleMenu) {
            const styleOptions = styleMenu.querySelectorAll('.style-option');
            const styleSheet = document.getElementById('style-sheet');
            const styleMap = {
                'vanilla': 'Vanilla',
                'imessage': 'iMessage',
                'imessage-dark': 'iMessage (Dark)',
                'green-screen': 'Green Screen'
            };
            function setStyle(style) {
                // Use the original style switching logic for correct stacking and classes
                window.ChatUtils.changeStyle(style);
                // Button always shows the emoji
                styleSwitcherBtn.textContent = '👀';
                // Special handling for green-screen mode
                const modernInterface = document.querySelector('.modern-interface');
                const terminalInterface = document.querySelector('.terminal-interface');
                if (style === 'green-screen') {
                    if (modernInterface) modernInterface.style.display = 'none';
                    if (typeof TerminalUI !== 'undefined') {
                        TerminalUI.showTerminalUI();
                        TerminalUI.initializeTerminalUI({
                            getModel: () => currentModel,
                            getMessageHistory: () => messageHistory
                        });
                        TerminalUI.redrawTerminalHistory();
                    }
                } else {
                    if (modernInterface) modernInterface.style.display = '';
                    if (typeof TerminalUI !== 'undefined') {
                        TerminalUI.hideTerminalUI();
                        TerminalUI.teardownTerminalUI();
                    }
                    // Redraw chat window
                    const chatWindow = document.getElementById('chat-window');
                    if (chatWindow) {
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
            }
            styleSwitcherBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                styleMenu.classList.toggle('open');
            });
            styleOptions.forEach(option => {
                option.addEventListener('click', (e) => {
                    const style = option.getAttribute('data-style');
                    setStyle(style);
                    styleMenu.classList.remove('open');
                });
            });
            document.addEventListener('click', (e) => {
                if (styleMenu.classList.contains('open')) {
                    styleMenu.classList.remove('open');
                }
            });
            // Optionally, set initial style from current stylesheet
            const initialHref = styleSheet.getAttribute('href');
            const initialStyle = initialHref.match(/([\w-]+)\.css$/)?.[1] || 'vanilla';
            setStyle(initialStyle);
        }
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
            // Use hasKey for clarity and consistency
            if (!window.apiKeyManager.hasKey('openai.chat')) {
                alert('A valid OpenAI API key is required to use this personality. Please add your API key in Preferences.');
                return;
            }
            // Proceed with model initialization with the key
            const keyObj = window.apiKeyManager.get('openai.chat');
            await doModelInit(keyObj.get());
        } else {
            // Proceed with model initialization for non-GPT models
            await doModelInit();
        }

        // --- Model initialization logic extracted for reuse ---
        async function doModelInit(apiKey = null) {
            if (modelName === 'SimpleBot' || modelName === 'ChatGPT 4o-mini') {
                // Create the appropriate model instance
                currentModel = modelName === 'SimpleBot' ? new window.SimpleBotModel() : new window.OpenAIModel();
                currentModel.initialize(resourcePath, apiKey).then(async () => {
                    currentPersonality = personalityName;

                    let greeting = '';
                    if (modelName === 'SimpleBot') {
                        // Use the first greeting from the loaded script, if available
                        greeting = (currentModel.script && currentModel.script.greetings && currentModel.script.greetings.length > 0)
                            ? currentModel.script.greetings[0]
                            : 'Hello!';
                    } else if (modelName === 'ChatGPT 4o-mini') {
                        // Prompt the GPT bot to introduce itself and stream the result
                        greeting = '';
                        try {
                            let intro = await currentModel.generateResponse('Please introduce yourself');
                            const chatWindow = document.getElementById('chat-window');
                            if (intro && typeof intro[Symbol.asyncIterator] === 'function') {
                                let fullIntro = '';
                                // Create streaming message entry
                                if (chatWindow) {
                                    chatWindow.innerHTML = '';
                                    const messageElements = window.ChatUtils.createMessageElement('', false);
                                    const messageElement = messageElements.bubble;
                                    const messageEntry = document.createElement('div');
                                    messageEntry.className = 'message-entry bot-entry';
                                    messageEntry.appendChild(messageElement);
                                    if (messageElements.feedback) {
                                        messageEntry.appendChild(messageElements.feedback);
                                        messageElements.feedback.classList.add('visible');
                                    }
                                    chatWindow.appendChild(messageEntry);
                                    for await (const chunk of intro) {
                                        if (chunk) {
                                            fullIntro += chunk;
                                            messageElement.textContent = fullIntro;
                                            chatWindow.scrollTop = chatWindow.scrollHeight;
                                        }
                                    }
                                    greeting = fullIntro;
                                } else {
                                    // Fallback: just collect the full intro
                                    for await (const chunk of intro) {
                                        if (chunk) fullIntro += chunk;
                                    }
                                    greeting = fullIntro;
                                }
                            } else {
                                greeting = intro;
                            }
                        } catch (e) {
                            greeting = 'Hello! (Failed to get introduction from model)';
                        }
                    }

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

// Helper for OpenAI Moderation rejection message (output)
function getOpenAIModerationOutputRejection(reason, probability) {
    const cat = reason === 'openai_sex' ? 'sexual content' : 'violent content';
    const percent = probability ? Math.round(probability * 100) : '?';
    return `I'm sorry, but my previous response contained inappropriate language and has been removed (OpenAI flagged as ${cat} with ${percent}% probability).`;
}

// Helper for output filtering (now async)
// IMPORTANT: Always run low-cost, local filters first, then API filters. Stop at the first filter that blocks and return its rejection message.
async function applyOutputFilters(response) {
    // Build ordered list of enabled output filters: local first, then API
    const filterPipeline = [];
    // Local filters
    if (blocklistFilter && selectedOutputFilters.some(f => ['sex', 'violence'].includes(f))) {
        filterPipeline.push({
            name: 'blocklist',
            check: msg => blocklistFilter.checkMessageWithSelection(msg, selectedOutputFilters),
            getRejection: r => blocklistFilter.getRejectionMessage(r)
        });
    }
    if (codeOutputFilter && selectedOutputFilters.includes('code')) {
        filterPipeline.push({
            name: 'code',
            check: msg => codeOutputFilter.checkMessage(msg),
            getRejection: r => codeOutputFilter.getRejectionMessage(r)
        });
    }
    // API filters
    if (selectedOutputFilters.includes('openai_sex') || selectedOutputFilters.includes('openai_violence')) {
        filterPipeline.push({
            name: 'openai_moderation',
            check: async msg => {
                const openAIFilter = new window.OpenAIModerationFilter();
                const checkSex = selectedOutputFilters.includes('openai_sex');
                const checkViolence = selectedOutputFilters.includes('openai_violence');
                return await openAIFilter.check(msg, { checkSex, checkViolence });
            },
            getRejection: r => {
                if (r.reason === 'no_api_key') return 'OpenAI API key is required for this output filter.';
                if (r.reason === 'api_error') return 'Error contacting OpenAI Moderation API.';
                return getOpenAIModerationOutputRejection(r.reason, r.probability);
            }
        });
    }
    // Sequentially run each filter, stopping at the first block
    for (const filter of filterPipeline) {
        let result;
        if (filter.name.startsWith('openai')) {
            result = await filter.check(response);
        } else {
            result = filter.check(response);
        }
        if (result.blocked) {
            const rejection = filter.getRejection(result);
            return { text: rejection, rejected: true };
        }
    }
    return { text: response, rejected: false };
}

async function ensureOpenAIApiKey() {
    try {
        const key = await window.apiKeyManager.require('openai.chat');
        return key.get();
    } catch (error) {
        console.error('Error getting OpenAI API key:', error);
        return null;
    }
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

    // Show scanning bubble
    window.ChatUtils.addScanningBubble();

    // Local filters first
    // 0. Input Length filter check (with selection)
    if (selectedInputFilters.includes('input_length')) {
        const filterResult = inputLengthFilter.checkMessage(message);
        if (filterResult.blocked) {
            window.ChatUtils.removeScanningBubble();
            const rejectionMessage = inputLengthFilter.getRejectionMessage(filterResult);
            window.ChatUtils.addMessageToChat(rejectionMessage, false, true);
            userInput.value = '';
            return;
        }
    }
    // 1. Rate Limit filter check (with selection)
    if (selectedInputFilters.includes('rate_limit')) {
        const filterResult = rateLimitFilter.checkMessage();
        if (filterResult.blocked) {
            window.ChatUtils.removeScanningBubble();
            const rejectionMessage = rateLimitFilter.getRejectionMessage(filterResult);
            window.ChatUtils.addMessageToChat(rejectionMessage, false, true);
            userInput.value = '';
            return;
        }
    }
    // 2. Blocklist filter check (with selection)
    if (blocklistFilter) {
        const filterResult = blocklistFilter.checkMessageWithSelection(message, selectedInputFilters);
        if (filterResult.blocked) {
            window.ChatUtils.removeScanningBubble();
            const rejectionMessage = blocklistFilter.getRejectionMessage(filterResult);
            window.ChatUtils.addMessageToChat(rejectionMessage, false, true);
            userInput.value = '';
            return;
        }
    }

    // 3. Prompt Injection filter check
    if (selectedInputFilters.includes('prompt_injection')) {
        const filterResult = promptInjectionFilter.checkMessage(message);
        if (filterResult.blocked) {
            window.ChatUtils.removeScanningBubble();
            const rejectionMessage = promptInjectionFilter.getRejectionMessage(filterResult);
            window.ChatUtils.addMessageToChat(rejectionMessage, false, true);
            userInput.value = '';
            return;
        }
    }

    // API-based filters
    // 4. OpenAI Prompt Injection filter check
    if (selectedInputFilters.includes('openai_prompt_injection')) {
        const filterResult = await openaiPromptInjectionFilter.check(message);
        if (filterResult.blocked) {
            window.ChatUtils.removeScanningBubble();
            const rejectionMessage = openaiPromptInjectionFilter.getRejectionMessage(filterResult);
            window.ChatUtils.addMessageToChat(rejectionMessage, false, true);
            userInput.value = '';
            return;
        }
    }

    // 5. OpenAI Moderation filter check (with selection)
    if (selectedInputFilters.includes('openai_sex') || selectedInputFilters.includes('openai_violence')) {
        const openAIFilter = new window.OpenAIModerationFilter();
        const checkSex = selectedInputFilters.includes('openai_sex');
        const checkViolence = selectedInputFilters.includes('openai_violence');
        const modResult = await openAIFilter.check(message, { checkSex, checkViolence });
        if (modResult.blocked) {
            window.ChatUtils.removeScanningBubble();
            let rejectionMessage = '';
            if (modResult.reason === 'no_api_key') {
                rejectionMessage = 'OpenAI API key is required for this filter.';
            } else if (modResult.reason === 'api_error') {
                rejectionMessage = 'Error contacting OpenAI Moderation API.';
            } else {
                rejectionMessage = getOpenAIModerationRejection(modResult.reason, modResult.probability);
            }
            window.ChatUtils.addMessageToChat(rejectionMessage, false, true);
            userInput.value = '';
            return;
        }
    }

    // Clear input
    userInput.value = '';
    // Remove scanning bubble before adding user message
    window.ChatUtils.removeScanningBubble();
    // Add user message to chat
    window.ChatUtils.addMessageToChat(message, true);
    // Add to message history
    messageHistory.push({ role: 'user', content: message });

    // Generate response (ensure this is defined before using 'response')
    let response = await currentModel.generateResponse(message, { messages: messageHistory });

    // Output filtering/streaming logic
    if (selectedOutputFilters.length === 0) {
        // No output filters: stream response as it arrives
        if (response && typeof response[Symbol.asyncIterator] === 'function') {
            let fullResponse = '';
            const messageElements = window.ChatUtils.createMessageElement('', false);
            const messageElement = messageElements.bubble;
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
            chatWindow.appendChild(messageEntry);
            try {
                let lastUpdateTime = Date.now();
                let responseComplete = false;
                for await (const chunk of response) {
                    if (chunk) {
                        fullResponse += chunk;
                        messageElement.textContent = fullResponse;
                        chatWindow.scrollTop = chatWindow.scrollHeight;
                        lastUpdateTime = Date.now();
                    }
                }
                // We've completed the stream loop normally
                responseComplete = true;
                // Ensure any pending content is fully rendered
                messageElement.textContent = fullResponse;
                chatWindow.scrollTop = chatWindow.scrollHeight;
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
                // Replace \n with real newlines for SimpleBot responses
                if (currentModel instanceof window.SimpleBotModel) {
                    response = response.replace(/\\n/g, '\n');
                }
                window.ChatUtils.addMessageToChat(response, false);
                messageHistory.push({ role: 'assistant', content: response });
            }
        }
    } else {
        // Output filters enabled: show Working... bubble, collect response, then filter
        window.ChatUtils.addWorkingBubble();
        if (response && typeof response[Symbol.asyncIterator] === 'function') {
            let fullResponse = '';
            for await (const chunk of response) {
                if (chunk) fullResponse += chunk;
            }
            response = fullResponse;
        }
        window.ChatUtils.removeWorkingBubble();
        window.ChatUtils.addFilteringBubble();
        // Replace \n with real newlines for SimpleBot responses
        if (currentModel instanceof window.SimpleBotModel) {
            response = response.replace(/\\n/g, '\n');
        }
        response = await applyOutputFilters(response);
        window.ChatUtils.removeFilteringBubble();
        if (response && response.text) {
            window.ChatUtils.addMessageToChat(response.text, false, response.rejected);
            messageHistory.push({ role: 'assistant', content: response.text });
        }
    }
    // Show working indicator
    window.ChatUtils.toggleWorkingIndicator(false);
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
            // If enabling an OpenAI-powered filter, check for key
            if (cb.checked && (cb.value.startsWith('openai') || cb.value === 'openai_prompt_injection')) {
                if (!window.apiKeyManager.hasKey('openai.chat')) {
                    alert('A valid OpenAI API key is required to use this filter. Please add your API key in Preferences.');
                    cb.checked = false;
                    return;
                }
            }
            selectedInputFilters = Array.from(checkboxes).filter(c => c.checked).map(c => c.value);
        });
    });
    selectedInputFilters = []; // Default: none selected
    // Track selected output filters
    outputCheckboxes.forEach(cb => {
        cb.checked = false; // Default: none selected
        cb.addEventListener('change', () => {
            // If enabling an OpenAI-powered output filter, check for key
            if (cb.checked && cb.value.startsWith('openai')) {
                if (!window.apiKeyManager.hasKey('openai.chat')) {
                    alert('A valid OpenAI API key is required to use this filter. Please add your API key in Preferences.');
                    cb.checked = false;
                    return;
                }
            }
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
    const persistCheckbox = document.getElementById('openai-key-persist');

    // Default: unchecked (session-only)
    persistCheckbox.checked = false;

    // Update key status display and checkbox state
    function updateKeyStatus() {
        const key = window.apiKeyManager.get('openai.chat');
        const keyStatus = document.getElementById('openai-key-status');
        const clearKeyBtn = document.getElementById('clear-openai-key');
        const addKeyBtn = document.getElementById('add-openai-key');
        const persistCheckbox = document.getElementById('openai-key-persist');
        
        if (key.isSet()) {
            keyStatus.textContent = 'Set';
            clearKeyBtn.style.display = 'inline-block';
            addKeyBtn.style.display = 'none';
            persistCheckbox.disabled = true;
            persistCheckbox.checked = key.strategy.name === 'localStorage';
        } else {
            keyStatus.textContent = 'Not Set';
            clearKeyBtn.style.display = 'none';
            addKeyBtn.style.display = 'inline-block';
            persistCheckbox.disabled = false;
        }
    }

    // Open panel
    prefsBtn.addEventListener('click', () => {
        prefsPanel.classList.add('open');
        prefsOverlay.classList.add('open');
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
        try {
            // Set the storage strategy based on the checkbox before prompting
            const key = window.apiKeyManager.get('openai.chat');
            const usePersistent = persistCheckbox.checked;
            const strategy = usePersistent ? new window.LocalStorageStrategy() : new window.InMemoryStrategy();
            key.switchStrategy(strategy);
            await window.apiKeyManager.require('openai.chat');
            updateKeyStatus();
        } catch (error) {
            console.error('Error adding API key:', error);
        }
    });

    // Clear Key button handler
    clearKeyBtn.addEventListener('click', () => {
        window.apiKeyManager.clear('openai.chat');
        if (currentModel && currentModel.clearApiKey) {
            currentModel.clearApiKey();
        }
        updateKeyStatus();
    });

    // Listen for key changes
    window.apiKeyManager.on('keyChanged', () => {
        updateKeyStatus();
    });

    window.apiKeyManager.on('keyCleared', () => {
        updateKeyStatus();
    });

    window.apiKeyManager.on('strategyChanged', () => {
        updateKeyStatus();
    });

    // Checkbox change updates storage mode display
    persistCheckbox.addEventListener('change', () => {
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