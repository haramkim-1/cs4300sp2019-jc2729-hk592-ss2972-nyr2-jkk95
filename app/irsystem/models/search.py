from json import load
import pickle
import numpy as np
from os.path import join
from sklearn.feature_extraction.text import TfidfVectorizer
import re

def tokenize(text):
	tokenized_review = re.findall(r'[a-z]+', text.lower())
	return [x for x in tokenized_review if len(x)>2]

def build_vectorizer(max_features, stop_words, max_df=0.65, min_df=45, norm='l2', tokenizer=tokenize):
	"""Returns a TfidfVectorizer object with the above preprocessing properties.

	Params: {max_features: Integer,
			 max_df: Float,
			 min_df: Float,
			 norm: String,
			 stop_words: String}
	Returns: TfidfVectorizer
	"""
	return TfidfVectorizer(max_features=max_features, min_df=min_df, max_df=max_df, stop_words=stop_words, norm=norm, tokenizer=tokenize)
#filter by size
def filter_sizes(min_size, max_size, min_price, max_price, car_size, car_price):
	return car_size >= min_size and car_size <= max_size and car_price >= min_price and car_price <= max_price
#cosine similarity
def get_sim(car, q):
	numerator = np.dot(car, q)
	norm1 = np.linalg.norm(car)
	norm2 = np.linalg.norm(q)
	sim = numerator/float(1 + norm1*norm2)
	return sim

class Searcher:
	def __init__(self, data_path="data"):

		with open(join(data_path, 'unfiltered_list.pkl'), 'rb') as unfiltered, \
			open(join(data_path, 'index_to_vocab.pkl'), 'rb') as itv, \
			open(join(data_path, 'data.json')) as all_data, \
			open(join(data_path, 'query_expansion_words.pkl'), 'rb') as query_expansion_file:
			self.all_data = load(all_data)
			self.unfiltered_list = pickle.load(unfiltered)
			self.index_to_vocab = pickle.load(itv)
			self.vocab_to_index = {self.index_to_vocab[k]:int(k) for k in self.index_to_vocab}
			self.cars_reverse_index = {car[0]: i for i, car in enumerate(self.unfiltered_list)}
			self.query_expansion_words = pickle.load(query_expansion_file)

		n_feats = 4000
		# self.doc_by_vocab = np.empty([len(self.all_data), n_feats])

		self.tfidf_vec = build_vectorizer(n_feats, "english")

		for car in self.all_data.values():
			car['Appended Reviews'] = ""
			for review in car['reviews']:
				new_review = (re.sub('[0-9]+', '', review['Review'])).lower()
				car['Appended Reviews'] = car['Appended Reviews'] + new_review + ' '
			self.all_data[car["Year_Make_Model"]] = car

		self.doc_by_vocab = self.tfidf_vec.fit_transform([d['Appended Reviews'] for d in self.all_data.values()]).toarray()

	def search(self, min_size, max_size, min_price, max_price, query):
		# print("enter method")
		truncated_list_by_size = [x[0] for x in self.unfiltered_list if filter_sizes(min_size, max_size, min_price, max_price, x[1], x[2])]

		# print("start idf_dict lookups")
		# tf_idf_query = np.zeros(len(self.keywords))
		# for t in query:
		#	 print("\t" + t)
		#	 tf_idf_query[self.vocab_to_index[t]] = self.idf_dict[t]

		# query expansion
		query = query[0].split(',')
		
		expanded_query = []
		for term in query:
			in_cluster = False
			for cluster in self.query_expansion_words:
				if term in cluster:
					expanded_query.extend(cluster)
			if not in_cluster:
				expanded_query.append(term)
		print(expanded_query)

		expanded_query = " ".join(expanded_query)
		tf_idf_query = self.tfidf_vec.transform([expanded_query]).toarray()[0]


		# print("make similarity dict")
		similarity_dict = {}
		for car in truncated_list_by_size:
			car_index = self.cars_reverse_index[car]
			sim = get_sim(self.doc_by_vocab[car_index].T, tf_idf_query)
			similarity_dict[car] = sim

		# print("get sorted results")
		sorted_results = sorted(similarity_dict.keys(), key=lambda word: similarity_dict.get(word), reverse = True)
		print('sorted results' , sorted_results[0:10])
		return sorted_results[0:10]
