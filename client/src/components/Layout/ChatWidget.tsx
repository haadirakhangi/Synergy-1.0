import React, { useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faRobot,
  faTimes,
  faPaperPlane,
  faMicrophone,
  faMicrophoneAltSlash,
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import '/src/assets/chat_widget.css'; // Import your styles

const ChatWidget: React.FC = () => {
  const [showChatbot, setShowChatbot] = useState(false);
  const [userMessage, setUserMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ role: string; message: string }>>([]);
  const [loading, setLoading] = useState(false);

  const sendAudioToServer = async (audioBlob: Blob) => {
    try {
      setLoading(true);
  
      // Create a FormData object and append the audioBlob with a key
      const formData = new FormData();
      formData.append('voice', audioBlob, 'voice.wav');
  
      // Send the FormData to the Flask route using axios
      const response = await axios.post("/api/voice-chat", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      setUserMessage(response.data.chatbotResponse);
    } catch (error) {
      console.error('Error sending audio to server:', error);
    } finally {
      setLoading(false);
    }
  };
  


  const handleSendMessage = async () => {
    let newChatHistory = [...chatHistory];
    newChatHistory.push({ role: 'user', message: userMessage });

    setLoading(true);

    try {
      const response = await fetch('/api/chatbot-route', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userdata: userMessage }),
      });

      const data = await response.json();

      const chatbotResponse = data.chatbotResponse;

      const newChatHistoryWithResponse = [
        ...newChatHistory,
        { role: 'chatbot', message: chatbotResponse },
      ];
      setChatHistory(newChatHistoryWithResponse);
    } catch (error) {
      console.error('Error fetching chatbot response:', error);
    } finally {
      setLoading(false);
    }

    setUserMessage('');
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const formData = new FormData();
      formData.append('file', event.target.files[0]);

      try {
        setLoading(true);
        setUserMessage('Uploading A file');
        let newChatHistory = [...chatHistory];
        newChatHistory.push({ role: 'user', message: userMessage });
        const response = await axios.post('/api/upload-file', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        const chatbotResponse = response.data.chatbotResponse;
        const newChatHistoryWithResponse = [
          ...newChatHistory,
          { role: 'chatbot', message: chatbotResponse },
        ];
        setChatHistory(newChatHistoryWithResponse);
        setUserMessage('');
      } catch (error) {
        console.error('Error uploading file to server:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div>
      <div className="floating-chatbot-button" onClick={() => setShowChatbot(!showChatbot)}>
        <FontAwesomeIcon icon={faRobot} />
      </div>
      {showChatbot && (
        <div className={`chatbot-interface ${showChatbot ? 'opened' : ''}`}>
          <button className="close-button" onClick={() => setShowChatbot(false)}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
          <div className="chat-history">
            {chatHistory.map((item, index) => (
              <div key={index} className={`message ${item.role}`}>
                {item.role === 'user' ? (
                  <div>
                    <strong>User:</strong> {item.message}
                  </div>
                ) : (
                  <div>
                    <strong>Chatbot:</strong> {item.message}
                  </div>
                )}
              </div>
            ))}
            {loading && <div className="loading-dots">Loading...</div>}
          </div>
          <div className="user-input">
            <input
              type="text"
              placeholder="Type your message..."
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
            />
            <button onClick={handleSendMessage} style={{ marginRight: '10px' }}>
              <FontAwesomeIcon icon={faPaperPlane} />
            </button>
            <label className="file-upload-button" >
              <input type="file" onChange={handleFileUpload} style={{width: "100px"}}/>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;
