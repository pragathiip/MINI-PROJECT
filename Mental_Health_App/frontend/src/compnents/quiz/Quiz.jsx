import React, { useState } from 'react';
import Loader from 'react-js-loader';
import Navbar from '../navbar/Navbar';

// Hugging Face Inference API configuration
const HF_API_URL = 'https://api-inference.huggingface.co/models/gpt2';
const HF_API_KEY = process.env.REACT_APP_HF_API_KEY;

// Fallback analysis function
const generateFallbackAnalysis = (answers) => {
  const responses = answers.filter(answer => answer.trim() !== '');

  if (responses.length === 0) {
    return "Thank you for taking the quiz. Please answer the questions to receive personalized insights.";
  }

  // Count concerning responses
  const concerningCount = responses.filter(answer =>
    answer.toLowerCase().includes('often') ||
    answer.toLowerCase().includes('always') ||
    answer.toLowerCase().includes('very') ||
    answer.toLowerCase().includes('extremely')
  ).length;

  let analysis = "Mental Health Quiz Analysis:\n\n";

  if (concerningCount >= 3) {
    analysis += "Based on your responses, it appears you may be experiencing some challenges with your mental health. ";
    analysis += "It's important to remember that seeking help is a sign of strength, not weakness.\n\n";
    analysis += "Recommendations:\n";
    analysis += "• Consider speaking with a mental health professional\n";
    analysis += "• Practice daily mindfulness or meditation\n";
    analysis += "• Maintain regular sleep and exercise routines\n";
    analysis += "• Connect with supportive friends and family\n";
    analysis += "• Consider journaling to process your thoughts and feelings";
  } else if (concerningCount >= 1) {
    analysis += "Your responses suggest you may be experiencing some mild stress or emotional challenges. ";
    analysis += "This is completely normal, and there are many ways to support your mental wellness.\n\n";
    analysis += "Suggestions:\n";
    analysis += "• Practice stress-reduction techniques like deep breathing\n";
    analysis += "• Engage in activities you enjoy\n";
    analysis += "• Maintain social connections\n";
    analysis += "• Consider talking to someone you trust about your feelings\n";
    analysis += "• Focus on self-care and healthy habits";
  } else {
    analysis += "Your responses suggest you're managing well overall. ";
    analysis += "Continue to prioritize your mental health and well-being.\n\n";
    analysis += "Keep up the good work:\n";
    analysis += "• Continue your current self-care practices\n";
    analysis += "• Stay connected with your support system\n";
    analysis += "• Be mindful of changes in your mood or stress levels\n";
    analysis += "• Remember that it's okay to seek help if things change";
  }

  analysis += "\n\nRemember: This is a general assessment. For personalized advice, please consult with a qualified mental health professional.";

  return analysis;
};

const questions = [
  "How often have you felt down, depressed, or hopeless in the past two weeks?",
  "How often do you feel little interest or pleasure in doing things?",
  "How often do you feel nervous, anxious, or on edge?",
  "How often do you have trouble relaxing?",
  "How often do you feel so restless that it is hard to sit still?",
  "How often do you feel fatigued or have little energy?",
  "How often do you feel bad about yourself, or that you are a failure or have let yourself or your family down?",
  "How often do you have trouble concentrating on things, such as reading the newspaper or watching television?",
  "How often do you feel afraid, as if something awful might happen?",
  "How often do you have trouble falling or staying asleep, or sleeping too much?",
  "How often do you feel easily annoyed or irritable?",
  "How often do you experience physical symptoms such as headaches, stomachaches, or muscle pain?",
  "How often do you feel disconnected or detached from reality or your surroundings?",
  "How often do you find it difficult to control your worry?",
  "How often do you avoid social situations due to fear of being judged or embarrassed?",
];

const options = ["Not at all", "Several days", "More than half the days", "Nearly every day"];

