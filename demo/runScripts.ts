const { exec } = require('child_process');

const commands = [
//   'npm run test-run',
  'npm run clearReports',
];

function runCommand(index) {
  if (index >= commands.length) return; // Stop when all commands have been run

  const command = commands[index];
  console.log(`Running: ${command}`);
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
    }
    if (stdout) {
      console.log(`Output: ${stdout}`);
    }
    if (stderr) {
      console.error(`Error Output: ${stderr}`);
    }
    // Run the next command regardless of the current one's exit status
    runCommand(index + 1);
  });
}

// Start with the first command
runCommand(0);