from flask import Flask, render_template, jsonify
import csv
import os

app = Flask(__name__)


# Home page
@app.route("/")
def home():
    return render_template("index.html")


# Read monitoring data from CSV
@app.route("/api/noise-data")
def noise_data():

    data = []

    csv_path = os.path.join(
        app.static_folder,
        "js",
        "dataset",
        "noise_data.csv"
    )

    with open(csv_path, mode="r", newline="", encoding="utf-8") as file:
        reader = csv.DictReader(file)

        for row in reader:
            data.append({
                "location": row["location"],
                "latitude": float(row["latitude"]),
                "longitude": float(row["longitude"]),
                "noise_level": float(row["noise_level"]),
                "status": row["status"],
                "compliance": row["compliance"]
            })

    return jsonify(data)


if __name__ == "__main__":
    app.run(debug=True)
   