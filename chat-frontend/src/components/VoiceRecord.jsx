import React, { useState, useRef } from "react";
import { v4 as uuidv4 } from "uuid";

const VoiceRecord = ({ onSendVoice }) => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        const audiofile = new File([audioBlob], `${uuidv4()}.webm`, {
          type: "audio/webm",
        });

        onSendVoice(audiofile);
        // You can also create a URL for the audio file if needed
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.play();
        // or you can use the audio file directly
        onSendVoice(audiofile);
        audioChunksRef.current = [];
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };
  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setIsRecording(false);
  };
  const handleRecordClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };
  return (
    <div>
      <button onClick={handleRecordClick}>
        {isRecording ? "Stop Recording" : "Start Recording"}
      </button>
    </div>
  );
};

export default VoiceRecord;
