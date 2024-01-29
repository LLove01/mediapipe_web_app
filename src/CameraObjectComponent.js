import React, { useRef, useState, useEffect } from 'react';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import '@tensorflow/tfjs';
import { Camera } from '@mediapipe/camera_utils';

function CameraObjectComponent() {
    const [cameraActive, setCameraActive] = useState(false);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const modelRef = useRef(null);

    useEffect(() => {
        // Load the COCO-SSD model
        const loadModel = async () => {
            modelRef.current = await cocoSsd.load();
        };

        loadModel().catch(console.error);

        return () => {
            // Any cleanup would go here
        };
    }, []);

    useEffect(() => {
        if (!cameraActive) {
            if (videoRef.current && videoRef.current.srcObject) {
                videoRef.current.srcObject.getTracks().forEach(track => track.stop());
            }
            return;
        }

        const videoElement = videoRef.current;
        const canvasElement = canvasRef.current;
        canvasElement.width = 640;
        canvasElement.height = 480;

        const camera = new Camera(videoRef.current, {
            onFrame: async () => {
                if (modelRef.current) {
                    const predictions = await modelRef.current.detect(videoRef.current);
                    const ctx = canvasRef.current.getContext('2d');
                    canvasRef.current.width = videoRef.current.videoWidth;
                    canvasRef.current.height = videoRef.current.videoHeight;

                    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                    predictions.forEach(prediction => {
                        if (prediction.class === 'sports ball') {
                            console.log("Sports ball detected", prediction);
                            const [x, y, width, height] = prediction.bbox;
                            ctx.strokeStyle = 'red';
                            ctx.lineWidth = 4;
                            ctx.strokeRect(x, y, width, height);
                        }
                    });
                }
            },
            width: 640,
            height: 480
        });

        camera.start();

        return () => {
            if (videoElement.srcObject) {
                videoElement.srcObject.getTracks().forEach(track => track.stop());
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
            <div className="video-container">
                <video ref={videoRef} className="input-video" autoPlay playsInline style={{ display: 'block' }} />
                <canvas ref={canvasRef} className="pose-overlay output-canvas" />
            </div>
        </div>
    );
}

export default CameraObjectComponent;
