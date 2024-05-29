const router = require("express").Router();
const Transcoder = require("simple-hls").Transcoder;
const fs = require("fs");
const path = require("path");
const { initializeApp } = require("firebase/app");
const {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} = require("firebase/storage");

const firebaseConfig = {
  apiKey: `${process.env.FIREBASE_API}`,
  authDomain: "gaiasight-b8a92.firebaseapp.com",
  projectId: "gaiasight-b8a92",
  storageBucket: "gaiasight-b8a92.appspot.com",
  messagingSenderId: "818784592613",
  appId: "1:818784592613:web:690b1a295e7a490f4c2a0c",
};

const firebaseApp = initializeApp(firebaseConfig);
const storage = getStorage(firebaseApp);

const uploadFilesToFirebase = async (folderPath, directory) => {
  try {
    const { default: pLimit } = await import("p-limit"); // import dinamic, nu ma lasa sa il import la inceput
    const limit = pLimit(5); // Limitez upload-ul la 5 fisiere simultan, la fisiere mai mari primesc timeout

    const files = fs.readdirSync(folderPath);
    const uploadPromises = [];
    const indexFiles = [];

    for (const file of files) {
      const filePath = `${folderPath}/${file}`;
      const storageRef = ref(storage, `${directory}/${file}`);
      const fileData = fs.readFileSync(filePath);

      const uploadPromise = limit(() =>
        uploadBytes(storageRef, fileData).then((data) =>
          getDownloadURL(data.ref).then((url) => ({ fileName: file, url }))
        )
      );

      uploadPromises.push(uploadPromise); // Store all files and their links in case needed later

      if (file.includes("index")) {
        indexFiles.push(uploadPromise); // Store link of index.m3u8
      }
    }

    // Wait for all uploads to complete, but only return index files
    await Promise.all(uploadPromises);
    return Promise.all(indexFiles);
  } catch (error) {
    console.error("Error uploading files to Firebase:", error);
    throw error;
  }
};

// const uploadFilesToFirebase = async (folderPath, directory) => {
//   try {
//     const files = fs.readdirSync(folderPath);
//     const uploadPromises = [];
//     const indexFiles = [];

//     for (const file of files) {
//       const filePath = `${folderPath}/${file}`;
//       const storageRef = ref(storage, `${directory}/${file}`);
//       const uploadTask = uploadBytes(storageRef, fs.readFileSync(filePath));

//       const uploadPromise = new Promise((resolve, reject) => {
//         uploadTask
//           .then((data) => {
//             getDownloadURL(data.ref).then((url) => {
//               resolve({ fileName: file, url });
//             });
//           })
//           .catch((error) => {
//             reject(error);
//           });
//       });

//       uploadPromises.push(uploadPromise); //toate fisierele si link-urile lor in caz de am nevoie mai tarziu

//       if (file.includes("index")) {
//         indexFiles.push(uploadPromise); //link-ul index.m3u8
//       }
//     }

//     return Promise.all(indexFiles);
//   } catch (error) {
//     console.error("Error uploading files to Firebase:", error);
//     throw error;
//   }
// };

router.post("/uploadHLS", async (req, res) => {
  const { folderPath, directory } = req.body;

  try {
    const indexFile = await uploadFilesToFirebase(folderPath, directory);
    console.log("Index file:", indexFile);
    res.status(200).json({ message: "Files uploaded successfully", indexFile });
  } catch (error) {
    console.error("Error updating files:", error);
    res.status(500).json({ message: "Error updating files", error });
  }
});

router.post("/", async (req, res) => {
  const { inputPath, outputPath, customRenditions } = req.body;
  console.log(inputPath, outputPath);

  if (!fs.existsSync(outputPath)) {
    try {
      fs.mkdirSync(outputPath, { recursive: true });
      console.log("Output directory created:", outputPath);
    } catch (error) {
      console.error("Error creating output directory:", error);
      res
        .status(500)
        .json({ message: "Error creating output directory", error });
      return;
    }
  }

  const t = new Transcoder(inputPath, outputPath, {
    renditions: customRenditions,
  });

  try {
    const hlsPath = await t.transcode();
    res.status(200).json({ message: "HLS generation successful", hlsPath });
  } catch (error) {
    res.status(500).json({ message: "HLS generation failed", error });
  }
});

router.post("/updateFilesInFolder", async (req, res) => {
  const { folderPath, videoName } = req.body;
  console.log(folderPath, videoName);

  try {
    const files = fs.readdirSync(folderPath);

    files.forEach((file) => {
      if (file.endsWith(".m3u8")) {
        const filePath = path.join(folderPath, file);
        const fileContents = fs.readFileSync(filePath, "utf-8");
        const lines = fileContents.split("\n");
        const updatedLines = lines.map((line) => {
          if (line.includes(".ts") || line.includes(".m3u8")) {
            return `${videoName}%2F${line}?alt=media`;
          }
          return line;
        });

        const updatedContents = updatedLines.join("\n");
        fs.writeFileSync(filePath, updatedContents, "utf-8");

        console.log(`File ${filePath} updated successfully.`);
      }
    });

    res.status(200).json({ message: "Files updated successfully" });
  } catch (error) {
    console.error("Error updating files:", error);
    res.status(500).json({ message: "Error updating files", error });
  }
});

module.exports = router;
