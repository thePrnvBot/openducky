import { type Plugin, tool } from "@opencode-ai/plugin";

export const OpenDucky: Plugin = async ({
  project,
  client,
  $,
  directory,
  worktree,
}) => {
  return {
    tool: {
      ducky: tool({
        description:
          "Rubber duck debugging quiz - tests your understanding of a file by generating questions",
        args: {
          filename: tool.schema
            .string()
            .describe("Path to the file to quiz on"),
          mode: tool.schema
            .enum(["Skim", "Full"])
            .describe(
              "Skim = high-level concepts, Full = implementation details",
            ),
          topic: tool.schema
            .string()
            .optional()
            .describe("Optional specific topic to focus questions on"),
        },
        async execute(args, context) {
          const { filename, mode, topic } = args;
          const { directory } = context;

          const path = await import("path");
          const filePath = path.isAbsolute(filename)
            ? filename
            : path.join(directory, filename);

          const file = Bun.file(filePath);
          const exists = await file.exists();

          if (!exists) {
            return `Error: File not found: ${filePath}`;
          }

          const content = await file.text();
          const fileName = path.basename(filePath);

          const modeInstructions =
            mode === "Skim"
              ? "Focus on HIGH-LEVEL understanding: purpose, architecture, exports, interfaces, what the code does overall."
              : "Focus on IMPLEMENTATION DETAILS: logic flow, edge cases, error handling, why specific decisions were made.";

          const topicFilter = topic
            ? `\n\nFOCUS SPECIFICALLY ON: "${topic}" - only ask questions related to this topic.`
            : "";

          return `## Rubber Duck Quiz: ${fileName}
          ### Instructions for Assistant
          You are now quizzing the user on their understanding of this code. ${modeInstructions}${topicFilter}
          **Your task:**
          1. Generate 3-5 questions about this code
          2. Present questions ONE AT A TIME
          3. Wait for user's answer before proceeding
          4. Evaluate their answer - acknowledge correct understanding, gently correct misconceptions
          5. After all questions, provide a brief summary of their understanding
          ### File Content
          \`\`\`
          ${content}
          \`\`\`
          ---
          **Begin the quiz now. Ask your first question.**`;
        },
      }),
    },
  };
};
