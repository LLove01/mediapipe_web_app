import React, { useState } from 'react';
import CameraComponent from './CameraComponent';
import VideoUploadComponent from './VideoComponent';
import './App.css';

function App() {
  const [showCamera, setShowCamera] = useState(false);

  const handleToggle = () => {
    setShowCamera(!showCamera);
  };

  return (
    <div className="App">
      <div className="toggle-switch">
        <button onClick={handleToggle}>
          {showCamera ? 'Switch to Video Upload' : 'Switch to Camera'}
        </button>
      </div>
      {showCamera ? (
        <CameraComponent />
      ) : (
        <VideoUploadComponent />
      )}
    </div>
  );
}

export default App;
