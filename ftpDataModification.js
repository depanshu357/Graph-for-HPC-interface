const fs = require("fs");
const util = require("util");
const path = require("path");
// import fs from "fs";
// import util from "util";
// import path from "path";

// #####################################
// For NEW data
// New data requires another type of parsing
// #####################################

let inputFilesforPath = ["./Data2/paths_table_100620231126.txt"];
let inputFilesforCounter = ["./Data2/counters_table_100620231126.txt"];
let inputFilesforJob = ["./Data2/jobs_table_100620231126.txt"];
let outputFiles = ["./outputData/output4.json"];

// const inputFile = "nodes_link_path.csv";
// const inputFile2 = "device_counter.csv";
// const outputFile = "./outputData/output3.json";

function readFile(pathFile, counterFile, jobFile, outputFile) {
  function processJobFile(
    filePath,
    maxValues,
    nodes,
    links,
    jobs,
    outputFiles
  ) {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, "utf8", (error, csvData) => {
        if (error) {
          console.error("Error reading CSV file:", error);
          return;
        }

        // Split the CSV data into rows
        const data = csvData.split("\n");
        const table = [];

        for (var i = 1; i < data.length - 1; i++) {
          var row = data[i];
          // Split the row by colon delimiter
          var values = row.split(" ");
          // JobID UserName QueueName TotalNodes TotalCores RequiredTime JobState ElaspedTime NodeList
          var list = {
            JobID: values[0],
            UserName: values[1],
            QueueName: values[2],
            TotalNodes: values[3],
            TotalCores: values[4],
            RequiredTime: values[5],
            JobState: values[6],
            ElapsedTime: values[7],
            NodeList: values[8].split(","),
          };
          table.push(list);
        }
        // Create the JSON object
        const jsonData = {
          table: table,
          maxValues: maxValues,
          nodes: nodes,
          links: links,
          jobs: jobs,
          outputFiles: outputFiles,
        };

        // // Convert the JSON object to a JSON string
        const jsonString = JSON.stringify(jsonData);
        resolve(jsonString);
      });
    });
  }

  // Function to read and process a CSV file
  function processCSVFile(filePath) {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, "utf8", (error, csvData) => {
        if (error) {
          console.error("Error reading CSV file:", error);
          return;
        }
        var sumMap = new Map();
        var maxValue = -1;
        var maxValuehpc = -1;
        var maxValueLeaf = -1;
        var maxValueDirector = -1;
        var maxValueSpine = -1;

        // Split the CSV data into rows
        const data = csvData.split("\n");

        for (var i = 0; i < data.length - 1; i++) {
          var row = data[i];
          // Split the row by colon delimiter
          var values = row.split(" ");

          // Get the values from the second and third columns
          var value1 = parseInt(values[2]) / 100000000;
          var value2 = parseInt(values[3]) / 100000000;

          // Normalize the values
          var normalizedValue = value1 + value2;
          if (values[0][0] === "h") {
            if (maxValuehpc < normalizedValue) maxValuehpc = normalizedValue;
          } else if (values[0][4] === "W") {
            if (maxValueLeaf < normalizedValue) maxValueLeaf = normalizedValue;
          } else if (values[0][5] === "L") {
            if (maxValueDirector < normalizedValue)
              maxValueDirector = normalizedValue;
          } else if (values[0][5] === "S") {
            if (maxValueSpine < normalizedValue)
              maxValueSpine = normalizedValue;
          }
          if (maxValue < normalizedValue) {
            maxValue = normalizedValue;
          }

          // Get the value from the first column
          var key = values[0];

          // Calculate the sum and store it in the map
          if (sumMap.has(key)) {
            // If the key already exists in the map, add the normalized values
            var sum = sumMap.get(key);
            sum[0] = normalizedValue;
          } else {
            // If the key doesn't exist in the map, initialize the sum
            sumMap.set(key, [normalizedValue]);
          }
        }
        resolve({
          sumMap,
          maxValue,
          maxValuehpc,
          maxValueLeaf,
          maxValueDirector,
          maxValueSpine,
        });
      });
    });
  }

  function processSecondCSVFile(
    sumMap,
    filePath,
    maxValue,
    maxValuehpc,
    maxValueLeaf,
    maxValueDirector,
    maxValueSpine
  ) {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, "utf8", (error, csvData) => {
        if (error) {
          console.error("Error reading CSV file:", error);
          return;
        }
        // Initialize nodes and links arrays
        const maxValues = [
          maxValue,
          maxValuehpc,
          maxValueLeaf,
          maxValueDirector,
          maxValueSpine,
        ];
        const nodes = [];
        const links = [];
        const jobs = [];

        var jobmap = new Map();

        const rows = csvData.split("\n");
        let arrayofLeafSwitches = [];
        for (let i = 0; i <= 52; i++) {
          const innerArray = [];
          innerArray.push(0);
          arrayofLeafSwitches.push(innerArray);
        }
        var countValues = 0;
        for (let i = 0; i < rows.length; i++) {
          var row = rows[i];
          var columns = row.split(" ");
          var connections;
          // console.log(columns)
          if (columns.length > 1) {
            connections = columns[2].split("->");
          } else continue;
          // console.log(connections)
          for (let j = 0; j < connections.length - 1; j++) {
            // console.log(connections);
            let node1 = connections[j].trim();
            node1 = node1.split(":");
            node1 = node1[0];
            let node2 = connections[j + 1].trim();
            node2 = node2.split(":");
            node2 = node2[0];
            if (node1 === node2) continue;
            if (node1.substring(0, 3) === "hpc") {
              const lastTwoLetters = node2.substring(node2.length - 2);
              const number1 = parseInt(lastTwoLetters, 10);
              const lastThree = node1.substring(node1.length - 3);
              const number2 = parseInt(lastThree, 10);
              if (!arrayofLeafSwitches[number1].includes(number2)) {
                arrayofLeafSwitches[number1].push(number2);
                countValues++;
              }
            } else if (node2.substring(0, 3) === "hpc") {
              const lastTwoLetters = node1.substring(node1.length - 2);
              const number1 = parseInt(lastTwoLetters, 10);
              const lastThree = node1.substring(node2.length - 3);
              const number2 = parseInt(lastThree, 10);
              if (!arrayofLeafSwitches[number1].includes(number2)) {
                arrayofLeafSwitches[number1].push(number2);
                countValues++;
              }
            }
          }
        }
        maxValues.push(countValues);

        var jobMap = new Map();
        // console.log(arrayofLeafSwitches);
        // Split the CSV data into rows
        // Iterate over each row
        for (let i = 0; i < rows.length; i++) {
          // Split the row into columns
          var row = rows[i];
          const columns = row.split(" ");
          // console.log(columns)
          var connections;
          if (columns.length > 1) {
            connections = columns[2].split("->");
          } else continue;

          const key = columns[1];

          if (!jobMap.has(key)) {
            jobMap.set(key, []);
          }
          const innerArray = jobMap.get(key);
          // Create links data structure
          for (let i = 0; i < connections.length - 1; i++) {
            let node1 = connections[i].trim();
            node1 = node1.split(":");
            // console.log(node1);
            node1 = node1[0];
            let node2 = connections[i + 1].trim();
            node2 = node2.split(":");
            node2 = node2[0];
            // console.log(node1,node2);
            if (node1 === node2) continue;
              innerArray.push(node1);
              innerArray.push(node2);
            var source = node1;
            var target = node2;
            if (source.substring(0, 3) === "hpc") {
              const lastTwoLetters = target.substring(target.length - 2);
              let nodeId = "Bhpc" + lastTwoLetters;
              source = nodeId;
            }
            if (target.substring(0, 3) === "hpc") {
              const lastTwoLetters = source.substring(source.length - 2);
              let nodeId = "Bhpc" + lastTwoLetters;
              target = nodeId;
            }
            const link = {
              source: source,
              target: target,
              value: 1, // Assign a random value to the link (you can modify this as per your requirement)
            };
            if (!links.includes(link)) {
              links.push(link);
            }
          }
        }

        let maxValueOfBhpc = -1;

        let groupValue = 5;
        for (let i = 0; i <= 52; i++) {
          let paddedNumber = ("00" + i).slice(-2);
          let nodeId = "Bhpc" + paddedNumber;
          groupValue = 4;
          var value = arrayofLeafSwitches[i].length - 1;
          maxValueOfBhpc = Math.max(maxValueOfBhpc,value);
          const node = { id: nodeId, group: groupValue, value: value };
          nodes.push(node);
        }
        for (let i = 1; i <= 52; i++) {
          let paddedNumber = ("00" + i).slice(-2);
          let nodeId = "IB_SW_" + paddedNumber;
          groupValue = 3;
          let value;
          if (sumMap.has(nodeId)) {
            value = sumMap.get(nodeId);
          } else value = [0];
          const node = { id: nodeId, group: groupValue, value: value[0] };
          nodes.push(node);
        }
        for (let i = 1; i <= 27; i++) {
          let paddedNumber = ("00" + i).slice(-2);
          let nodeId = "IBB1_L" + paddedNumber;
          groupValue = 2;
          let value;
          if (sumMap.has(nodeId)) {
            value = sumMap.get(nodeId);
          } else value = [0];
          const node = { id: nodeId, group: groupValue, value: value[0] };
          nodes.push(node);
        }
        for (let i = 1; i <= 27; i++) {
          let paddedNumber = ("00" + i).slice(-2);
          let nodeId = "IBB2_L" + paddedNumber;
          groupValue = 2;
          let value;
          if (sumMap.has(nodeId)) {
            value = sumMap.get(nodeId);
          } else value = [0];
          const node = { id: nodeId, group: groupValue, value: value[0] };
          nodes.push(node);
        }
        for (let i = 1; i <= 18; i++) {
          let paddedNumber = ("00" + i).slice(-2);
          let nodeId = "IBB1_S" + paddedNumber;
          groupValue = 1;
          let value;
          if (sumMap.has(nodeId)) {
            value = sumMap.get(nodeId);
          } else value = [0];
          const node = { id: nodeId, group: groupValue, value: value[0] };
          nodes.push(node);
        }
        for (let i = 1; i <= 18; i++) {
          let paddedNumber = ("00" + i).slice(-2);
          let nodeId = "IBB2_S" + paddedNumber;
          groupValue = 1;
          let value;
          if (sumMap.has(nodeId)) {
            value = sumMap.get(nodeId);
          } else value = [0];
          const node = { id: nodeId, group: groupValue, value: value[0] };
          nodes.push(node);
        }

        // Iterate over the Map using a for...of loop
        for (const [key, value] of jobMap) {
          const pair = { job: key, nodes: value, nodesM: [] }; // Create an object with key-value pair
          for (let i = 0; i < value.length - 1; i++) {
            if(value[i] != value[i+1]){
              const adjacentPair = [value[i], value[i + 1]]; // Create an array of adjacent elements
              pair.nodesM.push(adjacentPair); // Push the adjacentPair to the nodes array
            }
          }
          jobs.push(pair); // Store the object in the result array
        }

        maxValues.push(maxValueOfBhpc);
        // Create the JSON object
        // const jsonData = {
        //   maxValues: maxValues,
        //   nodes: nodes,
        //   links: links,
        // };

        // // Convert the JSON object to a JSON string
        // const jsonString = JSON.stringify(jsonData);
        // resolve(jsonString);
        resolve({ maxValues, nodes, links, jobs });
      });
    });
  }

  // Process the first CSV file
  processCSVFile(counterFile)
    .then((firstFileData) => {
      // console.log("Processed first file:", firstFileData);
      console.log(pathFile);
      // Process the second CSV file after processing the first file
      // return processCSVFile("secondFile.csv");
      const {
        sumMap,
        maxValue,
        maxValuehpc,
        maxValueLeaf,
        maxValueDirector,
        maxValueSpine,
      } = firstFileData;
      return processSecondCSVFile(
        sumMap,
        pathFile,
        maxValue,
        maxValuehpc,
        maxValueLeaf,
        maxValueDirector,
        maxValueSpine
      );
    })
    .then((secondFileData) => {
      const { maxValues, nodes, links, jobs } = secondFileData;
      return processJobFile(
        jobFile,
        maxValues,
        nodes,
        links,
        jobs,
        outputFiles
      );
    })
    .then((thirdFileData) => {
      var json = JSON.parse(thirdFileData);
      // console.log("Processed second file:", json.links);

      // Write the output CSV content to the output file
      fs.writeFile(outputFile, thirdFileData, "utf8", (error) => {
        if (error) {
          console.error("Error writing to CSV file:", error);
          return;
        }
        console.log("CSV file has been successfully created.");
      });
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

// Function to read files at regular intervals
function readFilesAtIntervals(interval) {
  const folderPath = "Data2";
  // Read the contents of the folder
  fs.readdir(folderPath, (err, files) => {
    if (err) {
      console.error("Error reading folder:", err);
      return;
    }
    // Filter the files based on the prefix "counter_table_"
    const filteredFilesForCounter = files.filter((file) =>
      file.startsWith("counters_table_")
    );
    // Map the filtered files to their full file paths
    inputFilesforCounter = filteredFilesForCounter.map((file) =>
      path.join(folderPath, file)
    );
    const filteredFilesForPath = files.filter((file) =>
      file.startsWith("paths_table_")
    );
    inputFilesforPath = filteredFilesForPath.map((file) =>
      path.join(folderPath, file)
    );
    const filteredFilesForJob = files.filter((file) =>
      file.startsWith("jobs_table_")
    );
    inputFilesforJob = filteredFilesForJob.map((file) =>
      path.join(folderPath, file)
    );
    // console.log(fileLocations);

    // Create an array of output file names based on counter file names
    outputFiles = filteredFilesForCounter.map((file) => {
      const regex = /\d{12}/;
      const numbers = file.match(regex);

      if (numbers && numbers.length > 0) {
        const extractedNumber = numbers[0];
        console.log(extractedNumber); // Output: 140620231238
        // const counterFileName = file.slice(-12); // Get the last 12 characters of the counter file name
        return `./outputData/output_${extractedNumber}.json`; // Construct the output file name
      } else {
        console.log("No 12-digit number found in the file name.");
      }
      return `./outputData/output_not_matched.json`;

    });

    // Print the output file names
    // console.log(outputFiles);
  });

  let index = 0;

  function readNextFile() {
    if (index < inputFilesforPath.length) {
      const pathFile = inputFilesforPath[index];
      const counterFile = inputFilesforCounter[index];
      const jobFile = inputFilesforJob[index];
      const outputFile = outputFiles[index];
      readFile(pathFile, counterFile, jobFile, outputFile);
      index++;
      setTimeout(readNextFile, interval);
    }
  }

  readNextFile();
}

const interval = 2000; // Interval in milliseconds (e.g., 5000ms = 5 seconds)
readFilesAtIntervals(interval);
console.log(outputFiles);
