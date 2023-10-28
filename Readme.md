Assumption made:

    - PDF always follows a particular format
    - All data is sorted by date

How to setup locally?

    - Clone the repo
    - To install node packages: npm install
    - Generate google token: npm run generateToken
        It will open a browser or ask you click on a link to authorize the application to access your google account. This step is necessay to download PDFs. A token.json file will be create under directory 'config/'
    - Open '/config/constants.js' and edit the 'GMAIL_QUERY' string as per your need to search the apporiate emails only. You only need to change 'subject' in the string.
    - Install these python libraries:
        - pdfplumber
        - csv
    - To run server: npm run dev
    - Server runs at port 8000
    - Make sure port 8000 and 3000 are not being used by any other service
    - Entry point of the server is 'index.js' at the root
    - Resources folder contain the files to test the application. It have 2 files i.e 'bank.pdf' to directly test it out and 'statement.docx' is just an docx version of bank.pdf to modify the data per your needs.

Working?

    - All the downloaded pdf will be stored under directory 'downloadedPdfs/'
    - To download PDF, it uses gmail API. It uses google OAuth to authenticate. You need to authorize the application by running 'npm run generateToken'
    - To parse table from the PDF, it uses pdfplumber python library. Node.js executes 'tableParser.py'. You can find 'tableParser.py' under 'util' folder
    - After successfull parsing, it saves the parsed data into a csv file 'data.csv' at root directory

APIs?

    1. Downloads PDF from emails and Parses table from PDF
        - ROUTE: GET /api/v1/pdf/generate-data-from-email/
        - RETURNS: All parsed data in a list

    2. Find records within a date
        - ROUTE: GET /api/v1/pdf/find-records?startDate={DATE}&endDate={DATE}
        - Example: http://localhost:8000/api/v1/pdf/find-records?startDate=10/25/2014&endDate=11/01/2014
        - RETURNS: List of records satisfying condition
        
        - Query string is optional
        - Date format should be: MM/DD/YYYY
        - IF the dates are not provided then return all records.
        - If only startDate is provided then return all records from that date.
        - If only endDate is provided then return all records till that date.
        - If both startDate and endDate is provided then return within the range.
    
    3. Find balance by date (Returns the first date encountered)
        - ROUTE: GET /api/v1/pdf/get-balance?date={DATE}
        - Example: http://localhost:8000/api/v1/pdf/get-balance?date=11/01/2014
        - RETURNS: If condition satisfies returns {balance} else null
        
        - Query string is mandatory
        - Date format should be: MM/DD/YYYY
        - If multiple records present on a date then only send the balance from the first matching record
    
