const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

// Function to get all files with "cy.ts" in the directory and subdirectories
function getAllCyTsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllCyTsFiles(filePath, fileList);
    } else if (filePath.endsWith("cy.ts")) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

// Function to divide the files into smaller batches
function divideFilesIntoBatches(files, batchSize = 3) {
  const batches = [];
  for (let i = 0; i < files.length; i += batchSize) {
    batches.push(files.slice(i, i + batchSize));
  }
  batches.forEach((batch, index) => {
    console.log(`Batch ${index + 1}: ${batch}`);
  });
  return batches;
}

// Function to run Cypress tests in parallel for each batch
function runCypressTestsInBatches(fileGroups) {
  const startTime = Date.now();

  const runBatch = (batch) => {
    const promises = batch.map((file) => {
      return new Promise((resolve) => {
        console.log(`Executing test file: ${file}`);
        exec(`npx cypress run --spec ${file}`, (error, stdout, stderr) => {
          if (error) {
            console.error(`Error executing file ${file}: ${error.message}`);
          }
          if (stderr) {
            console.error(`Error output for file ${file}: ${stderr}`);
          }
          console.log(`Output for file ${file}: ${stdout}`);
          resolve(stdout);
        });
      });
    });

    return Promise.all(promises);
  };

  const runAllBatches = async () => {
    for (const group of fileGroups) {
      const batches = divideFilesIntoBatches(group);
      for (const batch of batches) {
        await runBatch(batch);
      }
    }

    const endTime = Date.now();
    const executionTime = (endTime - startTime) / 1000;
    console.log(`Total execution time: ${executionTime} seconds`);
  };

  runAllBatches();
}

// Main function
function main() {
  const rootDir = "./cypress/e2e";
  const allCyTsFiles = getAllCyTsFiles(rootDir);
  const sampleFiles = allCyTsFiles;
  const numCores = os.cpus().length;
  const dividedFiles = divideFilesIntoBatches(sampleFiles);
  runCypressTestsInBatches(dividedFiles);
}

main();
