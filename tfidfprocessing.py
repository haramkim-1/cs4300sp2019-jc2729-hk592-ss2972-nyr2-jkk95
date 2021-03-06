#!/usr/bin/env python
# coding: utf-8


from __future__ import print_function
from sklearn.feature_extraction.text import TfidfVectorizer
from scipy.sparse.linalg import svds
import numpy as np
from numpy import linalg as LA
import math
import re
import string
import pickle
from sklearn.preprocessing import normalize


#Some of the following methods were inspired by various homework assignments

def tokenize(text):
    """
    Tokenize the review and remove words that have a length of 2 or smaller
    """
    tokenized_review = re.findall(r'[a-z]+', text.lower())
    return [x for x in tokenized_review if len(x)>2]

def build_vectorizer(max_features, stop_words, max_df=0.65, min_df=45, norm='l2', tokenizer=tokenize):
    """
    Returns a TfidfVectorizer object with the above preprocessing properties.
    """
    return TfidfVectorizer(max_features=max_features, min_df=min_df, max_df=max_df, stop_words=stop_words, norm=norm, tokenizer=tokenize)

def create_unique_cars_list(data):
    """
    Create a list of unique cars, the unique identifier being their Year_Make_Model
    """
    cars_list = []
    for car in data:
        cars_list.append(car['Year_Make_Model'])
    return cars_list

def fuel_definitions(mpg, h, e):
    #gas guzzler
    if mpg < 23:
        return 0
    #electric
    elif e == True:
        return 4
    #hybrid
    elif h == True:
        return 3
    #standard
    elif mpg < 30:
        return 1
    #fuel-efficient
    else:
        return 2



def create_sizes_list(data, size_rev_idx):
    """
    Create a list of tuples containing the car's Year_Make_Model, size, and MSRP
    """
    size_list = []
    for car in data:
        s = size_rev_idx[car['Vehicle Size']]
        combined = 0.55*int(car['city mpg']) + 0.45*int(car['highway MPG'])
        hybrid = 'hybrid' in str(car['Market Category']).lower()
        electric = 'electric' in str(car['Engine Fuel Type']).lower()
        f = fuel_definitions(combined, hybrid, electric)
        size_list.append((car['Year_Make_Model'], s, car['MSRP'], f))

    return size_list


with open('data/data.pkl', "rb") as json_file:
    data = list(pickle.load(json_file).values())

    num_cars = len(data)
    #Append all of the reviews for a car together, and remove numbers
    for car in data:
        car['Appended Reviews'] = ""
        for review in car['reviews']:
            new_review = (re.sub('[0-9]+', '', review['Review'])).lower()
            car['Appended Reviews'] = car['Appended Reviews'] + new_review + ' '

    n_feats = 4000
    doc_by_vocab = np.empty([len(data), n_feats])

    # #Create a tf_idf matrix
    tfidf_vec = build_vectorizer(n_feats, "english")
    doc_by_vocab = tfidf_vec.fit_transform([d['Appended Reviews'] for d in data]).toarray()
    index_to_vocab = {i:v for i, v in enumerate(tfidf_vec.get_feature_names())}

    vocab_by_doc = doc_by_vocab.transpose()
    words_compressed, _, docs_compressed = svds(vocab_by_doc, k=800) #(3646, 800),_,(800,1532)
    docs_compressed = docs_compressed.transpose() #(1532, 800)
    docs_compressed = normalize(docs_compressed, axis = 1)
    word_to_index = tfidf_vec.vocabulary_


    #Create a list of unique cars
    unique_cars = create_unique_cars_list(data)
    cars_reverse_index = {car: i for i, car in enumerate(unique_cars)}

    sizes = ['Compact', 'Midsize', 'Large']
    size_reverse_index = {size: i for i, size in enumerate(sizes)}


    unfiltered_list = create_sizes_list(data,size_reverse_index)

    with open("data/tfidf_vec.pkl", "wb+") as file:
        pickle.dump(tfidf_vec, file)

    # save data
    with open("data/unfiltered_list.pkl", "wb+") as file:
        pickle.dump(unfiltered_list, file)

    np.save("data/doc_by_vocab", doc_by_vocab)

    with open("data/index_to_vocab.pkl", "wb+") as file:
        pickle.dump(index_to_vocab, file)

    with open("data/word_to_index.pkl", "wb+") as file:
        pickle.dump(word_to_index, file)

    with open("data/words_compressed.pkl", "wb+") as file:
        pickle.dump(words_compressed, file)

    with open("data/docs_compressed.pkl", "wb+") as file:
        pickle.dump(docs_compressed, file)
