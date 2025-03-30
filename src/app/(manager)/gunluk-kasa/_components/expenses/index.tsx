"use client";

import { useSearchParams } from "next/navigation";
import { api } from "@/trpc/react";
import type { Doctor, User } from "@prisma/client";
import { format } from "date-fns";
import { Building, Clock, Stethoscope } from "lucide-react";

import { formatCurrency, paymentTypeLabels } from "@/lib/utils";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import NewExpenseDialog from "@/components/new-expense-dialog";
import Spinner from "@/components/spinner";

import DeleteExpenseDialog from "./delete-expense-dialog";

export default function Expenses() {
	const searchParams = useSearchParams();
	const date = searchParams.get("date");

	const { data: expenses, isFetching } =
		api.expense.getExpensesByBranchId.useQuery({
			date: date ?? format(new Date(), "yyyy-MM-dd"),
		});
	const { data: doctors, isFetching: doctorsIsFetching } =
		api.doctor.getDoctorsByBranch.useQuery();

	const isToday = date === format(new Date(), "yyyy-MM-dd");
	return (
		<Card>
			<CardHeader>
				<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
					<div>
						<CardTitle className="text-lg sm:text-xl">Giderler</CardTitle>
						<CardDescription className="text-xs sm:text-sm">
							Bugün gider akışı listeleniyor.
						</CardDescription>
					</div>
					<NewExpenseDialog
						doctors={doctors ?? []}
						isLoading={doctorsIsFetching}
					/>
				</div>
			</CardHeader>
			<CardContent className="h-[calc(100vh-16rem)] overflow-y-auto">
				<div className="space-y-8">
					<div className="divide-y">
						{isFetching || !expenses ? (
							<Spinner className="mx-auto mt-20" />
						) : expenses.length === 0 ? (
							<p className="text-center text-sm text-muted-foreground mt-20 underline">
								Herhangi bir gider yok.
							</p>
						) : (
							expenses.map((item) => (
								<div
									key={item.id}
									className="flex flex-col sm:flex-row sm:items-center justify-between py-4 gap-2 sm:gap-0"
								>
									<div className="space-y-1">
										<p className="font-medium text-sm sm:text-base">
											{item.expenseType.name}
										</p>

										<div className="flex items-center gap-2 h-4">
											<div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground h-full">
												{paymentTypeLabels[item.paymentType]}
												<Separator orientation="vertical" />
												<div className="flex items-center gap-1">
													{"doctor" in item ? (
														<>
															<Stethoscope size={14} />
															{
																(item.doctor as Doctor & { user: User }).user
																	.name
															}
														</>
													) : (
														<>
															<Building size={14} />
															Klinik Ödemesi
														</>
													)}
												</div>
											</div>
										</div>
										{item.description && (
											<p className="text-xs sm:text-sm text-muted-foreground">
												Açıklama: {item.description}
											</p>
										)}
									</div>
									<div className="flex items-center gap-4 self-end sm:self-auto">
										<div>
											<p className="font-medium text-destructive text-sm sm:text-base">
												{formatCurrency(item.amount)}
											</p>
											<div className="flex items-center justify-end gap-1 text-xs sm:text-sm text-muted-foreground">
												<Clock size={14} />
												{format(item.createdAt, "HH:mm")}
											</div>
										</div>
										{isToday && <DeleteExpenseDialog expense={item} />}
									</div>
								</div>
							))
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
