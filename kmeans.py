from sklearn.cluster import KMeans
import numpy as np
import pickle
# https://stackoverflow.com/questions/27889873/clustering-text-documents-using-scikit-learn-kmeans-in-python

# fine-tuning number of clusters: 5, then 4 and 6
NUM_CLUSTERS = 5

with open('data/index_to_vocab.pkl', 'rb') as index_vocab_pkl:
	index_to_vocab_dict = pickle.load(index_vocab_pkl)
doc_by_vocab_mat = np.load("data/doc_by_vocab.npy") 

model = KMeans(n_clusters=NUM_CLUSTERS, init='k-means++', max_iter=100, n_init=1)
model.fit(doc_by_vocab_mat)

# print("Top terms per cluster:")
order_centroids = model.cluster_centers_.argsort()[:, ::-1]
relevant_keywords = []
for i in range(NUM_CLUSTERS):
    # print ("Cluster %d:" % i)
    cluster = set()
    for ind in order_centroids[i, :10]:
        # print (' %s' % index_to_vocab_dict[ind])
        cluster.add(index_to_vocab_dict[ind])
    print
    relevant_keywords.append(cluster)

# output [ sets(keywords) ] to go to a pre-mapped list in search.py
with open("data/query_expansion_clusters.pkl", "wb+") as file:
		pickle.dump(relevant_keywords, file)