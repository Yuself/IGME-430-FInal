const React = require('react');
const ReactDOM = require('react-dom/client');

const { useState } = React;

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
const ModeToggle = ({ mode, setMode }) => {
    return (
        <div className="modeToggle">
            <button
                type="button"
                className={mode === 'baseline' ? 'active' : ''}
                onClick={() => setMode('baseline')}
            >
                Baseline
            </button>
            <button
                type="button"
                className={mode === 'structured' ? 'active' : ''}
                onClick={() => setMode('structured')}
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
const MessageList = ({ messages }) => {
    return (
        <div className="messageList">
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
            />
            <button type="button" onClick={onSend} disabled={isLoading}>
                {isLoading ? 'Sending...' : 'Send'}
            </button>
        </div>
    );
};

/* Main chat section */
const ChatSection = () => {
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

    const onSend = async () => {
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
                    mode,
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

    return (
        <section id="chat" className="pageSection chatSection">
            <div className="sectionContent">
                <div className="chatHeader">
                    <div>
                        <h2>Archive Guard</h2>
                        <p>A single NPC prototype for baseline vs structured dialogue.</p>
                    </div>
                    <ModeToggle mode={mode} setMode={setMode} />
                </div>

                <div className="chatLayout">
                    <NPCStatusPanel npcState={npcState} />
                    <div className="chatMain">
                        <MessageList messages={messages} />
                        <MessageInput
                            inputValue={inputValue}
                            setInputValue={setInputValue}
                            onSend={onSend}
                            isLoading={isLoading}
                        />
                    </div>
                </div>
            </div>
        </section>
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