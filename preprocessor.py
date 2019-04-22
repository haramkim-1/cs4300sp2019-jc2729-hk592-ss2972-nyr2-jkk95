import pandas as pd
from os import listdir
from os.path import join
from pickle import dump

details = pd.read_csv("data/raw/details.csv",
			usecols=["Make", "Model", "Year", "Transmission Type", "Driven_Wheels", "Engine Fuel Type",
					"Market Category", "Vehicle Size", "Vehicle Style", "highway MPG", 
					"city mpg", "Popularity", "MSRP"],
			dtype={"Make": str,
					"Model": str,
					"Year": int,
					"Transmission Type": str,
					"Driven_Wheels": str,
					"Vehicle Size": str,
					"Vehicle Style": str,
					"highway MPG": int,
					"city mpg": int,
					"Popularity": int,
					"MSRP": int},
			converters={"Market Category": lambda x: str(x) if x != "N/A" else ""})

# create reviews dataset
reviews_path = "data/raw/reviews"
review_df_list = []
for filename in listdir(reviews_path):
	df = pd.read_csv(join(reviews_path, filename), 
			engine="python", 
			usecols=["Review_Date","Author_Name","Vehicle_Title","Review_Title","Review","Rating"])
	review_df_list.append(df)
reviews = pd.concat(review_df_list, ignore_index=True)

# drop rows from reviews where Vehicle_Title is nan
reviews.dropna(axis="index", subset=["Vehicle_Title"], inplace=True)

# new column in details
details["Year_Make_Model"] = details.apply(lambda row: str(row.Year) + " " + str(row.Make) + " " + str(row.Model), axis="columns")

# remove columns where year make and model are all the same 
unique_ymm_list = details.Year_Make_Model.unique()
count = 0
for ymm in unique_ymm_list:
	# get all indices with same ymm
	same_ymm_indices = details.index[details["Year_Make_Model"] == ymm].tolist()

	if len(same_ymm_indices) > 1:
		# get all rows with same ymm
		same_ymm_rows = details.ix[same_ymm_indices]

		# get index where MSRP is minimized
		min_msrp_index = same_ymm_rows["MSRP"].idxmin()

		# get list of indices with same ymm where MSRP is *not* minimized
		same_ymm_indices.remove(min_msrp_index)

		# drop those indices from the dataset
		details.drop(labels=same_ymm_indices, inplace=True)

# convert details df to list of dicts
details_dicts = details.to_dict("records")

# iterate over each car record and augment with review details
for i in range(len(details_dicts)):
	current_ymm = details_dicts[i]["Year_Make_Model"]
	relevant_reviews = reviews[reviews["Vehicle_Title"].str.contains(current_ymm)]
	details_dicts[i]["reviews"] = relevant_reviews.to_dict("records")

# make a mapping from car ymm to car data
# at the same time, remove car objects that don't have any reviews
car_dict = {car["Year_Make_Model"]:car for car in details_dicts if len(car["reviews"]) > 1}

# save new details
with open("data/data.pkl", "wb+") as file:
	dump(car_dict, file)

# from json import load
# from statistics import median, stdev
# with open("data/data.json", "r") as file:
#	 data = load(file)
#	 counts = []
#	 no_reviews_count = 0
#	 with_reviews_count = 0
#	 for row in data:
#		 if len(row["reviews"]) == 0:
#			 no_reviews_count += 1
#		 else:
#			 with_reviews_count += 1
#		 counts.append(len(row["reviews"]))
#		 print(len(row["reviews"]))
#	 print("median: {}, stdev: {}, num w/o revs: {}, num w/ revs: {}".format(median(counts), stdev(counts), no_reviews_count, with_reviews_count))
