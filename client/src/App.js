import React, {useState, useEffect} from 'react' 

function App() {

  const [data, setData] = useState([{}]);

  useEffect(() => {
    setData({code: '', number:'', date:''})
  }, []);

  function doCodeChange(evt) {
    setData({code:evt.target.value, number:data.number, date:data.date});
  }

  function doFlightChange(evt) {

  }

  function doDateChange(evt) {

  }

  function doTestResp(res) {
    if (res.status == 200) {
      console.log(res.json().then((json) => console.log(json)))
    } else {
      console.log('not 200')
    }
  }

  function doSubmitClick(evt) {
    evt.preventDefault()
    fetch('http://localhost:8088/test')
    .then(doTestResp)
    .catch(() => console.log('failed to connect'))
  }

  return (
    <div>
      <form>
        Enter IATA carrier code:<input onChange={(evt) => doCodeChange(evt)} type="text" value={data.code}></input><br></br>
        Enter flight number:<input onChange={(evt) => doFlightChange()} type="text" value={data.number}></input><br></br>
        Enter date:<input onChange={(evt) => doDateChange()} type="text" value={data.date}></input><br></br>
        <input type="submit" onClick={(evt) => doSubmitClick(evt)} value="Submit"></input>
      </form>
    </div>
  );

}

export default App;
