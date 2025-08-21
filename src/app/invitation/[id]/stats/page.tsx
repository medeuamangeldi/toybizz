"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface Registration {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  attendees?: number;
  message?: string;
  registeredAt: string;
}

interface InvitationStats {
  _id: string;
  title: string;
  eventType: string;
  date: string;
  language: string;
  style: string;
  createdAt: string;
  registrations: Registration[];
  views: number;
  totalAttendees: number;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export default function InvitationStatsPage() {
  const [stats, setStats] = useState<InvitationStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();
  const params = useParams();
  const invitationId = params.id as string;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchStats = async () => {
      try {
        const response = await fetch(`/api/invitations/${invitationId}/stats`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          router.push("/login");
          return;
        }

        if (!response.ok) {
          setError("Failed to fetch invitation stats");
          return;
        }

        const data = await response.json();
        setStats(data);
      } catch (err) {
        console.error("Fetch stats error:", err);
        setError("Something went wrong");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [router, invitationId]);

  const downloadCSV = () => {
    if (!stats || stats.registrations.length === 0) return;

    const csvContent = [
      // Header
      [
        "Name",
        "Email",
        "Phone",
        "Attendees",
        "Message",
        "Registration Date",
      ].join(","),
      // Data rows
      ...stats.registrations.map((reg) =>
        [
          reg.name || "",
          reg.email || "",
          reg.phone || "",
          reg.attendees || 1,
          (reg.message || "").replace(/,/g, ";"), // Replace commas to avoid CSV issues
          new Date(reg.registeredAt).toLocaleDateString(),
        ]
          .map((field) => `"${field}"`)
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${stats.title}_registrations.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPDF = async () => {
    if (!stats) return;

    const element = document.getElementById("stats-content");
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        backgroundColor: "#1e1b4b",
        scale: 2,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF();

      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${stats.title}_stats.pdf`);
    } catch (error) {
      console.error("PDF generation error:", error);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Prepare chart data
  const dailyRegistrations = stats
    ? stats.registrations.reduce((acc, reg) => {
        const date = new Date(reg.registeredAt).toLocaleDateString();
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    : {};

  const chartData = Object.entries(dailyRegistrations).map(([date, count]) => ({
    date,
    registrations: count,
  }));

  const attendeesData = stats
    ? [
        { name: "Зарегистрированы", value: stats.registrations.length },
        { name: "Всего участников", value: stats.totalAttendees },
      ]
    : [];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-center text-white">
          <p className="text-xl mb-4">{error || "Приглашение не найдено"}</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="bg-indigo-600 hover:bg-indigo-700 px-6 py-2 rounded-lg transition-colors"
          >
            Назад к панели
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <header className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between py-3 sm:py-0 sm:h-16 sm:items-center space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push("/dashboard")}
                className="text-white hover:text-gray-300 transition-colors text-sm sm:text-base"
              >
                ← Назад к панели
              </button>
              <h1 className="text-lg sm:text-2xl font-bold text-white">
                Аналитика приглашения
              </h1>
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <button
                onClick={downloadCSV}
                className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
              >
                Скачать CSV
              </button>
              <button
                onClick={downloadPDF}
                className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
              >
                Скачать PDF
              </button>
            </div>
          </div>
        </div>
      </header>

      <main
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8"
        id="stats-content"
      >
        {/* Event Overview */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">
            {stats.title}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-green-400">
                {stats.registrations.length}
              </div>
              <div className="text-white/60 text-xs sm:text-sm">
                Регистраций
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-blue-400">
                {stats.totalAttendees}
              </div>
              <div className="text-white/60 text-xs sm:text-sm">
                Всего участников
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        {chartData.length > 0 && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-4">
                Ежедневные регистрации
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.2)"
                  />
                  <XAxis
                    dataKey="date"
                    stroke="#fff"
                    fontSize={12}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis stroke="#fff" fontSize={12} tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(30, 27, 75, 0.9)",
                      border: "none",
                      borderRadius: "8px",
                      color: "#fff",
                      fontSize: "14px",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                  <Bar dataKey="registrations" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-4">
                Распределение регистраций
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={attendeesData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                    style={{ fontSize: "12px" }}
                  >
                    {attendeesData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(30, 27, 75, 0.9)",
                      border: "none",
                      borderRadius: "8px",
                      color: "#fff",
                      fontSize: "14px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Registrations Table */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-bold text-white mb-4">
            Регистрации ({stats.registrations.length})
          </h3>

          {stats.registrations.length === 0 ? (
            <div className="text-center text-white/60 py-8">
              Регистраций пока нет.
            </div>
          ) : (
            <>
              {/* Mobile view - Cards */}
              <div className="sm:hidden space-y-4">
                {stats.registrations.map((registration) => (
                  <div
                    key={registration._id}
                    className="bg-white/5 rounded-lg p-4 space-y-2"
                  >
                    <div className="flex justify-between items-start">
                      <div className="font-semibold text-white">
                        {registration.name}
                      </div>
                      <div className="text-green-400 font-semibold text-sm">
                        {registration.attendees || 1} attendee
                        {(registration.attendees || 1) !== 1 ? "s" : ""}
                      </div>
                    </div>
                    {registration.email && (
                      <div className="text-white/80 text-sm">
                        {registration.email}
                      </div>
                    )}
                    {registration.phone && (
                      <div className="text-white/80 text-sm">
                        {registration.phone}
                      </div>
                    )}
                    {registration.message && (
                      <div className="text-white/70 text-sm italic">
                        &ldquo;{registration.message}&rdquo;
                      </div>
                    )}
                    <div className="text-white/60 text-xs">
                      {formatDate(registration.registeredAt)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop view - Table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="pb-3 text-white font-semibold text-sm">
                        Имя
                      </th>
                      <th className="pb-3 text-white font-semibold text-sm">
                        Email
                      </th>
                      <th className="pb-3 text-white font-semibold text-sm">
                        Телефон
                      </th>
                      <th className="pb-3 text-white font-semibold text-sm">
                        Участники
                      </th>
                      <th className="pb-3 text-white font-semibold text-sm">
                        Сообщение
                      </th>
                      <th className="pb-3 text-white font-semibold text-sm">
                        Дата
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.registrations.map((registration) => (
                      <tr
                        key={registration._id}
                        className="border-b border-white/10"
                      >
                        <td className="py-3 text-white text-sm">
                          {registration.name}
                        </td>
                        <td className="py-3 text-white/80 text-sm">
                          {registration.email || "—"}
                        </td>
                        <td className="py-3 text-white/80 text-sm">
                          {registration.phone || "—"}
                        </td>
                        <td className="py-3 text-green-400 font-semibold text-sm">
                          {registration.attendees || 1}
                        </td>
                        <td className="py-3 text-white/80 max-w-xs truncate text-sm">
                          {registration.message || "—"}
                        </td>
                        <td className="py-3 text-white/60 text-xs">
                          {formatDate(registration.registeredAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
