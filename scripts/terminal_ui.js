// Terminal UI Module for Green Screen Mode
// Handles all terminal-specific DOM, input, and event logic
// Exports: initializeTerminalUI, showTerminalUI, hideTerminalUI, redrawTerminalHistory, teardownTerminalUI

(function(global) {
    let terminalWindow = null;
    let terminalInterface = null;
    let listenersAdded = false;
    let getModel = null;
    let getMessageHistory = null;
    let onCommandProcessed = null;

    function appendToTerminal(text, className) {
        if (!terminalWindow) terminalWindow = document.getElementById('terminal-window');
        const line = document.createElement('div');
        line.className = `terminal-line ${className}`;
        line.textContent = text;
        terminalWindow.appendChild(line);
        terminalWindow.scrollTop = terminalWindow.scrollHeight;
    }

    function addTerminalPrompt() {
        if (!terminalWindow) terminalWindow = document.getElementById('terminal-window');
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
        terminalWindow.appendChild(newPromptDiv);
        requestAnimationFrame(() => {
            setTimeout(() => {
                newInputSpan.focus();
                terminalWindow.scrollTop = terminalWindow.scrollHeight;
            }, 50);
        });
        return newInputSpan;
    }

    async function processTerminalCommand(inputElement, command) {
        inputElement.removeAttribute('id');
        inputElement.contentEditable = 'false';
        inputElement.classList.remove('input');
        inputElement.textContent = command;
        const currentPromptDiv = inputElement.closest('.terminal-prompt, .terminal-line');
        if (currentPromptDiv) {
            currentPromptDiv.className = 'terminal-line user-command';
        }
        if (typeof getMessageHistory === 'function') {
            getMessageHistory().push({ role: 'user', content: command });
        }
        const model = typeof getModel === 'function' ? getModel() : null;
        if (!model) {
            appendToTerminal('No model selected.', 'system-response');
            addTerminalPrompt();
            return;
        }
        if (window.ChatUtils && window.ChatUtils.toggleWorkingIndicator) {
            window.ChatUtils.toggleWorkingIndicator(true);
        }
        try {
            let response = await model.generateResponse(command, { messages: getMessageHistory() });
            if (typeof window.applyOutputFilters === 'function') {
                response = await window.applyOutputFilters(response);
            }
            // Handle streaming response (async iterator)
            if (response && typeof response[Symbol.asyncIterator] === 'function') {
                let fullResponse = '';
                for await (const chunk of response) {
                    if (chunk) {
                        fullResponse += chunk;
                        // Optionally, update the last system-response line in real time
                    }
                }
                appendToTerminal(fullResponse, 'system-response');
                getMessageHistory().push({ role: 'assistant', content: fullResponse });
                if (typeof onCommandProcessed === 'function') {
                    onCommandProcessed(command, fullResponse);
                }
            } else {
                // Non-streaming response (string)
                if (typeof response === 'object' && response !== null) {
                    // Try to extract .content if present
                    if (typeof response.content === 'string') {
                        appendToTerminal(response.content, 'system-response');
                        getMessageHistory().push({ role: 'assistant', content: response.content });
                        if (typeof onCommandProcessed === 'function') {
                            onCommandProcessed(command, response.content);
                        }
                    } else {
                        appendToTerminal(JSON.stringify(response), 'system-response');
                        getMessageHistory().push({ role: 'assistant', content: JSON.stringify(response) });
                        if (typeof onCommandProcessed === 'function') {
                            onCommandProcessed(command, JSON.stringify(response));
                        }
                    }
                } else {
                    appendToTerminal(response, 'system-response');
                    getMessageHistory().push({ role: 'assistant', content: response });
                    if (typeof onCommandProcessed === 'function') {
                        onCommandProcessed(command, response);
                    }
                }
            }
        } catch (error) {
            appendToTerminal(`Error: ${error.message || 'Command processing failed. Please try again.'}`, 'system-response');
        } finally {
            if (window.ChatUtils && window.ChatUtils.toggleWorkingIndicator) {
                window.ChatUtils.toggleWorkingIndicator(false);
            }
            addTerminalPrompt();
        }
    }

    function handleTerminalKeyDown(event) {
        if (event.key === 'Enter' && event.target.id === 'terminal-input') {
            event.preventDefault();
            const currentInput = event.target;
            const command = currentInput.textContent.trim();
            if (!command) return;
            processTerminalCommand(currentInput, command);
        }
    }

    function handleTerminalClick(event) {
        const controls = document.querySelector('.controls');
        if (!controls.contains(event.target)) {
            const currentInput = document.getElementById('terminal-input');
            if (currentInput && !currentInput.contains(event.target)) {
                setTimeout(() => currentInput.focus(), 0);
            }
        }
    }

    function redrawTerminalHistory() {
        // Always get the latest reference to messageHistory
        terminalWindow = document.getElementById('terminal-window');
        terminalWindow.innerHTML = '';
        const history = typeof getMessageHistory === 'function' ? getMessageHistory() : [];
        for (let i = 0; i < history.length; i++) {
            const msg = history[i];
            if (msg.role === 'user') {
                appendToTerminal(`> ${msg.content}`, 'user-command');
            } else if (msg.role === 'assistant') {
                appendToTerminal(msg.content, 'system-response');
            }
        }
        addTerminalPrompt();
    }

    function showTerminalUI() {
        if (!terminalInterface) terminalInterface = document.querySelector('.terminal-interface');
        if (terminalInterface) terminalInterface.style.display = '';
        document.body.classList.add('green-screen');
    }

    function hideTerminalUI() {
        if (!terminalInterface) terminalInterface = document.querySelector('.terminal-interface');
        if (terminalInterface) terminalInterface.style.display = 'none';
        document.body.classList.remove('green-screen');
    }

    function initializeTerminalUI(options = {}) {
        getModel = options.getModel;
        getMessageHistory = options.getMessageHistory;
        onCommandProcessed = options.onCommandProcessed;
        terminalWindow = document.getElementById('terminal-window');
        terminalInterface = document.querySelector('.terminal-interface');
        if (!listenersAdded && terminalWindow) {
            terminalWindow.addEventListener('keydown', handleTerminalKeyDown);
            terminalWindow.addEventListener('click', handleTerminalClick);
            listenersAdded = true;
        }
    }

    function teardownTerminalUI() {
        if (listenersAdded && terminalWindow) {
            terminalWindow.removeEventListener('keydown', handleTerminalKeyDown);
            terminalWindow.removeEventListener('click', handleTerminalClick);
            listenersAdded = false;
        }
    }

    // Expose API
    global.TerminalUI = {
        initializeTerminalUI,
        showTerminalUI,
        hideTerminalUI,
        redrawTerminalHistory,
        teardownTerminalUI
    };
})(window); 