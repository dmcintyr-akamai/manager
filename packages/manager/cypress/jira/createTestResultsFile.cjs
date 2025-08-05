const fs = require('node:fs/promises');
const path = require('path');
const { JSDOM } = require("jsdom");
const inputPath = 'cypress/results';
const outputPath = 'cypress/results/upload/';

async function loadFiles(dir){
  const files = await fs.readdir(dir); 
  // let data = []
  for (file of files){
    const filePath = path.join(dir, file);  
    const xml = await modifyXml(filePath); 
    writeToFile(xml, file);
  } 
}

async function writeToFile(data, filename) {  
  await fs.writeFile(outputPath + filename, data)
}

async function readKeyMappingsFile(){
    const filePath = path.join('./', 'mappings.json'); 
    const jsonData = await fs.readFile(filePath, 'utf8'); 
  const objMappings = JSON.parse(jsonData);
  return objMappings;
}

async function modifyXml(filename) {
      
    try { 
        const mappings = await readKeyMappingsFile();
        const dom = await JSDOM.fromFile(filename, {
          contentType: "application/xml"  
        });
        const document = dom.window.document;  
        const testSuites = document.getElementsByTagName('testsuite')
        const testSuiteHeader = testSuites[0]
        const testResults = testSuites[1]
        const testFilename = testSuiteHeader.getAttribute('file'); 
        // testSuites.removeChild(testSuiteHeader)
        testSuiteHeader.remove(); 
        const testcases = testResults.getElementsByTagName('testcase')
        for (testcase of testcases){  
          const props = document.createElement("properties");
          testcase.appendChild(props)  
          // props.removeAttribute('xmlns')
          const testDescription = testcase.getAttribute('name')   
          // console.log('props', props) 
          const prop = document.createElement("property"); 
          const keyCypress = `${testFilename} ${testDescription}`
          const keyJira = mappings[keyCypress]  
          prop.setAttribute('name', 'jira_key')
          prop.setAttribute('value', keyJira)
          props.appendChild(prop);
        }   
        return dom.serialize();
    } catch (error) {
        console.error('Error loading XML:', error);
    }
} 
loadFiles(inputPath) 
