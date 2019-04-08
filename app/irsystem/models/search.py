with open('data/unfiltered_list.json') as json_file:
	unfiltered_list = json.load(json_file)

    #filter by size
    def filter_sizes(min_size, max_size, min_price, max_price, car_size, car_price):
        return car_size >= min_size and car_size <= max_size

    min_size = 0
    max_size = 1
    min_price = 0
    max_price = 100000
    truncated_list_by_size = [x[0] for x in unfiltered_list if filter_sizes(min_size, max_size, min_price, max_price, x[1], x[2])]
