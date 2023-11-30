import React, {useState} from 'react' 

function App() {

  const [data, setData] = useState({code:'', number:'', date:'', prediction: '', error_msg: ''});

  function doCodeChange(evt) {
    setData({code:evt.target.value, number:data.number, date:data.date, error_msg:data.error_msg, prediction:data.prediction});
  }

  function doFlightChange(evt) {
    setData({code:data.code, number:evt.target.value, date:data.date, error_msg:data.error_msg, prediction:data.prediction});
  }

  function doDateChange(evt) {
    setData({code:data.code, number:data.number, date:evt.target.value, error_msg:data.error_msg, prediction:data.prediction});
  }

  function doSubmitResp(res) {
    if (res.status === 200) {
      res.json()
      .then(doSubmitJson)
      .catch(() => doSubmitError('200 response not JSON'));
    } else {
      doSubmitError(`bad status code ${res.status}`);
    }
  }

  function doSubmitJson(json) {
    if (json['prediction'] === undefined) {
      setData({code:data.code, number:data.number, date:data.date, error_msg: json['error_msg'], prediction:''})
    }
    else {
      setData({code:data.code, number:data.number, date:data.date, prediction: json['prediction'], error_msg: ''});
    }
  }

  function doSubmitError(msg) {
    setData({code:data.code, number:data.number, date:data.date, error_msg: msg, prediction:''})
  }

  function validDate(date) {
    // Valid format: YYYY-MM-DD
    if (date.length !== 10) {
      return false;
    } else if (date.substring(4, 5) !== '-') {
      return false;
    } else if (date.substring(7, 8) !== '-') {
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
    evt.preventDefault()
    if (data.code === '' || data.number === '' || data.date === '') {
      doSubmitError("Please input all values");
      return;
    } if (data.code.length !== 2) {
      doSubmitError("Invalid carrier code");
      return;
    } if (data.number.length > 4 || data.number.length < 1) {
      doSubmitError("Invalid flight number");
      return;
    } if (!validDate(data.date)) {
      doSubmitError("Please enter a valid date");
      return;
    }
    fetch(`http://localhost:8088/predict?number=${data.number}&carrier=${data.code}&date=${data.date}`)
    .then(doSubmitResp)
    .catch(doSubmitError)
  }

  return (
    <div>
      <form>
        Enter IATA carrier code: <input onChange={(evt) => doCodeChange(evt)} type="text" value={data.code}></input><br></br>
        Enter flight number: <input onChange={(evt) => doFlightChange(evt)} type="text" value={data.number}></input><br></br>
        Enter date: <input onChange={(evt) => doDateChange(evt)} type="text" value={data.date}></input><br></br>
        <input type="submit" onClick={(evt) => doSubmitClick(evt)} value="Submit"></input>
      </form>
      <p>Prediction: {data.prediction}</p>
      <p>Error message: {data.error_msg}</p>
    </div>
  );

}

export default App;
