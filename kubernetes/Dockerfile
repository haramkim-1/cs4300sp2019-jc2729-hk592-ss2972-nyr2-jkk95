# Read from Ubuntu Base Image
FROM python:3.6.8
RUN mkdir -p /service
# Copy over all the files of interest
ADD app/frontend/build /service/app/frontend/build
ADD app /service/app
ADD data /service/data
ADD app.py /service/app.py
ADD config.py /service/config.py
ADD manage.py /service/manage.py
ADD requirements.txt /service/requirements.txt
WORKDIR /service/
RUN pip install -r requirements.txt
ENV APP_SETTINGS config.DevelopmentConfig
CMD python -u app.py config.DevelopmentConfig 
