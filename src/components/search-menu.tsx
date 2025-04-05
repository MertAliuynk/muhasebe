"use client";

import { api } from "@/trpc/react";
import type { DialogProps } from "@radix-ui/react-dialog";
import Link from "next/link";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
	Command,
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

import Spinner from "./spinner";

export function SearchMenu({ ...props }: DialogProps) {
	const [open, setOpen] = React.useState(false);
	const [query, setQuery] = React.useState("");

	React.useEffect(() => {
		const down = (e: KeyboardEvent) => {
			if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || e.key === "/") {
				if (
					(e.target instanceof HTMLElement && e.target.isContentEditable) ||
					e.target instanceof HTMLInputElement ||
					e.target instanceof HTMLTextAreaElement ||
					e.target instanceof HTMLSelectElement
				) {
					return;
				}

				e.preventDefault();
				setOpen((open) => !open);
			}
		};

		document.addEventListener("keydown", down);
		return () => document.removeEventListener("keydown", down);
	}, []);

	const { data, isLoading } = api.patient.searchPatient.useQuery({
		query,
	});

	return (
		<>
			<Button
				variant="outline"
				className={cn(
					"relative w-full justify-start rounded-[0.5rem] bg-muted/50 text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-40 lg:w-56 xl:w-64",
				)}
				onClick={() => setOpen(true)}
				{...props}
			>
				<span className="hidden lg:inline-flex">Hasta Ara...</span>
				<span className="inline-flex lg:hidden">Hasta Ara...</span>
				<kbd className="pointer-events-none absolute right-[0.3rem] top-[0.6rem] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
					<span className="text-xs">⌘</span>K
				</kbd>
			</Button>
			<CommandDialog open={open} onOpenChange={setOpen}>
				<Command shouldFilter={false}>
					<CommandInput
						placeholder="Hasta adı soyadı, tc no ve ya telefon numarasını giriniz..."
						value={query}
						onValueChange={setQuery}
					/>
					<CommandList className="h-[40vh] overflow-y-auto">
						{isLoading ? (
							<div className="flex justify-center items-center h-full mt-10">
								<Spinner className="w-6 h-6" />
							</div>
						) : (
							<CommandEmpty>Sonuç bulunamadı.</CommandEmpty>
						)}
						{data && data.length > 0 && (
							<CommandGroup heading="Hastalar">
								{data?.map((patient) => (
									<Link
										key={patient.id}
										href={`/hasta/${patient.id}`}
										onClick={() => setOpen(false)}
									>
										<CommandItem>{patient.name}</CommandItem>
									</Link>
								))}
							</CommandGroup>
						)}
					</CommandList>
				</Command>
			</CommandDialog>
		</>
	);
}
