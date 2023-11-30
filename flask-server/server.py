from flask import Flask, request, jsonify
from flask_cors import CORS
import predict
from predict import getPred

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

# Test API Route
@app.route("/test")
def test():
    return {"test":'abcd'}

# Predict API Route
@app.route("/predict")
def predict():
    # example route: localhost:8088/predict?number=398&carrier=DL&date=2023-11-29
    flight_num = request.args.get("number")
    carrier = request.args.get("carrier")
    date = request.args.get("date")
    pred = getPred(flight_num, date, carrier)
    return {'prediction': int(pred)}

if __name__ == "__main__":
    app.run(debug=True, port=8088)