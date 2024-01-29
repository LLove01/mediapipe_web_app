import React, { useState, useEffect, useRef } from 'react';
import { Pose, POSE_CONNECTIONS } from '@mediapipe/pose';
import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import camImage from './assets/cam.png';

function CameraPoseComponent() {
    const [cameraActive, setCameraActive] = useState(false);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const poseRef = useRef(null);
    const requestAnimationFrameId = useRef(null); // Store the ID of the animation frame

    useEffect(() => {
        if (!cameraActive) {
            const canvasCtx = canvasRef.current.getContext('2d');
            canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            if (requestAnimationFrameId.current) {
                cancelAnimationFrame(requestAnimationFrameId.current); // Stop the frame processing loop
            }
            if (videoRef.current && videoRef.current.srcObject) {
                videoRef.current.srcObject.getTracks().forEach(track => track.stop()); // Stop the camera stream
                videoRef.current.style.display = 'none'; // Hide the video element when the camera is off
            }
            return;
        } else {
            videoRef.current.style.display = 'block'; // Show the video element when the camera is on
        }

        const videoElement = videoRef.current;
        const canvasElement = canvasRef.current;

        poseRef.current = new Pose({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
        });

        poseRef.current.setOptions({
            modelComplexity: 1,
            smoothLandmarks: true,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });

        poseRef.current.onResults((results) => {
            if (results.poseLandmarks) {

                canvasElement.width = videoElement.videoWidth;
                canvasElement.height = videoElement.videoHeight;
                const canvasCtx = canvasElement.getContext('2d');
                canvasCtx.save();
                canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

                // Filter out head landmarks and draw the rest
                const headLandmarkIndices = new Set([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

                // Filter out connections that involve head landmarks
                const filteredConnections = POSE_CONNECTIONS.filter(connection =>
                    !headLandmarkIndices.has(connection[0]) && !headLandmarkIndices.has(connection[1])
                );
                const filteredLandmarks = results.poseLandmarks.filter((_, index) => !headLandmarkIndices.has(index));

                // Draw filtered connections and all landmarks
                drawConnectors(canvasCtx, results.poseLandmarks, filteredConnections, { color: '#00FF00', lineWidth: 0.5 });
                drawLandmarks(canvasCtx, filteredLandmarks, { color: '#FF0000', lineWidth: 1 });

                canvasCtx.restore();
            }
        });

        const camera = new Camera(videoElement, {
            onFrame: async () => {
                await poseRef.current.send({ image: videoElement });
            },
            width: 640,
            height: 480
        });

        camera.start();

        return () => {
            if (requestAnimationFrameId.current) {
                cancelAnimationFrame(requestAnimationFrameId.current); // Cleanup: stop the frame processing loop
            }
            if (videoElement.srcObject) {
                videoElement.srcObject.getTracks().forEach(track => track.stop()); // Cleanup: stop the camera stream
                videoElement.style.display = 'none'; // Hide the video element when the camera is off
            }
        };
    }, [cameraActive]);

    const toggleCamera = () => {
        setCameraActive(!cameraActive);
    };

    return (
        <div>
            <button onClick={toggleCamera} className="camera-toggle-button">
                {cameraActive ? 'Turn Off Camera' : 'Turn On Camera'}
            </button>
            <div className="video-container" style={{ backgroundImage: `url(${camImage})` }}>
                <video ref={videoRef} className="input-video" autoPlay playsInline style={{ display: 'block' }} />
                <canvas ref={canvasRef} className="pose-overlay output-canvas" />
            </div>
        </div>
    );
}

export default CameraPoseComponent;
