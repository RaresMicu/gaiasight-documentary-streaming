# gaiasight-streaming


## Overview
I have developed a web streaming application that streams video content using the HTTP Live Streaming (HLS) protocol. The application encodes video with H.264 and audio with AAC, ensuring efficient and high-quality streaming. Built using the MERN stack (MongoDB, Express, React, Node.js), it also leverages the Firebase API for storage, allowing admins to upload video/image files seamlessly.

## Features

### User Perspectives
- **Normal User**:
  - Watch videos at the highest bitrate supported by the network.
- **Admin**:
  - Manage users, documentaries, and documentary lists.
  - Convert MP4 files to HLS format using ffmpeg.
      
## Technical Details
- **Frontend**: React
- **Backend**: Node.js with Express
- **Database**: MongoDB
- **Storage**: Firebase for file uploads
- **Video Streaming**: 
  - **Protocol**: HLS
  - **Video Encoding**: H.264
  - **Audio Encoding**: AAC
- **Conversion**: MP4 to HLS conversion using ffmpeg

## Next Steps
- Fixing bugs to enhance stability and performance.
- Transitioning from Firebase storage to a Content Delivery Network (CDN) for improved scalability and speed.
- Optimizing stream queries for better efficiency.
- Adding functionality for users to manually select video quality.
