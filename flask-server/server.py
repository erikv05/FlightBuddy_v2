from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

# Test API Route
@app.route("/test")
def test():
    return {"test":'abcd'}

if __name__ == "__main__":
    app.run(debug=True, port=8088)