import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req) {
    try {
        const { messages } = await req.json();

        // --- MOCK FALLBACK MODE ---
        // If the API key is missing or the specific quota-exceeded key is being used,
        // we return a mock streaming response so the chat widget can still be tested!
        if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.startsWith('sk-proj-uY-Pj')) {
            const lastMessage = messages[messages.length - 1]?.content || "";
            const mockText = `I am operating in **Mock Mode** because the OpenAI API key has exceeded its billing quota.\n\nI received your message: *" ${lastMessage} "*\n\nTo restore full AI functionality, please add billing credits to your OpenAI account, generate a new key, and update the \`OPENAI_API_KEY\` in your \`.env.local\` file!`;
            
            const stream = new ReadableStream({
                async start(controller) {
                    const encoder = new TextEncoder();
                    const words = mockText.split(' ');
                    for (const word of words) {
                        controller.enqueue(encoder.encode(word + ' '));
                        await new Promise(r => setTimeout(r, 40)); // Simulate typing effect
                    }
                    controller.close();
                }
            });

            return new Response(stream, {
                headers: { 'Content-Type': 'text/plain; charset=utf-8' }
            });
        }

        // --- REAL OPENAI CALL (If a new, valid key is provided) ---
        const result = streamText({
            model: openai('gpt-3.5-turbo'),
            messages,
            system: "You are Nimbus, a helpful AI assistant for a cloud storage platform called NimbusVault. assist users with file management questions and general inquiries. Keep responses concise and friendly."
        });

        const stream = new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder();
                try {
                    for await (const chunk of result.textStream) {
                        controller.enqueue(encoder.encode(chunk));
                    }
                } catch (err) {
                    console.error("Stream Error:", err);
                    controller.enqueue(encoder.encode("\n\n[Error: Connection interrupted or quota exceeded. Check OpenAI billing limits.]"));
                }
                controller.close();
            }
        });

        return new Response(stream, {
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });

    } catch (error) {
        console.error("Chat Setup Error:", error);
        return new Response("Sorry, I encountered an error. Please try again later.", { status: 500 });
    }
}