const Quiz = () => {
  const [answers, setAnswers] = useState(Array(questions.length).fill(''));
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hoveredOption, setHoveredOption] = useState(null);

  const handleChange = (index, value) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const handleOptionHover = (index) => {
    setHoveredOption(index);
  };

  const handleOptionLeave = () => {
    setHoveredOption(null);
  };

  const handleSubmit = async () => {
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
          console.log(`Quiz API attempt ${attempt} failed, retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    };

    try {
      const generateAnalysis = async () => {
        if (!HF_API_KEY || HF_API_KEY === 'your_huggingface_api_key_here') {
          throw new Error('API_KEY_NOT_CONFIGURED');
        }

        const prompt = `Analyze the following mental health quiz answers and provide a supportive summary with practical suggestions:

${questions.map((q, i) => `${i+1}. ${q} ${answers[i]}`).join('\n')}

Mental Health Analysis:`;

        const response = await fetch(HF_API_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${HF_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: {
              max_new_tokens: 150,
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
          throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }

        const data = await response.json();

        // Handle different response formats from Hugging Face
        let generatedText = '';
        if (Array.isArray(data) && data[0]?.generated_text) {
          generatedText = data[0].generated_text;
        } else if (data.generated_text) {
          generatedText = data.generated_text;
        } else {
          throw new Error('Unexpected response format from Hugging Face API');
        }

        // Extract only the analysis part (remove the prompt)
        const analysisResponse = generatedText.split('Mental Health Analysis:')[1]?.trim() || generatedText;

        return analysisResponse;
      };

      let text = await retryWithBackoff(generateAnalysis);

      // Replace **word** with <strong>word</strong>
      text = text.replace(/\*\*(.*?)\*\*/g, '$1');

      setResult(text);
    } catch (error) {
      console.error('Error analyzing answers:', error);

      // Try to provide fallback analysis
      try {
        const fallbackResult = generateFallbackAnalysis(answers);
        setResult(fallbackResult);
        setLoading(false);
        return;
      } catch (fallbackError) {
        console.error('Fallback analysis also failed:', fallbackError);
      }

      let errorMessage = 'An error occurred while analyzing the answers.';

      if (error.message === 'API_KEY_NOT_CONFIGURED') {
        errorMessage = '🔑 Quiz analysis is not configured. Please set up your Hugging Face API key in the .env file to enable this feature.\n\nTo get an API key:\n1. Visit https://huggingface.co/settings/tokens\n2. Create a new API key (Read access is sufficient)\n3. Add it to the .env file as REACT_APP_HF_API_KEY=your_key_here\n4. Restart the application';
      } else if (error.message?.includes('503') || error.message?.includes('overloaded') || error.message?.includes('Service Unavailable')) {
        errorMessage = '🔄 Hugging Face service is temporarily overloaded. This is a temporary issue.\n\n💡 The system automatically retried 3 times. Please wait a moment and try submitting again.\n\nTechnical details: ' + error.message;
      } else if (error.message?.includes('429') || error.message?.includes('rate limit')) {
        errorMessage = '⏱️ Rate limit exceeded. Please wait a moment before submitting again.\n\nTechnical details: ' + error.message;
      } else if (error.message?.includes('401') || error.message?.includes('Unauthorized') || error.message?.includes('Invalid API key')) {
        errorMessage = '🔑 Invalid API key. Please check your Hugging Face API key configuration.\n\nTechnical details: ' + error.message;
      } else if (error.message?.includes('quota') || error.message?.includes('limit') || error.message?.includes('exceeded')) {
        errorMessage = '⚠️ API quota exceeded. Please check your Hugging Face usage limits.\n\nTechnical details: ' + error.message;
      } else if (error.message?.includes('network') || error.message?.includes('fetch') || error.message?.includes('Failed to fetch')) {
        errorMessage = '🌐 Network error. Please check your internet connection and try again.\n\nTechnical details: ' + error.message;
      } else {
        errorMessage = `❌ Unexpected error occurred.\n\nTechnical details: ${error.message}\n\nPlease check the browser console for more details.`;
      }

      setResult(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <Navbar />
    <div className="max-w-4xl mx-auto p-6" style={{background: 'linear-gradient(to right, #D1D5DB, #E5E7EB, #F3F4F6)', borderRadius: '1rem', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)', marginTop: '6rem'}}>
      <h1 className="text-2xl font-bold mb-6 text-center">Mental Health Quiz</h1>
      {questions.map((question, index) => (
        <div key={index} className="mb-4 text-black font-bold m-12">
          <p className={`mb-2 text-lg`}>{`${index+1}. ${question}`}</p>
          <div className="flex flex-col space-y-2">
            {options.map((option, optionIndex) => (
              <label
                key={optionIndex}
                className={`flex items-center p-3 px-5 block cursor-pointer rounded-full border border-black border-opacity-20 ${hoveredOption === index ? 'hover:bg-black hover:text-white' : 'hover:bg-gray-200'}`}
                onMouseEnter={() => handleOptionHover(index)}
                onMouseLeave={handleOptionLeave}
              >
                <input
                  type="radio"
                  name={`question-${index}`}
                  value={option}
                  checked={answers[index] === option}
                  onChange={() => handleChange(index, option)}
                  className="accent-primary"
                />
                <span className="ps-3 text-lg font-normal">{option}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
      <button
  onClick={handleSubmit}
  className="mt-6 w-half bg-blue-500 hover:bg-blue-700 text-white py-2 px-6 rounded-full transition-colors duration-300 ml-72"
>
  Submit
</button>

      {loading ? (
        <div className="flex justify-center mt-6">
          <Loader type="spinner-cub" bgColor={"#000000"} color={"#FFFFFF"} title={"spinner-cub"} size={100} />
        </div>
      ) : (
        result && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Analysis Result</h2>
            <p className="whitespace-pre-wrap">{result}</p>
          </div>
        )
      )}
    </div>
    </>
  );
};

export default Quiz;
