import pdfplumber
import csv
import os

table = []
directory = 'downloadedPdfs'

for file in os.listdir(directory):
    if not file.endswith(".pdf"):
        continue
    with open("{}/{}".format(directory, file), 'rb') as pdfFileObj:
        pdf = pdfplumber.open(pdfFileObj)
        totalPages = len(pdf.pages)

        for i in range(0, totalPages):
            page = pdf.pages[i]
            table = table + page.extract_table()

with open('data.csv', 'w') as fp:
    pass

with open("data.csv", "a") as my_csv:
    csvWriter = csv.writer(my_csv, delimiter=',')
    csvWriter.writerows(table)
