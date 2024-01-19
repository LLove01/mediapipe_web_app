import React, { useRef, useState, useEffect } from 'react';
import { FileDrop } from 'react-file-drop';
import { Pose, POSE_CONNECTIONS } from '@mediapipe/pose';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { calculateAngle, POSE_LANDMARKS } from './poseUtils';

function VideoUploadComponent() {
    const [videoSrc, setVideoSrc] = useState(null);
    const fileInputRef = useRef(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const requestAnimationFrameId = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [poseLandmarks, setPoseLandmarks] = useState(null);

    // Angle state varibles
    const [showLeftKneeAngle, setShowLeftKneeAngle] = useState(false);
    const [showRightKneeAngle, setShowRightKneeAngle] = useState(false);
    const [showLeftHipAngle, setShowLeftHipAngle] = useState(false);
    const [showRightHipAngle, setShowRightHipAngle] = useState(false);
    const [showLeftElbowAngle, setShowLeftElbowAngle] = useState(false);
    const [showRightElbowAngle, setShowRightElbowAngle] = useState(false);
    const [showLeftShoulderAngle, setShowLeftShoulderAngle] = useState(false);
    const [showRightShoulderAngle, setShowRightShoulderAngle] = useState(false);
    // Declare these state variables at the top with useState
    const [angleLeftKnee, setLeftKneeAngle] = useState(null);
    const [angleRightKnee, setRightKneeAngle] = useState(null);
    const [angleLeftHip, setLeftHipAngle] = useState(null);
    const [angleRightHip, setRightHipAngle] = useState(null);
    const [angleLeftElbow, setLeftElbowAngle] = useState(null);
    const [angleRightElbow, setRightElbowAngle] = useState(null);
    const [angleLeftShoulder, setLeftShoulderAngle] = useState(null);
    const [angleRightShoulder, setRightShoulderAngle] = useState(null);


    const calculateAndUpdateAngle = (keypoint1, keypoint2, keypoint3, setAngleState) => {
        if (keypoint1 && keypoint2 && keypoint3) {
            const angle = calculateAngle(keypoint1, keypoint2, keypoint3);
            console.log('Calculated angle: ', angle);  // Log right after calculation
            setAngleState(angle);
        }
    };


    useEffect(() => {
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
            setPoseLandmarks(results.poseLandmarks);

            const ctx = canvasRef.current.getContext('2d');
            ctx.save();
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);

            if (results.poseLandmarks) {
                drawConnectors(ctx, results.poseLandmarks, POSE_CONNECTIONS, { color: '#00FF00', lineWidth: 4 });
                drawLandmarks(ctx, results.poseLandmarks, { color: '#FF0000', lineWidth: 2 });

                // Define necessary keypoints
                const knee_l = results.poseLandmarks[POSE_LANDMARKS.LEFT_KNEE];
                const knee_r = results.poseLandmarks[POSE_LANDMARKS.RIGHT_KNEE];
                const hip_l = results.poseLandmarks[POSE_LANDMARKS.LEFT_HIP];
                const hip_r = results.poseLandmarks[POSE_LANDMARKS.RIGHT_HIP];
                const ankle_l = results.poseLandmarks[POSE_LANDMARKS.LEFT_ANKLE];
                const ankle_r = results.poseLandmarks[POSE_LANDMARKS.RIGHT_ANKLE];
                const shoulder_l = results.poseLandmarks[POSE_LANDMARKS.LEFT_SHOULDER];
                const shoulder_r = results.poseLandmarks[POSE_LANDMARKS.RIGHT_SHOULDER];
                const wrist_l = results.poseLandmarks[POSE_LANDMARKS.LEFT_WRIST];
                const wrist_r = results.poseLandmarks[POSE_LANDMARKS.RIGHT_WRIST];
                const elbow_l = results.poseLandmarks[POSE_LANDMARKS.LEFT_ELBOW];
                const elbow_r = results.poseLandmarks[POSE_LANDMARKS.RIGHT_ELBOW];

                // Right Knee Angle
                if (showRightKneeAngle && knee_r && hip_r && ankle_r) {
                    const calculatedRightKnee = calculateAngle(hip_r, knee_r, ankle_r);
                    setRightKneeAngle(calculatedRightKnee);
                    const kneeX = knee_r.x * canvasRef.current.width;
                    const kneeY = knee_r.y * canvasRef.current.height;
                    ctx.fillStyle = 'blue';
                    ctx.font = '60px Arial';
                    ctx.fillText(`${Math.round(calculatedRightKnee)}°`, kneeX, kneeY);
                }
                // Left Knee Angle
                if (showLeftKneeAngle && knee_l && hip_l && ankle_l) {
                    const calculatedLeftKnee = calculateAngle(hip_l, knee_l, ankle_l);
                    setLeftKneeAngle(calculatedLeftKnee);
                    const kneeX = knee_l.x * canvasRef.current.width;
                    const kneeY = knee_l.y * canvasRef.current.height;
                    ctx.fillStyle = 'red';
                    ctx.font = '60px Arial';
                    ctx.fillText(`${Math.round(calculatedLeftKnee)}°`, kneeX, kneeY);
                }

                // Left Hip Angle
                if (showLeftHipAngle && hip_l && shoulder_l && knee_l) {
                    const calculatedAngle = calculateAngle(shoulder_l, hip_l, knee_l);
                    setLeftHipAngle(calculatedAngle);
                    const hipX = hip_l.x * canvasRef.current.width;
                    const hipY = hip_l.y * canvasRef.current.height;
                    ctx.fillStyle = 'green';
                    ctx.font = '60px Arial';
                    ctx.fillText(`${Math.round(calculatedAngle)}°`, hipX, hipY);
                }

                // Right Hip Angle
                if (showRightHipAngle && hip_r && shoulder_r && knee_r) {
                    const calculatedAngle = calculateAngle(shoulder_r, hip_r, knee_r);
                    setRightHipAngle(calculatedAngle);
                    const hipX = hip_r.x * canvasRef.current.width;
                    const hipY = hip_r.y * canvasRef.current.height;
                    ctx.fillStyle = 'purple';
                    ctx.font = '60px Arial';
                    ctx.fillText(`${Math.round(calculatedAngle)}°`, hipX, hipY);
                }

                // Left Shoulder Angle
                if (showLeftShoulderAngle && shoulder_l && hip_l && elbow_l) {
                    const calculatedAngle = calculateAngle(hip_l, shoulder_l, elbow_l);
                    setLeftShoulderAngle(calculatedAngle);
                    const shoulderX = shoulder_l.x * canvasRef.current.width;
                    const shoulderY = shoulder_l.y * canvasRef.current.height;
                    ctx.fillStyle = 'orange';
                    ctx.font = '60px Arial';
                    ctx.fillText(`${Math.round(calculatedAngle)}°`, shoulderX, shoulderY);
                }

                // Right Shoulder Angle
                if (showRightShoulderAngle && shoulder_r && hip_r && elbow_r) {
                    const calculatedAngle = calculateAngle(hip_r, shoulder_r, elbow_r);
                    setRightShoulderAngle(calculatedAngle);
                    const shoulderX = shoulder_r.x * canvasRef.current.width;
                    const shoulderY = shoulder_r.y * canvasRef.current.height;
                    ctx.fillStyle = 'yellow';
                    ctx.font = '60px Arial';
                    ctx.fillText(`${Math.round(calculatedAngle)}°`, shoulderX, shoulderY);
                }


                // Left Elbow Angle
                if (showLeftElbowAngle && elbow_l && shoulder_l && wrist_l) {
                    const calculatedAngle = calculateAngle(shoulder_l, elbow_l, wrist_l);
                    setLeftElbowAngle(calculatedAngle);
                    const elbowX = elbow_l.x * canvasRef.current.width;
                    const elbowY = elbow_l.y * canvasRef.current.height;
                    ctx.fillStyle = 'cyan';
                    ctx.font = '60px Arial';
                    ctx.fillText(`${Math.round(calculatedAngle)}°`, elbowX, elbowY);
                }

                // Right Elbow Angle
                if (showRightElbowAngle && elbow_r && shoulder_r && wrist_r) {
                    const calculatedAngle = calculateAngle(shoulder_r, elbow_r, wrist_r);
                    setRightElbowAngle(calculatedAngle);
                    const elbowX = elbow_r.x * canvasRef.current.width;
                    const elbowY = elbow_r.y * canvasRef.current.height;
                    ctx.fillStyle = 'magenta';
                    ctx.font = '60px Arial';
                    ctx.fillText(`${Math.round(calculatedAngle)}°`, elbowX, elbowY);
                }

            }

            ctx.restore();
        });

        videoRef.current.pose = pose;
    }, [showLeftKneeAngle, angleLeftKnee, showRightKneeAngle, angleRightKnee, showLeftHipAngle, angleLeftHip, showRightHipAngle, angleRightHip, showLeftShoulderAngle, angleLeftShoulder, showRightShoulderAngle, angleRightShoulder, showLeftElbowAngle, angleLeftElbow, showRightElbowAngle, angleRightElbow]);



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

        const drawAndDetectFirstFrame = () => {
            if (pose) {
                pose.send({ image: video });
            } else {
                ctx.drawImage(video, 0, 0, canvasRef.current.width, canvasRef.current.height);
            }
        };

        const renderFrame = async () => {
            if (!video.paused && !video.ended) {
                ctx.drawImage(video, 0, 0, canvasRef.current.width, canvasRef.current.height);
                await pose.send({ image: video });
                requestAnimationFrame(renderFrame);
            }
        };

        video.addEventListener('loadedmetadata', () => {
            canvasRef.current.width = video.videoWidth;
            canvasRef.current.height = video.videoHeight;
            video.currentTime = 0;
        });

        video.addEventListener('loadeddata', () => {
            drawAndDetectFirstFrame();
            video.pause();
            setIsPlaying(false);
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


    const joints = [
        { name: "Left Knee", showAngle: showLeftKneeAngle, setShowAngle: setShowLeftKneeAngle },
        { name: "Right Knee", showAngle: showRightKneeAngle, setShowAngle: setShowRightKneeAngle },
        { name: "Left Hip", showAngle: showLeftHipAngle, setShowAngle: setShowLeftHipAngle },
        { name: "Right Hip", showAngle: showRightHipAngle, setShowAngle: setShowRightHipAngle },
        { name: "Left Elbow", showAngle: showLeftElbowAngle, setShowAngle: setShowLeftElbowAngle },
        { name: "Right Elbow", showAngle: showRightElbowAngle, setShowAngle: setShowRightElbowAngle },
        { name: "Left Shoulder", showAngle: showLeftShoulderAngle, setShowAngle: setShowLeftShoulderAngle },
        { name: "Right Shoulder", showAngle: showRightShoulderAngle, setShowAngle: setShowRightShoulderAngle }
    ];

    const jointAngleControls = joints.map(joint => (
        <div key={joint.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '5px' }}>
            <span>{joint.name}</span>
            <button onClick={() => {
                joint.setShowAngle(!joint.showAngle);
                console.log(`${joint.name} Angle Visibility: `, !joint.showAngle); // Log on button click
            }}>
                {joint.showAngle ? 'Hide Angle' : 'Show Angle'}
            </button>
        </div>
    ));


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
            <div className="joint-controls-container">
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
                    {jointAngleControls}
                </div>
            </div>
            {/* Hide the video element; it's only used to provide a source for the canvas */}
            <div style={{ display: 'none' }}>
                <video ref={videoRef} src={videoSrc} preload="metadata"></video>
            </div>
        </div >
    );
}

export default VideoUploadComponent;
