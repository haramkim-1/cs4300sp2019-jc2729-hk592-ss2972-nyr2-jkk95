#!/usr/bin/env python
# coding: utf-8


from __future__ import print_function
from sklearn.feature_extraction.text import TfidfVectorizer
import numpy as np
from numpy import linalg as LA
import json
import math
import matplotlib.pyplot as plt
from json import dumps
import re
import string

def tokenize(text):
	return re.findall(r'[a-z]+', text.lower())
	
def build_vectorizer(max_features, stop_words, max_df=0.8, min_df=20, norm='l2'):
	"""Returns a TfidfVectorizer object with the above preprocessing properties.
	
	Params: {max_features: Integer,
			 max_df: Float,
			 min_df: Float,
			 norm: String,
			 stop_words: String}
	Returns: TfidfVectorizer
	"""
	return TfidfVectorizer(max_features=max_features, min_df=min_df, max_df=max_df, stop_words=stop_words, norm=norm)

def create_unique_cars_list(data):
	cars_list = []
	for car in data:
		cars_list.append(car['Year_Make_Model'])
	return cars_list

def create_sizes_list(data, size_rev_idx):
	size_list = []
	for car in data:
		s = size_rev_idx[car['Vehicle Size']]
		size_list.append((car['Year_Make_Model'], s, car['MSRP']))
	
	return size_list

def build_inverted_index(msgs):
	inverted_index = {}
	for index, msg in enumerate(msgs):
		tokens = msg['Tokenized Reviews']
		tokens_set = set(tokens)
		for token in tokens_set:
			if token not in inverted_index:
				inverted_index[token] = [(index, tokens.count(token))]
			else:
				inverted_index[token].append((index, tokens.count(token)))
	return inverted_index

def compute_idf(inv_idx, n_docs, min_df=10, max_df_ratio=0.95):
	idf_dict = {}
	for term, tf_list in inv_idx.items():
		df = len(tf_list)
		if (df >= min_df and df/n_docs <= max_df_ratio):
			frac = n_docs/(1+df)
			idf = math.log(frac, 2)
			idf_dict[term] = idf
			
	return idf_dict

with open('data/data.json') as json_file:  
	data = json.load(json_file)

	num_cars = len(data)

	for car in data:
		car['Appended Reviews'] = ""
		for review in car['reviews']:
			new_review = (re.sub('[0-9]+', '', review['Review'])).lower()
			car['Appended Reviews'] = car['Appended Reviews'] + new_review + ' '
		car['Tokenized Reviews'] = tokenize(car['Appended Reviews'])

	n_feats = 5000
	doc_by_vocab = np.empty([len(data), n_feats])
	
	tfidf_vec = build_vectorizer(n_feats, "english")
	doc_by_vocab = tfidf_vec.fit_transform([d['Appended Reviews'] for d in data]).toarray()
	index_to_vocab = {i:v for i, v in enumerate(tfidf_vec.get_feature_names())}

	unique_cars = create_unique_cars_list(data)
	cars_reverse_index = {car: i for i, car in enumerate(unique_cars)}

	sizes = ['Compact', 'Midsize', 'Large']
	size_reverse_index = {size: i for i, size in enumerate(sizes)}


	unfiltered_list = create_sizes_list(data,size_reverse_index)

	inv_idx = build_inverted_index(data)

	idf_dict = compute_idf(inv_idx, len(data))


	# save data
	with open("data/unfiltered_list.json", "w+") as file:
		file.write(dumps(list(unfiltered_list)))

	with open("data/keywords.json", "w+") as file:
		file.write(dumps(list(index_to_vocab.values())))

	np.save("data/doc_by_vocab.json",doc_by_vocab)

	with open("data/index_to_vocab.json", "w+") as file:
		file.write(dumps(index_to_vocab))

	with open("data/idf_dict.json", "w+") as file:
		file.write(dumps(idf_dict))

