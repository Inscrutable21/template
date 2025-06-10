import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Cache for OpenAI responses to prevent duplicate calls
const responseCache = new Map();
const CACHE_TTL = 1000 * 60 * 30; // 30 minutes

export async function generatePersonalizedRecommendations(analyticsData, userId, forceRefresh = false) {
  try {
    console.log('Generating personalized recommendations with OpenAI');
    
    // Create a cache key based on user ID and a hash of analytics data
    const cacheKey = `${userId}_${JSON.stringify(analyticsData).length}`;
    
    // Check cache if not forcing refresh
    if (!forceRefresh && responseCache.has(cacheKey)) {
      const { recommendations, timestamp } = responseCache.get(cacheKey);
      const now = Date.now();
      
      // Use cached response if it's still valid
      if (now - timestamp < CACHE_TTL) {
        console.log('Using cached OpenAI response');
        return recommendations;
      }
      
      // Remove expired cache entry
      responseCache.delete(cacheKey);
    }
    
    // Determine if user is authenticated
    const isAuthenticated = analyticsData.isAuthenticated || userId !== 'anonymous';
    
    // Extract top clicked elements for direct use in recommendations
    const topClickedElements = analyticsData.elementClicksData 
      ? analyticsData.elementClicksData.slice(0, 3).map(item => item.element) 
      : [];
      
    // Extract most viewed sections for direct use in recommendations
    const topViewedSections = analyticsData.sectionVisibilityData 
      ? analyticsData.sectionVisibilityData.slice(0, 3).map(item => item.section) 
      : [];
    
    // Optimize analytics data to reduce token usage
    const optimizedAnalytics = optimizeAnalyticsForPrompt(analyticsData);
    
    // Create the prompt for OpenAI with more specific instructions
    const prompt = `
You are an advanced AI personalization engine for a web application. Your task is to analyze user behavior data and provide specific, actionable UI personalization recommendations.

USER ID: ${userId || 'anonymous'}
USER IS AUTHENTICATED: ${isAuthenticated ? 'Yes' : 'No'}
USER ANALYTICS DATA:
${optimizedAnalytics}

TOP CLICKED ELEMENTS (HIGHEST PRIORITY FOR PERSONALIZATION):
${topClickedElements.length > 0 
  ? topClickedElements.map((el, i) => `${i+1}. ${el}`).join('\n') 
  : 'No element click data available'}

MOST VIEWED SECTIONS (HIGHEST PRIORITY FOR PERSONALIZATION):
${topViewedSections.length > 0 
  ? topViewedSections.map((sec, i) => `${i+1}. ${sec}`).join('\n') 
  : 'No section visibility data available'}

Based on this data, create a personalization strategy that will:
1. Prioritize content sections based on user engagement patterns
2. Customize UI elements to match user preferences and behavior
3. Optimize the layout for the user's browsing patterns
4. Enhance the overall user experience with targeted customizations

IMPORTANT: The user's authentication status is ${isAuthenticated ? 'LOGGED IN' : 'LOGGED OUT'}. 
${isAuthenticated 
  ? 'For logged-in users, focus on personalized content, dashboard access, and user-specific recommendations.' 
  : 'For logged-out users, focus on sign-up incentives, login prompts, and general feature highlights.'}

Please provide detailed recommendations in the following JSON format:
{
  "topSections": [
    {"identifier": "features", "priority": "high/medium/low", "reasoning": "brief explanation"},
    {"identifier": "testimonials", "priority": "high/medium/low", "reasoning": "brief explanation"},
    {"identifier": "about", "priority": "high/medium/low", "reasoning": "brief explanation"}
  ],
  "uiCustomizations": {
    "colorTheme": "default/vibrant/subtle/professional",
    "fontSizes": "small/medium/large",
    "spacing": "compact/balanced/spacious",
    "emphasis": ["element-id-1", "element-id-2"],
    "deemphasis": ["element-id-3", "element-id-4"]
  },
  "layoutPreferences": {
    "contentDensity": "high/medium/low",
    "navigationStyle": "prominent/standard/minimal",
    "featuredContent": ["content-id-1", "content-id-2"],
    "contentGrouping": "categorical/chronological/relevance"
  },
  "userJourney": {
    "suggestedNextPages": ${isAuthenticated 
      ? '["dashboard", "settings", "profile"]' 
      : '["signup", "login", "features"]'},
    "callToActionEmphasis": "strong/moderate/subtle",
    "personalizedGreeting": "returning/new/engaged",
    "authState": "${isAuthenticated ? 'authenticated' : 'anonymous'}"
  }
}

Be specific and decisive in your recommendations. Choose values that will create a noticeable difference in the UI while maintaining usability and coherence.
`;

    // Call OpenAI API with more detailed system message
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        { 
          role: "system", 
          content: `You are an expert web personalization engine that analyzes user behavior data to create highly effective UI personalization strategies. Your recommendations should be specific, data-driven, and impactful. The user is currently ${isAuthenticated ? 'LOGGED IN' : 'LOGGED OUT'} - tailor your recommendations accordingly. Provide only valid JSON with no explanations outside the JSON structure. MOST IMPORTANTLY: The top clicked elements and most viewed sections in the analytics data MUST be given the highest priority in your recommendations.` 
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.3, // Lower temperature for more consistent results
      max_tokens: 1500,
      response_format: { type: "json_object" }
    });

    // Extract and parse the JSON response
    const content = response.choices[0].message.content;
    console.log('OpenAI response:', content);
    
    const recommendations = JSON.parse(content);
    
    // Validate the recommendations format
    if (!recommendations.topSections || !Array.isArray(recommendations.topSections)) {
      throw new Error('Invalid recommendations format: missing topSections array');
    }
    
    // Add auth state to recommendations
    if (!recommendations.userJourney) {
      recommendations.userJourney = {};
    }
    
    recommendations.userJourney.authState = isAuthenticated ? 'authenticated' : 'anonymous';
    
    // Cache the response
    responseCache.set(cacheKey, {
      recommendations,
      timestamp: Date.now()
    });
    
    return recommendations;
  } catch (error) {
    console.error('Error generating recommendations with OpenAI:', error);
    
    // Return default recommendations if OpenAI fails
    const isAuthenticated = analyticsData.isAuthenticated || userId !== 'anonymous';
    
    // Extract top clicked elements for direct use in recommendations
    const topClickedElements = analyticsData.elementClicksData 
      ? analyticsData.elementClicksData.slice(0, 3).map(item => item.element) 
      : [];
      
    // Extract most viewed sections for direct use in recommendations
    const topViewedSections = analyticsData.sectionVisibilityData 
      ? analyticsData.sectionVisibilityData.slice(0, 3).map(item => item.section) 
      : [];
    
    // Create default recommendations that incorporate the top elements and sections
    return {
      topSections: topViewedSections.length > 0 
        ? topViewedSections.map(section => ({
            identifier: section,
            priority: "high",
            reasoning: "Based on user viewing patterns"
          }))
        : [
            { identifier: isAuthenticated ? "dashboard" : "features", priority: "high", reasoning: "Default high priority section" },
            { identifier: isAuthenticated ? "settings" : "pricing", priority: "medium", reasoning: "Default medium priority section" },
            { identifier: "about", priority: "low", reasoning: "Default low priority section" }
          ],
      uiCustomizations: {
        colorTheme: isAuthenticated ? "professional" : "vibrant",
        fontSizes: "medium",
        spacing: "balanced",
        emphasis: topClickedElements.length > 0 ? topClickedElements : (isAuthenticated ? ["dashboard-link"] : ["signup-cta", "login-link"]),
        deemphasis: []
      },
      layoutPreferences: {
        contentDensity: "medium",
        navigationStyle: isAuthenticated ? "standard" : "prominent",
        featuredContent: isAuthenticated ? ["dashboard"] : ["features"],
        contentGrouping: "relevance"
      },
      userJourney: {
        suggestedNextPages: isAuthenticated 
          ? ["dashboard", "settings"] 
          : ["signup", "login", "features"],
        callToActionEmphasis: isAuthenticated ? "moderate" : "strong",
        personalizedGreeting: isAuthenticated ? "returning" : "new",
        authState: isAuthenticated ? "authenticated" : "anonymous"
      }
    };
  }
}

