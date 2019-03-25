import pandas as pd
from os import listdir
from os.path import join

details = pd.read_csv("data/raw/details.csv",
            usecols=["Make", "Model", "Year", "Transmission Type", "Driven_Wheels", 
                    "Market Category", "Vehicle Size", "Vehicle Style", "highway MPG", 
                    "city mpg", "Popularity", "MSRP"])

# create reviews dataset
# reviews_path = "data/raw/reviews"
# review_df_list = []
# for filename in listdir(reviews_path):
#     df = pd.read_csv(join(reviews_path, filename), 
#             engine="python", 
#             usecols=["Review_Date","Author_Name","Vehicle_Title","Review_Title","Review","Rating"])
#     review_df_list.append(df)
# reviews = pd.concat(review_df_list, ignore_index=True)

# reviews.to_csv("data/reviews_cleaned.csv")

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

# save new details
details.to_csv("data/details_cleaned.csv")
