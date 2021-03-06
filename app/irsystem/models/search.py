import pickle
import numpy as np
from os.path import join
from sklearn.feature_extraction.text import TfidfVectorizer
import re
from sklearn.preprocessing import normalize
from scipy.sparse.linalg import svds


"""Returns a list of words that make up the text.

    Note: for simplicity, lowercase everything.
    Used Regex

    Params: {text: String}
    Returns: List

    Used:
    https://stackoverflow.com/questions/12851791/removing-numbers-from-string/12856384
    as reference

    First, lowercase, remove quotations, and remove numbers
    """
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

def filter_sizes(min_size, max_size, min_price, max_price, min_fuel, max_fuel, car_size, car_price, car_fuel):
    '''Returns a filtered list of car_size
        filter_sizes is a function that filters sizes and prices of the cars to fit
        the query
        (1: compact, 2: midsize, 3: large)
        min_size: an Integer that is taken from the query. The lower bound of the sizes.
        max_size: an Integer that is taken from the query. The upper bound of the sizes.
        min_price: an Integer that is taken from the query. The lower bound of the prices.
        max_price: an Integer that is taken from the query. The upper bound of the prices.
        car_size: an Integer for given car in our dataset. We want to see if this car fits
                    the requested parameters
        car_price: an Integer for given car in our dataset. We want to see if this car fits
                    the requested parameters

        Returns: a list of cars (cars defined by a string: Year_Make_Model)
    '''
    return car_size >= min_size and car_size <= max_size and car_price >= min_price and car_price <= max_price and car_fuel >= min_fuel and car_fuel <= max_fuel

def get_sim(car, q):
    """Returns a float giving the cosine similarity of
       the two movie transcripts.

    Params: {mov1: String,
             mov2: String,
             input_doc_mat: Numpy Array,
             movie_name_to_index: Dict}
    Returns: Float (Cosine similarity of the two movie transcripts.)
    """
    #print(car)
    #print('******')
    #print(q)
    numerator = np.dot(car, q)
    norm1 = np.linalg.norm(car)
    norm2 = np.linalg.norm(q)
    sim = numerator/float(1 + norm1*norm2)
    return sim

class Searcher:
    def __init__(self, data_path="data"):
        '''
        All preprocessed data is stored in data folder. Want to access this data.
        '''
        with open(join(data_path, 'unfiltered_list.pkl'), 'rb') as unfiltered, \
            open(join(data_path, 'index_to_vocab.pkl'), 'rb') as itv, \
            open(join(data_path, 'data.pkl'), 'rb') as all_data, \
            open(join(data_path, 'word_to_index.pkl'), 'rb') as word_to_index, \
            open(join(data_path, 'words_compressed.pkl'), 'rb') as words_compressed, \
            open(join(data_path, 'docs_compressed.pkl'), 'rb') as docs_compressed, \
            open(join(data_path, 'query_expansion_clusters.pkl'), 'rb') as query_expansion_file:

            self.all_data = pickle.load(all_data)
            self.unfiltered_list = pickle.load(unfiltered)
            self.index_to_vocab = pickle.load(itv)
            self.vocab_to_index = {self.index_to_vocab[k]:int(k) for k in self.index_to_vocab}
            self.cars_reverse_index = {car[0]: i for i, car in enumerate(self.unfiltered_list)}
            self.word_to_index = pickle.load(word_to_index)
            self.words_compressed = pickle.load(words_compressed)
            self.docs_compressed = pickle.load(docs_compressed)
            self.query_expansion_clusters = pickle.load(query_expansion_file)
        n_feats = 4000
        # self.doc_by_vocab = np.empty([len(self.all_data), n_feats])
        '''
        run build_vectorizer to create the TF IDF vector with the above n_feats
        '''
        self.tfidf_vec = build_vectorizer(n_feats, "english")

        for car in self.all_data.values():
            car['Appended Reviews'] = ""
            for review in car['reviews']:
                new_review = (re.sub('[0-9]+', '', review['Review'])).lower()
                car['Appended Reviews'] = car['Appended Reviews'] + new_review + ' '
            self.all_data[car["Year_Make_Model"]] = car
        self.temp_dict = {}
        self.temp_list = []
        for i, d in enumerate(self.all_data.values()):
            self.temp_dict[d['Year_Make_Model']] = i
            self.temp_list.append(d['Appended Reviews'])

        self.doc_by_vocab = self.tfidf_vec.fit_transform(self.temp_list).toarray()
        # np.savetxt("version2.csv", self.doc_by_vocab, delimiter=",")
        # print("done")

    def search(self, min_size, max_size, min_price, max_price, min_fuel, max_fuel, query):
        '''
        Function that returns top 10 cars that are most relevant to the query

        inputs:
        min_size: integer from the query that is the minimum bound of car size
        max_size: integer from the query that is the maximum bound of the car size
        min_price: integer from the query that is the minimum bound of car price
        max_price: integer from the query tha tis the maximum bound of car price
        query: list of words from the query
        '''
        #filter list of cars by size and price
        truncated_list_by_size = [x[0] for x in self.unfiltered_list if filter_sizes(min_size, max_size, min_price, max_price, min_fuel, max_fuel, x[1], x[2], x[3])]

        # print("start idf_dict lookups")
        # tf_idf_query = np.zeros(len(self.keywords))
        # for t in query:
        #    print("\t" + t)
        #    tf_idf_query[self.vocab_to_index[t]] = self.idf_dict[t]

        #convert query to a string

        #query = " ".join(query)
        #print(query)
        #tf_idf_query = self.tfidf_vec.transform([query]).toarray()[0]

		# TODO: actually use priorities
        query_terms = [item["word"] for item in query]
        query_priorities = [item["priority"] for item in query]

        expanded_query = []
        for term in query_terms:
            in_cluster = False
            for cluster in self.query_expansion_clusters:
                if term in cluster:
                    expanded_query.extend(cluster)
                    in_cluster = True
            if not in_cluster:
                expanded_query.append(term)
        print(expanded_query)

        k_means_words = list(set(expanded_query) - set(query_terms))

        # generate expanded query for frontend
        qwords_to_priorities = {elem["word"]:elem["priority"] for elem in query}
        exp_query_with_priorities = [{"word": w, "priority": qwords_to_priorities[w] if w in query_terms else 3} for w in expanded_query]




        svd_query = np.zeros(800)
        count = 0
        for item in exp_query_with_priorities:
            word = item['word']
            priority = item['priority']

            if word in self.word_to_index:
                # print(svd_query)
                svd_query = svd_query + (self.words_compressed[self.word_to_index[word]])*(1/priority)
                count += 1
        if count!=0:
            svd_query = svd_query / count

        #for each car, find it's similarity to the query via cosine similarity
        similarity_dict = {}
        for car in truncated_list_by_size:
            car_index = self.temp_dict[car]
            sim = get_sim(self.docs_compressed[car_index].T, svd_query)
            similarity_dict[car] = sim


















        #sort results and then take the top 10
        sorted_results = sorted(similarity_dict.keys(), key=lambda word: similarity_dict.get(word), reverse = True)
        print('sorted results' , sorted_results[0:10])
        if sorted_results==[]:
            return {"results": 'None', "query":exp_query_with_priorities}
        return {"results": sorted_results[0:10], "query":exp_query_with_priorities}
