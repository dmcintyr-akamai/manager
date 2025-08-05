const fs = require('node:fs/promises');
const os = require('os');
const path = require('path'); 
const userHomeDir = os.homedir();
const dirInput = userHomeDir + '/.zephyr-client/import_results';
const dirOutput = 'cypress/results';

async function createMappingsFile(){
    const responseOutput = await getMostRecentFile();
    console.log('most recent log file = ', responseOutput)
    if (responseOutput){
        const tsv = await fs.readFile(responseOutput, 'utf-8');
        const lines = tsv.split('\n');
        const _ = lines.shift();
        const parsedData = lines.map(line => line.split('\t'));
        const map = parsedData.reduce((prev, curr) => { 
            if (curr.length >= 3){
                const jiraKey = curr[0].trim();
                const cypressKey = curr[2].trim()
				// add key to obtain jira_key from cypress_key and cypress_key from jira_key
                prev[cypressKey] = jiraKey
                prev[jiraKey] = cypressKey

            }
            return prev;
        }, {})
        const json = JSON.stringify(map);
		const filePath = path.join(dirOutput, 'mappings.json'); 
        await fs.writeFile(filePath, json, 'utf-8')

		console.log('done creating mappings.json file')
    }
}

async function getMostRecentFile(){
    let mostRecentFile = null;;
  const files = await fs.readdir(dirInput);  
    const promises = files.map(async (filename) => {
        const filePath = path.join(dirInput, filename);
        const stats = await fs.stat(filePath);   
        return {
            name: filename,
            mtime: stats.mtime.getTime() // Get modification time in milliseconds
        };
    });
    const filesWithStats = await Promise.all(promises); 
    // Sort files by modification time in descending order (most recent first)
    filesWithStats.sort((a, b) => b.mtime - a.mtime);

    // Return the name of the most recent file
    if (filesWithStats.length > 0) {
        mostRecentFile = filesWithStats[0].name;
    } 
    return path.join(dirInput, mostRecentFile);
}

createMappingsFile(); 