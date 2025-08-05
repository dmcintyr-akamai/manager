const fs = require('node:fs/promises');
const path = require('path');
const { JSDOM } = require("jsdom");
const directoryPath = 'cypress/results';

async function loadFiles(dir){
  const files = await fs.readdir(dir); 
  let data = []
  for (file of files){
    const filePath = path.join(dir, file); 
    const items = await loadXML(filePath);
    data = data.concat(items)
  }
  await writeToFile(data);
}

async function writeToFile(data) { 
  const headers = ['summary', 'description', 'labels']
  const tsvRows = []; 
  tsvRows.push(headers.join('\t')); 

  // Add data rows
  data.forEach(row => {
      const {suite, testFilename, testDescription} = row;
      const issueTitle = `${suite}: ${testDescription}`;
      const issueDescription = `${testFilename} ${testDescription}`
      const values = [issueTitle,issueDescription] 
      const item = values.join('\t') 
      tsvRows.push(item);
  });  

	const filePath = path.join(dir, 'jira_test_issues.tsv'); 
  await fs.writeFile(filePath, tsvRows.join('\n'))
  console.log('done creating file')
}

async function loadXML(filename) {
      
    try { 
        const rows = [];
        const dom = await JSDOM.fromFile(filename);
        const document = dom.window.document; 
        const testSuites = document.getElementsByTagName('testsuite')
        const testSuite = testSuites[0]
        const testFilename = testSuite.getAttribute('file');

        const testcases = document.getElementsByTagName('testcase')
        for (testcase of testcases){  
          const suite = testcase.getAttribute('classname')
          const testDescription = testcase.getAttribute('name') 
          rows.push({suite, testFilename, testDescription}); 
        } 
        return rows;
    } catch (error) {
        console.error('Error loading XML:', error);
    }
} 
loadFiles(directoryPath) 

// TODO: add tags as labels
// TODO: buggy when > 1 describe in file. see Object Storage Multicluster Bucket Details Tabs