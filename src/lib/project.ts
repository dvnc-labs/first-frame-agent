import type { Provider } from "@/lib/models";

export const project = {
	name: "First Frame Agent",
	tagline:
		"Turn a rough product or creator note into a 9:16 first frame, motion prompt, caption beats, and QA checklist.",
	repoUrl: "https://github.com/dvnc-labs/first-frame-agent",
	siteUrl: "https://first-frame-agent.vercel.app",
	authorUrl:
		"https://omidsaffari.com/?utm_source=first-frame-agent&utm_medium=oss-demo&utm_campaign=labs",
} as const;

export const PROVIDER_COPY: Record<
	Provider,
	{ label: string; placeholder: string; consoleUrl: string }
> = {
	openai: {
		label: "OpenAI API key",
		placeholder: "sk-...",
		consoleUrl: "https://platform.openai.com/api-keys",
	},
	anthropic: {
		label: "Anthropic API key",
		placeholder: "sk-ant-...",
		consoleUrl: "https://console.anthropic.com/settings/keys",
	},
	google: {
		label: "Google AI API key",
		placeholder: "AIza...",
		consoleUrl: "https://aistudio.google.com/apikey",
	},
};
