import { Injectable, Logger } from "@nestjs/common";
import { OREN_SYSTEM_PROMPT } from "../agents/oren/prompt";

type OrenInput = {
  step: string;
  userMessage: string;
  allowedActions: string[];
  history: Array<{ role: "user" | "assistant"; content: string }>;
};

type OrenOutput = {
  classification: string | null;
  normalizedValue: string | null;
  reply: string;
};

@Injectable()
export class OpenAiService {
  private readonly logger = new Logger(OpenAiService.name);

  async runOren(input: OrenInput): Promise<OrenOutput> {
    const apiKey = process.env.OPENAI_API_KEY;
    const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

    if (!apiKey) {
      return this.fallback(input.userMessage);
    }

    try {
      const response = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model,
          input: [
            { role: "system", content: OREN_SYSTEM_PROMPT },
            {
              role: "system",
              content: `step=${input.step}; allowed_actions=${input.allowedActions.join(",")}`
            },
            ...input.history.map((item) => ({
              role: item.role,
              content: item.content
            })),
            { role: "user", content: input.userMessage }
          ],
          max_output_tokens: 200
        })
      });

      if (!response.ok) {
        const raw = await response.text();
        this.logger.warn(`OpenAI fallback due HTTP ${response.status}: ${raw.slice(0, 240)}`);
        return this.fallback(input.userMessage);
      }

      const data = (await response.json()) as {
        output_text?: string;
      };

      const outputText = data.output_text ?? "{}";
      const parsed = JSON.parse(outputText) as Partial<OrenOutput>;

      if (typeof parsed.reply === "string") {
        return {
          classification: parsed.classification ?? null,
          normalizedValue: parsed.normalizedValue ?? null,
          reply: parsed.reply
        };
      }

      return this.fallback(input.userMessage);
    } catch (error) {
      this.logger.warn(`OpenAI fallback by exception: ${(error as Error).message}`);
      return this.fallback(input.userMessage);
    }
  }

  private fallback(userMessage: string): OrenOutput {
    return {
      classification: null,
      normalizedValue: userMessage.trim().toLowerCase(),
      reply: "Entendido. Vou seguir seu atendimento no fluxo estruturado."
    };
  }
}
