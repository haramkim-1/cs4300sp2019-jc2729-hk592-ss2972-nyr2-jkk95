from . import *
from app.irsystem.models.helpers import *
from app.irsystem.models.helpers import NumpyEncoder as NumpyEncoder
from flask import send_from_directory
from flask import request
from json import dumps
from app.irsystem.models.search import Searcher

project_name = "Vroom Vroom"
net_id = "Janice Chan: jc2729, Haram Kim: hk592, Stephanie Shum: ss2972, Nataly Rodriguez: nyr2, Jasmine Kitahara: jkk95"

# create searcher object
searcher = Searcher()

@irsystem.route('/', methods=['GET'])
def search():
	query = request.args.get('search')
	if not query:
		data = []
		output_message = ''
	else:
		output_message = "Your search: " + query
		data = range(5)
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
	return dumps(searcher.keywords)

@irsystem.route('/search', methods=['GET'])
def do_search():
	carsize_range = request.args.get("")
	keywords = request.args.get("")
	price_range = request.args.get("")

	# convert compact: 0, midsize: 1, large: 2
	
	# TODO: do something here

	return None