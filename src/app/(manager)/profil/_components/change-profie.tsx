"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateUserProfileSchema } from "@/server/api/routers/user/schema";
import { api, type RouterOutputs } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import type { TRPCError } from "@trpc/server";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import UploadImage from "@/components/form/upload-image";

type PageProps = {
	userProfile: RouterOutputs["user"]["getUserProfile"];
};

export default function ChangeProfile({ userProfile }: PageProps) {
	const router = useRouter();
	const [isUploadingImage, setIsUploadingImage] = useState(false);

	const { mutateAsync: updateProfile, isPending } =
		api.user.updateUserProfile.useMutation();

	const form = useForm<z.infer<typeof updateUserProfileSchema>>({
		resolver: zodResolver(updateUserProfileSchema),
		defaultValues: {
			name: userProfile.name,
			username: userProfile.username,
			imagePath: userProfile.imagePath,
		},
	});

	async function onSubmit(values: z.infer<typeof updateUserProfileSchema>) {
		try {
			if (!values.imagePath || typeof values.imagePath === "string") {
				// Resim yoksa veya resim zaten bir URL ise direkt profil güncelle
				toast.promise(updateProfile(values), {
					loading: "Profil bilgileriniz güncelleniyor...",
					success: () => {
						router.refresh();
						return "Profil bilgileriniz başarıyla güncellendi.";
					},
					error: (error: TRPCError) => error.message,
				});
				return;
			}

			// Resim varsa önce resmi yükle
			setIsUploadingImage(true);
			const formData = new FormData();

			// Kırpılmış resim dosyasını formData'ya ekle
			const imageFile = values.imagePath as unknown as File;
			formData.append("file", imageFile);

			// Kırpılmış resim olduğunu belirtmek için ek bir alan ekle
			formData.append("isCropped", "true");

			toast.promise(
				fetch("/api/upload", {
					method: "POST",
					body: formData,
				})
					.then((res) => res.json())
					.then((data: { url: string }) => {
						// Resim yüklendikten sonra profil güncelle
						return toast.promise(
							updateProfile({ ...values, imagePath: data.url }),
							{
								loading: "Profil bilgileriniz güncelleniyor...",
								success: () => {
									router.refresh();
									return "Profil bilgileriniz başarıyla güncellendi.";
								},
								error: (error: TRPCError) => error.message,
							},
						);
					})
					.finally(() => {
						setIsUploadingImage(false);
					}),
				{
					loading: "Resim yükleniyor...",
					success: "Resim yüklendi.",
					error: (error: TRPCError) => error.message,
				},
			);
		} catch (error) {
			console.error("Profil güncelleme hatası:", error);
			setIsUploadingImage(false);
		}
	}

	return (
		<Card className="w-full">
			<CardHeader>
				<CardTitle>Profil Bilgileri</CardTitle>
				<CardDescription>
					Kişisel bilgilerinizi güncelleyebilirsiniz.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
						<div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6 md:gap-10">
							<FormField
								control={form.control}
								name="imagePath"
								render={({ field }) => (
									<FormItem className="flex justify-center md:justify-start">
										<FormControl>
											<UploadImage {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<div className="grid grid-cols-1 gap-6">
								<FormField
									control={form.control}
									name="name"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Ad Soyad</FormLabel>
											<FormControl>
												<Input placeholder="Ad Soyad" {...field} />
											</FormControl>
											<FormDescription className="text-xs md:text-sm">
												Tam adınızı ve soyadınızı giriniz.
											</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="username"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Kullanıcı Adı</FormLabel>
											<FormControl>
												<Input placeholder="Kullanıcı adı" {...field} />
											</FormControl>
											<FormDescription className="text-xs md:text-sm">
												Kullanıcı adınızı değiştirebilirsiniz. Boşluk ve Türkçe
												karakter içeremez.
											</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						</div>
						<div className="flex justify-center md:justify-end">
							<Button
								type="submit"
								loading={isPending || isUploadingImage}
								className="w-full md:w-auto"
							>
								Bilgileri Güncelle
							</Button>
						</div>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}
