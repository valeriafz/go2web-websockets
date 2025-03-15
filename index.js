const readline = require('readline');
const { parse: parseHtml } = require('node-html-parser');

const args = process.argv.slice(2);
const helpText = `
Usage:
  go2web -u <URL>         # make an HTTP request to the specified URL and print the response
  go2web -s <search-term> # make an HTTP request to search the term using your favorite search engine and print top 10 results
  go2web -h               # show this help
`;

async function main() {
  if (args.length === 0 || args[0] === '-h') {
    console.log(helpText);
    return;
  }

  const flag = args[0];
  const value = args[1];

  if (!value && flag !== '-h') {
    console.error('Error: Missing value for flag', flag);
    console.log(helpText);
    return;
  }

  switch (flag) {
    case '-u':
      
      break;
    case '-s':
      
      break;
    default:
      console.error('Error: Unknown flag', flag);
      console.log(helpText);
  }
}

main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});