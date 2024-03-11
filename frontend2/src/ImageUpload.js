import React from "react";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";

const ImageUpload = ({ selectedFile, setSelectedFile }) => {
  const handleUploadClick = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onloadend = () => {
      setSelectedFile(reader.result);
    };
  };

  return (
    <div>
      <Card>
        <Grid container direction="column" alignItems="center">
          <Grid item>
            {selectedFile ? (
              <img
                style={{
                  margin: "auto",
                  display: "block",
                  maxWidth: "100%",
                  maxHeight: "85vh",
                }}
                width="100%"
                src={selectedFile}
                alt="Uploaded"
              />
            ) : (
              <div style={{ height: "85vh", width: "100%" }} />
            )}
          </Grid>
          <Grid item>
            <label htmlFor="contained-button-file">
              <Button variant="contained" component="span">
                Select Image
              </Button>
              <input
                accept="image/*"
                id="contained-button-file"
                multiple
                type="file"
                onChange={handleUploadClick}
                style={{ display: "none" }}
              />
            </label>
          </Grid>
        </Grid>
      </Card>
    </div>
  );
};

export default ImageUpload;
