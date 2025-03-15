const { HttpClient } = require('./http-client');
const { processContent } = require('./content-processor');

async function fetchUrl(urlString) {
  const client = new HttpClient();
  
  try {
    if (!urlString.startsWith('http')) {
      urlString = 'https://' + urlString;
    }
    
    console.log(`Fetching: ${urlString}`);
    const response = await client.request(urlString);
    
    if (response.statusCode !== 200) {
      console.error(`Error: Request failed with status ${response.statusCode}`);
      return;
    }
    
    const processedContent = processContent(response);
    console.log('\n=== Response ===\n');
    console.log(processedContent);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

module.exports = { fetchUrl };