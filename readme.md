## Usage
The top half represents the graph.
The bottom half represent the list of job logs running in the process.
To get the paths taken by jobs, click on the particular job id on the table.
To select a date - just click on one of the dates in the select dropdown menu.
To highlight the links of a  paricular job, click on the partcular job in the table two times.

## Installation
To run the code in your system - 
Please ensure to have git installed to your system
first clone the code in your sytem by writing
```bash
    git clone https://github.com/depanshu357/Graph-for-HPC-interface.git
```
and then just open the graph.html file in your browser.

## Additional Info
If you want to add new data, please put it under Data2 folder which should have same format as the present files.
To process the new data run the code in the directory 
```bash
    node ./ftpDataModification.js
```
It will create new output files in the directory ./outputData

## Contributing
Pull requests are welcome.For major changes, please open an issue first to discuss what you would like to change.

## Caution
If graph looks messed up or deformed please reload the page.