// Optimize analytics data to reduce token usage
function optimizeAnalyticsForPrompt(analyticsData) {
  let formattedData = '';
  
  // Format page views (limit to 3)
  if (analyticsData.pageViews && analyticsData.pageViews.length) {
    formattedData += 'Recent page views:\n';
    analyticsData.pageViews.slice(0, 3).forEach(view => {
      formattedData += `- ${view.path}\n`;
    });
    formattedData += '\n';
  }
  
  // Format element clicks data with more emphasis (limit to 5)
  if (analyticsData.elementClicksData && analyticsData.elementClicksData.length) {
    formattedData += 'Top clicked elements (IMPORTANT FOR PERSONALIZATION):\n';
    analyticsData.elementClicksData.slice(0, 5).forEach(item => {
      formattedData += `- ${item.element || 'Unknown'} (${item.count} clicks) - HIGH PRIORITY\n`;
    });
    formattedData += '\n';
  }
  
  // Format section visibility with more emphasis (limit to 5)
  if (analyticsData.sectionVisibilityData && analyticsData.sectionVisibilityData.length) {
    formattedData += 'Most viewed sections (IMPORTANT FOR PERSONALIZATION):\n';
    analyticsData.sectionVisibilityData.slice(0, 5).forEach(item => {
      formattedData += `- ${item.section} (viewed ${item.count} times) - HIGH PRIORITY\n`;
    });
    formattedData += '\n';
  }
  
  // Add scroll depth data (limit to 3)
  if (analyticsData.scrollDepthData && analyticsData.scrollDepthData.length) {
    formattedData += 'Scroll depth by page:\n';
    analyticsData.scrollDepthData.slice(0, 3).forEach(item => {
      formattedData += `- ${item.path || 'Unknown'}: ${item.percentage || 0}% scrolled\n`;
    });
    formattedData += '\n';
  }
  
  return formattedData;
}

