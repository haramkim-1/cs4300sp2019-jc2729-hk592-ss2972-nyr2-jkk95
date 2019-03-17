from . import *  
from app.irsystem.models.helpers import *
from app.irsystem.models.helpers import NumpyEncoder as NumpyEncoder

project_name = "iSight"
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



