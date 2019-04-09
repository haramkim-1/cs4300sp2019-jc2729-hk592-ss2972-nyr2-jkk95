from . import *
from app.irsystem.models.helpers import *
from app.irsystem.models.helpers import NumpyEncoder as NumpyEncoder
from flask import request
from json import dumps
from app.irsystem.models.search import Searcher

project_name = "Vroom Vroom"
net_id = "Janice Chan: jc2729, Haram Kim: hk592, Stephanie Shum: ss2972, Nataly Rodriguez: nyr2, Jasmine Kitahara: jkk95"

@irsystem.route('/', methods=['GET'])
def search():
	query = request.args.get('search')
	if not query:
		data = []
		output_message = ''
	else:
		output_message = "Your search: " + query
		data = range(5)
	return render_template('search.html', name=project_name, netid=net_id, output_message=output_message, data=data)

@irsystem.route('/keywords', methods=['GET'])
def get_keywords():
	return dumps(["keyword_1", "keyword_2", "keyword_3", "keyword_4"])

@irsystem.route('/search', methods=['GET'])
def do_search():
	carsize_range = request.args.get("")
	keywords = request.args.get("")
	price_range = request.args.get("")

	# convert compact: 0, midsize: 1, large: 2
	
	# TODO: do something here

	return None
