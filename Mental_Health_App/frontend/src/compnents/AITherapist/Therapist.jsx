import React, { useState, useEffect, useRef } from 'react';
import Loader from 'react-js-loader';
import Navbar from '../navbar/Navbar';
import FrequencyPlayer from './FrequencyPlayer';
import './Therapist.css';

// Hugging Face Inference API configuration
const HF_API_URL = 'https://api-inference.huggingface.co/models/distilgpt2';
const HF_API_KEY = process.env.REACT_APP_HF_API_KEY;

// Helper function for frequency descriptions
const getFrequencyDescription = (frequency) => {
  const descriptions = {
    '396': 'Liberating Guilt and Fear',
    '417': 'Undoing Situations and Facilitating Change',
    '432': 'Natural Earth Frequency',
    '528': 'Love and DNA Repair',
    '639': 'Connecting Relationships'
  };
  return descriptions[frequency] || 'Healing Frequency';
};

// Therapeutic responses for when API is not available or fails
const getTherapeuticResponse = (userInput) => {
  const input = userInput.toLowerCase();

  // Mood-based recommendations
  const getMoodRecommendations = (mood) => {
    const recommendations = {
      happy: {
        music: "Upbeat instrumental",
        frequency: "528 Hz - Love",
        yoga: "Sukhasana (Easy Pose)"
      },
      sad: {
        music: "Lofi chill",
        frequency: "396 Hz - Healing",
        yoga: "Balasana (Child's Pose)"
      },
      anxious: {
        music: "Nature sounds",
        frequency: "432 Hz - Earth",
        yoga: "Vrikshasana (Tree Pose)"
      },
      angry: {
        music: "Soft piano",
        frequency: "417 Hz - Change",
        yoga: "Shashankasana (Rabbit Pose)"
      },
      neutral: {
        music: "Ambient pads",
        frequency: "639 Hz - Balance",
        yoga: "Sukhasana (Easy Pose)"
      }
    };
    return recommendations[mood] || recommendations.neutral;
  };

  const formatRecommendations = (recommendations) => {
    return `\n\n🎵 Music Suggestion: ${recommendations.music}\n🎶 Healing Frequency: ${recommendations.frequency}\n🧘 Yoga Pose: ${recommendations.yoga}\n\nThese suggestions might help you process and work through your current feelings.`;
  };

  const getFrequencyFromRecommendation = (frequencyText) => {
    const match = frequencyText.match(/(\d+)\s*Hz/);
    return match ? match[1] : null;
  };

  // Analyze the input for keywords and provide appropriate responses
  if (input.includes('happy') || input.includes('joy') || input.includes('excited') || input.includes('great') || input.includes('wonderful')) {
    const recommendations = getMoodRecommendations('happy');
    return "I'm so glad to hear that you're feeling happy! It's wonderful when we can experience joy and positivity. These moments are precious and worth celebrating. What's been bringing you this happiness today?" + formatRecommendations(recommendations);
  } else if (input.includes('sad') || input.includes('depressed') || input.includes('down')) {
    const recommendations = getMoodRecommendations('sad');
    return "I hear that you're feeling sad, and I want you to know that it's okay to feel this way. Sadness is a natural human emotion, and acknowledging it is the first step toward healing. Can you tell me what might be contributing to these feelings? Sometimes talking about what's weighing on your heart can help lighten the load." + formatRecommendations(recommendations);
  } else if (input.includes('anxious') || input.includes('worried') || input.includes('stress')) {
    const recommendations = getMoodRecommendations('anxious');
    return "It sounds like you're experiencing anxiety or stress, which can be really overwhelming. These feelings are more common than you might think, and you're not alone in experiencing them. When we're anxious, our minds can race with worries. Have you noticed any particular triggers for these feelings? Sometimes identifying patterns can help us develop coping strategies." + formatRecommendations(recommendations);
  } else if (input.includes('angry') || input.includes('mad') || input.includes('frustrated')) {
    const recommendations = getMoodRecommendations('angry');
    return "I can sense that you're feeling angry or frustrated, and those are completely valid emotions. Anger often signals that something important to us feels threatened or unfair. It's okay to feel this way. What's been happening that's brought up these feelings for you? Sometimes expressing anger in a safe space can help us understand what we really need." + formatRecommendations(recommendations);
  } else if (input.includes('lonely') || input.includes('alone') || input.includes('isolated')) {
    const recommendations = getMoodRecommendations('sad');
    return "Feeling lonely can be one of the most difficult emotions to bear. I want you to know that even though you feel alone, you're not truly alone - you've reached out here, which shows incredible strength. Loneliness doesn't reflect your worth as a person. Can you think of any small connections you might be able to make today, even something as simple as a brief conversation?" + formatRecommendations(recommendations);
  } else if (input.includes('bad day') || input.includes('terrible') || input.includes('awful')) {
    const recommendations = getMoodRecommendations('sad');
    return "I'm sorry to hear you've had such a difficult day. Bad days can feel overwhelming and make everything seem harder than usual. It's important to remember that having a bad day doesn't mean you're having a bad life - difficult days are temporary, even when they don't feel that way. What happened today that made it particularly challenging for you?" + formatRecommendations(recommendations);
  } else if (input.includes('tired') || input.includes('exhausted') || input.includes('drained')) {
    const recommendations = getMoodRecommendations('neutral');
    return "It sounds like you're feeling really drained, whether that's physically, emotionally, or both. Exhaustion can make everything feel more difficult and overwhelming. Your body and mind might be telling you that you need rest and care. Have you been able to get enough sleep lately? Sometimes when we're emotionally tired, we need different kinds of rest too." + formatRecommendations(recommendations);
  } else {
    const recommendations = getMoodRecommendations('neutral');
    const generalResponses = [
      "Thank you for sharing with me. I can hear that you're going through something difficult right now. Your feelings are valid, and it takes courage to reach out. What's been on your mind lately that you'd like to talk about?",
      "I'm here to listen and support you. It sounds like you're dealing with some challenges, and I want you to know that you don't have to face them alone. Can you tell me more about what's been troubling you?",
      "I appreciate you opening up to me. Whatever you're experiencing right now, please know that your feelings matter and you deserve support. What would be most helpful for you to talk about today?",
      "It takes strength to acknowledge when we're struggling and to reach out for support. I'm glad you're here. What's been weighing on your heart or mind that you'd like to share?"
    ];
    return generalResponses[Math.floor(Math.random() * generalResponses.length)] + formatRecommendations(recommendations);
  }
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
    if (!HF_API_KEY || HF_API_KEY === 'your_huggingface_api_key_here') {
      setMessages([{
        sender: 'ai',
        text: '🔑 Welcome to AI Therapist! To enable this feature, you need to configure your Hugging Face API key.\n\nSteps to set up:\n1. Get a free API key from https://huggingface.co/settings/tokens\n2. Add it to the .env file in the frontend folder as:\n   REACT_APP_HF_API_KEY=your_api_key_here\n3. Restart the application\n\nOnce configured, I\'ll be here to listen and provide mental health support! 💙'
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

    // Retry function for handling temporary API issues
    const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 1000) => {
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          return await fn();
        } catch (error) {
          if (attempt === maxRetries) throw error;

          // Check if it's a retryable error (503, 429, network issues)
          const isRetryable = error.message?.includes('503') ||
                             error.message?.includes('overloaded') ||
                             error.message?.includes('429') ||
                             error.message?.includes('rate limit') ||
                             error.message?.includes('network') ||
                             error.message?.includes('fetch');

          if (!isRetryable) throw error;

          const delay = baseDelay * Math.pow(2, attempt - 1); // Exponential backoff
          console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    };

    try {
      // Check if API key is configured
      if (!HF_API_KEY || HF_API_KEY === 'your_huggingface_api_key_here') {
        // Use therapeutic response when API is not available
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate thinking time
        const therapeuticResponse = getTherapeuticResponse(input);
        const configMessage = therapeuticResponse + "\n\n💡 To enable AI-powered responses, please configure your Hugging Face API key in the .env file.";
        setMessages([...messages, newMessage, { sender: 'ai', text: configMessage }]);
        return;
      }

      const generateResponse = async () => {
        // Create a therapeutic prompt for DistilGPT2
        const therapeuticPrompt = `As a caring therapist, I want to help you. You said: "${input.trim()}". I understand that you're going through a difficult time. Here's my supportive response:`;

        const response = await fetch(HF_API_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${HF_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: therapeuticPrompt,
            parameters: {
              max_new_tokens: 80,
              temperature: 0.7,
              do_sample: true,
              top_p: 0.9,
              repetition_penalty: 1.1,
              return_full_text: false
            }
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error Response:', errorText);
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const data = await response.json();

        // Handle DistilGPT2 response format
        let generatedText = '';
        if (Array.isArray(data) && data[0]?.generated_text) {
          generatedText = data[0].generated_text;
        } else if (data.generated_text) {
          generatedText = data.generated_text;
        } else {
          console.log('Unexpected response format:', data);
          throw new Error('Unexpected response format from Hugging Face API');
        }

        // Clean up the response and make it more therapeutic
        let therapistResponse = generatedText.trim();

        // If the response is too short or doesn't seem appropriate, provide a caring response
        if (therapistResponse.length < 20 || !therapistResponse.includes('I')) {
          therapistResponse = `I hear you, and I want you to know that your feelings are valid. It sounds like you're going through a challenging time. Sometimes when we're struggling, it can feel overwhelming. Can you tell me more about what's been weighing on your mind? I'm here to listen and support you.`;
        }

        // Ensure the response is supportive and not too long
        if (therapistResponse.length > 300) {
          therapistResponse = therapistResponse.substring(0, 300) + '...';
        }

        return therapistResponse;
      };

      let aiMessage = await retryWithBackoff(generateResponse);

      // Clean up the response
      aiMessage = aiMessage.replace(/\*\*(.*?)\*\*/g, '$1');

      // Ensure the response is appropriate length and ends properly
      if (aiMessage.length > 500) {
        aiMessage = aiMessage.substring(0, 500) + '...';
      }

      // Simulate typing delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create message object with potential frequency information
      const messageObj = {
        sender: 'ai',
        text: aiMessage
      };

      // Check if the response contains frequency information
      const frequencyMatch = aiMessage.match(/(\d+)\s*Hz\s*-\s*([^*\n]+)/);
      if (frequencyMatch) {
        messageObj.frequency = frequencyMatch[1];
        messageObj.frequencyName = `${frequencyMatch[1]} Hz - ${frequencyMatch[2].trim()}`;
        messageObj.frequencyDescription = getFrequencyDescription(frequencyMatch[1]);
      }

      setMessages([...messages, newMessage, messageObj]);
    } catch (error) {
      console.error('Error generating response:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        statusText: error.statusText,
        stack: error.stack
      });

      // Instead of showing error messages, provide therapeutic fallback responses
      console.log('API failed, using therapeutic fallback response');
      const therapeuticResponse = getTherapeuticResponse(input);

      // Extract frequency information for the player
      const frequencyMatch = therapeuticResponse.match(/(\d+)\s*Hz\s*-\s*([^*\n]+)/);
      const aiMessage = {
        sender: 'ai',
        text: therapeuticResponse
      };

      if (frequencyMatch) {
        aiMessage.frequency = frequencyMatch[1];
        aiMessage.frequencyName = `${frequencyMatch[1]} Hz - ${frequencyMatch[2].trim()}`;
        aiMessage.frequencyDescription = getFrequencyDescription(frequencyMatch[1]);
      }

      setMessages([...messages, newMessage, aiMessage]);
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
              <div style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>
              {msg.sender === 'ai' && msg.frequency && (
                <FrequencyPlayer
                  frequency={msg.frequency}
                  name={msg.frequencyName}
                  description={msg.frequencyDescription}
                />
              )}
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
