const fs = require("fs");
const util = require("util");

// #####################################
// For Old data
// New data requires another type of parsing
// #####################################

// const inputFilesforPath = ["nodes_link_path_1.csv"];
// const inputFilesforCounter = ["device_counters_1.csv"];
const inputFilesforPath = [
  "./data/nodes_link_path_1.csv",
  "./data/nodes_link_path_2.csv",
  "./data/nodes_link_path_3.csv",
];
const inputFilesforCounter = [
  "./data/device_counters_1.csv",
  "./data/device_counters_2.csv",
  "./data/device_counters_3.csv",
];

const inputFile = "nodes_link_path.csv";
const inputFile2 = "device_counter.csv";
const outputFile = "./outputData/output3.json";

function readFile(pathFile, counterFile) {
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
          var values = row.split(":");

          // Get the values from the second and third columns
          var value1 = parseInt(values[2]) / 100000000;
          var value2 = parseInt(values[3]) / 100000000;

          // Normalize the values
          var normalizedValue = value1 + value2;
          if (values[0][0] === "h") {
            if (maxValuehpc < normalizedValue) maxValuehpc = normalizedValue;
          } else if (values[0][3] === "W") {
            if (maxValueLeaf < normalizedValue) maxValueLeaf = normalizedValue;
          } else if (values[0][8] === "L") {
            if (maxValueDirector < normalizedValue)
              maxValueDirector = normalizedValue;
          } else if (values[0][8] === "S") {
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
          var columns = row.split(":");
          var connections;
          if (columns.length > 1) {
            connections = columns[3].split("->");
          } else continue;
          for (let j = 0; j < connections.length - 1; j++) {
            let node1 = connections[j].trim();
            let node2 = connections[j + 1].trim();
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
        // Split the CSV data into rows
        // Iterate over each row
        for (let i = 0; i < rows.length; i++) {
          // Split the row into columns
          var row = rows[i];
          const columns = row.split(":");
          var connections;
          if (columns.length > 1) {
            connections = columns[3].split("->");
          } else continue;

          // Create links data structure
          for (let i = 0; i < connections.length - 1; i++) {
            var source = connections[i].trim();
            var target = connections[i + 1].trim();
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

        let groupValue = 5;
        for (let i = 0; i <= 52; i++) {
          let paddedNumber = ("00" + i).slice(-2);
          let nodeId = "Bhpc" + paddedNumber;
          groupValue = 4;
          var value = arrayofLeafSwitches[i].length - 1;
          const node = { id: nodeId, group: groupValue, value: value };
          nodes.push(node);
        }
        for (let i = 1; i <= 52; i++) {
          let paddedNumber = ("00" + i).slice(-2);
          let nodeId = "IBSW_" + paddedNumber;
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
          let nodeId = "IBB1_SW_L" + paddedNumber;
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
          let nodeId = "IBB2_SW_L" + paddedNumber;
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
          let nodeId = "IBB1_SW_S" + paddedNumber;
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
          let nodeId = "IBB2_SW_S" + paddedNumber;
          groupValue = 1;
          let value;
          if (sumMap.has(nodeId)) {
            value = sumMap.get(nodeId);
          } else value = [0];
          const node = { id: nodeId, group: groupValue, value: value[0] };
          nodes.push(node);
        }

        // Create the JSON object
        const jsonData = {
          maxValues: maxValues,
          nodes: nodes,
          links: links,
        };

        // Convert the JSON object to a JSON string
        const jsonString = JSON.stringify(jsonData);
        resolve(jsonString);
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
      var json = JSON.parse(secondFileData);
      // console.log("Processed second file:", json.links);

      // Write the output CSV content to the output file
      fs.writeFile(outputFile, secondFileData, "utf8", (error) => {
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
  let index = 0;

  function readNextFile() {
    if (index < inputFilesforPath.length) {
      const pathFile = inputFilesforPath[index];
      const counterFile = inputFilesforCounter[index];
      readFile(pathFile, counterFile);
      index++;
      setTimeout(readNextFile, interval);
    }
  }

  readNextFile();
}

// Usage example
const interval = 5000; // Interval in milliseconds (e.g., 5000ms = 5 seconds)
readFilesAtIntervals(interval);
