import React from "react";

const Loading = () => {
  return (
    <div className="pan-loader">
      <div className="loader"></div>
      <div className="pan-container">
        <div className="pan"></div>
        <div className="handle"></div>
      </div>
      <div className="shadow"></div>

      <style>{`
        .pan-loader {
          width: 180px;
          height: 180px;
          margin: 100px auto;
        }

        .loader {
          position: relative;
          top: 10%;
          left: 0;
          z-index: -1;
          width: 60%;
          height: 45%;
          border: 10px solid transparent;
          border-bottom: 10px solid #FDD835;
          border-radius: 50%;
          animation: loader 2s infinite;
          animation-timing-function: linear;
        }

        .pan-container {
          display: flex;
          width: 100%;
          animation: pan 2s infinite;
        }

        .pan {
          width: 60%;
          height: 20px;
          background: linear-gradient(#3949AB, #5C6BC0);
          border-bottom-right-radius: 20px;
          border-bottom-left-radius: 20px;
        }

        .handle {
          width: 40%;
          height: 10px;
          background: linear-gradient(#3949AB, #5C6BC0);
          border-top-right-radius: 10px;
          border-top-left-radius: 10px;
          border-bottom-right-radius: 10px;
          border-bottom-left-radius: 10px;
        }

        .shadow {
          position: relative;
          top: 15%;
          left: 15%;
          width: 30%;
          height: 8px;
          background: lightgray;
          border-radius: 20px;
          animation: shadow 2s infinite;
        }

        @keyframes loader {
          0% {
            width: 10%;
            transform: rotate(0deg);
          }
          10% {
            left: 0%;
            transform: rotate(0deg);
          }
          20% {
            width: 0%;
            left: 20%;
          }
          30% {
            width: 25%;
          }
          50% {
            left: 15%;
            width: 35%;
          }
          70% {
            width: 30%;
            left: 18%;
            transform: rotate(240deg);
          }
          90% {
            width: 30%;
            left: 10%;
          }
          100% {
            width: 2%;
            left: 25%;
            transform: rotate(360deg);
          }
        }

        @keyframes pan {
          0% {
            transform: rotate(0deg);
            transform-origin: top right;
          }
          10% {
            transform: rotate(-2deg);
            transform-origin: top right;
          }
          50% {
            transform: rotate(15deg);
          }
          100% {
            transform: rotate(0deg);
          }
        }

        @keyframes shadow {
          0% {
            width: 30%;
          }
          50% {
            width: 40%;
            left: 20px;
          }
          100% {
            width: 30%;
          }
        }
      `}</style>
    </div>
  );
};

export default Loading;
