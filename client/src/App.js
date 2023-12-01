import React, { useEffect, useState } from "react";
import "./input.css";

function App() {
  const [data, setData] = useState({
    code: "",
    number: "",
    date: "",
    prediction: "",
    error_msg: "",
  });

  const [showErrorBox, setShowErrorBox] = useState(false);
  const [showPredictionBox, setShowPredictionBox] = useState(false);

  useEffect(() => {}, [showErrorBox]);

  function doCodeChange(evt) {
    setData({
      code: evt.target.value,
      number: data.number,
      date: data.date,
      error_msg: data.error_msg,
      prediction: data.prediction,
    });
  }

  function doFlightChange(evt) {
    setData({
      code: data.code,
      number: evt.target.value,
      date: data.date,
      error_msg: data.error_msg,
      prediction: data.prediction,
    });
  }

  function doDateChange(evt) {
    setData({
      code: data.code,
      number: data.number,
      date: evt.target.value,
      error_msg: data.error_msg,
      prediction: data.prediction,
    });
  }

  function doSubmitResp(res) {
    if (res.status === 200) {
      res
        .json()
        .then(doSubmitJson)
        .catch(() => doSubmitError("200 response not JSON"));
    } else {
      doSubmitError(`bad status code ${res.status}`);
    }
  }

  function doSubmitJson(json) {
    if (json["error_msg"] !== undefined || json["error_msg"] !== '') {
      setData({
        code: data.code,
        number: data.number,
        date: data.date,
        error_msg: json["error_msg"],
        prediction: "",
      });
      setShowErrorBox(true);
    } else {
      setData({
        code: data.code,
        number: data.number,
        date: data.date,
        prediction: json["prediction"],
        error_msg: "",
      });
    }
  }

  function doSubmitError(msg) {
    if (typeof msg !== "string") {
      setData({
        code: data.code,
        number: data.number,
        date: data.date,
        error_msg: "Couldn't fetch from server",
        prediction: "",
      });
    }
    setData({
      code: data.code,
      number: data.number,
      date: data.date,
      error_msg: msg,
      prediction: "",
    });
  }

  function validDate(date) {
    // Valid format: YYYY-MM-DD
    if (date.length !== 10) {
      return false;
    } else if (date.substring(4, 5) !== "-") {
      return false;
    } else if (date.substring(7, 8) !== "-") {
      return false;
    } else if (date.substring(0, 4) > 2023) {
      return false;
    } else if (date.substring(0, 4) < 0) {
      return false;
    } else if (date.substring(5, 7) > 12 || date.substring(5, 7) < 1) {
      return false;
    } else if (date.substring(8, 10) > 31 || date.substring(8, 10) < 1) {
      return false;
    } else {
      return true;
    }
  }

  function doSubmitClick(evt) {
    evt.preventDefault();
    if (data.code === "" || data.number === "" || data.date === "") {
      doSubmitError("Please input all values");
      setShowErrorBox(true);
      return;
    }
    if (data.code.length !== 2) {
      doSubmitError("Invalid carrier code");
      setShowErrorBox(true);
      return;
    }
    if (data.number.length > 4 || data.number.length < 1) {
      doSubmitError("Invalid flight number");
      setShowErrorBox(true);
      return;
    }
    if (!validDate(data.date)) {
      doSubmitError("Please enter a valid date");
      setShowErrorBox(true);
      return;
    }
    fetch(
      `http://localhost:8088/predict?number=${data.number}&carrier=${data.code}&date=${data.date}`
    )
      .then(doSubmitResp)
      .catch(doSubmitError);
    setShowPredictionBox(true);
  }

  function hideError() {
    console.log("test");
    setShowErrorBox(false);
  }

  function hidePrediction() {
    setShowPredictionBox(false);
  }

  return (
    <div className="flex justify-center items-center flex-col mt-20">
      <h1 className="mb-5 font-semibold text-lg">Predict Flight Delay ✈️</h1>
      {showErrorBox ? (
        <div
          className="bg-red-100  text-red-700 px-4 py-3 rounded relative w-80 mb-5"
          role="alert"
        >
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {data.error_msg}</span>
          <span className="absolute top-0 bottom-0 right-0 px-4 py-3">
            <svg
              onClick={hideError}
              className="fill-current h-6 w-6 text-red-500"
              role="button"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <title>Close</title>
              <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
            </svg>
          </span>
        </div>
      ) : (
        <div></div>
      )}
      <form>
        <div className="w-80">
          <div className="relative w-full min-w-[200px] h-10">
            <input
              className="peer w-full h-full bg-gray-100 text-blue-gray-700 font-sans font-normal outline outline-0 focus:outline-0 disabled:bg-blue-gray-50 disabled:border-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200 border focus:border-2 border-t-transparent focus:border-t-transparent text-sm px-3 py-2.5 rounded-[7px] border-blue-gray-200 focus:border-gray-600 shadow-sm"
              placeholder=" "
              onChange={(evt) => doCodeChange(evt)}
              type="text"
              value={data.code}
            />
            <label className="flex w-full h-full select-none pointer-events-none absolute left-0 font-normal !overflow-visible truncate peer-placeholder-shown:text-blue-gray-500 leading-tight peer-focus:leading-tight peer-disabled:text-transparent peer-disabled:peer-placeholder-shown:text-blue-gray-500 transition-all -top-1.5 peer-placeholder-shown:text-sm text-[11px] peer-focus:text-[11px] before:content[' '] before:block before:box-border before:w-2.5 before:h-1.5 before:mt-[6.5px] before:mr-1 peer-placeholder-shown:before:border-transparent before:rounded-tl-md before:border-t peer-focus:before:border-t-2 before:border-l peer-focus:before:border-l-2 before:pointer-events-none before:transition-all peer-disabled:before:border-transparent after:content[' '] after:block after:flex-grow after:box-border after:w-2.5 after:h-1.5 after:mt-[6.5px] after:ml-1 peer-placeholder-shown:after:border-transparent after:rounded-tr-md after:border-t peer-focus:after:border-t-2 after:border-r peer-focus:after:border-r-2 after:pointer-events-none after:transition-all peer-disabled:after:border-transparent peer-placeholder-shown:leading-[3.75] text-gray-500 peer-focus:text-gray-900 before:border-blue-gray-200 peer-focus:before:!border-gray-900 after:border-blue-gray-200 peer-focus:after:!border-gray-900">
              IATA Carrier Code
            </label>
          </div>
        </div>
        <br></br>
        {/* <p className=" text-gray-400">Enter flight number: </p> */}
        {/* break */}
        <div className="w-80">
          <div className="relative w-full min-w-[200px] h-10">
            <input
              className="peer w-full h-full bg-gray-100 text-blue-gray-700 font-sans font-normal outline outline-0 focus:outline-0 disabled:bg-blue-gray-50 disabled:border-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200 border focus:border-2 border-t-transparent focus:border-t-transparent text-sm px-3 py-2.5 rounded-[7px] border-blue-gray-200 focus:border-gray-600 shadow-sm"
              placeholder=" "
              onChange={(evt) => doFlightChange(evt)}
              type="text"
              value={data.number}
            />
            <label className="flex w-full h-full select-none pointer-events-none absolute left-0 font-normal !overflow-visible truncate peer-placeholder-shown:text-blue-gray-500 leading-tight peer-focus:leading-tight peer-disabled:text-transparent peer-disabled:peer-placeholder-shown:text-blue-gray-500 transition-all -top-1.5 peer-placeholder-shown:text-sm text-[11px] peer-focus:text-[11px] before:content[' '] before:block before:box-border before:w-2.5 before:h-1.5 before:mt-[6.5px] before:mr-1 peer-placeholder-shown:before:border-transparent before:rounded-tl-md before:border-t peer-focus:before:border-t-2 before:border-l peer-focus:before:border-l-2 before:pointer-events-none before:transition-all peer-disabled:before:border-transparent after:content[' '] after:block after:flex-grow after:box-border after:w-2.5 after:h-1.5 after:mt-[6.5px] after:ml-1 peer-placeholder-shown:after:border-transparent after:rounded-tr-md after:border-t peer-focus:after:border-t-2 after:border-r peer-focus:after:border-r-2 after:pointer-events-none after:transition-all peer-disabled:after:border-transparent peer-placeholder-shown:leading-[3.75] text-gray-500 peer-focus:text-gray-900 before:border-blue-gray-200 peer-focus:before:!border-gray-900 after:border-blue-gray-200 peer-focus:after:!border-gray-900">
              Flight Number
            </label>
          </div>
          {/* break */}
        </div>
        <br></br>
        <div className="relative w-full min-w-[200px] h-10">
          <input
            className="peer w-full h-full bg-gray-100 text-blue-gray-700 font-sans font-normal outline outline-0 focus:outline-0 disabled:bg-blue-gray-50 disabled:border-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200 border focus:border-2 border-t-transparent focus:border-t-transparent text-sm px-3 py-2.5 rounded-[7px] border-blue-gray-200 focus:border-gray-600 shadow-sm"
            placeholder=""
            onChange={(evt) => doDateChange(evt)}
            type="text"
            value={data.date}
          />
          <label className="flex w-full h-full select-none pointer-events-none absolute left-0 font-normal !overflow-visible truncate peer-placeholder-shown:text-blue-gray-500 leading-tight peer-focus:leading-tight peer-disabled:text-transparent peer-disabled:peer-placeholder-shown:text-blue-gray-500 transition-all -top-1.5 peer-placeholder-shown:text-sm text-[11px] peer-focus:text-[11px] before:content[' '] before:block before:box-border before:w-2.5 before:h-1.5 before:mt-[6.5px] before:mr-1 peer-placeholder-shown:before:border-transparent before:rounded-tl-md before:border-t peer-focus:before:border-t-2 before:border-l peer-focus:before:border-l-2 before:pointer-events-none before:transition-all peer-disabled:before:border-transparent after:content[' '] after:block after:flex-grow after:box-border after:w-2.5 after:h-1.5 after:mt-[6.5px] after:ml-1 peer-placeholder-shown:after:border-transparent after:rounded-tr-md after:border-t peer-focus:after:border-t-2 after:border-r peer-focus:after:border-r-2 after:pointer-events-none after:transition-all peer-disabled:after:border-transparent peer-placeholder-shown:leading-[3.75] text-gray-500 peer-focus:text-gray-900 before:border-blue-gray-200 peer-focus:before:!border-gray-900 after:border-blue-gray-200 peer-focus:after:!border-gray-900">
            Flight Date (yyyy-mm-dd)
          </label>
        </div>
        <br></br>
        <button
          type="submit"
          className="shadow-sm inline-block px-5 py-2 mx-auto text-white bg-blue-500 rounded-full hover:bg-blue-600 md:mx-0 font-semibold w-full"
          onClick={(evt) => doSubmitClick(evt)}
          value="Submit"
        >
          Submit
          {/* <svg
            class="w-4 h-4 ml-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M14 5l7 7m0 0l-7 7m7-7H3"
            ></path>
          </svg> */}
        </button>
      </form>
      {showPredictionBox ? (
        <div className="absolute bg-green-300 bg-opacity-100 w-96 rounded-md h-20 flex justify-between items-center">
          <p></p>
          <p className="font-medium text-green-600">
            {data.prediction} minute delay
          </p>
          <svg
            onClick={hidePrediction}
            className="fill-current h-6 w-6 text-green-500 mx-5"
            role="button"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <title>Close</title>
            <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
          </svg>
          {/* <p className="font-semibold">Prediction: {data.prediction}</p> */}
        </div>
      ) : (
        <div></div>
      )}
    </div>
  );
}

export default App;
