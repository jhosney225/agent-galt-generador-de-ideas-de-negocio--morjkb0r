const Anthropic = require("@anthropic-ai/sdk");

const client = new Anthropic();

interface BusinessIdea {
  name: string;
  description: string;
  targetMarket: string;
  initialInvestment: string;
  profitMargin: string;
  riskLevel: string;
  validationScore: number;
}

async function generateBusinessIdea(
  industry: string,
  budget: string
): Promise<BusinessIdea> {
  const systemPrompt = `You are an expert business consultant with deep knowledge in finance, 
market analysis, and entrepreneurship. Your task is to generate viable business ideas and validate them.

When generating a business idea, provide a JSON response with the following structure:
{
  "name": "Business name",
  "description": "2-3 sentence description",
  "targetMarket": "Target customer segment",
  "initialInvestment": "Estimated initial investment",
  "profitMargin": "Expected profit margin percentage",
  "riskLevel": "Low/Medium/High",
  "validationScore": 0-100
}

The validationScore should be based on:
- Market demand (0-25 points)
- Scalability potential (0-25 points)
- Competitive advantage (0-25 points)
- Feasibility (0-25 points)`;

  const userPrompt = `Generate a unique and viable business idea for the ${industry} industry 
with an initial budget of ${budget}. 
The idea should be innovative, realistic, and profitable.
Provide the response as valid JSON only, no additional text.`;

  const message = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 1024,
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: userPrompt,
      },
    ],
  });

  const responseText =
    message.content[0].type === "text" ? message.content[0].text : "";

  // Parse the JSON response
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Failed to parse business idea response");
  }

  const businessIdea: BusinessIdea = JSON.parse(jsonMatch[0]);
  return businessIdea;
}

async function validateBusinessIdea(idea: BusinessIdea): Promise<string> {
  const validationPrompt = `You are a business validator. Analyze this business idea and provide a brief validation report:

Business Name: ${idea.name}
Description: ${idea.description}
Target Market: ${idea.targetMarket}
Initial Investment: ${idea.initialInvestment}
Expected Profit Margin: ${idea.profitMargin}
Risk Level: ${idea.riskLevel}
Validation Score: ${idea.validationScore}/100

Provide a concise validation report (2-3 sentences) identifying:
1. Key strengths of the idea
2. Potential challenges
3. A recommendation (Highly Recommended/Recommended/Consider Carefully/Not Recommended)`;

  const message = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 512,
    messages: [
      {
        role: "user",
        content: validationPrompt,
      },
    ],
  });

  return message.content[0].type === "text" ? message.content[0].text : "";
}

async function main() {
  console.log("🚀 Business Idea Generator with Validation\n");
  console.log("=".repeat(50));

  // Generate business ideas for different industries and budgets
  const scenarios = [
    { industry: "Technology", budget: "$10,000" },
    { industry: "Agriculture", budget: "$50,000" },
    { industry: "Finance", budget: "$100,000" },
  ];

  for (const scenario of scenarios) {
    console.log(
      `\n📊 Generating idea for ${scenario.industry} industry (Budget: ${scenario.budget})`
    );
    console.log("-".repeat(50));

    const businessIdea = await generateBusinessIdea(
      scenario.industry,
      scenario.budget
    );

    console.log(`\n✅ Business Idea Generated:`);
    console.log(`   Name: ${businessIdea.name}`);
    console.log(`   Description: ${businessIdea.description}`);
    console.log(`   Target Market: ${businessIdea.targetMarket}`);
    console.log(`   Initial Investment: ${businessIdea.initialInvestment}`);
    console.log(`   Expected Profit Margin: ${businessIdea.profitMargin}`);
    console.log(`   Risk Level: ${businessIdea.riskLevel}`);
    console.log(`   Validation Score: ${businessIdea.validationScore}/100`);

    console.log(`\n🔍 Validating Business Idea...`);
    const validationReport = await validateBusinessIdea(businessIdea);
    console.log(`\n📋 Validation Report:`);
    console.log(validationReport);

    // Add delay between API calls to avoid rate limiting
    if (scenarios.indexOf(scenario) < scenarios.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log("✨ Business Idea Generation Complete!");
}

main().catch(console.error);