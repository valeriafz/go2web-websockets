const readline = require('readline');
const { HttpClient } = require('./http-client');
const { fetchUrl } = require('./fetcher');
const { parse: parseHtml } = require('node-html-parser');

async function searchWeb(term) {
  const searchEngine = 'https://duckduckgo.com/html/?q=' + encodeURIComponent(term);
  const client = new HttpClient();
  
  try {
    console.log(`Searching for: ${term}`);
    const response = await client.request(searchEngine);
    
    if (response.statusCode !== 200) {
      console.error(`Error: Search failed with status ${response.statusCode}`);
      return;
    }

    const root = parseHtml(response.body);
    const results = root.querySelectorAll('.result');
    
    const searchResults = results.slice(0, 10).map((result, index) => {
      const titleElement = result.querySelector('.result__title');
      const linkElement = result.querySelector('.result__url');
      
      const title = titleElement ? titleElement.text.trim() : 'No title';
      const link = linkElement ? linkElement.text.trim() : '';
     
      return {
        index: index + 1,
        title,
        link,
      };
    });

    console.log('\n=== Search Results ===\n');
    searchResults.forEach(result => {
      console.log(`${result.index}. ${result.title}`);
      console.log(`   URL: ${result.link}`);
      console.log();
    });

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question('Enter a number to open a result (or q to quit): ', async (answer) => {
      rl.close();
      
      if (answer.toLowerCase() === 'q') {
        return;
      }
      
      const resultIndex = parseInt(answer) - 1;
      if (isNaN(resultIndex) || resultIndex < 0 || resultIndex >= searchResults.length) {
        console.log('Invalid selection.');
        return;
      }
      
      const selectedResult = searchResults[resultIndex];
      console.log(`Opening: ${selectedResult.title}`);
      
      let resultUrl = selectedResult.link;
      if (!resultUrl.startsWith('http')) {
        resultUrl = 'https://' + resultUrl;
      }
      
      await fetchUrl(resultUrl);
    });
    
  } catch (error) {
    console.error('Search error:', error.message);
  }
}

module.exports = { searchWeb };