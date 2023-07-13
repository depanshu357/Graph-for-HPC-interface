const fs = require("fs");

const inputFile = "nodes_link_path.csv";
const inputFile2 = "device_counter.csv";
const outputFile = "output2.json";

var sumMap = new Map();

var maxValue1 = 0;
var maxValue2 = 0;

fs.readFile(inputFile2, "utf8", (error, csvData) => {
  if (error) {
    console.error("Error reading CSV file:", error);
    return;
  }

  // Split the CSV data into rows
  const data = csvData.split("\n");
  // console.log(data);

  for (var i = 0; i < data.length - 1; i++) {
    var row = data[i];
    // Split the row by colon delimiter
    var values = row.split(":");

    // Get the values from the second and third columns
    var value1 = parseInt(values[2]) / 100000000;
    var value2 = parseInt(values[3]) / 100000000;
    // console.log(value1,value2)

    maxValue1 = Math.max(value1, maxValue1);
    maxValue2 = Math.max(value2, maxValue2);
  }

  console.log(maxValue1, maxValue2);

  for (var i = 0; i < data.length - 1; i++) {
    var row = data[i];
    // Split the row by colon delimiter
    var values = row.split(":");

    // Get the values from the second and third columns
    var value1 = parseInt(values[2]) / 100000000;
    var value2 = parseInt(values[3]) / 100000000;
    // console.log(value1,value2)

    // Normalize the values
    var normalizedValue = normalizeValue(value1 + value2);
    // var normalizedValue2 = normalizeValue(value2);
    // console.log(normalizedValue);

    // Get the value from the first column
    var key = values[0];

    // Calculate the sum and store it in the map
    if (sumMap.has(key)) {
      // If the key already exists in the map, add the normalized values
      var sum = sumMap.get(key);
      sum[0] += normalizedValue;
      // sum[0] += normalizedValue2;
    } else {
      // If the key doesn't exist in the map, initialize the sum
      sumMap.set(key, [normalizedValue]);
    }
  }

  // Output the sums stored in the map
  // sumMap.forEach(function (sum, key) {
  //   console.log(sumMap.get(key)[0])
  //   console.log(typeof key)
  // });

  // console.log(sumMap);
});
// console.log(sumMap.get("hpc183"))
function normalizeValue(value) {
  // Normalize the value between 1 and 100
  var min = 0; // minimum value in the range
  var max = maxValue1 + maxValue2; // maximum value in the range

  // Normalize the value using min-max normalization formula
  var normalizedValue = ((value - min) / (max - min)) * (100 - 1) + 1;
  if (normalizedValue < max) normalizedValue = max;
  return Math.round(normalizedValue);
}

// Read data from the input CSV file
fs.readFile(inputFile, "utf8", (error, csvData) => {
  if (error) {
    console.error("Error reading CSV file:", error);
    return;
  }

  //   const csvData = `981629.09,hpc210,hpc256,hpc260,hpc279,hpc334,hpc434,hpc457:Nodes hpc139 <-> hpc193:hpc139->IBSW_08->IBB1_SW_L04->IBB1_SW_S09->IBB1_SW_L06->IBSW_11->hpc193`;

  // Initialize nodes and links arrays
  const nodes = [];
  const links = [];
  const uniqueNodeIds = new Set(); // To keep track of unique node IDs
  let groupValue = 5;
  for (let i = 0; i <= 888; i++) {
    let paddedNumber = ("000" + i).slice(-3);
    let nodeId = "hpc" + paddedNumber;
    groupValue = 4;
    // console.log(nodeId)

    var value = [];
    if (sumMap.has(nodeId)) {
      value = sumMap.get(nodeId);
      // console.log("heu")
    } else {
      value = [0];
    }
    // console.log(value);

    // console.log(typeof value)
    const node = { id: nodeId, group: groupValue, value: value[0] };
    nodes.push(node);
    console.log(node);
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
  //   for(let i)

  // Split the CSV data into rows
  const rows = csvData.split("\n");

  // Iterate over each row
  rows.forEach((row) => {
    // Split the row into columns
    const columns = row.split(":");
    const connections = columns[3].split("->");

    // Create links data structure
    for (let i = 0; i < connections.length - 1; i++) {
      const link = {
        source: connections[i].trim(),
        target: connections[i + 1].trim(),
        value: Math.random(), // Assign a random value to the link (you can modify this as per your requirement)
      };
      links.push(link);
    }
  });

  // console.log(nodes);

  // Create the JSON object
  const jsonData = {
    nodes: nodes,
    links: links,
  };

  // Convert the JSON object to a JSON string
  const jsonString = JSON.stringify(jsonData);

  // Display the JSON string
  // console.log(jsonString);

  // Write the output CSV content to the output file
  fs.writeFile(outputFile, jsonString, "utf8", (error) => {
    if (error) {
      console.error("Error writing to CSV file:", error);
      return;
    }
    console.log("CSV file has been successfully created.");
  });
});
