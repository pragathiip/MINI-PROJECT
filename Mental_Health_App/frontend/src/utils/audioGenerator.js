// Audio Generator for Healing Frequencies
export const generateFrequencyAudio = (frequency, duration = 30) => {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
  oscillator.type = 'sine'; // Pure sine wave for healing frequencies
  
  // Set volume to a comfortable level
  gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
  
  // Fade in
  gainNode.gain.exponentialRampToValueAtTime(0.3, audioContext.currentTime + 1);
  
  // Fade out near the end
  gainNode.gain.exponentialRampToValueAtTime(0.1, audioContext.currentTime + duration - 1);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + duration);
  
  return { oscillator, gainNode, audioContext };
};

// Frequency definitions
export const HEALING_FREQUENCIES = {
  '396': { name: '396 Hz - Healing', description: 'Liberating Guilt and Fear' },
  '417': { name: '417 Hz - Change', description: 'Undoing Situations and Facilitating Change' },
  '432': { name: '432 Hz - Earth', description: 'Natural Earth Frequency' },
  '528': { name: '528 Hz - Love', description: 'Love and DNA Repair' },
  '639': { name: '639 Hz - Balance', description: 'Connecting Relationships' }
};

// Create audio element for frequency playback
export const createFrequencyPlayer = (frequency, containerId) => {
  const container = document.getElementById(containerId);
  if (!container) return null;
  
  const playerDiv = document.createElement('div');
  playerDiv.className = 'frequency-player';
  playerDiv.style.cssText = `
    margin: 10px 0;
    padding: 15px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 10px;
    color: white;
    text-align: center;
  `;
  
  const frequencyInfo = HEALING_FREQUENCIES[frequency];
  
  playerDiv.innerHTML = `
    <div style="margin-bottom: 10px;">
      <strong>${frequencyInfo.name}</strong><br>
      <small>${frequencyInfo.description}</small>
    </div>
    <button id="play-${frequency}" style="
      background: rgba(255,255,255,0.2);
      border: 2px solid rgba(255,255,255,0.3);
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      cursor: pointer;
      margin: 0 5px;
      transition: all 0.3s ease;
    " onmouseover="this.style.background='rgba(255,255,255,0.3)'" 
       onmouseout="this.style.background='rgba(255,255,255,0.2)'">
      ▶️ Play (30s)
    </button>
    <button id="stop-${frequency}" style="
      background: rgba(255,255,255,0.2);
      border: 2px solid rgba(255,255,255,0.3);
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      cursor: pointer;
      margin: 0 5px;
      transition: all 0.3s ease;
      display: none;
    " onmouseover="this.style.background='rgba(255,255,255,0.3)'" 
       onmouseout="this.style.background='rgba(255,255,255,0.2)'">
      ⏹️ Stop
    </button>
  `;
  
  container.appendChild(playerDiv);
  
  let currentAudio = null;
  
  // Play button functionality
  document.getElementById(`play-${frequency}`).addEventListener('click', () => {
    if (currentAudio) {
      currentAudio.oscillator.stop();
      currentAudio.audioContext.close();
    }
    
    currentAudio = generateFrequencyAudio(parseInt(frequency), 30);
    
    document.getElementById(`play-${frequency}`).style.display = 'none';
    document.getElementById(`stop-${frequency}`).style.display = 'inline-block';
    
    // Auto-hide stop button after 30 seconds
    setTimeout(() => {
      document.getElementById(`play-${frequency}`).style.display = 'inline-block';
      document.getElementById(`stop-${frequency}`).style.display = 'none';
    }, 30000);
  });
  
  // Stop button functionality
  document.getElementById(`stop-${frequency}`).addEventListener('click', () => {
    if (currentAudio) {
      currentAudio.oscillator.stop();
      currentAudio.audioContext.close();
      currentAudio = null;
    }
    
    document.getElementById(`play-${frequency}`).style.display = 'inline-block';
    document.getElementById(`stop-${frequency}`).style.display = 'none';
  });
  
  return playerDiv;
};
