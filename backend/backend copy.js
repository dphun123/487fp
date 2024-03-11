import express from "express";
import cors from "cors";
import { config } from "dotenv";
import axios from "axios";
import * as tf from "@tensorflow/tfjs-node";
import fs from "fs";

const app = express();
const port = 8000;

app.use(cors());
app.use(express.json());

config();
async function loadModel() {
  try {
    const model = await tf.loadGraphModel("file://./tfjs_model/model.json");
    console.log("Model loaded successfully");
    return model;
  } catch (error) {
    console.error("Error loading model:", error);
    throw error;
  }
}

const model = await loadModel();

const classLabels = ["banana", "bread", "green onion", "ground beef", "potato"];

app.post("/classify", async (req, res) => {
  const { imageData } = req.body;

  try {
    // Decode base64-encoded image data
    const base64Data = imageData.replace(/^data:image\/jpeg;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    // Resize and normalize the image
    const imageTensor = tf.node.decodeImage(buffer); // Create a TensorFlow tensor from the image buffer
    const resizedImage = tf.image.resizeBilinear(imageTensor, [224, 224]); // Resize the image to 224x224
    const normalizedImage = resizedImage.toFloat().div(255.0); // Normalize the pixel values

    // Add a batch dimension to the image tensor
    const batchedInput = normalizedImage.expandDims(0);

    // Perform image classification using the loaded model
    const prediction = model.predict(batchedInput); // Assuming your model is ready for inference

    // Convert the prediction tensor to a JavaScript array
    const predictionArray = prediction.arraySync()[0]; // Get the prediction array from the batched output

    // Find the index of the predicted class
    const predictedClassIndex = tf.argMax(predictionArray).dataSync()[0];

    // Return the predicted class label
    const predictedClass = classLabels[predictedClassIndex];

    // Return the classification result
    res.send({ prediction: predictedClass });
  } catch (error) {
    console.error("Error classifying image:", error);
    res.status(500).send("An error occurred while classifying the image.");
  }
});

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
