"use client";
import { useActionState } from "react";
import { requestMagicLink, type LoginActionState } from "./actions";

export default function AdminLoginPage() {
	const [state, action, pending] = useActionState<LoginActionState, FormData>(
		requestMagicLink,
		{ ok: false },
	);
	return (
		<div className="min-h-screen bg-ink-50">
			<div className="mx-auto max-w-md px-4 py-16">
				<h1 className="text-2xl font-semibold tracking-tight">Bee Bright admin</h1>
				<p className="mt-2 text-sm text-ink-600">
					Enter your admin email and we will send you a sign-in link.
				</p>
				<form action={action} className="mt-8 space-y-4">
					<label className="flex flex-col gap-1 text-sm">
						<span className="font-medium">Email</span>
						<input
							name="email"
							type="email"
							required
							autoComplete="email"
							className="rounded-md border px-3 py-2"
						/>
					</label>
					<button
						type="submit"
						disabled={pending}
						className="w-full rounded-md bg-ink-950 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
					>
						{pending ? "Sending…" : "Send sign-in link"}
					</button>
					{state.message ? <p className="text-sm text-ink-600">{state.message}</p> : null}
				</form>
			</div>
		</div>
	);
}
