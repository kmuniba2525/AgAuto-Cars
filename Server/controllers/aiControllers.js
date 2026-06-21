import groq from '../utils/groq.js'

// export const askAI = async (req, res) => {


//   try {

//     const {
//       message = "",
//       products = [],
//       history = []
//     } = req.body;

//     // Safety check
//     if (!Array.isArray(products)) {
//       return res.status(400).json({
//         success: false,
//         reply: "Products must be an array"
//       });
//     }

//     const optimizedProducts = products.slice(0, 50).map((p) => ({
//   name: p.name,
//   category: p.category,
//   price: p.offerPrice || p.price,
//   stock: p.inStock,
// }));

//     const systemPrompt = `
// You are FreshCart AI, a smart grocery shopping assistant.

// RULES:
// - Talk naturally like a human
// - Keep responses short and helpful
// - NEVER reply in JSON
// -Make small small heading and subheading like for a certain recipee make heading like ingredient and procedure
// - ONLY recommend products from the provided list
// - If product unavailable, politely say so

// - Remember previous conversation
// - Help users with grocery shopping
// -ONLY recommend products from AVAILABLE PRODUCTS
// - NEVER invent product names
// - NEVER suggest products not present in inventory
// - If a product is unavailable, clearly say:
//   "Sorry, this item is not available right now."
// - If user asks for something unavailable, suggest similar products ONLY from inventory
// - Keep replies short and clean
// - Use markdown formatting for readability
// - Act like a real shopping assistant


// AVAILABLE PRODUCTS:
// ${JSON.stringify(optimizedProducts)}
// `;

//     const completion = await groq.chat.completions.create({
//       model: "llama-3.1-8b-instant",

//       temperature: 0.7,
//       max_tokens: 150,

//       messages: [
//         {
//           role: "system",
//           content: systemPrompt,
//         },

//         ...history.slice(-10),

//         {
//           role: "user",
//           content: message,
//         }
//       ],
//     });

//     const reply = completion.choices[0]?.message?.content;

//     res.json({
//       success: true,
//       reply,
//     });

//   } catch (error) {
//     console.log(error);

//     res.status(500).json({
//       success: false,
//       reply: "Something went wrong",
//     });
//   }
// };
export const askAI = async (req, res) => {
  try {
    const {
      message = "",
      products = [],
      history = [],
    } = req.body;

    if (!Array.isArray(products)) {
      return res.status(400).json({
        success: false,
        reply: "Products must be an array",
      });
    }

    // Only available products
    const availableProducts = products
      .filter((p) => p.inStock)
      .slice(0, 50)
      .map((p) => ({
        name: p.name,
        price: p.offerPrice || p.price,
        category: p.category,
      }));

    // Product names only
    const productNames = availableProducts
      .map((p) => p.name)
      .join(", ");

    const systemPrompt = `
You are FreshCart AI, a grocery shopping assistant.

STRICT RULES:
- ONLY recommend products from the AVAILABLE PRODUCTS list
- NEVER invent product names
- NEVER mention brands/products not in inventory
- If product unavailable say:
  "Sorry, this item is not available right now."
- Keep replies short
- Use markdown formatting
- Talk naturally

AVAILABLE PRODUCTS:
${productNames}

IMPORTANT:
If a product is not in AVAILABLE PRODUCTS,
you MUST say it is unavailable.
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",

      temperature: 0.2,

      max_tokens: 150,

      messages: [
        {
          role: "system",
          content: systemPrompt,
        },

        ...history.slice(-6),

        {
          role: "user",
          content: message,
        },
      ],
    });

    const reply = completion.choices[0]?.message?.content;

    res.json({
      success: true,
      reply,
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      reply: "Something went wrong",
    });
  }
};