import { api } from "@/trpc/server";

import SavePatientForm from "./_components/save-patient-form";

export default async function AddPatientPage() {
	const doctors = await api.doctor.getDoctorsByBranch();

	return (
		<div className="space-y-5">
			<div>
				<h2 className="text-2xl font-bold">Hasta Ekle</h2>
				<p className="text-sm text-muted-foreground">
					Yeni bir hasta eklemek için formu doldurunuz ve kaydet butonuna
					tıklayınız.
				</p>
			</div>
			<SavePatientForm doctors={doctors} />
		</div>
	);
}
