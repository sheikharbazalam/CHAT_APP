import React, { useState, useRef } from "react";
import PropTypes from "prop-types";

const VoiceRecord = ({ onSendVoice }) => {
  const [isRecording, setIsMediaRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: "audio/webm",
      audioBitsPerSecond: 16000,
    });
    mediaRecorderRef.current = mediaRecorder;
    audioChunksRef.current = [];
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, {
        type: "audio/webm",
      });
      const formData = new FormData();
      formData.append("voice", audioBlob, "voice.webm");
      try {
        const res = await fetch("http://localhost:4000/upload-voice", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (data.url) {
          onSendVoice(data.url); // Call the callback with the uploaded voice URL
        }
      } catch (error) {
        console.error("Error uploading voice:", error);
      }
      audioChunksRef.current = [];
      mediaRecorderRef.current = null;
    };
    mediaRecorder.start();
    setIsMediaRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsMediaRecording(false);
    }
  };

  return (
    <div>
      <button onClick={startRecording} disabled={isRecording}>
        Start Recording
      </button>
      <button onClick={stopRecording} disabled={!isRecording}>
        Stop Recording
      </button>
    </div>
  );
};
VoiceRecord.propTypes = {
  onSendVoice: PropTypes.func.isRequired,
};

export default VoiceRecord;
