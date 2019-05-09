from . import *
from app.irsystem.models.helpers import *
from app.irsystem.models.helpers import NumpyEncoder as NumpyEncoder
from flask import send_from_directory
from flask import request
from json import dumps, loads
from app.irsystem.models.search import Searcher
from app.irsystem.models.imagesearch import ImageSearcher
from statistics import mean

project_name = "Vroom Vroom"
net_id = "Janice Chan: jc2729, Haram Kim: hk592, Stephanie Shum: ss2972, Nataly Rodriguez: nyr2, Jasmine Kitahara: jkk95"

# create searcher object
searcher = Searcher()
image_searcher = ImageSearcher()

@irsystem.route('/', methods=['GET'])
def search():
    """Serve the frontend HTML file"""
    return render_template('index.html')

@irsystem.route('/manifest.json', methods=['GET'])
def send_manifest():
    return send_from_directory('frontend/build', 'manifest.json')

@irsystem.route('/favicon.ico', methods=['GET'])
def send_fav():
    return send_from_directory('frontend/build', 'favicon.ico')

@irsystem.route('/static/<css_js>/<file>', methods=['GET'])
def send_static(css_js,file):
    print('sending sttic')
    return send_from_directory('frontend/build/static', css_js+'/'+file)

@irsystem.route('/keywords', methods=['GET'])
def get_keywords():
    """Route to provide the list of good types to the frontend"""
    return dumps([{"text": kw} for kw in searcher.index_to_vocab.values()])

@irsystem.route('/search', methods=['GET'])
def do_search():
    """Route to handle search requests from frontend.
    Querystring must contain the arguments:
    - size1: First of two car size filter strings; unordered
    - size2: Second of two car size filter strings; unordered
    - minPrice: Minimum price to filter with
    - maxPrice: Maximum price to filter with
    - keywords: A list of strings giving the keywords to be passed to Searcher
    """
    # unpack variables from querystring
    size1 = request.args.get("size1")
    size2 = request.args.get("size2")
    min_price = int(request.args.get("minPrice"))
    max_price = int(request.args.get("maxPrice"))
    fuel1 = request.args.get("fuel1")
    fuel2 = request.args.get("fuel2")
    keywords_and_priorities = loads(request.args.get("keywords"))

    # TODO: remove this line
    print(keywords_and_priorities)

    # convert mapping words to min and max size integers
    mapping = {"Compact":0, "Midsize":1, "Large":2}
    size1 = mapping[size1]
    size2 = mapping[size2]
    min_size = min(size1, size2)
    max_size = max(size1, size2)

    fuel_mapping = {"Gas-Guzzler":0, "Standard":1, "Fuel-Efficient":2, "Hybrid":3, "Electric":4}
    fuel1 = fuel_mapping[fuel1]
    fuel2 = fuel_mapping[fuel2]
    min_fuel = min(fuel1, fuel2)
    max_fuel = max(fuel1, fuel2)


    # call search method
    search_results = searcher.search(min_size=min_size, max_size=max_size, min_price=min_price,
        max_price=max_price, min_fuel=min_fuel, max_fuel=max_fuel, query=keywords_and_priorities)

	# generate object to send to frontend
    to_send = []
    for idx, ymm in enumerate(search_results["results"]):
        car = searcher.all_data.get(ymm)
        print(ymm)
        ratings = [float(review["Rating"]) for review in car["reviews"] if review["Rating"].replace('.','',1).isnumeric()]
        
        # extract only the fields we care about to save
        car_to_send = {"MSRP": car["MSRP"], "avg_rating": mean(ratings), "ranking": idx, "ymm": ymm}

        # get car make-model string to find image
        make_model = car["Make"] + " " + car["Model"]
        make_model = make_model.replace("/", ":")
        try:
            car_to_send["img"] = image_searcher.image_search(make_model).decode('utf-8')
        except:
            pass

        # add to list to send
        to_send.append(car_to_send)

    # send back json of results from Searcher
    return dumps({"results": to_send, "query": search_results["query"]})

@irsystem.route('/cardetails', methods=['GET'])
def get_details():
	"""Route to provide specific car details to the frontend"""
	# unpack year-make-model from querystring
	ymm = request.args.get("carYMM")

	# add average star rating to car
	car = searcher.all_data.get(ymm)
	ratings = [float(review["Rating"]) for review in car["reviews"] if review["Rating"].replace('.','',1).isnumeric()]
	car["avg_rating"] = mean(ratings)

	# get car make-model string
	make_model = car["Make"] + " " + car["Model"]
	make_model = make_model.replace("/", ":")

	# get image; fail silently
	try:
		car["img"] = image_searcher.image_search(make_model).decode('utf-8')
	except:
		pass

	# return a json of the car data
	return dumps(car, allow_nan=False)
