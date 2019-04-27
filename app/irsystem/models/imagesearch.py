import base64
from os.path import join

    
class ImageSearcher:
    def __init__(self, data_path="data/images"):
    	self.data_path = data_path

    def image_search(self, make, model):
    	print(join(self.data_path, make + ' ' + model + '.jpg'))
    	with open(join(self.data_path, make + ' ' + model + '.jpg'), 'rb') as image_file:
        	return base64.b64encode(image_file.read())