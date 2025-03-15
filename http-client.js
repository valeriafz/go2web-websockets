const net = require('net');
const tls = require('tls');
const { URL } = require('url');

class HttpClient {
  constructor() {
    this.maxRedirects = 5;
  }

  async request(urlString, headers = {}) {
    const defaultHeaders = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Connection': 'close'
    };

    const mergedHeaders = { ...defaultHeaders, ...headers };
    
    return this.makeRequest(urlString, mergedHeaders, 0);
  }

  makeRequest(urlString, headers, redirectCount) {
    if (redirectCount >= this.maxRedirects) {
      return Promise.reject(new Error('Too many redirects'));
    }

    const parsedUrl = new URL(urlString);
    const isHttps = parsedUrl.protocol === 'https:';
    const hostname = parsedUrl.hostname;
    const port = parsedUrl.port ? parseInt(parsedUrl.port) : (isHttps ? 443 : 80);
    const path = parsedUrl.pathname + parsedUrl.search || '/';

    const requestData = [
      `GET ${path} HTTP/1.1`,
      `Host: ${hostname}`,
      ...Object.entries(headers).map(([key, value]) => `${key}: ${value}`),
      '\r\n'
    ].join('\r\n');

    return new Promise((resolve, reject) => {
      const socket = isHttps 
        ? tls.connect(port, hostname, { rejectUnauthorized: false })
        : net.createConnection(port, hostname);

      let responseData = '';
      
      socket.on('error', (err) => {
        reject(err);
      });

      socket.on('connect', () => {
        socket.write(requestData);
      });

      socket.on('data', (data) => {
        responseData += data.toString();
      });

      socket.on('end', () => {
        try {
          const [headersPart, ...bodyParts] = responseData.split('\r\n\r\n');
          const body = bodyParts.join('\r\n\r\n');
          
          const headerLines = headersPart.split('\r\n');
          const statusLine = headerLines[0];
          const statusMatch = statusLine.match(/HTTP\/\d\.\d (\d+) (.*)/);
          
          if (!statusMatch) {
            reject(new Error('Invalid HTTP response'));
            return;
          }
          
          const statusCode = parseInt(statusMatch[1]);
          const headers = {};
          
          for (let i = 1; i < headerLines.length; i++) {
            const line = headerLines[i];
            const separatorIndex = line.indexOf(':');
            
            if (separatorIndex > 0) {
              const key = line.substring(0, separatorIndex).trim();
              const value = line.substring(separatorIndex + 1).trim();
              headers[key.toLowerCase()] = value;
            }
          }

          if (statusCode >= 300 && statusCode < 400 && headers.location) {
            let redirectUrl = headers.location;
            
            if (!redirectUrl.startsWith('http')) {
              const baseUrl = new URL(urlString);
              redirectUrl = new URL(redirectUrl, baseUrl.origin).toString();
            }
            
            console.log(`Redirecting to: ${redirectUrl}`);
            this.makeRequest(redirectUrl, headers, redirectCount + 1)
              .then(resolve)
              .catch(reject);
            return;
          }

          const response = {
            statusCode,
            headers,
            body
          };

          if (statusCode >= 200 && statusCode < 300) {
            this.cache.cacheResponse(urlString, response);
          }

          resolve(response);
        } catch (err) {
          reject(err);
        }
      });
    });
  }
}

module.exports = { HttpClient };