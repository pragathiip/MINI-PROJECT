import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Loader from 'react-js-loader';
import Navbar from '../navbar/Navbar';
import './Therapist.css';

const API_KEY = process.env.REACT_APP_API_KEY;
const genAI = API_KEY && API_KEY !== 'your_google_generative_ai_api_key_here' ? new GoogleGenerativeAI(API_KEY) : null;

// Mock responses for when API is not available
const getMockResponse = (userInput) => {
  const responses = [
    "I understand you're sharing something important with me. While I'm currently in demo mode (API key not configured), I want you to know that your feelings are valid and it's great that you're reaching out for support.",
    "Thank you for opening up. In a fully configured setup, I would provide personalized mental health guidance. For now, remember that seeking help is a sign of strength, not weakness.",
    "I hear you. While I'm running in demo mode, I encourage you to practice self-care and consider speaking with a mental health professional if you need immediate support.",
    "Your mental health matters. Although I'm currently in demo mode, please know that there are resources available to help you, including crisis hotlines and mental health professionals.",
    "I appreciate you sharing with me. In demo mode, I can't provide full AI responses, but I want to remind you that you're not alone and that help is available when you need it."
  ];

  return responses[Math.floor(Math.random() * responses.length)] +
    "\n\n💡 To enable full AI responses, please configure your Google Generative AI API key in the .env file.";
};

const TypingAnimation = ({ color }) => (
  <div className="item text-2xl">
    <Loader type="ping-cube" bgColor={color} color={color} size={100} />
  </div>
);

const Therapist = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatBoxRef = useRef(null);

  // Add initial message if API key is not configured
  React.useEffect(() => {
    if (!genAI) {
      setMessages([{
        sender: 'ai',
        text: '🔑 Welcome to AI Therapist! To enable this feature, you need to configure your Google Generative AI API key.\n\nSteps to set up:\n1. Get a free API key from https://makersuite.google.com/app/apikey\n2. Add it to the .env file in the frontend folder as:\n   REACT_APP_API_KEY=your_api_key_here\n3. Restart the application\n\nOnce configured, I\'ll be here to listen and provide mental health support! 💙'
      }]);
    } else {
      setMessages([{
        sender: 'ai',
        text: '👋 Hello! I\'m your AI Therapist. I\'m here to listen and provide support for your mental health journey. Feel free to share what\'s on your mind, and I\'ll do my best to help you process your thoughts and feelings. How are you feeling today?'
      }]);
    }
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessage = { sender: 'user', text: input };
    setMessages([...messages, newMessage]);
    setInput('');
    setLoading(true);

    try {
      // Check if API key is configured
      if (!genAI) {
        // Use mock response when API is not available
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate thinking time
        const mockResponse = getMockResponse(input);
        setMessages([...messages, newMessage, { sender: 'ai', text: mockResponse }]);
        return;
      }

      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const prompt = `Analyse the user's input and give suggestions or talk with them and provide an answer in paragraphs with spaces between paragraphs and points. Respond as if you are talking to the user in the first person, not the third person:\n\nUser: ${input}\nTherapist:`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      let aiMessage = await response.text();

      // Replace **word** with <strong>word</strong>
      aiMessage = aiMessage.replace(/\*\*(.*?)\*\*/g, '$1');

      // Simulate typing delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      setMessages([...messages, newMessage, { sender: 'ai', text: aiMessage }]);
    } catch (error) {
      console.error('Error generating response:', error);

      let errorMessage = 'An error occurred while generating the response.';

      if (error.message === 'API_KEY_NOT_CONFIGURED') {
        errorMessage = '🔑 AI Therapist is not configured. Please set up your Google Generative AI API key in the .env file to enable this feature.\n\nTo get an API key:\n1. Visit https://makersuite.google.com/app/apikey\n2. Create a new API key\n3. Add it to the .env file as REACT_APP_API_KEY=your_key_here\n4. Restart the application';
      } else if (error.message?.includes('API_KEY')) {
        errorMessage = '🔑 Invalid API key. Please check your Google Generative AI API key configuration.';
      } else if (error.message?.includes('quota') || error.message?.includes('limit')) {
        errorMessage = '⚠️ API quota exceeded. Please check your Google Generative AI usage limits.';
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        errorMessage = '🌐 Network error. Please check your internet connection and try again.';
      }

      setMessages([...messages, newMessage, { sender: 'ai', text: errorMessage }]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => setInput(e.target.value);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  useEffect(() => {
    // Scroll to the bottom of the chat box whenever messages change
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <>
      <Navbar />
      <div className="therapist-container">
        <h1 className="heading">Your Personal AI Assistant</h1>
        <div ref={chatBoxRef} className="chat-box">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.sender === 'user' ? 'user-message' : 'ai-message'}`}>
              {msg.text}
            </div>
          ))}
          {loading && <TypingAnimation color="#007BFF" />}
        </div>
        <div className="input-container">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="input-field"
          />
          <button onClick={handleSend} className="send-button">Send</button>
        </div>
      </div>
    </>
  );
};

export default Therapist;
