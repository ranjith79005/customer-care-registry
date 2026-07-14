import { useEffect, useRef, useState } from 'react';
import api from '../api/axios';

// Simple polling-based chat (refetches every 4s). Good enough for an MVP;
// swap for socket.io later if you want true real-time updates.
export default function ChatBox({ complaintId, currentUserId }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchMessages() {
      try {
        const { data } = await api.get(`/messages/${complaintId}`);
        if (!cancelled) setMessages(data.messages);
      } catch (err) {
        if (!cancelled) setError('Could not load messages');
      }
    }

    fetchMessages();
    const interval = setInterval(fetchMessages, 4000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [complaintId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      const { data } = await api.post(`/messages/${complaintId}`, { text });
      setMessages((prev) => [...prev, data.message]);
      setText('');
    } catch (err) {
      setError('Message failed to send');
    }
  };

  return (
    <div className="chatbox">
      <div className="chatbox__messages">
        {messages.length === 0 && <p className="chatbox__empty">No messages yet — say hello.</p>}
        {messages.map((m) => (
          <div
            key={m._id}
            className={`chatbox__bubble ${m.sender._id === currentUserId ? 'is-mine' : ''}`}
          >
            <span className="chatbox__author">{m.sender.name} &middot; {m.senderRole}</span>
            <p>{m.text}</p>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {error && <p className="form-error">{error}</p>}

      <form className="chatbox__form" onSubmit={handleSend}>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
