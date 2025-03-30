"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateDoctorSchema } from "@/server/api/routers/doctor/schema";
import { api, type RouterOutputs } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	DropdownMenuItem,
	DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/form/date-picker";
import UploadImage from "@/components/form/upload-image";
import { PhoneInput } from "@/components/phone-input";

type Props = {
	doctor: RouterOutputs["doctor"]["getDoctorsByBranch"][number];
};

export default function EditDoctorDialog({ doctor }: Props) {
	const router = useRouter();

	const [isOpen, setIsOpen] = useState(false);
	const [isUploadingImage, setIsUploadingImage] = useState(false);

	const { mutateAsync: updateDoctor, isPending } =
		api.doctor.updateDoctor.useMutation();

	const form = useForm<z.infer<typeof updateDoctorSchema>>({
		resolver: zodResolver(updateDoctorSchema),
		defaultValues: {
			id: doctor.id,
			specialty: doctor.specialty || "",
			phoneNumber: doctor.phoneNumber || "",
			birthDate: doctor.birthDate || new Date(),
			imagePath: doctor.user.imagePath || "",
		},
	});

	async function onSubmit(values: z.infer<typeof updateDoctorSchema>) {
		try {
			if (!values.imagePath || typeof values.imagePath === "string") {
				toast.promise(
					updateDoctor(values).then(async () => {
						router.refresh();
						setIsOpen(false);
					}),
					{
						loading: "Hekim bilgileri güncelleniyor...",
						success: "Hekim bilgileri başarıyla güncellendi.",
						error: "Hekim bilgileri güncellenirken bir hata oluştu.",
					},
				);
				return;
			}

			setIsUploadingImage(true);
			const formData = new FormData();

			const imageFile = values.imagePath as unknown as File;
			formData.append("file", imageFile);

			formData.append("isCropped", "true");

			toast.promise(
				fetch("/api/upload", {
					method: "POST",
					body: formData,
				})
					.then((res) => res.json())
					.then((data: { url: string }) => {
						return toast.promise(
							updateDoctor({ ...values, imagePath: data.url }).then(
								async () => {
									router.refresh();
									setIsOpen(false);
								},
							),
							{
								loading: "Hekim bilgileri güncelleniyor...",
								success: "Hekim bilgileri başarıyla güncellendi.",
								error: "Hekim bilgileri güncellenirken bir hata oluştu.",
							},
						);
					})
					.finally(() => {
						setIsUploadingImage(false);
					}),
				{
					loading: "Resim yükleniyor...",
					success: "Resim yüklendi.",
					error: "Resim yüklenirken bir hata oluştu.",
				},
			);
		} catch (error) {
			console.error("Hekim güncelleme hatası:", error);
			setIsUploadingImage(false);
		}
	}

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<DropdownMenuItem modal>
					Düzenle
					<DropdownMenuShortcut>
						<Pencil size={12} className="sm:size-14" />
					</DropdownMenuShortcut>
				</DropdownMenuItem>
			</DialogTrigger>
			<DialogContent className="max-w-[90vw] sm:max-w-lg md:max-w-2xl">
				<DialogHeader>
					<DialogTitle className="text-lg sm:text-xl">
						Hekim Bilgilerini Düzenle
					</DialogTitle>
					<DialogDescription className="text-xs sm:text-sm">
						Hekim bilgilerini güncellemek için aşağıdaki formu doldurun.
					</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="space-y-4 sm:space-y-5"
					>
						<div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-4 sm:gap-10">
							<FormField
								control={form.control}
								name="imagePath"
								render={({ field }) => (
									<FormItem className="mx-auto sm:mx-0">
										<FormControl>
											<UploadImage {...field} />
										</FormControl>
										<FormMessage className="text-xs" />
									</FormItem>
								)}
							/>
							<div className="space-y-3 sm:space-y-5">
								<FormField
									control={form.control}
									name="specialty"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="text-xs sm:text-sm">
												Uzmanlık Alanı
											</FormLabel>
											<FormControl>
												<Input
													placeholder="Uzmanlık alanı giriniz"
													className="text-xs sm:text-sm h-8 sm:h-10"
													{...field}
												/>
											</FormControl>
											<FormMessage className="text-xs" />
										</FormItem>
									)}
								/>
								<div className="space-y-3 sm:space-y-5">
									<FormField
										control={form.control}
										name="phoneNumber"
										render={({ field }) => (
											<FormItem>
												<FormLabel className="text-xs sm:text-sm">
													Telefon Numarası
												</FormLabel>
												<FormControl>
													<PhoneInput
														defaultCountry="TR"
														international
														className="text-xs sm:text-sm h-8 sm:h-10"
														{...field}
													/>
												</FormControl>
												<FormMessage className="text-xs" />
											</FormItem>
										)}
									/>

									<DatePicker name="birthDate" label="Doğum Tarihi" />
								</div>
							</div>
						</div>

						<DialogFooter className="sm:justify-end">
							<Button
								type="submit"
								disabled={isPending || isUploadingImage}
								className="w-full sm:w-auto text-xs sm:text-sm h-8 sm:h-10"
							>
								{isPending || isUploadingImage
									? "Güncelleniyor..."
									: "Güncelle"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
