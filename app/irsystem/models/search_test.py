from search import Searcher

searcher = Searcher("../../../data")

results = searcher.search(2, 2, 0, 1000000, ["luxury"])
print(results)