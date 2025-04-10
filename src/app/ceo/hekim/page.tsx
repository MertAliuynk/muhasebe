import { api } from "@/trpc/server";
import { UserPlus } from "lucide-react";
import Link from "next/link";
import React from "react";

import { DashboardHeader } from "@/components/dashboard-heading";
import { DataTable } from "@/components/data-table";
import { buttonVariants } from "@/components/ui/button";

import columns from "./_components/doctors-columns";

export default async function page() {
	const doctors = await api.doctor.getDoctorsAdmin();

	return (
		<div className="space-y-5">
			<DashboardHeader
				heading="Hekimler"
				text="Hekimleri listeleyin ve yönetin."
			>
				<Link href="/ceo/hekim/ekle" className={buttonVariants({ size: "sm" })}>
					<UserPlus className="size-4 mr-2" />
					Yeni Hekim Ekle
				</Link>
			</DashboardHeader>
			<DataTable columns={columns} data={doctors} searchKey="name" viewOption />
		</div>
	);
}
