import React, { useState, useRef, useEffect } from 'react';

const FrequencyPlayer = ({ frequency, name, description }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    // Create audio element
    const audio = new Audio(`/audio/frequencies/${frequency}hz.mp3`);
    audioRef.current = audio;

    // Set up event listeners
    audio.addEventListener('loadedmetadata', () => {
      setDuration(audio.duration);
    });

    audio.addEventListener('timeupdate', () => {
      setCurrentTime(audio.currentTime);
    });

    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      setCurrentTime(0);
    });

    audio.addEventListener('error', (e) => {
      console.error('Error loading audio:', e);
      setIsPlaying(false);
    });

    // Set volume to comfortable level
    audio.volume = 0.3;

    return () => {
      audio.pause();
      audio.removeEventListener('loadedmetadata', () => {});
      audio.removeEventListener('timeupdate', () => {});
      audio.removeEventListener('ended', () => {});
      audio.removeEventListener('error', () => {});
    };
  }, [frequency]);

  const togglePlayback = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((error) => {
          console.error('Error playing audio:', error);
          setIsPlaying(false);
        });
    }
  };

  const stopPlayback = () => {
    if (!audioRef.current) return;

    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{
      margin: '10px 0',
      padding: '15px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '10px',
      color: 'white',
      textAlign: 'center',
      boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
    }}>
      <div style={{ marginBottom: '15px' }}>
        <strong>{name}</strong><br />
        <small style={{ opacity: 0.9 }}>{description}</small>
      </div>

      {/* Progress bar */}
      {duration > 0 && (
        <div style={{
          width: '100%',
          height: '4px',
          background: 'rgba(255,255,255,0.2)',
          borderRadius: '2px',
          marginBottom: '10px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${(currentTime / duration) * 100}%`,
            height: '100%',
            background: 'rgba(255,255,255,0.8)',
            borderRadius: '2px',
            transition: 'width 0.1s ease'
          }} />
        </div>
      )}

      {/* Time display */}
      {duration > 0 && (
        <div style={{
          fontSize: '12px',
          opacity: 0.8,
          marginBottom: '10px'
        }}>
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      )}

      {/* Control buttons */}
      <div>
        <button
          onClick={togglePlayback}
          style={{
            background: isPlaying ? 'rgba(255,99,99,0.3)' : 'rgba(255,255,255,0.2)',
            border: '2px solid rgba(255,255,255,0.3)',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '20px',
            cursor: 'pointer',
            margin: '0 5px',
            transition: 'all 0.3s ease',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
          onMouseOver={(e) => {
            e.target.style.background = isPlaying ? 'rgba(255,99,99,0.4)' : 'rgba(255,255,255,0.3)';
          }}
          onMouseOut={(e) => {
            e.target.style.background = isPlaying ? 'rgba(255,99,99,0.3)' : 'rgba(255,255,255,0.2)';
          }}
        >
          {isPlaying ? '⏸️ Pause' : '▶️ Play'}
        </button>

        <button
          onClick={stopPlayback}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: '2px solid rgba(255,255,255,0.3)',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '20px',
            cursor: 'pointer',
            margin: '0 5px',
            transition: 'all 0.3s ease',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
          onMouseOver={(e) => {
            e.target.style.background = 'rgba(255,255,255,0.3)';
          }}
          onMouseOut={(e) => {
            e.target.style.background = 'rgba(255,255,255,0.2)';
          }}
        >
          ⏹️ Stop
        </button>
      </div>

      {isPlaying && (
        <div style={{
          marginTop: '10px',
          fontSize: '12px',
          opacity: 0.8,
          animation: 'pulse 2s infinite'
        }}>
          🎵 Playing healing frequency...
        </div>
      )}

      <style jsx>{`
        @keyframes pulse {
          0% { opacity: 0.8; }
          50% { opacity: 1; }
          100% { opacity: 0.8; }
        }
      `}</style>
    </div>
  );
};

export default FrequencyPlayer;
