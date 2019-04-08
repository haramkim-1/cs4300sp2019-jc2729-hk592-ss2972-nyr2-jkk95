from json import load

#filter by size
def filter_sizes(min_size, max_size, min_price, max_price, car_size, car_price):
    return car_size >= min_size and car_size <= max_size

class searcher:
    def __init__(self):
        with open('data/unfiltered_list.json') as json_file:
            self.unfiltered_list = load(json_file)

    def search(self, min_size, max_size, min_price, max_price):
        truncated_list_by_size = [x[0] for x in self.unfiltered_list if filter_sizes(min_size, max_size, min_price, max_price, x[1], x[2])]
