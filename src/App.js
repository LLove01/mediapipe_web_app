import React, { useState } from 'react';
import CameraObjectComponent from './CameraObjectComponent';
import CameraPoseComponent from './CameraPoseComponent';
import VideoPoseComponent from './VideoPoseComponent';
import VideoObjectComponent from './VideoObjectComponent';
import Navbar from './Navbar';
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
      <Navbar />
      <div className="toggle-switch">
        <button onClick={handleToggleCamera}>
          {showCamera ? 'Switch to Video Upload' : 'Switch to Camera'}
        </button>
        {/* This button is now outside the condition for showCamera */}
        <button onClick={handleToggleDetection}>
          {showPose ? 'Switch to Object Detection' : 'Switch to Pose Detection'}
        </button>
      </div>
      {showCamera ? (
        showPose ? <CameraPoseComponent /> : <CameraObjectComponent />
      ) : (
        showPose ? <VideoPoseComponent /> : <VideoObjectComponent />
      )}
    </div>
  );
}


export default App;
