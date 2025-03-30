"use client";

import { type RouterOutputs } from "@/trpc/react";
import { format } from "date-fns";
import { CalendarDays, Phone } from "lucide-react";
import { formatPhoneNumberIntl } from "react-phone-number-input";

import { calculateAge, getImageUrl } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DateRangePicker } from "@/components/date-range-picker";

export default function PreviewDoctor({
	doctor,
}: {
	doctor: RouterOutputs["doctor"]["getDoctorById"];
}) {
	return (
		<div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/5 via-background to-primary/10 p-4 sm:p-6 md:p-8">
			<div className="absolute inset-0 bg-grid-white/10" />
			<div className="relative z-10 flex flex-col md:flex-row justify-between gap-4 md:gap-8">
				{/* Sol Taraf - Hasta Detayları */}
				<div className="space-y-3 sm:space-y-4">
					<div className="flex items-center gap-2 sm:gap-3">
						<div className="relative">
							<Avatar className="size-12 sm:size-16">
								<AvatarImage
									src={getImageUrl(doctor?.user.imagePath ?? null)}
								/>
								<AvatarFallback className="text-xs sm:text-sm">
									{doctor?.user.name
										?.split(" ")
										.map((name) => name.charAt(0))
										.join("")}
								</AvatarFallback>
							</Avatar>
							<div className="absolute -bottom-1 -right-1 size-4 sm:size-5 rounded-full bg-green-500 border-2 border-background" />
						</div>
						<div>
							<h2 className="text-xl sm:text-2xl md:text-3xl font-light">
								{doctor?.user.name}
							</h2>
							<div className="flex items-center gap-2 text-muted-foreground text-xs sm:text-sm">
								<CalendarDays className="size-3" />
								{doctor?.birthDate &&
									`${format(doctor?.birthDate, "dd.MM.yyyy")} (${calculateAge(
										doctor.birthDate,
									)} yaşında)`}
							</div>
						</div>
					</div>
					<div className="flex items-center gap-4 text-xs sm:text-sm">
						<div className="flex items-center gap-2">
							<Phone className="size-3 sm:size-4 text-primary" />
							<span>{formatPhoneNumberIntl(doctor?.phoneNumber ?? "")}</span>
						</div>
					</div>
				</div>
				{/* Sağ Taraf - Aksiyonlar */}
				<div className="flex flex-col justify-between items-start md:items-end mt-3 md:mt-0">
					<DateRangePicker className="text-xs sm:text-sm h-8 sm:h-10" />
				</div>
			</div>
		</div>
	);
}
