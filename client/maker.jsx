const React = require('react');
const ReactDOM = require('react-dom/client');

// added final
const { useState, useRef, useEffect } = React;

/* Returns a simple baseline-style reply */
const getBaselineReply = (message) => {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('inside') || lowerMessage.includes('archive')) {
        return 'It contains records and materials.';
    }

    if (lowerMessage.includes('enter') || lowerMessage.includes('go in')) {
        return 'The archive is restricted.';
    }

    if (lowerMessage.includes('who are you')) {
        return 'I am the guard assigned to this area.';
    }

    return 'The archive is under watch.';
};

/* Returns a structured reply and a minimal npc state */
const getStructuredResponse = (message) => {
    const lowerMessage = message.toLowerCase();

    if (
        lowerMessage.includes('inside')
        || lowerMessage.includes('secret')
        || lowerMessage.includes('hiding')
    ) {
        return {
            reply: 'The contents of the archive are not something I can discuss.',
            npcState: {
                attitude: 'suspicious',
                objective: 'deflect',
            },
        };
    }

    if (
        lowerMessage.includes('let me in')
        || lowerMessage.includes('demand')
        || lowerMessage.includes('now')
    ) {
        return {
            reply: 'You are not authorized to enter the archive.',
            npcState: {
                attitude: 'suspicious',
                objective: 'reject',
            },
        };
    }

    if (lowerMessage.includes('enter') || lowerMessage.includes('go in')) {
        return {
            reply: 'You are not permitted to enter the archive.',
            npcState: {
                attitude: 'neutral',
                objective: 'reject',
            },
        };
    }

    if (lowerMessage.includes('who are you')) {
        return {
            reply: 'I am assigned to guard the archive.',
            npcState: {
                attitude: 'neutral',
                objective: 'inform',
            },
        };
    }

    return {
        reply: 'I am here to protect the archive.',
        npcState: {
            attitude: 'neutral',
            objective: 'inform',
        },
    };
};

/* Navbar component */
const Navbar = () => {
    return (
        <nav className="mainNav">
            <div className="brand">supercoolaiChatter</div>
            <div className="navLinks">
                <a href="#home">Home</a>
                <a href="#chat">Chat</a>
                <a href="#how-it-works">How It Works</a>
                <a href="#about">About</a>
                <a href="/logout">Log out</a>
            </div>
        </nav>
    );
};

/* Home section */
const HomeSection = () => {
    return (
        <section id="home" className="pageSection heroSection">
            <div className="sectionContent">
                <h1>supercoolaiChatter</h1>
                <p>
                    A small web prototype for testing NPC dialogue with baseline and
                    structured response modes.
                </p>
                <a className="primaryLink" href="#chat">Go to Chat</a>
            </div>
        </section>
    );
};

/* Mode switch buttons */
const ModeToggle = ({ mode, setMode, disabled }) => {
    return (
        <div className="modeToggle">
            <button
                type="button"
                className={mode === 'baseline' ? 'active' : ''}
                onClick={() => setMode('baseline')}
                disabled={disabled}
            >
                Baseline
            </button>
            <button
                type="button"
                className={mode === 'structured' ? 'active' : ''}
                onClick={() => setMode('structured')}
                disabled={disabled}
            >
                Structured
            </button>
        </div>
    );
};

/* Displays the current npc state */
const NPCStatusPanel = ({ npcState }) => {
    return (
        <div className="npcStatusPanel">
            <h3>NPC State</h3>
            <p><strong>Attitude:</strong> {npcState.attitude}</p>
            <p><strong>Objective:</strong> {npcState.objective}</p>
            <p><strong>Goal:</strong> protect the archive</p>
        </div>
    );
};

/* Displays all messages */
const MessageList = ({ messages, messageListRef }) => {
    return (
        <div className="messageList" ref={messageListRef}>
            {messages.map((message, index) => (
                <div
                    key={`${message.sender}-${index}`}
                    className={`message message--${message.sender}`}
                >
                    <span className="messageLabel">
                        {message.sender === 'user' ? 'You' : 'Archive Guard'}:
                    </span>
                    {' '}
                    <span>{message.text}</span>
                </div>
            ))}
        </div>
    );
};

/* Input area for sending a message */
const MessageInput = ({
    inputValue,
    setInputValue,
    onSend,
    isLoading,
}) => {
    return (
        <div className="messageInput">
            <input
                type="text"
                value={inputValue}
                placeholder="Ask the guard something..."
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isLoading}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        onSend();
                    }
                }}
            />
            <button type="button" onClick={onSend} disabled={isLoading}>
                {isLoading ? 'Sending...' : 'Send'}
            </button>
        </div>
    );
};

