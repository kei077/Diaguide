import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/hooks/use-auth';
import {
  Activity,
  HeartPulse,
  Download,
  User,
  Droplets,
  Scale,
  Loader2,
  AlertCircle,
  Calendar,
  TrendingUp
} from 'lucide-react';

interface Record<T> {
  id: number;
  value?: number;
  dose?: number;
  date: string;
  notes?: string;
  [key: string]: any;
}

interface PatientHealth {
  id: number;
  nom: string;
  prenom: string;
  diabetes_type: string;
  health_metrics: {
    glucose_records: Record<number>[];
    insulin_records: Record<number>[];
    weight_records: Record<number>[];
    meal_records: any[];
    activity_records: any[];
    medication_records: any[];
    bmi: number | null;
  };
  is_assigned: boolean;
}

export function DoctorDashboard() {
  const { user } = useAuth();
  const [patients, setPatients] = useState<PatientHealth[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPatientHealthData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token || !user?.email) {
          throw new Error("Authentication required");
        }

        const url =
          `${import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api'}` +
          `/patient/doctor/patients/health/`;

        const response = await axios.get<PatientHealth[]>(url, {
          params: { email: user.email },
          headers: { Authorization: `Token ${token}` },
        });

        setPatients(response.data);
      } catch (err) {
        let message = 'Error loading data';
        if (axios.isAxiosError(err)) {
          message =
            err.response?.data?.detail ||
            err.response?.data?.message ||
            err.message;
        } else if (err instanceof Error) {
          message = err.message;
        }
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchPatientHealthData();
  }, [user?.email]);

  const generatePatientReport = (patient: PatientHealth) => {
    const { health_metrics } = patient;
    
    const glucoseStats = calculateStats(health_metrics.glucose_records.map(r => r.value).filter((v): v is number => v !== undefined));
    const weightStats = calculateStats(health_metrics.weight_records.map(r => r.value).filter((v): v is number => v !== undefined));
    const insulinStats = calculateStats(health_metrics.insulin_records.map(r => r.dose).filter((v): v is number => v !== undefined));
    
    const recentGlucose = health_metrics.glucose_records.slice(0, 7);
    const recentWeight = health_metrics.weight_records.slice(0, 7);
    const recentInsulin = health_metrics.insulin_records.slice(0, 7);
    
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const reportHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Medical Report - ${patient.nom} ${patient.prenom}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body { 
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
            color: #2c3e50;
            line-height: 1.6;
          }

          .report-container {
            max-width: 1200px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            position: relative;
          }

          .report-container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 6px;
            background: linear-gradient(90deg, #667eea, #764ba2, #f093fb, #f5576c);
          }

          .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            text-align: center;
            position: relative;
            overflow: hidden;
          }

          .header::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px);
            background-size: 30px 30px;
            animation: drift 20s linear infinite;
          }

          @keyframes drift {
            0% { transform: translate(0, 0); }
            100% { transform: translate(30px, 30px); }
          }

          .header h1 { 
            font-size: 2.8rem;
            font-weight: 700;
            margin-bottom: 10px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
            position: relative;
            z-index: 1;
          }

          .header p {
            font-size: 1.1rem;
            opacity: 0.9;
            position: relative;
            z-index: 1;
          }

          .content {
            padding: 40px;
          }

          .patient-info { 
            background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
            padding: 30px;
            border-radius: 16px;
            margin-bottom: 30px;
            border: 1px solid rgba(103, 126, 234, 0.1);
            position: relative;
            overflow: hidden;
          }

          .patient-info::before {
            content: '👤';
            position: absolute;
            top: 20px;
            right: 20px;
            font-size: 3rem;
            opacity: 0.1;
          }

          .patient-info h2 { 
            color: #5e35b1;
            margin-bottom: 20px;
            font-size: 1.8rem;
            font-weight: 600;
          }

          .patient-info p { 
            margin-bottom: 12px;
            font-size: 1.1rem;
          }

          .patient-info strong {
            color: #4a148c;
            font-weight: 600;
          }

          .section { 
            margin-bottom: 40px;
            background: #fafafa;
            border-radius: 16px;
            padding: 30px;
            border: 1px solid #e1e5e9;
            transition: all 0.3s ease;
          }

          .section:hover {
            box-shadow: 0 8px 25px rgba(0,0,0,0.08);
            transform: translateY(-2px);
          }

          .section h3 { 
            color: #2c3e50;
            margin-bottom: 25px;
            font-size: 1.6rem;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 12px;
            padding-bottom: 15px;
            border-bottom: 3px solid transparent;
            background: linear-gradient(90deg, #667eea, #764ba2) no-repeat bottom;
            background-size: 100px 3px;
          }

          .stats { 
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin: 25px 0;
          }

          .stat-box { 
            background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
            padding: 25px;
            border-radius: 16px;
            text-align: center;
            border: 2px solid transparent;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
          }

          .stat-box:nth-child(1) { border-color: #e91e63; }
          .stat-box:nth-child(2) { border-color: #2196f3; }
          .stat-box:nth-child(3) { border-color: #4caf50; }

          .stat-box::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: var(--accent-color);
          }

          .stat-box:nth-child(1) { --accent-color: #e91e63; }
          .stat-box:nth-child(2) { --accent-color: #2196f3; }
          .stat-box:nth-child(3) { --accent-color: #4caf50; }

          .stat-box:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 35px rgba(0,0,0,0.1);
          }

          .stat-box h4 { 
            color: var(--accent-color);
            margin-bottom: 15px;
            font-size: 1.3rem;
            font-weight: 600;
          }

          .stat-box p { 
            margin-bottom: 8px;
            font-size: 0.95rem;
            color: #546e7a;
          }

          .stat-box p:first-of-type {
            font-size: 1.1rem;
            font-weight: 600;
            color: #2c3e50;
          }

          table { 
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            margin: 20px 0;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
            background: white;
          }

          th { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 18px 15px;
            text-align: left;
            font-weight: 600;
            font-size: 0.95rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          td { 
            padding: 15px;
            border-bottom: 1px solid #e1e5e9;
            transition: background-color 0.2s ease;
            vertical-align: middle;
          }

          tr:hover td {
            background-color: rgba(103, 126, 234, 0.05);
          }

          tr:last-child td {
            border-bottom: none;
          }

          .clinical-observations {
            background: linear-gradient(135deg, #fff3e0 0%, #fce4ec 100%);
            padding: 25px;
            border-radius: 16px;
            border-left: 6px solid #ff9800;
            margin-top: 20px;
            position: relative;
            overflow: hidden;
          }

          .clinical-observations::before {
            content: '📋';
            position: absolute;
            top: 20px;
            right: 20px;
            font-size: 2.5rem;
            opacity: 0.1;
          }

          .footer { 
            background: linear-gradient(135deg, #37474f 0%, #263238 100%);
            color: #b0bec5;
            padding: 30px 40px;
            text-align: center;
            font-size: 0.9rem;
            line-height: 1.8;
          }

          .footer p {
            margin-bottom: 5px;
          }

          .footer p:last-child {
            margin-bottom: 0;
            opacity: 0.8;
          }

          /* Responsive Design */
          @media (max-width: 768px) {
            body { padding: 10px; }
            
            .header { padding: 30px 20px; }
            .header h1 { font-size: 2.2rem; }
            
            .content { padding: 20px; }
            
            .stats {
              grid-template-columns: 1fr;
            }
            
            table {
              font-size: 0.9rem;
            }
            
            th, td {
              padding: 12px 10px;
            }
          }

          /* Print Styles */
          @media print { 
            body { 
              background: white;
              padding: 0;
            }
            
            .report-container {
              box-shadow: none;
              border-radius: 0;
            }
            
            .section:hover {
              transform: none;
              box-shadow: none;
            }
            
            .stat-box:hover {
              transform: none;
              box-shadow: none;
            }
          }

          /* Animation for loading */
          .section {
            animation: fadeInUp 0.6s ease-out;
            animation-fill-mode: both;
          }

          .section:nth-child(1) { animation-delay: 0.1s; }
          .section:nth-child(2) { animation-delay: 0.2s; }
          .section:nth-child(3) { animation-delay: 0.3s; }
          .section:nth-child(4) { animation-delay: 0.4s; }
          .section:nth-child(5) { animation-delay: 0.5s; }

          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        </style>
      </head>
      <body>
        <div class="report-container">
          <div class="header">
            <h1>MEDICAL REPORT</h1>
            <p>Report generated on: ${currentDate}</p>
          </div>
          
          <div class="content">
            <div class="patient-info">
              <h2>Patient Information</h2>
              <p><strong>Name:</strong> ${patient.nom} ${patient.prenom}</p>
              <p><strong>Diabetes type:</strong> ${getDiabetesTypeLabel(patient.diabetes_type)}</p>
              <p><strong>BMI:</strong> ${patient.health_metrics.bmi || 'Not available'}</p>
            </div>
            
            <div class="section">
              <h3>📊 Statistics Summary</h3>
              <div class="stats">
                <div class="stat-box">
                  <h4>Glucose</h4>
                  <p>Average: ${glucoseStats.avg.toFixed(1)} mmol/L</p>
                  <p>Min: ${glucoseStats.min} - Max: ${glucoseStats.max}</p>
                  <p>Measurements: ${glucoseStats.count}</p>
                </div>
                <div class="stat-box">
                  <h4>Weight</h4>
                  <p>Average: ${weightStats.avg.toFixed(1)} kg</p>
                  <p>Min: ${weightStats.min} - Max: ${weightStats.max}</p>
                  <p>Measurements: ${weightStats.count}</p>
                </div>
                <div class="stat-box">
                  <h4>Insulin</h4>
                  <p>Average: ${insulinStats.avg.toFixed(1)} IU</p>
                  <p>Min: ${insulinStats.min} - Max: ${insulinStats.max}</p>
                  <p>Injections: ${insulinStats.count}</p>
                </div>
              </div>
            </div>
            
            <div class="section">
              <h3>🩸 Glucose History (Last 7 measurements)</h3>
              <table>
                <thead>
                  <tr><th>Date</th><th>Value (mmol/L)</th></tr>
                </thead>
                <tbody>
                  ${recentGlucose.map(record => `
                    <tr>
                      <td>${formatDate(record.date)}</td>
                      <td>${record.value || '—'}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
            
            <div class="section">
              <h3>⚖️ Weight History (Last 7 measurements)</h3>
              <table>
                <thead>
                  <tr><th>Date</th><th>Weight (kg)</th></tr>
                </thead>
                <tbody>
                  ${recentWeight.map(record => `
                    <tr>
                      <td>${formatDate(record.date)}</td>
                      <td>${record.value || '—'}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
            
            <div class="section">
              <h3>💉 Insulin History (Last 7 injections)</h3>
              <table>
                <thead>
                  <tr><th>Date</th><th>Dose (IU)</th></tr>
                </thead>
                <tbody>
                  ${recentInsulin.map(record => `
                    <tr>
                      <td>${formatDate(record.date)}</td>
                      <td>${record.dose || '—'}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
            
            <div class="section">
              <h3>📝 Clinical Observations</h3>
              <div class="clinical-observations">
                ${generateClinicalObservations(patient, glucoseStats, weightStats, insulinStats)}
              </div>
            </div>
          </div>
          
          <div class="footer">
            <p>Report automatically generated on ${currentDate}</p>
            <p>This document is confidential and intended for medical use only</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    return reportHTML;
  };

  const calculateStats = (values: number[]) => {
    if (values.length === 0) return { avg: 0, min: 0, max: 0, count: 0 };
    
    const sum = values.reduce((a, b) => a + b, 0);
    return {
      avg: sum / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      count: values.length
    };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDiabetesTypeLabel = (type: string) => {
    switch (type) {
      case 'type1': return 'Type 1';
      case 'type2': return 'Type 2';
      case 'gestationnel': return 'Gestational';
      default: return type;
    }
  };

  const generateClinicalObservations = (
    patient: PatientHealth, 
    glucoseStats: ReturnType<typeof calculateStats>, 
    weightStats: ReturnType<typeof calculateStats>, 
    insulinStats: ReturnType<typeof calculateStats>
  ) => {
    const observations = [];
    
    if (glucoseStats.avg > 10) {
      observations.push("⚠️ High average glucose (>10 mmol/L) - Consider therapy adjustment");
    } else if (glucoseStats.avg < 4) {
      observations.push("⚠️ Hypoglycemia risk - Increased monitoring recommended");
    } else {
      observations.push("✅ Glucose control within targets");
    }
    
    if (patient.health_metrics.bmi) {
      if (patient.health_metrics.bmi > 30) {
        observations.push("📈 High BMI (>30) - Nutritional support recommended");
      } else if (patient.health_metrics.bmi < 18.5) {
        observations.push("📉 Low BMI (<18.5) - Nutritional monitoring needed");
      }
    }
    
    if (insulinStats.count > 0) {
      observations.push(`💉 ${insulinStats.count} insulin injections recorded`);
    }
    
    observations.push(`📊 Total of ${patient.health_metrics.glucose_records.length} glucose measurements`);
    
    return observations.join('<br><br>');
  };

  const downloadReport = (patient: PatientHealth) => {
    try {
      const reportHTML = generatePatientReport(patient);
      
      const blob = new Blob([reportHTML], { type: 'text/html;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report-${patient.nom}-${patient.prenom}-${new Date().toISOString().split('T')[0]}.html`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Report generation error:', err);
      alert("Failed to generate report");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
        <p className="mt-4 text-lg text-gray-600">Loading patient data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 p-6">
        <AlertCircle className="h-12 w-12 text-red-600" />
        <h2 className="mt-4 text-xl font-semibold text-gray-800">Error loading data</h2>
        <p className="mt-2 text-gray-600 max-w-md text-center">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-slate-200 opacity-20 pointer-events-none"></div>
      
      <div className="relative p-6 max-w-7xl mx-auto space-y-8">
        {/* Enhanced Header */}
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-white/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-400/20 to-pink-500/20 rounded-full translate-y-12 -translate-x-12"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                <Activity className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Medical Dashboard
                </h1>
                <p className="text-gray-600 text-lg mt-1">Overview of your patients' health metrics</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Last updated: Today, 14:30</span>
              </div>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Real-time monitoring active</span>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: "Monitored Patients",
              value: patients.length,
              icon: User,
              gradient: "from-blue-500 to-cyan-500",
              bgGradient: "from-blue-50 to-cyan-50",
              iconBg: "bg-blue-100",
              iconColor: "text-blue-600",
              change: "+2 this week"
            },
            {
              title: "Type 1 Diabetes",
              value: patients.filter(p => p.diabetes_type === 'type1').length,
              icon: Droplets,
              gradient: "from-purple-500 to-pink-500",
              bgGradient: "from-purple-50 to-pink-50",
              iconBg: "bg-purple-100",
              iconColor: "text-purple-600",
              change: "Stable"
            },
            {
              title: "Type 2 Diabetes",
              value: patients.filter(p => p.diabetes_type === 'type2').length,
              icon: Scale,
              gradient: "from-orange-500 to-red-500",
              bgGradient: "from-orange-50 to-red-50",
              iconBg: "bg-orange-100",
              iconColor: "text-orange-600",
              change: "+1 this month"
            },
            {
              title: "Gestational",
              value: patients.filter(p => p.diabetes_type === 'gestationnel').length,
              icon: HeartPulse,
              gradient: "from-pink-500 to-rose-500",
              bgGradient: "from-pink-50 to-rose-50",
              iconBg: "bg-pink-100",
              iconColor: "text-pink-600",
              change: "No change"
            }
          ].map((stat, index) => (
            <div
              key={index}
              className={`bg-gradient-to-br ${stat.bgGradient} backdrop-blur-sm p-6 rounded-3xl shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group relative overflow-hidden`}
            >
              {/* Animated background elements */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-8 -translate-x-8 group-hover:scale-125 transition-transform duration-700"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-700 flex items-center gap-2 text-sm mb-2">
                      <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                      {stat.title}
                    </h3>
                    <p className="text-4xl font-bold text-gray-800 mb-1">{stat.value}</p>
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <TrendingUp className="h-3 w-3" />
                      <span>{stat.change}</span>
                    </div>
                  </div>
                  <div className={`${stat.iconBg} p-4 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className={`h-8 w-8 ${stat.iconColor}`} />
                  </div>
                </div>
                
                {/* Progress bar */}
                <div className="w-full bg-white/30 rounded-full h-2 mb-2">
                  <div className={`bg-gradient-to-r ${stat.gradient} h-2 rounded-full transition-all duration-1000 ease-out`} 
                       style={{ width: `${Math.min((stat.value / Math.max(patients.length, 1)) * 100, 100)}%` }}></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced Patient Records Table */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-100/50 bg-gradient-to-r from-gray-50/50 to-blue-50/50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-1">Patient Records</h2>
                <p className="text-gray-600">Detailed view of your patients' latest metrics</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-green-700">Live Data</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-blue-50">
                  {[
                    'Patient',
                    'Diabetes Type',
                    'Glucose',
                    'Weight',
                    'Insulin',
                    'BMI',
                    'Actions'
                  ].map((header, index) => (
                    <th
                      key={index}
                      scope="col"
                      className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider border-b border-gray-200/50"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100/50">
                {patients.map((patient, index) => {
                  const latestGlucose = patient.health_metrics.glucose_records[0]?.value ?? '—';
                  const latestWeight = patient.health_metrics.weight_records[0]?.value ?? '—';
                  const latestInsulin = patient.health_metrics.insulin_records[0]?.dose ?? '—';
                  const bmi = patient.health_metrics.bmi ?? '—';

                  return (
                    <tr 
                      key={patient.id} 
                      className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 transition-all duration-300 group"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <td className="px-6 py-6">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <User className="h-6 w-6 text-white" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-bold text-gray-900">
                              {patient.nom} {patient.prenom}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                              <span>ID: {patient.id}</span>
                              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                              <span>Active</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full shadow-sm
                          ${patient.diabetes_type === 'type1' ? 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border border-purple-200' : 
                            patient.diabetes_type === 'type2' ? 'bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 border border-orange-200' : 
                            'bg-gradient-to-r from-pink-100 to-pink-200 text-pink-800 border border-pink-200'}`}>
                          {getDiabetesTypeLabel(patient.diabetes_type)}
                        </span>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${
                            typeof latestGlucose === 'number' && latestGlucose > 8 ? 'bg-red-400' : 
                            typeof latestGlucose === 'number' && latestGlucose < 4 ? 'bg-yellow-400' : 'bg-green-400'
                          }`}></div>
                          <span className="text-sm font-medium text-gray-900">
                            {latestGlucose} {latestGlucose !== '—' && 'mmol/L'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="text-sm font-medium text-gray-900">
                          {latestWeight} {latestWeight !== '—' && 'kg'}
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="text-sm font-medium text-gray-900">
                          {latestInsulin} {latestInsulin !== '—' && 'IU'}
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        {typeof bmi === 'number' ? (
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full shadow-sm
                            ${bmi < 18.5 ? 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-200' : 
                              bmi >= 25 ? 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-200' : 
                              'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-200'}`}>
                            {bmi.toFixed(1)}
                          </span>
                        ) : (
                          <div className="text-sm text-gray-500">—</div>
                        )}
                      </td>
                      <td className="px-6 py-6">
                        <button
                          onClick={() => downloadReport(patient)}
                          className="group/btn relative flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-500"></div>
                          <Download className="h-4 w-4 relative z-10" />
                          <span className="font-medium relative z-10">Report</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Alert Section */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-3xl p-6 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-100 rounded-2xl">
              <AlertCircle className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <h3 className="font-bold text-amber-800 mb-1">Monitoring Alert</h3>
              <p className="text-amber-700 text-sm">
                2 patients require attention for glucose levels outside normal range. Review recommended.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}