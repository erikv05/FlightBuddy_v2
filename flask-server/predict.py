from requests_html import HTMLSession
from datetime import datetime
import pandas as pd
import pickle
import os
import math
import xgboost
from dotenv import load_dotenv

load_dotenv()
FLIGHTS_API_KEY = os.getenv("FLIGHTS_API_KEY")

session = HTMLSession()
airports = pd.read_csv("airports.csv", index_col='iata')
model = pickle.load(open('flights_model_v2.pkl', 'rb'))

'''
Example values:
Carrier: 'dl'
Flight number: '197'
Date: '2023-11-29'
'''

'''
Helpers to convert data from user input/API to model-friendly inputs. data is defined as res.json()['data'][0] and the rest are user inputs as defined by:
date: 'YYYY-MM-DD'
carrier_code: IATA carrier code
flight_num: flight number (int)
'''
def getMonth(date):
    return int(date[5:7])
def getQuarter(date):
    month = int(getMonth(date))
    if month < 1:
        raise ValueError(f"Month not between 1 and 12: {month}")
    if month <= 3:
        return 1
    if month <= 6:
        return 2
    if month <= 9:
        return 3
    if month <= 12:
        return 4
    else:
        raise ValueError(f"Month not between 1 and 12: {month}")
def getDayofMonth(date):
    return int(date[-2:])
def getDayOfWeek(dep_date):
    dt = datetime.strptime(dep_date, '%Y-%m-%d')
    return dt.isoweekday()
def getOpAirline(data):
    return data['carrier']['iata']
def getTailNum(data):
    return data['statusDetails'][0]['equipment']['aircraftRegistrationNumber']
def getOrigin(data):
    return data['departure']['airport']['iata']
def getOriginCity(data):
    return airports.loc[getOrigin(data)]['city'] + f', {getOriginState(data)}'
def getOriginState(data):
    return airports.loc[getOrigin(data)]['state']
def getDest(data):
    return data['arrival']['airport']['iata']
def getDestCity(data):
    return airports.loc[getDest(data)]['city'] + f', {getDestState(data)}'
def getDestState(data):
    return airports.loc[getDest(data)]['state']
def getCRSDepTime(data):
    time = data['departure']['time']['local']
    return str(math.floor(int(time[:2] + time[3:])/100))
def getCRSArrTime(data):
    time = data['arrival']['time']['local']
    return str(math.floor(int(time[:2] + time[3:])/100))

def getPred(flight_num, dep_date, carrier_code):
    """
    Predicts how long a flight will be delayed by.
    @param flight_num flight number (string)
    @param dep_date departure date in YYYY-MM-DD format (string)
    @param carrier_code IATA carrier code (string)
    """
    columns = ['Quarter', 'Month', 'DayofMonth', 'DayOfWeek', 'Operating_Airline', 'Tail_Number', 'Origin', 'OriginCityName', 'OriginState', 'Dest', 'DestCityName', 'DestState', 'CRSDepTime', 'CRSArrTime']
    data = session.get(f'https://api.oag.com/flight-instances/?DepartureDateTime={dep_date}&CarrierCode={carrier_code}&FlightNumber={flight_num}&CodeType=IATA&Content=Status&version=v2', headers={"Subscription-Key":FLIGHTS_API_KEY})
    if data.status_code != 200:
        return f"Couldn't get flight data: status {data.status_code}, message {data}"
    if len(data.json()['data']) == 0:
        return "Couldn't find your flight"
    try: 
        data = data.json()['data'][0]
        vals = [[getQuarter(dep_date), getMonth(dep_date), getDayofMonth(dep_date), getDayOfWeek(dep_date), getOpAirline(data), getTailNum(data), getOrigin(data), getOriginCity(data), getOriginState(data), getDest(data), getDestCity(data), getDestState(data), getCRSDepTime(data), getCRSArrTime(data)]]
        pred = pd.DataFrame(data = vals, columns=columns)
        for col in pred.columns:
            if pred[col].dtype == object:
                pred[col] = pred[col].astype('category')
        pred = model.predict(pred)[0]
        return pred
    except:
        return "Couldn't get flight info"