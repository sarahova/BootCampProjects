from flask import Flask, render_template, jsonify
from scrape_mars import scrape_data

app = Flask(__name__)


@app.route('/')
def home_page():
    return render_template('index.html')

@app.route('/scrape', methods=['GET'])
def data_scrape():
    scraped=scrape_data()
    return jsonify(scraped)
    
if __name__ == '__main__':
    app.run(debug=True, port=4996)
