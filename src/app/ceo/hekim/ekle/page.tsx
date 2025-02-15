import SaveDoctorForm from "./_components/save-doctor-form"

export default function AddDoctorPage() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold">Hekim Ekle</h2>
        <p className="text-sm text-muted-foreground">
          Yeni bir hekim eklemek için formu doldurunuz ve kaydet butonuna
          tıklayınız.
        </p>
      </div>
      <SaveDoctorForm />
    </div>
  )
}
