import React, { useState } from 'react';
import CameraComponent from './CameraComponent';
import VideoPoseComponent from './VideoPoseComponent';
import VideoObjectComponent from './VideoObjectComponent';
import './App.css';

function App() {
  const [showCamera, setShowCamera] = useState(false);
  const [showPose, setShowPose] = useState(true); // New state for toggling between pose and object

  const handleToggleCamera = () => {
    setShowCamera(!showCamera);
  };

  const handleToggleDetection = () => {
    setShowPose(!showPose);
  };

  return (
    <div className="App">
      <div className="toggle-switch">
        <button onClick={handleToggleCamera}>
          {showCamera ? 'Switch to Video Upload' : 'Switch to Camera'}
        </button>
        {!showCamera && (
          <button onClick={handleToggleDetection}>
            {showPose ? 'Switch to Object Detection' : 'Switch to Pose Detection'}
          </button>
        )}
      </div>
      {showCamera ? (
        <CameraComponent />
      ) : showPose ? (
        <VideoPoseComponent />
      ) : (
        <VideoObjectComponent />
      )}
    </div>
  );
}

export default App;
