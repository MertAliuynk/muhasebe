"use client"

import { useState } from "react"
import { api } from "@/trpc/react"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import {
  ArrowUpDown,
  Building,
  DollarSign,
  Download,
  Filter,
  Loader2,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function IncomesPage() {
  const [filters, setFilters] = useState({
    branchId: undefined as string | undefined,
    doctorId: undefined as string | undefined,
    type: "all" as "income" | "expense" | "all",
    incomeType: undefined as "patient" | "branch" | undefined,
    expenseType: undefined as "doctor" | "branch" | undefined,
    paymentType: undefined as
      | "CASH"
      | "CREDIT_CARD"
      | "BANK_TRANSFER"
      | undefined,
    startDate: undefined as string | undefined,
    endDate: undefined as string | undefined,
    sortBy: "date" as "date" | "amount",
    sortOrder: "desc" as "asc" | "desc",
  })
  const [page, setPage] = useState(1)

  const { data: branchData } = api.branch.getAllBranches.useQuery()
  const branches = branchData || []

  const { data: doctorData } = api.doctor.getAll.useQuery()
  const doctors = doctorData || []

  const { data: incomeData, isLoading: loading } = api.income.getAll.useQuery({
    ...filters,
    page,
    limit: 50,
  })

  const incomes = incomeData?.incomes || []
  const stats = incomeData?.stats || null
  const pagination = incomeData?.pagination || {
    page: 1,
    limit: 50,
    totalPages: 1,
    totalCount: 0,
  }

  const handleFilterChange = (key: string, value: string | undefined) => {
    const newFilters = { ...filters, [key]: value || undefined }

    // Type değiştiğinde alt filtreleri temizle
    if (key === "type") {
      if (value === "income") {
        newFilters.expenseType = undefined
      } else if (value === "expense") {
        newFilters.incomeType = undefined
      }
    }

    setFilters(newFilters)
    setPage(1)
  }

  const resetFilters = () => {
    setFilters({
      branchId: undefined,
      doctorId: undefined,
      type: "all",
      incomeType: undefined,
      expenseType: undefined,
      paymentType: undefined,
      startDate: undefined,
      endDate: undefined,
      sortBy: "date",
      sortOrder: "desc",
    })
    setPage(1)
  }

  const exportMutation = api.income.export.useQuery(filters, { enabled: false })

  const exportToCSV = async () => {
    try {
      const data = await exportMutation.refetch()

      if (!data.data?.length) {
        alert("İndirilecek veri bulunamadı")
        return
      }

      const headers = [
        "Tarih",
        "Tür",
        "İşlem Tipi",
        "Miktar",
        "Ödeme Tipi",
        "Şube",
        "İlgili Kişi",
        "Açıklama",
      ]
      const rows = data.data.map((income) => [
        format(new Date(income.date), "dd.MM.yyyy HH:mm"),
        getIncomeTypeLabel(income.type),
        income.transactionType === "income" ? "Gelir" : "Gider",
        income.amount.toString(),
        getPaymentTypeLabel(income.paymentType),
        income.branchName,
        income.patientName || income.doctorName || "-",
        income.note || income.description || "-",
      ])

      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.join(",")),
      ].join("\n")

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute(
        "download",
        `mali-rapor-${format(new Date(), "yyyy-MM-dd")}.csv`
      )
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error("CSV indirme hatası:", error)
      alert("CSV indirme sırasında bir hata oluştu")
    }
  }

  const getPaymentTypeLabel = (type: string) => {
    switch (type) {
      case "CASH":
        return "Nakit"
      case "CREDIT_CARD":
        return "Kredi Kartı"
      case "BANK_TRANSFER":
        return "Banka Transferi"
      default:
        return type
    }
  }

  const getIncomeTypeLabel = (type: string) => {
    switch (type) {
      case "patient":
        return "Hasta Ödemesi"
      case "branch":
        return "Şube Geliri"
      case "doctorExpense":
        return "Doktor Gideri"
      case "branchExpense":
        return "Şube Gideri"
      default:
        return type
    }
  }

  const getPaymentTypeBadgeVariant = (type: string) => {
    switch (type) {
      case "CASH":
        return "default"
      case "CREDIT_CARD":
        return "secondary"
      case "BANK_TRANSFER":
        return "outline"
      default:
        return "default"
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(Math.abs(amount))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Mali Yönetim</h1>
        <Button
          onClick={exportToCSV}
          disabled={loading || incomes.length === 0}
        >
          <Download className="mr-2 h-4 w-4" />
          CSV İndir
        </Button>
      </div>

      {/* İstatistik Kartları */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Toplam Gelir
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(stats.totalIncome)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Toplam Gider
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(stats.totalExpense)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Durum</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${stats.netAmount >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                {formatCurrency(stats.netAmount)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Nakit</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="text-sm text-green-600">
                  Gelir:{" "}
                  {formatCurrency(stats.byPaymentType?.income?.CASH || 0)}
                </div>
                <div className="text-sm text-red-600">
                  Gider:{" "}
                  {formatCurrency(stats.byPaymentType?.expense?.CASH || 0)}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Kredi Kartı</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="text-sm text-green-600">
                  Gelir:{" "}
                  {formatCurrency(
                    stats.byPaymentType?.income?.CREDIT_CARD || 0
                  )}
                </div>
                <div className="text-sm text-red-600">
                  Gider:{" "}
                  {formatCurrency(
                    stats.byPaymentType?.expense?.CREDIT_CARD || 0
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtreler */}
      <Card className="relative">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="mr-2 h-5 w-5" />
            Filtreler
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-2">
            <Select
              value={filters.type}
              onValueChange={(value) => handleFilterChange("type", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="İşlem Tipi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                <SelectItem value="income">Sadece Gelirler</SelectItem>
                <SelectItem value="expense">Sadece Giderler</SelectItem>
              </SelectContent>
            </Select>

            {filters.type === "income" && (
              <Select
                value={filters.incomeType || "all"}
                onValueChange={(value) =>
                  handleFilterChange(
                    "incomeType",
                    value === "all" ? undefined : value
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Gelir Türü" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Gelirler</SelectItem>
                  <SelectItem value="patient">Hasta Ödemeleri</SelectItem>
                  <SelectItem value="branch">Şube Gelirleri</SelectItem>
                </SelectContent>
              </Select>
            )}

            {filters.type === "expense" && (
              <Select
                value={filters.expenseType || "all"}
                onValueChange={(value) =>
                  handleFilterChange(
                    "expenseType",
                    value === "all" ? undefined : value
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Gider Türü" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Giderler</SelectItem>
                  <SelectItem value="doctor">Doktor Giderleri</SelectItem>
                  <SelectItem value="branch">Şube Giderleri</SelectItem>
                </SelectContent>
              </Select>
            )}

            <Select
              value={filters.branchId || "all"}
              onValueChange={(value) =>
                handleFilterChange(
                  "branchId",
                  value === "all" ? undefined : value
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Tüm Şubeler" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Şubeler</SelectItem>
                {branches.map((branch) => (
                  <SelectItem key={branch.id} value={branch.id}>
                    {branch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {filters.type === "expense" && filters.expenseType === "doctor" && (
              <Select
                value={filters.doctorId || "all"}
                onValueChange={(value) =>
                  handleFilterChange(
                    "doctorId",
                    value === "all" ? undefined : value
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tüm Doktorlar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Doktorlar</SelectItem>
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id}>
                      {doctor.user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Select
              value={filters.paymentType || "all"}
              onValueChange={(value) =>
                handleFilterChange(
                  "paymentType",
                  value === "all" ? undefined : value
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Tüm Ödeme Tipleri" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Ödeme Tipleri</SelectItem>
                <SelectItem value="CASH">Nakit</SelectItem>
                <SelectItem value="CREDIT_CARD">Kredi Kartı</SelectItem>
                <SelectItem value="BANK_TRANSFER">Banka Transferi</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="date"
              placeholder="Başlangıç Tarihi"
              value={filters.startDate || ""}
              onChange={(e) => handleFilterChange("startDate", e.target.value)}
            />

            <Input
              type="date"
              placeholder="Bitiş Tarihi"
              value={filters.endDate || ""}
              onChange={(e) => handleFilterChange("endDate", e.target.value)}
            />

            <div className="flex gap-2">
              <Select
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onValueChange={(value) => {
                  const [sortBy, sortOrder] = value.split("-")
                  handleFilterChange("sortBy", sortBy)
                  handleFilterChange("sortOrder", sortOrder)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sıralama" />
                  <ArrowUpDown className="h-4 w-4 ml-2" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">
                    Tarih (Yeniden Eskiye)
                  </SelectItem>
                  <SelectItem value="date-asc">
                    Tarih (Eskiden Yeniye)
                  </SelectItem>
                  <SelectItem value="amount-desc">
                    Tutar (Büyükten Küçüğe)
                  </SelectItem>
                  <SelectItem value="amount-asc">
                    Tutar (Küçükten Büyüğe)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="absolute top-0 right-2">
            <Button onClick={resetFilters} variant="outline" size="sm">
              <X className="h-4 w-4" />
              Filtreleri Temizle
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* İşlem Tablosu */}
      <Card>
        <CardHeader>
          <CardTitle>İşlem Listesi</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : incomes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Gösterilecek işlem bulunamadı
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tarih</TableHead>
                    <TableHead>Tür</TableHead>
                    <TableHead>Miktar</TableHead>
                    <TableHead>Ödeme Tipi</TableHead>
                    <TableHead>Şube</TableHead>
                    <TableHead>İlgili</TableHead>
                    <TableHead>Açıklama</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {incomes.map((income) => (
                    <TableRow key={income.id}>
                      <TableCell>
                        {format(new Date(income.date), "PPP EEEE HH:mm", {
                          locale: tr,
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            income.transactionType === "income"
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {getIncomeTypeLabel(income.type)}
                        </Badge>
                      </TableCell>
                      <TableCell
                        className={`font-semibold ${
                          income.transactionType === "income"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {income.transactionType === "income" ? "+" : "-"}
                        {formatCurrency(income.amount)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            getPaymentTypeBadgeVariant(income.paymentType) as
                              | "default"
                              | "secondary"
                              | "outline"
                              | "destructive"
                          }
                        >
                          {getPaymentTypeLabel(income.paymentType)}
                        </Badge>
                      </TableCell>
                      <TableCell>{income.branchName}</TableCell>
                      <TableCell>
                        {income.type === "patient" && income.patientName}
                        {income.type === "doctorExpense" && income.doctorName}
                        {(income.type === "branch" ||
                          income.type === "branchExpense") &&
                          "-"}
                        {income.expenseTypeName && (
                          <div className="text-xs text-muted-foreground">
                            {income.expenseTypeName}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {income.note || income.description || "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Sayfalama */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Toplam {pagination.totalCount} kayıttan{" "}
                  {(pagination.page - 1) * pagination.limit + 1} -{" "}
                  {Math.min(
                    pagination.page * pagination.limit,
                    pagination.totalCount
                  )}{" "}
                  arası gösteriliyor
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((prev) => prev - 1)}
                    disabled={pagination.page === 1}
                  >
                    Önceki
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((prev) => prev + 1)}
                    disabled={pagination.page === pagination.totalPages}
                  >
                    Sonraki
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Şube Bazlı Özet */}
      {stats?.byBranch && stats.byBranch.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building className="mr-2 h-5 w-5" />
              Şube Bazlı Mali Özet
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.byBranch.map((branch) => (
                <div
                  key={branch.branchId}
                  className="border-b pb-3 last:border-0"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium">{branch.branchName}</p>
                    <p
                      className={`font-bold ${branch.netAmount >= 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      Net: {formatCurrency(branch.netAmount)}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Gelir:</span>
                      <span className="text-green-600 font-medium">
                        {formatCurrency(branch.totalIncome)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Gider:</span>
                      <span className="text-red-600 font-medium">
                        {formatCurrency(branch.totalExpense)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
