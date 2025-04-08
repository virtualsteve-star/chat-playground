/**
 * Main JavaScript file for Steve's Chat Playground
 * Initializes and manages the chat application
 */

// Global variables
let currentModel = null;
let currentPersonality = null;
let messageHistory = [];

// Initialize the application
function initializeApp() {
    try {
        // Load configuration files
        const modelsConfig = window.ChatUtils.loadProperties('config/models.properties');
        const stylesConfig = window.ChatUtils.loadProperties('config/styles.properties');
        const personalitiesConfig = window.ChatUtils.loadProperties('config/personalities.properties');
        
        // Populate personality selector
        const personalitySelector = document.getElementById('personality-selector');
        for (const [name, config] of Object.entries(personalitiesConfig)) {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
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
        
        console.log('Application initialized successfully');
    } catch (error) {
        console.error('Error initializing application:', error);
        alert('Failed to initialize the application. Please check the console for details.');
    }
}

// Handle personality change
function handlePersonalityChange(event) {
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
        
        // Clear the chat window and message history
        const chatWindow = document.getElementById('chat-window');
        chatWindow.innerHTML = '';
        messageHistory = [];
        
        // Create and initialize the appropriate model
        if (modelName === 'Eliza') {
            currentModel = new window.ElizaModel();
            currentModel.initialize(resourcePath).then(() => {
                currentPersonality = personalityName;
                
                // Add a welcome message
                const greeting = `Hello! I'm your ${personalityName}. How can I help you today?`;
                if (document.body.classList.contains('green-screen')) {
                    const terminalWindow = document.getElementById('terminal-window');
                    terminalWindow.innerHTML = '';
                    appendToTerminal(greeting, 'system-response');
                    
                    // Re-add the prompt
                    const promptElement = document.createElement('div');
                    promptElement.className = 'terminal-prompt';
                    promptElement.innerHTML = '<span class="prompt">> </span><span id="terminal-input" class="input" contenteditable="true" spellcheck="false"></span>';
                    terminalWindow.appendChild(promptElement);
                    
                    // Ensure terminal input is focused
                    setTimeout(() => {
                        const terminalInput = document.getElementById('terminal-input');
                        if (terminalInput) {
                            terminalInput.focus();
                        }
                    }, 100);
                } else {
                    window.ChatUtils.addMessageToChat(greeting, false);
                    messageHistory.push({ role: 'assistant', content: greeting });
                    const userInput = document.getElementById('user-input');
                    if (userInput) userInput.focus();
                }
                
                console.log(`Switched to personality: ${personalityName}`);
            }).catch(error => {
                console.error('Error initializing model:', error);
                alert(`Failed to initialize model for "${personalityName}". Please check the console for details.`);
            });
        } else if (modelName === 'ChatGPT 4o-mini') {
            currentModel = new window.OpenAIModel();
            currentModel.initialize(resourcePath).then(() => {
                currentPersonality = personalityName;
                
                // Add a welcome message
                const greeting = `Hello! I'm your ${personalityName}. How can I help you today?`;
                if (document.body.classList.contains('green-screen')) {
                    const terminalWindow = document.getElementById('terminal-window');
                    terminalWindow.innerHTML = '';
                    appendToTerminal(greeting, 'system-response');
                    
                    // Re-add the prompt
                    const promptElement = document.createElement('div');
                    promptElement.className = 'terminal-prompt';
                    promptElement.innerHTML = '<span class="prompt">> </span><span id="terminal-input" class="input" contenteditable="true" spellcheck="false"></span>';
                    terminalWindow.appendChild(promptElement);
                    
                    // Ensure terminal input is focused
                    setTimeout(() => {
                        const terminalInput = document.getElementById('terminal-input');
                        if (terminalInput) {
                            terminalInput.focus();
                        }
                    }, 100);
                } else {
                    window.ChatUtils.addMessageToChat(greeting, false);
                    messageHistory.push({ role: 'assistant', content: greeting });
                    const userInput = document.getElementById('user-input');
                    if (userInput) userInput.focus();
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

// Handle style change
function handleStyleChange(event) {
    const styleName = event.target.value;
    window.ChatUtils.changeStyle(styleName);
    
    // Toggle terminal mode
    document.body.classList.remove('green-screen');
    if (styleName === 'green-screen') {
        document.body.classList.add('green-screen');
        
        // Transfer existing conversation to terminal format
        const terminalWindow = document.getElementById('terminal-window');
        
        // Clear any existing content in terminal window
        terminalWindow.innerHTML = '';
        
        // Add initial greeting if this is the first time
        if (messageHistory.length === 0 && currentPersonality) {
            const greeting = `Hello! I'm your ${currentPersonality}. How can I help you today?`;
            appendToTerminal(greeting, 'system-response');
            messageHistory.push({ role: 'assistant', content: greeting });
        }
        
        // Transfer each message from the chat history
        messageHistory.forEach(msg => {
            if (msg.role === 'user') {
                appendToTerminal(`> ${msg.content}`, 'user-command');
            } else if (msg.role === 'assistant') {
                appendToTerminal(msg.content, 'system-response');
            }
        });
        
        // Add the prompt at the end
        const promptElement = document.createElement('div');
        promptElement.className = 'terminal-prompt';
        promptElement.innerHTML = '<span class="prompt">> </span><span id="terminal-input" class="input" contenteditable="true" spellcheck="false"></span>';
        terminalWindow.appendChild(promptElement);
        
        // Set up terminal input handling and ensure focus
        setupTerminalInput();
        
        // Ensure terminal input is focused
        setTimeout(() => {
            const terminalInput = document.getElementById('terminal-input');
            if (terminalInput) {
                terminalInput.focus();
            }
        }, 100);
        
        // Ensure we're scrolled to the bottom
        terminalWindow.scrollTop = terminalWindow.scrollHeight;
    } else {
        // Transfer terminal messages back to chat format if switching away from terminal
        const terminalWindow = document.getElementById('terminal-window');
        const chatWindow = document.getElementById('chat-window');
        
        // Clear chat window
        chatWindow.innerHTML = '';
        
        // Add initial greeting if this is the first time
        if (messageHistory.length === 0 && currentPersonality) {
            const greeting = `Hello! I'm your ${currentPersonality}. How can I help you today?`;
            window.ChatUtils.addMessageToChat(greeting, false);
            messageHistory.push({ role: 'assistant', content: greeting });
        }
        
        // Transfer all messages from history
        messageHistory.forEach(msg => {
            window.ChatUtils.addMessageToChat(msg.content, msg.role === 'user');
        });
        
        // Focus the regular input after a short delay to ensure DOM is ready
        setTimeout(() => {
            const userInput = document.getElementById('user-input');
            if (userInput) {
                userInput.focus();
            }
        }, 100);
    }
}

// Terminal-specific functions
function setupTerminalInput() {
    const terminalInput = document.getElementById('terminal-input');
    const terminalWindow = document.getElementById('terminal-window');
    const controls = document.querySelector('.controls');
    
    // Focus the input initially
    terminalInput.focus();
    
    // Handle terminal input
    terminalInput.addEventListener('keydown', async function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            
            const command = terminalInput.textContent.trim();
            if (!command) return;
            
            // Clear input
            terminalInput.textContent = '';
            
            // Add command to terminal and message history
            appendToTerminal(`> ${command}`, 'user-command');
            messageHistory.push({ role: 'user', content: command });
            
            // Show working indicator
            window.ChatUtils.toggleWorkingIndicator(true);
            
            try {
                // Generate response
                const response = await currentModel.generateResponse(command, { messages: messageHistory });
                
                // Handle streaming response
                if (response && typeof response[Symbol.asyncIterator] === 'function') {
                    let fullResponse = '';
                    let responseElement = null;
                    
                    for await (const chunk of response) {
                        if (chunk) {
                            if (!responseElement) {
                                responseElement = document.createElement('div');
                                responseElement.className = 'terminal-line system-response';
                                terminalWindow.appendChild(responseElement);
                            }
                            fullResponse += chunk;
                            responseElement.textContent = fullResponse;
                            terminalWindow.scrollTop = terminalWindow.scrollHeight;
                        }
                    }
                    messageHistory.push({ role: 'assistant', content: fullResponse });
                } else {
                    // Handle non-streaming response
                    appendToTerminal(response, 'system-response');
                    messageHistory.push({ role: 'assistant', content: response });
                }
            } catch (error) {
                console.error('Error generating response:', error);
                appendToTerminal('Error: Command processing failed. Please try again.', 'system-response');
            } finally {
                // Hide working indicator
                window.ChatUtils.toggleWorkingIndicator(false);
                // Move prompt to end
                const promptElement = document.querySelector('.terminal-prompt');
                if (promptElement) {
                    terminalWindow.appendChild(promptElement);
                }
                terminalWindow.scrollTop = terminalWindow.scrollHeight;
                terminalInput.focus();
            }
        }
    });
    
    // Only refocus input when clicking in the terminal window, not the controls
    document.addEventListener('click', function(event) {
        // Don't refocus if clicking on or inside the controls section
        if (!controls.contains(event.target)) {
            terminalInput.focus();
        }
    });
    
    // Handle focus on dropdowns
    const dropdowns = document.querySelectorAll('select');
    dropdowns.forEach(dropdown => {
        dropdown.addEventListener('change', function(event) {
            // After selection, return focus to terminal input
            setTimeout(() => terminalInput.focus(), 100);
        });
    });
}

function appendToTerminal(text, className) {
    const terminalWindow = document.getElementById('terminal-window');
    const line = document.createElement('div');
    line.className = `terminal-line ${className}`;
    
    // Only add the prompt for user input that's being echoed
    if (className === 'user-command') {
        line.textContent = text;  // The '>' is already in the text from the prompt
    } else {
        line.textContent = text;
    }
    
    terminalWindow.appendChild(line);
    terminalWindow.scrollTop = terminalWindow.scrollHeight;
}

function updateLastTerminalLine(text) {
    const terminalWindow = document.getElementById('terminal-window');
    const lines = terminalWindow.getElementsByClassName('terminal-line');
    if (lines.length > 0) {
        const lastLine = lines[lines.length - 1];
        lastLine.textContent = text;
    } else {
        appendToTerminal(text, 'system-response');
    }
}

// Handle send message
async function handleSendMessage() {
    const userInput = document.getElementById('user-input');
    const message = userInput.value.trim();
    
    if (!message) return;
    
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
        const response = await currentModel.generateResponse(message, { messages: messageHistory });
        
        // Handle streaming response
        if (response && typeof response[Symbol.asyncIterator] === 'function') {
            let fullResponse = '';
            const messageElement = window.ChatUtils.createMessageElement('', false);
            document.getElementById('chat-window').appendChild(messageElement);
            
            try {
                for await (const chunk of response) {
                    if (chunk) {
                        fullResponse += chunk;
                        messageElement.textContent = fullResponse;
                        document.getElementById('chat-window').scrollTop = document.getElementById('chat-window').scrollHeight;
                    }
                }
            } catch (streamError) {
                console.error('Error in stream:', streamError);
                if (!fullResponse) {
                    messageElement.remove();
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

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp); 