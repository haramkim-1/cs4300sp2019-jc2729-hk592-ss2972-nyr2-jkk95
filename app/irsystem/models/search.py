from json import load

#filter by size
def filter_sizes(min_size, max_size, min_price, max_price, car_size, car_price):
    return car_size >= min_size and car_size <= max_size and car_price >= min_price and car_price <= max_price
#cosine similarity
def get_sim(car, query):
    numerator = np.dot(car, query)
    norm1 = LA.norm(car)
    norm2 = LA.norm(query)
    sim = numerator/(norm1*norm2)
    return sim

class Searcher:
    def __init__(self):
        self.doc_by_vocab = np.load('data/doc_by_vocab.json.npy')
        with open('data/unfiltered_list.json') as unfiltered, open('data/idf_dict.json') as idfs, open('data/index_to_vocab.json') as itv:
            self.unfiltered_list = load(unfiltered)
            self.idf_dict = load(idfs)
            self.index_to_vocab = load(idv)

    def search(self, min_size, max_size, min_price, max_price, query):
        truncated_list_by_size = [x[0] for x in self.unfiltered_list if filter_sizes(min_size, max_size, min_price, max_price, x[1], x[2])]

        vocab_to_index = {index_to_vocab[k]:k for k in index_to_vocab}
        tf_idf_query = np.zeros(len())
        for t in toks:
            t_query[self.[t]] = 1
            tf_idf_query[vocab_to_index[t]] = self.idf_dict[t]

        similarity_list = []
        for car in truncated_list_by_size:
            car_index = self.cars_reverse_index[car]
            sim = get_sim(doc_by_vocab[car_index] , tf_idf_query)
            similarity_list.append((car, sim))
