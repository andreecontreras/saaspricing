
// Hugging Face integration for AI review analysis
let sentimentModel = null;
let loadingPromise = null;

// Initialize sentiment analysis model
export async function initSentimentAnalysis() {
  if (sentimentModel) return sentimentModel;
  
  if (loadingPromise) return loadingPromise;
  
  try {
    console.log("Loading sentiment analysis model...");
    // Use a UI status update if available
    const statusEl = document.getElementById('hf-status');
    if (statusEl) statusEl.textContent = 'Loading model...';
    
    // Dynamic import to ensure browser compatibility
    const { pipeline } = await import('@huggingface/transformers');
    
    // Initialize the model loading once and cache the promise
    loadingPromise = pipeline(
      'sentiment-analysis',
      'distilbert-base-uncased-finetuned-sst-2-english',
      { quantized: true } // Use quantized model for better performance
    );
    
    sentimentModel = await loadingPromise;
    console.log("Sentiment analysis model loaded successfully");
    
    if (statusEl) {
      statusEl.textContent = 'Model loaded';
      statusEl.classList.add('connected');
    }
    
    return sentimentModel;
  } catch (error) {
    console.error("Error loading sentiment analysis model:", error);
    const statusEl = document.getElementById('hf-status');
    if (statusEl) {
      statusEl.textContent = 'Error loading model';
      statusEl.classList.add('not-connected');
    }
    loadingPromise = null;
    throw error;
  }
}

// Analyze text sentiment
export async function analyzeSentiment(text) {
  try {
    const model = await initSentimentAnalysis();
    const result = await model(text);
    return result[0];
  } catch (error) {
    console.error("Error analyzing sentiment:", error);
    return { label: 'Error', score: 0 };
  }
}

// Analyze multiple reviews
export async function analyzeReviews(reviews) {
  if (!reviews || reviews.length === 0) {
    return {
      positiveCount: 0,
      negativeCount: 0,
      positivePct: 0,
      negativePct: 0,
      neutralPct: 0,
      averageSentiment: 0.5
    };
  }
  
  try {
    const model = await initSentimentAnalysis();
    
    // Process reviews in batches to avoid overloading the browser
    const batchSize = 5;
    let results = [];
    
    for (let i = 0; i < reviews.length; i += batchSize) {
      const batch = reviews.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(review => model(review.text || review))
      );
      results = results.concat(batchResults.map(r => r[0]));
    }
    
    // Count positive and negative sentiments
    const positiveCount = results.filter(r => r.label === 'POSITIVE').length;
    const negativeCount = results.filter(r => r.label === 'NEGATIVE').length;
    const total = results.length;
    
    // Calculate percentages
    const positivePct = Math.round((positiveCount / total) * 100);
    const negativePct = Math.round((negativeCount / total) * 100);
    const neutralPct = 100 - positivePct - negativePct;
    
    // Calculate average sentiment score (normalize from 0-1)
    const averageSentiment = results.reduce((acc, r) => {
      // For POSITIVE, use the score directly; for NEGATIVE, invert it
      return acc + (r.label === 'POSITIVE' ? r.score : 1 - r.score);
    }, 0) / total;
    
    return {
      positiveCount,
      negativeCount,
      positivePct,
      negativePct,
      neutralPct,
      averageSentiment
    };
  } catch (error) {
    console.error("Error analyzing reviews:", error);
    return {
      positiveCount: 0,
      negativeCount: 0,
      positivePct: 0,
      negativePct: 0,
      neutralPct: 100,
      averageSentiment: 0.5,
      error: error.message
    };
  }
}

// Extract key pros and cons from reviews using sentiment analysis
export async function extractKeyInsights(reviews) {
  if (!reviews || reviews.length === 0) {
    return {
      topPros: ["No pros identified"],
      topCons: ["No cons identified"]
    };
  }
  
  try {
    const model = await initSentimentAnalysis();
    
    // Process each review
    const analysisResults = await Promise.all(
      reviews.slice(0, 20).map(async (review) => {
        const reviewText = review.text || review;
        const result = await model(reviewText);
        return {
          text: reviewText,
          sentiment: result[0].label,
          score: result[0].score
        };
      })
    );
    
    // Extract top positive and negative sentences
    const positiveReviews = analysisResults
      .filter(r => r.sentiment === 'POSITIVE')
      .sort((a, b) => b.score - a.score);
      
    const negativeReviews = analysisResults
      .filter(r => r.sentiment === 'NEGATIVE')
      .sort((a, b) => b.score - a.score);
    
    // Simplify to extract key phrases (this is a simplified approach)
    const extractKeyPhrases = (text) => {
      // Split into sentences
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
      
      // Return first sentence or the whole text if no good split is found
      return sentences.length > 0 ? sentences[0].trim() : text.trim();
    };
    
    const topPros = positiveReviews
      .slice(0, 3)
      .map(r => extractKeyPhrases(r.text))
      .filter(phrase => phrase.length > 0);
      
    const topCons = negativeReviews
      .slice(0, 2)
      .map(r => extractKeyPhrases(r.text))
      .filter(phrase => phrase.length > 0);
    
    return {
      topPros: topPros.length > 0 ? topPros : ["No significant pros identified"],
      topCons: topCons.length > 0 ? topCons : ["No significant cons identified"]
    };
  } catch (error) {
    console.error("Error extracting key insights:", error);
    return {
      topPros: ["Unable to analyze pros"],
      topCons: ["Unable to analyze cons"],
      error: error.message
    };
  }
}
