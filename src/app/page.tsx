"use client";

import { useChat } from "@ai-sdk/react";
import {
	Add01Icon,
	ArrowReloadHorizontalIcon,
	ArtificialIntelligence03Icon,
	Image02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { DefaultChatTransport } from "ai";
import { useMemo, useRef, useState } from "react";
import {
	AssistantMessage,
	ChatInput,
	ChatMessages,
	EmptyState,
	ModelSelector,
	UserMessage,
} from "@/components/ai";
import { KeyGate } from "@/components/key-gate";
import { Panel, PanelDivider, PanelItem, PanelList } from "@/components/panels/shared";
import { Shell } from "@/components/shell/shell";
import { Button } from "@/components/ui/button";
import { PROVIDER_KEY_HEADER, readKey, useByokKey } from "@/lib/byok";
import { DEFAULT_MODEL_ID, providerOf } from "@/lib/models";

const PLATFORMS = ["TikTok", "Reels", "Shorts", "Product page"] as const;
const MOTIONS = ["Reveal", "Orbit", "Unbox", "Before/after", "Pour", "Handoff"] as const;

const EXAMPLES = [
	{
		label: "Skincare drop",
		brief:
			"Refillable vitamin C serum launching for busy founders who want bright skin without a ten-step routine.",
		style: "warm bathroom counter, morning light, chrome cap, clean citrus accents",
		constraints: "No medical claims. Keep label text unreadable. Premium but not clinical.",
	},
	{
		label: "SaaS feature",
		brief:
			"A finance ops tool that turns vendor invoices into approval queues for mid-market teams.",
		style: "desktop product moment, tidy workspace, blue accent light, human hand entering frame",
		constraints: "No fake UI text. Avoid cyberpunk. Needs to feel trustworthy and fast.",
	},
	{
		label: "Cafe reel",
		brief: "Neighborhood cafe promoting a cold pistachio latte for a summer weekend menu.",
		style: "close table-side pour, green ceramic cup, condensation, late afternoon sun",
		constraints: "No visible brand logos. Make it appetizing without messy splashes.",
	},
];

function choiceClass(active: boolean) {
	return `rounded-lg border px-3 py-2 text-left text-[12px] leading-tight transition-colors ${
		active
			? "border-foreground/40 bg-foreground text-background"
			: "border-border bg-background hover:bg-muted/50"
	}`;
}

function composeFramePrompt({
	brief,
	platform,
	motion,
	style,
	constraints,
	extra,
}: {
	brief: string;
	platform: string;
	motion: string;
	style: string;
	constraints: string;
	extra: string;
}) {
	const lines = [
		"Build a first-frame slate for an image-to-video tool.",
		`Brief: ${brief.trim()}`,
		`Platform: ${platform}`,
		`Motion: ${motion}`,
		`Visual style: ${style.trim() || "Choose the strongest visual treatment for the brief."}`,
		`Constraints: ${constraints.trim() || "Keep it realistic, brand-safe, and readable at mobile size."}`,
		extra.trim() ? `Extra revision note: ${extra.trim()}` : "",
		"Output the director board first, then render one vertical 9:16 opening frame if the selected model exposes an image tool.",
	];

	return lines.filter(Boolean).join("\n");
}

export default function Home() {
	const [modelId, setModelId] = useState(DEFAULT_MODEL_ID);
	const provider = providerOf(modelId);
	const { key, setKey, clear, hasKey } = useByokKey(provider);
	const [input, setInput] = useState("");
	const [brief, setBrief] = useState("");
	const [platform, setPlatform] = useState<(typeof PLATFORMS)[number]>("TikTok");
	const [motion, setMotion] = useState<(typeof MOTIONS)[number]>("Reveal");
	const [style, setStyle] = useState("");
	const [constraints, setConstraints] = useState("");

	const providerRef = useRef(provider);
	providerRef.current = provider;
	const modelRef = useRef(modelId);
	modelRef.current = modelId;

	const transport = useMemo(
		() =>
			new DefaultChatTransport({
				api: "/api/run",
				headers: () => ({ [PROVIDER_KEY_HEADER]: readKey(providerRef.current) }),
				body: () => ({ modelId: modelRef.current }),
			}),
		[],
	);

	const { messages, sendMessage, setMessages, status, stop, error } = useChat({ transport });
	const isLoading = status === "submitted" || status === "streaming";
	const canBuild = brief.trim().length > 0 && hasKey && !isLoading;

	const handleSubmit = () => {
		const text = input.trim();
		if (!text || isLoading || !hasKey) return;
		setInput("");
		sendMessage({ text });
	};

	const handleGenerate = () => {
		if (!canBuild) return;
		const text = composeFramePrompt({ brief, platform, motion, style, constraints, extra: input });
		setInput("");
		sendMessage({ text });
	};

	const handleNew = () => {
		stop();
		setMessages([]);
		setInput("");
	};

	return (
		<Shell
			panel={
				<Panel
					label="Frame desk"
					banner={
						<div className="flex flex-col gap-5">
							<KeyGate
								provider={provider}
								value={key}
								hasKey={hasKey}
								onSet={setKey}
								onClear={clear}
							/>
							{messages.length > 0 && (
								<Button
									className="w-full shadow-[0_2px_20px_-4px_rgb(0_0_0/0.08),0_0_40px_-8px_rgb(0_0_0/0.04)]"
									onClick={handleNew}
									data-testid="chat-new"
								>
									<HugeiconsIcon icon={Add01Icon} size={14} data-icon="inline-start" />
									New slate
								</Button>
							)}
						</div>
					}
				>
					<PanelList>
						<PanelItem title="Output" subtitle="Frame, motion prompt, captions, QA" />
						<PanelItem title="Default ratio" subtitle="Vertical 9:16 for image-to-video starts" />
						<PanelItem title="Selected model" subtitle={modelId.replace("/", " / ")} />
					</PanelList>
					<PanelDivider />
					<div className="pt-4">
						<p className="text-muted-foreground/60 text-[11px] leading-relaxed">
							Keys stay in session storage and ride only the same-origin run request.
						</p>
					</div>
				</Panel>
			}
		>
			<div data-testid="chat-surface" className="relative flex h-svh flex-col">
				<div className="from-background via-background pointer-events-none absolute inset-x-0 top-0 z-10 h-20 bg-gradient-to-b to-transparent lg:hidden" />

				{messages.length > 0 && (
					<button
						type="button"
						onClick={handleNew}
						data-testid="chat-new-mobile"
						aria-label="New slate"
						className="text-foreground hover:text-muted-foreground absolute right-4 top-3 z-20 flex items-center gap-1.5 py-1.5 text-[13px] font-medium transition-colors lg:hidden"
					>
						<HugeiconsIcon icon={Add01Icon} size={14} />
						New
					</button>
				)}

				<section className="border-border/70 border-b border-dashed px-4 pt-16 pb-4 lg:pt-6">
					<div className="mx-auto grid w-full max-w-5xl gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)]">
						<div className="flex min-w-0 flex-col gap-3">
							<div className="flex flex-wrap items-center gap-2">
								<span className="bg-muted text-muted-foreground inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-medium">
									<HugeiconsIcon icon={Image02Icon} size={13} />
									9:16 first frame
								</span>
								<span className="bg-muted text-muted-foreground rounded-lg px-2.5 py-1 text-[11px] font-medium">
									Motion prompt
								</span>
								<span className="bg-muted text-muted-foreground rounded-lg px-2.5 py-1 text-[11px] font-medium">
									Caption beats
								</span>
							</div>

							<label className="flex flex-col gap-2">
								<span className="text-muted-foreground text-[11px] font-medium uppercase tracking-widest">
									Brief
								</span>
								<textarea
									value={brief}
									onChange={(event) => setBrief(event.target.value)}
									aria-label="Video brief"
									placeholder="Paste the product, offer, scene, or creator note..."
									className="border-border bg-background text-foreground placeholder:text-muted-foreground/45 min-h-24 resize-none rounded-lg border px-3 py-2.5 text-sm leading-relaxed outline-none transition-colors focus:border-foreground/40"
								/>
							</label>

							<div className="grid gap-3 md:grid-cols-2">
								<label className="flex flex-col gap-2">
									<span className="text-muted-foreground text-[11px] font-medium uppercase tracking-widest">
										Style
									</span>
									<textarea
										value={style}
										onChange={(event) => setStyle(event.target.value)}
										aria-label="Visual style"
										placeholder="Lighting, setting, camera, palette..."
										className="border-border bg-background text-foreground placeholder:text-muted-foreground/45 min-h-20 resize-none rounded-lg border px-3 py-2.5 text-sm leading-relaxed outline-none transition-colors focus:border-foreground/40"
									/>
								</label>
								<label className="flex flex-col gap-2">
									<span className="text-muted-foreground text-[11px] font-medium uppercase tracking-widest">
										Constraints
									</span>
									<textarea
										value={constraints}
										onChange={(event) => setConstraints(event.target.value)}
										aria-label="Constraints"
										placeholder="No-go elements, claims, text, logos..."
										className="border-border bg-background text-foreground placeholder:text-muted-foreground/45 min-h-20 resize-none rounded-lg border px-3 py-2.5 text-sm leading-relaxed outline-none transition-colors focus:border-foreground/40"
									/>
								</label>
							</div>
						</div>

						<div className="flex min-w-0 flex-col gap-4">
							<div className="grid gap-2">
								<p className="text-muted-foreground text-[11px] font-medium uppercase tracking-widest">
									Platform
								</p>
								<div className="grid grid-cols-2 gap-2">
									{PLATFORMS.map((item) => (
										<button
											key={item}
											type="button"
											onClick={() => setPlatform(item)}
											className={choiceClass(platform === item)}
										>
											{item}
										</button>
									))}
								</div>
							</div>

							<div className="grid gap-2">
								<p className="text-muted-foreground text-[11px] font-medium uppercase tracking-widest">
									Motion
								</p>
								<div className="grid grid-cols-2 gap-2">
									{MOTIONS.map((item) => (
										<button
											key={item}
											type="button"
											onClick={() => setMotion(item)}
											className={choiceClass(motion === item)}
										>
											{item}
										</button>
									))}
								</div>
							</div>

							<div className="grid gap-2">
								<p className="text-muted-foreground text-[11px] font-medium uppercase tracking-widest">
									Starts
								</p>
								<div className="grid gap-2">
									{EXAMPLES.map((example) => (
										<button
											key={example.label}
											type="button"
											onClick={() => {
												setBrief(example.brief);
												setStyle(example.style);
												setConstraints(example.constraints);
											}}
											className="border-border bg-background hover:bg-muted/50 rounded-lg border px-3 py-2 text-left text-[12px] transition-colors"
										>
											{example.label}
										</button>
									))}
								</div>
							</div>

							<Button
								type="button"
								onClick={handleGenerate}
								disabled={!canBuild}
								className="h-10 w-full"
							>
								<HugeiconsIcon
									icon={ArrowReloadHorizontalIcon}
									size={14}
									data-icon="inline-start"
								/>
								Build first frame
							</Button>
						</div>
					</div>
				</section>

				<ChatMessages>
					{messages.length === 0 ? (
						<EmptyState
							icon={ArtificialIntelligence03Icon}
							title="Frame slate is empty"
							subtitle={hasKey ? "Build the first frame." : "Set your key in the panel."}
						/>
					) : (
						messages.map((message, index) =>
							message.role === "user" ? (
								<UserMessage key={message.id} message={message} />
							) : (
								<AssistantMessage
									key={message.id}
									message={message}
									isStreaming={status === "streaming" && index === messages.length - 1}
								/>
							),
						)
					)}

					{status === "submitted" && (
						<div className="text-muted-foreground/50 flex items-center gap-2 text-[13px]">
							<span className="size-1.5 animate-pulse rounded-full bg-current" />
							Building slate...
						</div>
					)}

					{error && (
						<div
							data-testid="chat-error"
							className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-500"
						>
							{error.message}
						</div>
					)}
				</ChatMessages>

				<div className="px-4 pb-4">
					<ChatInput
						value={input}
						onChange={setInput}
						onSubmit={handleSubmit}
						onStop={stop}
						isLoading={isLoading}
						disabled={!hasKey}
						placeholder={
							hasKey
								? "Ask for a revision, alternate frame, or tighter motion prompt..."
								: "Set your key first"
						}
					>
						<ModelSelector model={modelId} setModel={setModelId} />
					</ChatInput>
				</div>
			</div>
		</Shell>
	);
}
