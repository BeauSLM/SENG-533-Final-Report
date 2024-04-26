import os
import pandas as pd
from scipy.stats import norm

TESTS_DIR = 'data'
LEVEL_OF_CONFIDENCE = 0.95
MIN_SAMPLES = 10000

# maps test name to response times
response_times = {}
for file in os.listdir(TESTS_DIR):
    test = file.split('-')[1].split('.')[0] # e.g. pull L50 from data/stats-L50.csv

    # pull response times from csv
    response_times[test] = pd.read_csv(os.path.join(TESTS_DIR, file))['elapsed']

for test, data in response_times.items():
    assert(len(data) > MIN_SAMPLES) # large number of samples, safe to compute confidence with z-score

    mean = data.mean()
    sem = data.sem()
    z = norm.ppf((1 + LEVEL_OF_CONFIDENCE) / 2)

    confidence_interval = norm.interval(
        LEVEL_OF_CONFIDENCE,
        loc=mean,
        scale=sem,
    )

    print(f'Margin of error for {test}: {z * sem}')
    print(f'Sample mean for {test}: {mean}')
    print(f'{LEVEL_OF_CONFIDENCE * 100}% confidence interval for {test}: {confidence_interval}\n\n')
