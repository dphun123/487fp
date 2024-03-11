// src/MyApp.js
import React from "react";
import Recipes from "./Recipe.js";
import ImageUpload from "./ImageUpload.js";
import { useState, useEffect } from "react";
import axios from "axios";

function MyApp() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedIngredients, setSelectedIngredients] = useState([]);

  useEffect(() => {
    const getPrediction = async () => {
      if (!selectedFile) {
        console.error("No image selected.");
        return;
      }
      console.log(selectedFile);
      try {
        const formData = new FormData();
        const base64Image = selectedFile.split(",")[1];
        const binaryString = atob(base64Image);
        const uint8Array = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          uint8Array[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([uint8Array], { type: "image/jpeg" });

        formData.append("imageData", blob);

        const response = await axios.post(
          "http://localhost:8000/classify",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        console.log("Prediction:", response.data.prediction);
        setSelectedIngredients((prevIngredients) => [
          ...prevIngredients,
          ...response.data.prediction,
        ]);
      } catch (error) {
        console.error("Error classifying image:", error);
      }
    };
    getPrediction();
  }, [selectedFile]);

  return (
    <div>
      <ImageUpload
        selectedFile={selectedFile}
        setSelectedFile={setSelectedFile}
      />
      <Recipes selectedIngredients={selectedIngredients} />
    </div>
  );
}
export default MyApp;
