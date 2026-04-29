const React = require('react');
const ReactDOM = require('react-dom/client');

const { useState, useEffect } = React;

const Navbar = () => {
    return (
        <nav className="mainNav">
            <div className="brand">Archive Guard RPG</div>
            <div className="navLinks">
                <a href="/app#chat">Chat</a>
                <a href="/history">History</a>
                <a href="/logout">Log out</a>
            </div>
        </nav>
    );
};

const ConversationList = ({ conversations, selectedId, onSelect }) => {
    return (
        <div className="historySidebar">
            <h2>History</h2>

            {conversations.length === 0 && (
                <p>No saved conversations yet.</p>
            )}

            {conversations.map((conversation) => (
                <button
                    key={conversation._id}
                    type="button"
                    className={`historyItem ${selectedId === conversation._id ? 'active' : ''}`}
                    onClick={() => onSelect(conversation._id)}
                >
                    <div><strong>{conversation.title}</strong></div>
                    <div>{conversation.mode}</div>
                    <div>{new Date(conversation.updatedAt).toLocaleString()}</div>
                </button>
            ))}
        </div>
    );
};

const ConversationDetail = ({ conversation }) => {
    if (!conversation) {
        return (
            <div className="historyDetail">
                <h2>Conversation Detail</h2>
                <p>Select a conversation from the left.</p>
            </div>
        );
    }

    return (
        <div className="historyDetail">
            <h2>{conversation.title}</h2>

            <div className="historyMeta">
                <p><strong>Mode:</strong> {conversation.mode}</p>
                <p><strong>Debug Visible:</strong> {conversation.debugVisible ? 'Yes' : 'No'}</p>
                <p><strong>Final Attitude:</strong> {conversation.finalAttitude}</p>
                <p><strong>Final Objective:</strong> {conversation.finalObjective}</p>
                <p><strong>Turn Count:</strong> {conversation.turnCount}</p>
            </div>

            <div className="historyMessages">
                <h3>Messages</h3>
                {conversation.messages.map((message, index) => (
                    <div key={`${message.sender}-${index}`} className="historyMessage">
                        <strong>{message.sender === 'user' ? 'You' : 'Archive Guard'}:</strong>{' '}
                        {message.text}
                    </div>
                ))}
            </div>

            <div className="historyReview">
                <h3>Review</h3>
                <p><strong>Strangeness:</strong> {conversation.review.strangenessScore}</p>
                <p><strong>Role Adherence:</strong> {conversation.review.roleAdherenceScore}</p>
                <p><strong>Consistency:</strong> {conversation.review.consistencyScore}</p>
                <p><strong>Helpfulness:</strong> {conversation.review.helpfulnessScore}</p>
                <p><strong>Control Improvement:</strong> {conversation.review.controlImprovement}</p>
                <p><strong>AI Issue Flags:</strong> {conversation.review.aiIssueFlags.join(', ') || 'None'}</p>
                <p><strong>Notes:</strong> {conversation.review.notes || 'No notes.'}</p>
            </div>
        </div>
    );
};

const HistoryPage = () => {
    const [conversations, setConversations] = useState([]);
    const [selectedId, setSelectedId] = useState('');
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const loadConversations = async () => {
            try {
                const response = await fetch('/getConversations');
                const data = await response.json();

                if (!response.ok) {
                    setErrorMessage(data.error || 'Failed to load conversations.');
                    return;
                }

                setConversations(data.conversations);

                if (data.conversations.length > 0) {
                    setSelectedId(data.conversations[0]._id);
                }
            } catch (err) {
                setErrorMessage('Failed to load conversations.');
            }
        };

        loadConversations();
    }, []);

    useEffect(() => {
        if (!selectedId) {
            return;
        }

        const loadConversationDetail = async () => {
            try {
                const response = await fetch(`/getConversationById?id=${selectedId}`);
                const data = await response.json();

                if (!response.ok) {
                    setErrorMessage(data.error || 'Failed to load conversation.');
                    return;
                }

                setSelectedConversation(data.conversation);
            } catch (err) {
                setErrorMessage('Failed to load conversation.');
            }
        };

        loadConversationDetail();
    }, [selectedId]);

    return (
        <div>
            <Navbar />

            <main className="historyPage">
                {errorMessage && <p>{errorMessage}</p>}

                <ConversationList
                    conversations={conversations}
                    selectedId={selectedId}
                    onSelect={setSelectedId}
                />

                <ConversationDetail conversation={selectedConversation} />
            </main>
        </div>
    );
};

const init = () => {
    const content = globalThis.document.getElementById('content');
    const root = ReactDOM.createRoot(content);
    root.render(<HistoryPage />);
};

globalThis.window.onload = init;
