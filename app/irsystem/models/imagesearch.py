import base64
from os.path import join

    
class ImageSearcher:
    def __init__(self, data_path="data/images"):
    	self.data_path = data_path

    def image_search(self, make_model):
    	print(join(self.data_path, make_model + '.jpg'))
    	with open(join(self.data_path, make_model + '.jpg'), 'rb') as image_file:
        	return base64.b64encode(image_file.read())