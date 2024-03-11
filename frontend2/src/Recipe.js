import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";
import Slide from "@mui/material/Slide";
import Rating from "@mui/material/Rating";
import axios from "axios";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Masonry from "@mui/lab/Masonry";
import { styled } from "@mui/material/styles";
import Loading from "./Loading";

const Label = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
  borderBottomLeftRadius: 0,
  borderBottomRightRadius: 0,
  boxShadow: theme.shadows[4],
}));

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function VideoPlayer({ selectedRecommendation }) {
  const videoUrl = selectedRecommendation ? selectedRecommendation.video : "";
  return (
    <div style={{ width: "100%", textAlign: "center" }}>
      <video controls width="100%" style={{ maxHeight: "66vh" }}>
        <source src={videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
}

function RecipeDetails({
  expandRecipe,
  setExpandRecipe,
  selectedRecommendation,
}) {
  return (
    <Dialog
      fullScreen
      open={expandRecipe}
      onClose={() => setExpandRecipe(false)}
      TransitionComponent={Transition}
    >
      <AppBar sx={{ position: "relative", backgroundColor: "#6675df" }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => setExpandRecipe(false)}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
          <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
            Recipes
          </Typography>
        </Toolbar>
      </AppBar>
      <Box sx={{ margin: "0 auto", padding: "40px" }}>
        <VideoPlayer selectedRecommendation={selectedRecommendation} />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginLeft: 20,
            marginTop: 15,
            marginBottom: 8,
          }}
        >
          <Typography variant="h5" style={{ marginRight: "16px" }}>
            {selectedRecommendation.name}
          </Typography>
          <Rating
            name="rating"
            value={selectedRecommendation.rating * 5}
            readOnly
            precision={0.5}
          />
        </div>
        <div style={{ marginLeft: "40px", marginRight: "40px" }}>
          <Typography variant="body1" style={{ marginBottom: 8 }}>
            Description: {selectedRecommendation.description}
          </Typography>
          <Typography variant="body1">
            Instructions:
            <ol>
              {selectedRecommendation.instructions.map((step, index) => (
                <li key={index}>{step.display_text}</li>
              ))}
            </ol>
          </Typography>
        </div>
      </Box>
    </Dialog>
  );
}

export default function FullScreenDialog(props) {
  const [open, setOpen] = React.useState(false);
  const [expandRecipe, setExpandRecipe] = React.useState(false);
  const [recommendations, setRecommendations] = React.useState([]);
  const [selectedRecommendation, setSelectedRecommendation] =
    React.useState(null);
  const [recObtained, setRecObtained] = React.useState(false);

  const items = props.selectedIngredients;

  async function getRecommendations(items) {
    console.log(items.join(", "));
    try {
      const response = await axios.post(`http://localhost:8000/recommend`, {
        ingredients: items.join(", "),
      });
      console.log(response);
      return response.data;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  const handleClickOpen = async () => {
    if (items.length === 0) {
      alert("No ingredients found.");
      return null;
    }
    setRecObtained(false);
    setOpen(true);
    console.log(items);
    const response = await getRecommendations(items);
    console.log(response?.recommendations);
    if (response?.recommendations) {
      if (response.recommendations.count === 0) {
        setOpen(false);
        console.log("No recommendations found.");
        return;
      }
      setRecommendations(
        response.recommendations.results.map((item) => ({
          image: item.thumbnail_url,
          video: item.original_video_url,
          name: item.name,
          description: item.description,
          instructions: item.instructions,
          rating: item.user_ratings?.score,
        }))
      );
      setTimeout(() => {
        setRecObtained(true);
      }, 1000);
      console.log(recommendations);
    } else {
      setOpen(false);
      console.log("No recommendations found.");
      console.error("No recommendations.");
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleRecipeClick = (recommendation) => {
    setExpandRecipe(true);
    setSelectedRecommendation(recommendation);
  };

  return (
    <React.Fragment>
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Button variant="contained" onClick={handleClickOpen}>
          Get Recommendations
        </Button>
      </Box>
      <Dialog
        fullScreen
        open={open}
        onClose={handleClose}
        TransitionComponent={Transition}
      >
        {recObtained ? (
          <>
            <AppBar sx={{ position: "relative", backgroundColor: "#6675df" }}>
              <Toolbar>
                <IconButton
                  edge="start"
                  color="inherit"
                  onClick={handleClose}
                  aria-label="close"
                >
                  <CloseIcon />
                </IconButton>
                <Typography
                  sx={{ ml: 2, flex: 1 }}
                  variant="h6"
                  component="div"
                >
                  Recipes
                </Typography>
              </Toolbar>
            </AppBar>
            <Box sx={{ margin: "0 auto", padding: "20px" }}>
              <Masonry columns={5} spacing={3}>
                {recommendations.map((recommendation, index) => (
                  <div
                    className="specific-recipe"
                    key={index}
                    onClick={() => handleRecipeClick(recommendation)}
                  >
                    <Label>{recommendation.name}</Label>
                    <img
                      srcSet={`${recommendation.image}?w=162&auto=format&dpr=2 2x`}
                      src={`${recommendation.image}?w=162&auto=format`}
                      alt={recommendation.title}
                      loading="lazy"
                      style={{
                        display: "block",
                        width: "100%",
                        borderBottomLeftRadius: 4,
                        borderBottomRightRadius: 4,
                      }}
                    />
                  </div>
                ))}
              </Masonry>
            </Box>
          </>
        ) : (
          <>
            <Loading />
          </>
        )}
      </Dialog>
      {expandRecipe && (
        <RecipeDetails
          expandRecipe={expandRecipe}
          setExpandRecipe={setExpandRecipe}
          selectedRecommendation={selectedRecommendation}
        />
      )}
    </React.Fragment>
  );
}
