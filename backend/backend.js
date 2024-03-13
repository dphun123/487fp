import express from "express";
import cors from "cors";
import { config } from "dotenv";
import axios from "axios";
import * as tf from "@tensorflow/tfjs-node";
import fs from "fs";
import GIFEncoder from "gifencoder";
import { createCanvas, loadImage } from "canvas";
import multer from "multer";

const app = express();
const port = 8000;

app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });

config();
async function loadModel() {
  try {
    const model = await tf.loadGraphModel("file://./tfjs_model3/model.json");
    console.log("Model loaded successfully");
    return model;
  } catch (error) {
    console.error("Error loading model:", error);
    throw error;
  }
}

const model = await loadModel();

// const classLabels = ["banana", "bread", "green onion", "ground beef", "potato"];
// const classLabels = [
//   "apple",
//   "banana",
//   "bread",
//   "broccoli",
//   "brown rice",
//   "butter",
//   "chicken meat",
//   "egg",
//   "green onion",
//   "ground beef",
//   "olive oil",
//   "onion",
//   "potato",
//   "tomato",
//   "vegetable oil",
//   "white rice",
// ];

const classLabels = [
  "banana",
  "bread",
  "chicken meat",
  "green onion",
  "ground beef",
  "olive oil",
  "tomato",
  "vegetable oil",
];

app.post("/classify2", upload.single("imageData"), async (req, res) => {
  try {
    console.log(req.file);
    const buffer = await fs.promises.readFile(req.file.path);
    // create tensor
    const imageTensor = tf.node.decodeImage(buffer);
    // perform sliding window and image pyramid operations on the resized image
    const normalizedTensor = imageTensor.toFloat().div(255);
    const detections = await detectObjects(normalizedTensor);
    res.send({ prediction: detections });
  } catch (error) {
    console.error("Error detecting objects:", error);
    res.status(500).send("An error occurred while detecting objects.");
  }
});

function* sliding_window(image, step, ws) {
  for (let y = 0; y < image.shape[0] - ws[1]; y += step) {
    for (let x = 0; x < image.shape[1] - ws[0]; x += step) {
      const window = image.slice([y, x, 0], [ws[1], ws[0], image.shape[2]]);
      yield [x, y, window];
    }
  }
}

function* image_pyramid(image, scale = 1.5, minSize = [224, 224]) {
  yield image;
  while (true) {
    const w = Math.floor(image.shape[1] / scale);
    image = tf.image.resizeBilinear(image, [w, w]);
    if (image.shape[0] < minSize[0] || image.shape[1] < minSize[1]) {
      break;
    }
    yield image;
  }
}

