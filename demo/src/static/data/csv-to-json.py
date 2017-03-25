import json, csv

def csv_to_rows(filename):
	rows = []
	with open(filename, 'rb') as csvfile:
		csvreader = csv.DictReader(csvfile, dialect='excel')

		for row in csvreader:

			try:
				row['latitude'] = float(row['latitude'])
				row['longitude'] = float(row['longitude'])
				rows.append(row)
			except Exception as e:
					print str(e)
		csvfile.close()

	return rows

def trim_csv(filename):
	rows = []
	with open(filename, 'rb') as csvfile:
		csvreader = csv.DictReader(csvfile, dialect='excel')

		for row in csvreader:

			try:
				new_row = [row['Longitude'], row['Latitude']]

				rows.append(new_row)
			except Exception as e:
					print str(e)
		csvfile.close()

	return rows

if __name__ == "__main__":
	#rows = csv_to_rows('heatmap-data.csv')
	#jsonData = {'points': rows}
	rows = trim_csv('accidents_2015.csv')
	print len(rows)
	with open('heatmap-data.csv', 'w') as outfile:
		spamwriter = csv.writer(outfile, dialect='excel')
		for row in rows:
			print row
			spamwriter.writerow(row)
	outfile.close()

	# with open('heatmap-data.json', 'w') as outfile:
	# 	print("json dump")
	# 	json.dump(jsonData, outfile)
	# 	outfile.close()
