from json import load
import pickle
import numpy as np
from os.path import join
from sklearn.feature_extraction.text import TfidfVectorizer

#filter by size
def filter_sizes(min_size, max_size, min_price, max_price, car_size, car_price):
	return car_size >= min_size and car_size <= max_size and car_price >= min_price and car_price <= max_price
#cosine similarity
def get_sim(car, query):
	numerator = np.dot(car, query)
	norm1 = np.linalg.norm(car)
	norm2 = np.linalg.norm(query)
	sim = numerator/(1 + norm1*norm2)
	return sim

class Searcher:
	def __init__(self, data_path="data"):
		self.doc_by_vocab = np.load(join(data_path, 'doc_by_vocab.npy'))
		with open(join(data_path, 'unfiltered_list.pkl'), 'rb') as unfiltered, \
			open(join(data_path, 'index_to_vocab.pkl'), 'rb') as itv, open(join(data_path, 'tfidf_vec.pkl'), 'rb') as tf_file, \
			open(join(data_path, 'data.json')) as all_data:
			self.all_data = load(all_data)
			self.unfiltered_list = pickle.load(unfiltered)
			self.index_to_vocab = pickle.load(itv)
			self.tf = pickle.load(tf_file)
			self.vocab_to_index = {self.index_to_vocab[k]:int(k) for k in self.index_to_vocab}
			self.cars_reverse_index = {car[0]: i for i, car in enumerate(self.unfiltered_list)}

	def search(self, min_size, max_size, min_price, max_price, query):
		# print("enter method")
		truncated_list_by_size = [x[0] for x in self.unfiltered_list if filter_sizes(min_size, max_size, min_price, max_price, x[1], x[2])]

		# print("start idf_dict lookups")
		# tf_idf_query = np.zeros(len(self.keywords))
		# for t in query:
		#	 print("\t" + t)
		#	 tf_idf_query[self.vocab_to_index[t]] = self.idf_dict[t]
		tf_idf_query = self.tf.transform(query)

		# print("make similarity dict")
		similarity_dict = {}
		for car in truncated_list_by_size:
			car_index = self.cars_reverse_index[car]
			sim = get_sim(self.doc_by_vocab[car_index] , tf_idf_query)
			similarity_dict[car] = sim

		# print("get sorted results")
		sorted_results = sorted(similarity_dict, key=lambda x:x[0], reverse = True)

		# print(sorted_results[0:10])
		return sorted_results[0:10]
