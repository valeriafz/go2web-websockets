const fs = require('fs');
const path = require('path');


const cacheDir = path.join( '.', '.go2web_cache');
if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir);
}

class Cache {
  constructor() {
    this.cacheTTL = 300000; // 5 minutes 
  }

  getCacheKey(url) {
    return Buffer.from(url).toString('base64').replace(/[/+=]/g, '_');
  }

  getCachedResponse(url) {
    const cacheKey = this.getCacheKey(url);
    const cachePath = path.join(cacheDir, cacheKey);
    
    try {
      if (fs.existsSync(cachePath)) {
        const cacheData = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
        
        // Check if cache is still valid
        if (Date.now() - cacheData.timestamp < this.cacheTTL) {
          return cacheData.response;
        } else {
          // Cache expired, remove it
          fs.unlinkSync(cachePath);
        }
      }
    } catch (error) {
      // Handle cache read errors by ignoring cache
      console.error('Cache read error:', error.message);
    }
    
    return null;
  }

  cacheResponse(url, response) {
    const cacheKey = this.getCacheKey(url);
    const cachePath = path.join(cacheDir, cacheKey);
    
    try {
      fs.writeFileSync(cachePath, JSON.stringify({
        timestamp: Date.now(),
        response
      }));
    } catch (error) {
      console.error('Cache write error:', error.message);
    }
  }
}

module.exports = { Cache };