async function detectObjects(imageTensor) {
  const WIDTH = 600;
  const PYR_SCALE = 1.5;
  const WIN_STEP = 32;
  const ROI_SIZE = [200, 150];
  const INPUT_SIZE = [224, 224];

  console.log(
    "Original image: ",
    imageTensor.shape[0],
    "x",
    imageTensor.shape[1]
  );

  // resize the image
  const resizedImage = tf.image.resizeBilinear(imageTensor, [WIDTH, WIDTH]);

  console.log("1. Creating image pyramid");

  // initialize the image pyramid
  const pyramid = image_pyramid(resizedImage, PYR_SCALE, ROI_SIZE);

  const labels = new Set();
  let i = 1;

  // loop over the image pyramid
  for (const image of pyramid) {
    console.log(`Layer ${i}:`, image.shape);
    await downloadImage(image, `images/image_pyramid_layer${i}.png`);
    const scale = WIDTH / image.shape[1];
    const slidingWindowGenerator = sliding_window(image, WIN_STEP, ROI_SIZE);
    // set up for gif
    const gifTensor = image.mul(255).clipByValue(0, 255).toInt();
    const outputPath = `images/gif_layer${i}_sliding.gif`;
    // get dimensions
    const [height, width, channels] = gifTensor.shape;
    // set up  GIF encoder
    const encoder = new GIFEncoder(width, height);
    encoder.createReadStream().pipe(fs.createWriteStream(outputPath));
    encoder.start();
    encoder.setRepeat(0);
    encoder.setDelay(100);
    // set up canvas
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");
    // Convert the tensor to a Uint8Array for canvas
    const imageData = await tf.node.encodePng(gifTensor);
    const imageBuffer = Buffer.from(imageData.buffer, "base64");
    // Load the image directly from buffer
    const loadedImage = await loadImage(imageBuffer);
    // Draw the initial image
    ctx.drawImage(loadedImage, 0, 0, width, height);

    // loop over the sliding window locations
    for (const [x, y, window] of slidingWindowGenerator) {
      // resize the window
      const resizedImage = tf.image.resizeBilinear(window, INPUT_SIZE);
      const batchedInput = resizedImage.expandDims(0);
      // get predicted class label and probability
      const prediction = model.predict(batchedInput);
      const predictionArray = prediction.arraySync()[0];
      const predictedClassIndex = tf.argMax(predictionArray).dataSync()[0];
      const predictedProbability = predictionArray[predictedClassIndex];
      // if probability high enough
      if (predictedProbability > 0.96) {
        // add to labels
        const predictedClass = classLabels[predictedClassIndex];
        labels.add(predictedClass);
        // green box
        ctx.globalAlpha = 1.0;
        ctx.strokeStyle = "green";
        ctx.font = "20px Arial";
        ctx.fillStyle = "black";
        const textWidth = ctx.measureText(predictedClass).width;
        ctx.fillText(
          predictedClass,
          x + window.shape[1] / 2 - textWidth / 2,
          y
        );
      } else {
        ctx.globalAlpha = 0.3;
        ctx.strokeStyle = "red";
      }
      ctx.strokeRect(x, y, window.shape[1], window.shape[0]);
      // Add the frame to the GIF
      encoder.addFrame(ctx);
    }
    // Finish encoding the GIF
    encoder.finish();
    console.log(`GIF saved to ${outputPath}`);
    i++;
  }
  console.log([...labels]);
  return [...labels];
}

app.post("/recommend", async (req, res) => {
  const { ingredients } = req.body;
  const options = {
    method: "GET",
    url: "https://tasty.p.rapidapi.com/recipes/list",
    params: {
      from: "0",
      size: "20",
      q: ingredients,
    },
    headers: {
      "X-RapidAPI-Key": process.env.X_RAPIDAPI_KEY,
      "X-RapidAPI-Host": process.env.X_RAPIDAPI_HOST,
    },
  };

  try {
    const response = await axios.request(options);
    res.send({ recommendations: response.data });
  } catch (error) {
    console.log(error);
    res.status(500).send("An error ocurred in the server.");
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

async function downloadImage(image, filePath) {
  const denormalizedImage = image.mul(255).clipByValue(0, 255).toInt();
  const buffer = await tf.node.encodePng(denormalizedImage);
  fs.writeFileSync(filePath, buffer);
  console.log(`Image saved to: ${filePath}`);
}

app.post("/classify1", upload.single("imageData"), async (req, res) => {
  try {
    const buffer = await fs.promises.readFile(req.file.path);
    // resize and normalize image
    const imageTensor = tf.node.decodeImage(buffer);
    const resizedImage = tf.image.resizeBilinear(imageTensor, [224, 224]);
    const normalizedImage = resizedImage.toFloat().div(255.0);
    const batchedInput = normalizedImage.expandDims(0);
    // get prediction
    const prediction = model.predict(batchedInput);
    const predictionArray = prediction.arraySync()[0];
    const predictedClassIndex = tf.argMax(predictionArray).dataSync()[0];
    const predictedProbability = predictionArray[predictedClassIndex];
    const predictedClass = classLabels[predictedClassIndex];
    // console.log(predictedClass, predictedProbability);
    // Return the classification result
    console.log([predictedClass]);
    res.send({ prediction: [predictedClass] });
  } catch (error) {
    console.error("Error classifying image:", error);
    res.status(500).send("An error occurred while classifying the image.");
  }
});
