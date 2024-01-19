import React, { useRef, useState, useEffect } from 'react';
import { FileDrop } from 'react-file-drop';
import { Pose, POSE_CONNECTIONS } from '@mediapipe/pose';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';

function VideoUploadComponent() {
    const [videoSrc, setVideoSrc] = useState(null);
    const fileInputRef = useRef(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const requestAnimationFrameId = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        // Initialize the pose detector
        const pose = new Pose({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
        });

        pose.setOptions({
            modelComplexity: 1,
            smoothLandmarks: true,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });

        pose.onResults((results) => {
            const ctx = canvasRef.current.getContext('2d');
            ctx.save();
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

            // Draw the video frame first
            ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);

            // Then draw the pose landmarks
            if (results.poseLandmarks) {
                drawConnectors(ctx, results.poseLandmarks, POSE_CONNECTIONS, { color: '#00FF00', lineWidth: 4 });
                drawLandmarks(ctx, results.poseLandmarks, { color: '#FF0000', lineWidth: 2 });
            }

            ctx.restore();
        });


        // Save the pose instance for later use
        videoRef.current.pose = pose;
    }, []);

    const handleVideoUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setVideoSrc(url);
        }
    };

    const drawVideoOnCanvas = () => {
        const video = videoRef.current;
        const pose = video.pose;
        const ctx = canvasRef.current.getContext('2d');

        // Function to draw the first frame and perform pose detection
        const drawAndDetectFirstFrame = () => {
            if (pose) {
                pose.send({ image: video }); // This will trigger pose.onResults to draw the frame and pose
            } else {
                ctx.drawImage(video, 0, 0, canvasRef.current.width, canvasRef.current.height);
            }
        };

        const renderFrame = async () => {
            if (!video.paused && !video.ended) {
                // Draw the video frame
                ctx.drawImage(video, 0, 0, canvasRef.current.width, canvasRef.current.height);

                // Send the current frame to pose detector
                await pose.send({ image: video });
                requestAnimationFrameId.current = requestAnimationFrame(renderFrame);
            }
        };

        video.addEventListener('loadedmetadata', () => {
            canvasRef.current.width = video.videoWidth;
            canvasRef.current.height = video.videoHeight;
            video.currentTime = 0; // Seek to the start
        });

        video.addEventListener('loadeddata', () => {
            drawAndDetectFirstFrame(); // Draw the first frame when it's available
            video.pause(); // Ensure the video is paused after drawing the first frame
            setIsPlaying(false); // Update the playing state
        });

        video.addEventListener('play', renderFrame);

    };
    const togglePlayPause = () => {
        const video = videoRef.current;
        if (!video) return;

        if (video.paused || video.ended) {
            video.play();
            setIsPlaying(true);
        } else {
            video.pause();
            setIsPlaying(false);
        }
    };

    const handleReset = () => {
        const video = videoRef.current;
        const pose = video.pose;

        if (video) {
            video.pause();
            video.currentTime = 0;
            setIsPlaying(false);

            video.onseeked = async () => {
                // Trigger pose detection for the first frame
                if (pose) {
                    await pose.send({ image: video });
                }
                video.onseeked = null; // Clear the event handler
            };
        }
    };


    // Function to remove the video and clear the canvas
    const handleRemove = () => {
        setVideoSrc(null);
        setIsPlaying(false);
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    };


    useEffect(() => {
        if (videoSrc) {
            drawVideoOnCanvas();
        }

        return () => {
            if (requestAnimationFrameId.current) {
                cancelAnimationFrame(requestAnimationFrameId.current);
            }
        };
    }, [videoSrc]);

    return (
        <div>
            <div className="drop-area">
                {!videoSrc && (
                    <FileDrop onDrop={handleVideoUpload} onTargetClick={() => fileInputRef.current.click()}>
                        Drop your video here or click to upload
                    </FileDrop>
                )}
                <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleVideoUpload}
                    style={{ display: 'none' }}
                />
                {videoSrc && (
                    <canvas ref={canvasRef} style={{ width: '100%', height: 'auto' }}></canvas>
                )}
            </div>
            <div>
                {videoSrc && (
                    <>
                        <button onClick={togglePlayPause}>
                            {isPlaying ? 'Pause' : 'Play'}
                        </button>
                        <button onClick={handleReset}>Reset</button>
                        <button onClick={handleRemove}>Remove</button>
                    </>
                )}
            </div>
            {/* Hide the video element; it's only used to provide a source for the canvas */}
            <div style={{ display: 'none' }}>
                <video ref={videoRef} src={videoSrc} preload="metadata"></video>
            </div>
        </div >
    );
}

export default VideoUploadComponent;
