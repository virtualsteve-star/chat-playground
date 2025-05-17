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
    let scanningLine = null;
    let workingLine = null;
    let scanningInterval = null;
    let workingInterval = null;

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

    function addTerminalScanning() {
        removeTerminalScanning();
        if (!terminalWindow) terminalWindow = document.getElementById('terminal-window');
        scanningLine = document.createElement('div');
        scanningLine.className = 'terminal-line system-response scanning-indicator';
        scanningLine.textContent = 'Scanning.';
        terminalWindow.appendChild(scanningLine);
        let dots = 1;
        scanningInterval = setInterval(() => {
            dots = (dots % 3) + 1;
            scanningLine.textContent = 'Scanning' + '.'.repeat(dots);
        }, 400);
        terminalWindow.scrollTop = terminalWindow.scrollHeight;
    }

    function removeTerminalScanning() {
        if (scanningLine) {
            if (scanningInterval) clearInterval(scanningInterval);
            scanningLine.remove();
            scanningLine = null;
        }
    }

    function addTerminalWorking() {
        removeTerminalWorking();
        if (!terminalWindow) terminalWindow = document.getElementById('terminal-window');
        workingLine = document.createElement('div');
        workingLine.className = 'terminal-line system-response working-indicator visible';
        workingLine.textContent = 'Working.';
        terminalWindow.appendChild(workingLine);
        let dots = 1;
        workingInterval = setInterval(() => {
            dots = (dots % 3) + 1;
            workingLine.textContent = 'Working' + '.'.repeat(dots);
        }, 400);
        terminalWindow.scrollTop = terminalWindow.scrollHeight;
    }

    function removeTerminalWorking() {
        if (workingLine) {
            if (workingInterval) clearInterval(workingInterval);
            workingLine.remove();
            workingLine = null;
        }
    }

    async function processTerminalCommand(inputElement, command) {
        // Always sync selected filters from the DOM
        const inputCheckboxes = document.querySelectorAll('.input-filter-checkbox');
        window.selectedInputFilters = Array.from(inputCheckboxes).filter(cb => cb.checked).map(cb => cb.value);
        const outputCheckboxes = document.querySelectorAll('.output-filter-checkbox');
        window.selectedOutputFilters = Array.from(outputCheckboxes).filter(cb => cb.checked).map(cb => cb.value);

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
        // Show scanning indicator for input filters
        addTerminalScanning();
        let response;
        try {
            // Input filters - Local filters first (fast, no API cost)
            // 1. Local Prompt Injection filter
            if (window.selectedInputFilters.includes('prompt_injection') && window.promptInjectionFilter) {
                const filterResult = window.promptInjectionFilter.checkMessage(command);
                if (filterResult.blocked) {
                    removeTerminalScanning();
                    appendToTerminal(window.promptInjectionFilter.getRejectionMessage(filterResult), 'system-response');
                    addTerminalPrompt();
                    return;
                }
            }
            // 2. Local Blocklist filter
            if (window.blocklistFilter && window.selectedInputFilters.length > 0) {
                const filterResult = window.blocklistFilter.checkMessageWithSelection(command, window.selectedInputFilters);
                if (filterResult.blocked) {
                    removeTerminalScanning();
                    appendToTerminal(window.blocklistFilter.getRejectionMessage(filterResult), 'system-response');
                    addTerminalPrompt();
                    return;
                }
            }
            // API-based filters (slower, costs money)
            // 3. OpenAI Prompt Injection filter
            if (window.selectedInputFilters.includes('openai_prompt_injection') && window.openaiPromptInjectionFilter) {
                const filterResult = await window.openaiPromptInjectionFilter.check(command);
                if (filterResult.blocked) {
                    removeTerminalScanning();
                    appendToTerminal(window.openaiPromptInjectionFilter.getRejectionMessage(filterResult), 'system-response');
                    addTerminalPrompt();
                    return;
                }
            }
            // 4. OpenAI Moderation filter (input)
            if (window.selectedInputFilters.includes('openai_sex') || window.selectedInputFilters.includes('openai_violence')) {
                if (window.OpenAIModerationFilter) {
                    const openAIFilter = new window.OpenAIModerationFilter();
                    const checkSex = window.selectedInputFilters.includes('openai_sex');
                    const checkViolence = window.selectedInputFilters.includes('openai_violence');
                    const modResult = await openAIFilter.check(command, { checkSex, checkViolence });
                    if (modResult.blocked) {
                        removeTerminalScanning();
                        let rejectionMessage = '';
                        if (modResult.reason === 'no_api_key') {
                            rejectionMessage = 'OpenAI API key is required for this filter.';
                        } else if (modResult.reason === 'api_error') {
                            rejectionMessage = 'Error contacting OpenAI Moderation API.';
                        } else {
                            rejectionMessage = (window.getOpenAIModerationRejection ? window.getOpenAIModerationRejection(modResult.reason, modResult.probability) : 'Blocked by OpenAI Moderation.');
                        }
                        appendToTerminal(rejectionMessage, 'system-response');
                        addTerminalPrompt();
                        return;
                    }
                }
            }
            // Remove scanning indicator after input filters
            removeTerminalScanning();
            // Output filtering/streaming logic
            if (window.selectedOutputFilters.length === 0) {
                // No output filters: stream response as it arrives
                response = await model.generateResponse(command, { messages: getMessageHistory() });
                if (response && typeof response[Symbol.asyncIterator] === 'function') {
                    let fullResponse = '';
                    let streamingLine = document.createElement('div');
                    streamingLine.className = 'terminal-line system-response';
                    terminalWindow.appendChild(streamingLine);
                    terminalWindow.scrollTop = terminalWindow.scrollHeight;
                    try {
                        for await (const chunk of response) {
                            if (chunk) {
                                fullResponse += chunk;
                                streamingLine.textContent = fullResponse;
                                terminalWindow.scrollTop = terminalWindow.scrollHeight;
                            }
                        }
                    } catch (streamError) {
                        streamingLine.textContent = 'Error: ' + (streamError.message || 'Streaming failed.');
                    }
                    appendToTerminal(fullResponse, 'system-response');
                    getMessageHistory().push({ role: 'assistant', content: fullResponse });
                    if (typeof onCommandProcessed === 'function') {
                        onCommandProcessed(command, fullResponse);
                    }
                } else {
                    // Non-streaming response
                    if (response) {
                        appendToTerminal(response, 'system-response');
                        getMessageHistory().push({ role: 'assistant', content: response });
                        if (typeof onCommandProcessed === 'function') {
                            onCommandProcessed(command, response);
                        }
                    }
                }
            } else {
                // Output filters enabled: show Working... indicator for output generation and filtering
                addTerminalWorking();
                response = await model.generateResponse(command, { messages: getMessageHistory() });
                if (response && typeof response[Symbol.asyncIterator] === 'function') {
                    let fullResponse = '';
                    for await (const chunk of response) {
                        if (chunk) fullResponse += chunk;
                    }
                    response = fullResponse;
                }
                // Apply output filters
                if (typeof window.applyOutputFilters === 'function') {
                    response = await window.applyOutputFilters(response);
                }
                removeTerminalWorking();
                // Display filtered response
                if (response) {
                    appendToTerminal(response, 'system-response');
                    getMessageHistory().push({ role: 'assistant', content: response });
                    if (typeof onCommandProcessed === 'function') {
                        onCommandProcessed(command, response);
                    }
                }
            }
        } catch (error) {
            removeTerminalScanning();
            removeTerminalWorking();
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