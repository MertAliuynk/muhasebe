"use client";

import { type RouterOutputs, api } from "@/trpc/react";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
	DropdownMenuItem,
	DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu";

type Props = {
	doctor: RouterOutputs["doctor"]["getDoctorsByBranch"][number];
};

export default function DeleteDoctorDialog({ doctor }: Props) {
	const utils = api.useUtils();
	const [isOpen, setIsOpen] = useState(false);

	const { mutateAsync, isPending } = api.doctor.deleteDoctor.useMutation();

	const handleDelete = async () => {
		toast.promise(
			mutateAsync({ id: doctor.id }).then(async () => {
				setIsOpen(false);
				await utils.doctor.getDoctorsByBranch.invalidate();
			}),
			{
				loading: "Hekim siliniyor...",
				success: "Hekim başarıyla silindi.",
				error: "Hekim silinirken bir hata oluştu.",
			},
		);
	};

	return (
		<AlertDialog open={isOpen} onOpenChange={setIsOpen}>
			<AlertDialogTrigger asChild>
				<DropdownMenuItem variant="destructive" modal>
					Sil
					<DropdownMenuShortcut>
						<Trash2 size={12} />
					</DropdownMenuShortcut>
				</DropdownMenuItem>
			</AlertDialogTrigger>
			<AlertDialogContent className="max-w-[90vw] sm:max-w-lg">
				<AlertDialogHeader>
					<AlertDialogTitle className="text-lg sm:text-xl">
						Hekim Sil
					</AlertDialogTitle>
					<AlertDialogDescription className="text-xs sm:text-sm">
						<span className="font-medium">{doctor.user.name}</span> isimli
						hekimi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
					<AlertDialogCancel className="mt-0 text-xs sm:text-sm h-8 sm:h-10">
						İptal
					</AlertDialogCancel>
					<Button
						variant="destructive"
						onClick={handleDelete}
						loading={isPending}
						className="text-xs sm:text-sm h-8 sm:h-10"
					>
						<Trash2 size={12} className="mr-2 sm:size-14" />
						Sil
					</Button>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
