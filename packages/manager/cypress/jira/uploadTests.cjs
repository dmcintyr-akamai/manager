// const fs = require('fs');
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
  console.log('loadfiles data', data)
  await convertToTsv(data);
}

async function convertToTsv(data) { 
  const headers = ['summary', 'description', 'labels']
  const tsvRows = []; 
  tsvRows.push(headers.join('\t')); 

  // Add data rows
  data.forEach(row => {
      const {title, desc} = row;
      const summary = `${title}: ${desc}`
      const values = [summary,desc] 
      const item = values.join('\t')
      console.log('item ', item)
      tsvRows.push(item);
  });  
  await fs.writeFile('jira_test_issues.tsv', tsvRows.join('\n'))
}

async function loadXML(filename) {
      
    try { 
        const rows = [];
        const dom = await JSDOM.fromFile(filename);
        const document = dom.window.document; 
        const testSuites = document.getElementsByTagName('testsuite')
        const parent = testSuites[0]
        const testFilename = parent.getAttribute('file');

        const testcases = document.getElementsByTagName('testcase')
        for (testcase of testcases){  
          const title = testcase.getAttribute('classname')
          const desc = testcase.getAttribute('name') 
          rows.push({title, testFilename, desc}); 
        } 
        return rows;
    } catch (error) {
        console.error('Error loading XML:', error);
    }
} 
loadFiles(directoryPath) 