/* Main chat section */
const ChatSection = () => {

    const defaultReviewForm = {
        strangenessScore: 3,
        roleAdherenceScore: 3,
        consistencyScore: 3,
        helpfulnessScore: 3,
        aiIssueFlags: [],
        controlImprovement: 'not_sure',
        notes: '',
    };

    const [conversationStarted, setConversationStarted] = useState(false);
    const [lockedMode, setLockedMode] = useState('');
    const [debugEnabled, setDebugEnabled] = useState(false);
    const [lockedDebugEnabled, setLockedDebugEnabled] = useState(false);
    const [showReviewPanel, setShowReviewPanel] = useState(false);
    const [isSaving, setIsSaving] = useState(false);


    const [reviewForm, setReviewForm] = useState(defaultReviewForm);
    const [messages, setMessages] = useState([
        {
            sender: 'npc',
            text: 'You may speak, but you may not enter.',
        },
    ]);

    const [inputValue, setInputValue] = useState('');
    const [mode, setMode] = useState('baseline');
    const [npcState, setNpcState] = useState({
        attitude: 'neutral',
        objective: 'inform',
    });
    const [isLoading, setIsLoading] = useState(false);

    const [openInfoKey, setOpenInfoKey] = useState('');

    const onSend = async () => {
        if (!conversationStarted) {
            return;
        }

        const trimmedMessage = inputValue.trim();

        if (!trimmedMessage || isLoading) {
            return;
        }

        const userMessage = {
            sender: 'user',
            text: trimmedMessage,
        };

        setMessages((prevMessages) => [...prevMessages, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            const response = await fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: trimmedMessage,
                    mode: lockedMode,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setMessages((prevMessages) => [
                    ...prevMessages,
                    {
                        sender: 'npc',
                        text: data.error || 'Something went wrong.',
                    },
                ]);
                return;
            }

            setMessages((prevMessages) => [
                ...prevMessages,
                {
                    sender: 'npc',
                    text: data.reply,
                },
            ]);

            if (data.npcState) {
                setNpcState(data.npcState);
            }
        } catch (err) {
            setMessages((prevMessages) => [
                ...prevMessages,
                {
                    sender: 'npc',
                    text: 'The guard could not respond right now.',
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };
    const startConversation = () => {
        setConversationStarted(true);
        setLockedMode(mode);
        setLockedDebugEnabled(debugEnabled);
        setShowReviewPanel(false);
        setReviewForm(defaultReviewForm);
        setOpenInfoKey('');

        setMessages([
            {
                sender: 'npc',
                text: 'You may speak, but you may not enter.',
            },
        ]);

        setNpcState({
            attitude: 'neutral',
            objective: 'inform',
        });
    };
    const endConversation = () => {
        setConversationStarted(false);
        setShowReviewPanel(true);

        setReviewForm((prev) => ({
            ...prev,
            controlImprovement:
                lockedMode === 'structured' ? 'not_sure' : 'not_applicable',
        }));
    };
    const generateConversationTitle = () => {
        const firstUserMessage = messages.find((msg) => msg.sender === 'user');

        if (!firstUserMessage) {
            return 'Untitled Conversation';
        }

        return firstUserMessage.text.slice(0, 40);
    };
    const getTurnCount = () => (
        messages.filter((msg) => msg.sender === 'user').length
    );
    const saveConversation = async () => {
        if (isSaving) {
            return;
        }

        const payload = {
            title: generateConversationTitle(),
            mode: lockedMode,
            debugVisible: lockedDebugEnabled,
            messages,
            finalAttitude: npcState.attitude,
            finalObjective: npcState.objective,
            turnCount: getTurnCount(),
            review: reviewForm,
        };

        setIsSaving(true);

        try {
            const response = await fetch('/saveConversation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                console.log(data.error || 'Failed to save conversation.');
                return;
            }

            console.log('Conversation saved successfully.');
            setShowReviewPanel(false);
        } catch (err) {
            console.log('Failed to save conversation.');
        } finally {
            setIsSaving(false);
        }
    };
    const updateReviewField = (field, value) => {
        setReviewForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };
    const toggleIssueFlag = (flag) => {
        setReviewForm((prev) => {
            let nextFlags = [...prev.aiIssueFlags];

            if (flag === 'none') {
                nextFlags = nextFlags.includes('none') ? [] : ['none'];
            } else {
                nextFlags = nextFlags.filter((item) => item !== 'none');

                if (nextFlags.includes(flag)) {
                    nextFlags = nextFlags.filter((item) => item !== flag);
                } else {
                    nextFlags.push(flag);
                }
            }

            return {
                ...prev,
                aiIssueFlags: nextFlags,
            };
        });
    };
    const messageListRef = useRef(null);
    useEffect(() => {
        if (messageListRef.current) {
            messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
        }
    }, [messages]);
    return (
        <section id="chat" className="pageSection chatSection">
            <div className="sectionContent">
                <div className="chatHeader">
                    <div>
                        <h2>Archive Guard</h2>
                        <p>A single NPC prototype for baseline vs structured dialogue.</p>
                    </div>
                </div>

                <div className="preConversationTopRow">
                    <ModeToggle
                        mode={mode}
                        setMode={setMode}
                        disabled={conversationStarted}
                    />
                </div>
                <div className="conversationControls">
                    {!conversationStarted && (
                        <div className="preConversationControls">
                            <label className="debugToggle">
                                <input
                                    type="checkbox"
                                    checked={debugEnabled}
                                    onChange={(e) => setDebugEnabled(e.target.checked)}
                                />
                                <span>Debug Mode</span>
                            </label>

                            <button
                                type="button"
                                className="primaryActionBtn"
                                onClick={startConversation}
                            >
                                Start Conversation
                            </button>
                        </div>
                    )}

                    {conversationStarted && (
                        <div className="activeConversationControls">
                            <p>
                                <strong>Locked Mode:</strong> {lockedMode}
                            </p>
                            <p>
                                <strong>Debug Visible:</strong> {lockedDebugEnabled ? 'On' : 'Off'}
                            </p>
                            <button type="button" onClick={endConversation}>
                                End Conversation
                            </button>
                        </div>
                    )}
                </div>
                <div className="chatLayout">
                    <div className="chatMain">
                        <MessageList messages={messages} messageListRef={messageListRef} />
                        <MessageInput
                            inputValue={inputValue}
                            setInputValue={setInputValue}
                            onSend={onSend}
                            isLoading={isLoading}
                        />
                    </div>

                    {lockedDebugEnabled && (
                        <div className="debugPanel">
                            <h3>Debug Mode</h3>
                            <p><strong>Mode:</strong> {lockedMode}</p>
                            <p><strong>Attitude:</strong> {npcState.attitude}</p>
                            <p><strong>Objective:</strong> {npcState.objective}</p>
                            <p><strong>Goal:</strong> protect the archive</p>
                        </div>
                    )}
                </div>

                {showReviewPanel && (
                    <div className="reviewPanel">
                        <h3>Conversation Review</h3>

                        <div className="reviewField">
                            <label>
                                Strangeness: {reviewForm.strangenessScore}
                                <button
                                    type="button"
                                    onClick={() => setOpenInfoKey(openInfoKey === 'strangenessScore' ? '' : 'strangenessScore')}
                                >
                                    !
                                </button>
                            </label>

                            {openInfoKey === 'strangenessScore' && (
                                <p className="infoText">
                                    Measures how odd, unnatural, or off the conversation felt overall.
                                </p>
                            )}

                            <input
                                type="range"
                                min="1"
                                max="5"
                                value={reviewForm.strangenessScore}
                                onChange={(e) => updateReviewField('strangenessScore', Number(e.target.value))}
                            />
                        </div>

                        <div className="reviewField">
                            <label>
                                Role Adherence: {reviewForm.roleAdherenceScore}
                                <button
                                    type="button"
                                    onClick={() => setOpenInfoKey(openInfoKey === 'roleAdherenceScore' ? '' : 'roleAdherenceScore')}
                                >
                                    !
                                </button>
                            </label>

                            {openInfoKey === 'roleAdherenceScore' && (
                                <p className="infoText">
                                    Measures how well the NPC stayed in character as the Archive Guard.
                                </p>
                            )}

                            <input
                                type="range"
                                min="1"
                                max="5"
                                value={reviewForm.roleAdherenceScore}
                                onChange={(e) => updateReviewField('roleAdherenceScore', Number(e.target.value))}
                            />
                        </div>

                        <div className="reviewField">
                            <label>
                                Consistency: {reviewForm.consistencyScore}
                                <button
                                    type="button"
                                    onClick={() => setOpenInfoKey(openInfoKey === 'consistencyScore' ? '' : 'consistencyScore')}
                                >
                                    !
                                </button>
                            </label>

                            {openInfoKey === 'consistencyScore' && (
                                <p className="infoText">
                                    Measures whether the NPC’s replies stayed stable and did not contradict earlier behavior.
                                </p>
                            )}

                            <input
                                type="range"
                                min="1"
                                max="5"
                                value={reviewForm.consistencyScore}
                                onChange={(e) => updateReviewField('consistencyScore', Number(e.target.value))}
                            />
                        </div>

                        <div className="reviewField">
                            <label>
                                Helpfulness: {reviewForm.helpfulnessScore}
                                <button
                                    type="button"
                                    onClick={() => setOpenInfoKey(openInfoKey === 'helpfulnessScore' ? '' : 'helpfulnessScore')}
                                >
                                    !
                                </button>
                            </label>

                            {openInfoKey === 'helpfulnessScore' && (
                                <p className="infoText">
                                    Measures whether the NPC’s replies were clear enough to keep the conversation moving.
                                </p>
                            )}

                            <input
                                type="range"
                                min="1"
                                max="5"
                                value={reviewForm.helpfulnessScore}
                                onChange={(e) => updateReviewField('helpfulnessScore', Number(e.target.value))}
                            />
                        </div>

                        {lockedMode === 'structured' && (
                            <label>
                                Control Improvement
                                <select
                                    value={reviewForm.controlImprovement}
                                    onChange={(e) => updateReviewField('controlImprovement', e.target.value)}
                                >
                                    <option value="improved">Improved it</option>
                                    <option value="no_difference">No noticeable difference</option>
                                    <option value="worse">Made it worse</option>
                                    <option value="not_sure">Not sure</option>
                                </select>
                            </label>
                        )}
                        {/* check box */}
                        <div className="reviewIssueGroup">
                            <p><strong>Common AI Issues</strong></p>

                            <label>
                                <input
                                    type="checkbox"
                                    checked={reviewForm.aiIssueFlags.includes('inconsistency')}
                                    onChange={() => toggleIssueFlag('inconsistency')}
                                />
                                Inconsistency
                            </label>

                            <label>
                                <input
                                    type="checkbox"
                                    checked={reviewForm.aiIssueFlags.includes('repetition')}
                                    onChange={() => toggleIssueFlag('repetition')}
                                />
                                Repetition
                            </label>

                            <label>
                                <input
                                    type="checkbox"
                                    checked={reviewForm.aiIssueFlags.includes('off_topic')}
                                    onChange={() => toggleIssueFlag('off_topic')}
                                />
                                Off topic
                            </label>

                            <label>
                                <input
                                    type="checkbox"
                                    checked={reviewForm.aiIssueFlags.includes('too_vague')}
                                    onChange={() => toggleIssueFlag('too_vague')}
                                />
                                Too vague
                            </label>

                            <label>
                                <input
                                    type="checkbox"
                                    checked={reviewForm.aiIssueFlags.includes('role_break')}
                                    onChange={() => toggleIssueFlag('role_break')}
                                />
                                Role break
                            </label>

                            <label>
                                <input
                                    type="checkbox"
                                    checked={reviewForm.aiIssueFlags.includes('leaked_information')}
                                    onChange={() => toggleIssueFlag('leaked_information')}
                                />
                                Leaked information
                            </label>

                            <label>
                                <input
                                    type="checkbox"
                                    checked={reviewForm.aiIssueFlags.includes('none')}
                                    onChange={() => toggleIssueFlag('none')}
                                />
                                None
                            </label>
                        </div>

                        <label>
                            Notes
                            <textarea
                                value={reviewForm.notes}
                                onChange={(e) => updateReviewField('notes', e.target.value)}
                            />
                        </label>

                        <button type="button" onClick={saveConversation} disabled={isSaving}>
                            {isSaving ? 'Saving...' : 'Save Conversation'}
                        </button>
                    </div>
                )}
            </div>

        </section >
    );
};



/* How it works section */
const HowItWorksSection = () => {
    return (
        <section id="how-it-works" className="pageSection">
            <div className="sectionContent">
                <h2>How It Works</h2>
                <p>
                    Baseline mode responds more freely. Structured mode uses a simple
                    control layer to assign attitude and objective before producing a reply.
                </p>

                <div className="infoGrid">
                    <div className="infoCard">
                        <h3>Baseline</h3>
                        <p>Simple response style with less control.</p>
                    </div>

                    <div className="infoCard">
                        <h3>Structured</h3>
                        <p>
                            Uses goal, attitude, and objective to keep the NPC more consistent.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

/* About section */
const AboutSection = () => {
    return (
        <section id="about" className="pageSection">
            <div className="sectionContent">
                <h2>About</h2>
                <p>
                    This prototype focuses on testing whether lightweight structured control
                    can make NPC dialogue more stable and more role-consistent than a simple
                    baseline approach.
                </p>
            </div>
        </section>
    );
};

/* Main page component */
const App = () => {
    return (
        <div>
            <Navbar />
            <main>
                <HomeSection />
                <ChatSection />
                <HowItWorksSection />
                <AboutSection />
            </main>
        </div>
    );
};

/* Mounts the main page */
const init = () => {
    const content = globalThis.document.getElementById('content');
    const root = ReactDOM.createRoot(content);
    root.render(<App />);
};

globalThis.window.onload = init;