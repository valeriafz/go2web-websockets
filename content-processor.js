const processContent = (response) => {
    const contentType = response.headers['content-type'] || '';
    
    if (contentType.includes('application/json')) {
      try {
        const jsonData = JSON.parse(response.body);
        return JSON.stringify(jsonData, null, 2);
      } catch (e) {
        return response.body;
      }
    } else if (contentType.includes('text/html') || contentType.includes('application/xhtml+xml')) {
      try {
        // Remove <style> and <script> tags along with their content
        let cleanedHtml = response.body.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
                                       .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    
        // Remove all remaining HTML tags 
        let text = cleanedHtml.replace(/<[^>]+>/g, '');
    
        // Clean up whitespace
        text = text.replace(/\s+/g, ' ').trim();
    
        return text;
      } catch (e) {
        console.error('HTML processing error:', e.message);
        return response.body; 
      }
    } else {
      console.error('Unsupported content type:', contentType);
    }
    
    return response.body;
  }
  
  module.exports = { processContent };