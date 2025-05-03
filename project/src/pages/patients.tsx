import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { 
  Download, Filter, Search, AlertTriangle, CheckCircle, Activity,
  Scale, Utensils, Syringe, Calendar, FileWarning as Running
} from 'lucide-react';
import { format } from 'date-fns';
import jsPDF from 'jspdf';

const mockPatients = [
  {
    id: 1,
    name: "John Doe",
    status: "critical",
    bmi: 28.5,
    mealsPerDay: 4,
    insulinInjections: 3,
    diabetesType: "Type 1",
    diagnosisDate: "2022-03-15",
    physicalActivity: "Moderate",
    lastReading: 245,
    weeklyReadings: [180, 195, 245, 210, 185, 200, 245],
    a1c: 8.5,
    compliance: 75
  },
  {
    id: 2,
    name: "Jane Smith",
    status: "stable",
    bmi: 24.2,
    mealsPerDay: 5,
    insulinInjections: 4,
    diabetesType: "Type 2",
    diagnosisDate: "2021-06-20",
    physicalActivity: "High",
    lastReading: 165,
    weeklyReadings: [150, 165, 155, 170, 160, 165, 165],
    a1c: 6.5,
    compliance: 95
  }
];

const statusColors = {
  critical: "#ef4444",
  warning: "#f59e0b",
  stable: "#10b981"
};

const statusDistribution = [
  { name: "Critical", value: 3, color: statusColors.critical },
  { name: "Warning", value: 8, color: statusColors.warning },
  { name: "Stable", value: 45, color: statusColors.stable }
];

const StatCard = ({ icon: Icon, title, value, trend }: { icon: any; title: string; value: string | number; trend?: string }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm">
    <div className="flex items-center gap-4">
      <div className="rounded-full bg-primary-50 p-3">
        <Icon className="h-6 w-6 text-primary-600" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
        {trend && <p className="text-sm text-green-600">{trend}</p>}
      </div>
    </div>
  </div>
);
const hexToRgb = (hex: string): [number, number, number] => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    return [r, g, b];
  };
  
const PatientRow = ({ patient }: { patient: any }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
  };

  const downloadPDF = () => {
    // Création du document avec une orientation portrait
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Palette de couleurs professionnelle améliorée
    const colors = {
      primary: "#2563eb",       // Bleu plus profond, meilleur contraste
      primaryLight: "#93c5fd",
      primaryDark: "#1d4ed8",   // Version plus foncée du primaire
      critical: "#dc2626",      // Rouge critique plus profond
      criticalLight: "#fca5a5",
      warning: "#d97706",       // Orange avertissement plus contrasté
      warningLight: "#fcd34d",
      stable: "#059669",        // Vert stable plus profond
      stableLight: "#6ee7b7",
      info: "#0284c7",
      text: "#1f2937",
      textLight: "#6b7280",
      lightGray: "#f3f4f6",
      mediumGray: "#e5e7eb",
      darkGray: "#9ca3af",
      accent: "#8b5cf6"
    };
    
    // FONCTIONS UTILITAIRES AMÉLIORÉES
    const getStatusColor = (status: string) => {
      switch (status.toLowerCase()) {
        case 'critical': return colors.critical;
        case 'warning': return colors.warning;
        default: return colors.stable;
      }
    };
    
    const getStatusLightColor = (status: string) => {
      switch (status.toLowerCase()) {
        case 'critical': return colors.criticalLight;
        case 'warning': return colors.warningLight;
        default: return colors.stableLight;
      }
    };
    
    // Convertir les couleurs hex en RGB pour jsPDF
    const hexToRgb = (hex: string): [number, number, number] => {
      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;
      return [r, g, b];
    };
  
    // Fonction utilitaire pour dessiner un polygone à partir d'un tableau de points
    const drawPolygon = (points: [number, number][], style: string = 'F') => {
      if (points.length < 2) return;
      const segments: number[][] = [];
      for (let i = 0; i < points.length - 1; i++) {
        segments.push([points[i + 1][0] - points[i][0], points[i + 1][1] - points[i][1]]);
      }
      // Fermer le polygone
      segments.push([points[0][0] - points[points.length - 1][0], points[0][1] - points[points.length - 1][1]]);
      doc.lines(segments, points[0][0], points[0][1], [1, 1], style);
    };
  
    // Fonction pour créer un graphique linéaire amélioré
    const drawLineChart = (
      data: { label: string; value: number }[],
      x: number,
      y: number,
      width: number,
      height: number,
      title: string,
      showGrid: boolean = true,
      targetValue: number | null = null
    ) => {
      // Titre du graphique avec style amélioré
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...hexToRgb(colors.text));
      doc.text(title, x + width / 2, y - 7, { align: 'center' });
      
      // Cadre du graphique avec léger effet d'ombre
      doc.setDrawColor(...hexToRgb(colors.darkGray));
      doc.setFillColor(...hexToRgb(colors.lightGray));
      doc.roundedRect(x, y, width, height, 3, 3, 'F');
      
      // Effet d'ombre subtil
      doc.setFillColor(0, 0, 0, 0.05);
      doc.roundedRect(x+1, y+1, width, height, 3, 3, 'F');
      
      // Calculer min et max
      const values = data.map(d => d.value);
      const minValue = Math.min(...values) > 20 ? Math.min(...values) - 10 : 0;
      const maxValue = Math.max(...values) + 10;
      const range = maxValue - minValue;
      
      // Grille de fond si activée
      if (showGrid) {
        const gridLines = 5;
        doc.setDrawColor(...hexToRgb(colors.mediumGray));
        doc.setLineDashPattern([0.5, 1], 0);
        doc.setLineWidth(0.2);
        
        for (let i = 1; i < gridLines; i++) {
          const yPos = y + height - 15 - ((i / gridLines) * (height - 25));
          doc.line(x + 10, yPos, x + width - 10, yPos);
        }
        
        doc.setLineDashPattern([], 0);
      }
      
      // Axes avec effet visuel amélioré
      doc.setDrawColor(...hexToRgb(colors.darkGray));
      doc.setLineWidth(0.5);
      doc.line(x + 10, y + height - 15, x + width - 10, y + height - 15); // Axe X
      doc.line(x + 10, y + 10, x + 10, y + height - 15); // Axe Y
      
      // Échelle Y avec plus d'étiquettes
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...hexToRgb(colors.textLight));
      const yLabels = 5;
      for (let i = 0; i <= yLabels; i++) {
        const value = minValue + (range * (i / yLabels));
        const yPos = y + height - 15 - ((i / yLabels) * (height - 25));
        doc.text(Math.round(value).toString(), x + 8, yPos, { align: 'right' });
      }
      
      const chartWidth = width - 20;
      const chartHeight = height - 25;
      const pointsX: number[] = [];
      const pointsY: number[] = [];
      
      // Tracer la zone de remplissage sous la ligne (effet d'aire)
      if (data.length > 1) {
        doc.setFillColor(...hexToRgb(colors.primaryLight), 0.3); // Semi-transparent
        let areaPoints: [number, number][] = [];
        areaPoints.push([x + 10, y + height - 15]); // Point inférieur gauche
        data.forEach((point, index) => {
          const xPos = x + 10 + (index * (chartWidth / (data.length - 1)));
          const yPos = y + height - 15 - ((point.value - minValue) / range * chartHeight);
          areaPoints.push([xPos, yPos]);
        });
        areaPoints.push([x + 10 + chartWidth, y + height - 15]); // Point inférieur droit
        drawPolygon(areaPoints, 'F');
      }
      
      // Tracer la courbe
      data.forEach((point, index) => {
        const xPos = x + 10 + (index * (chartWidth / (data.length - 1)));
        const yPos = y + height - 15 - ((point.value - minValue) / range * chartHeight);
        pointsX.push(xPos);
        pointsY.push(yPos);
        if (data.length > 10) {
          doc.setFontSize(6);
          doc.text(point.label, xPos, y + height - 5, { align: 'center', angle: 45 });
        } else {
          doc.setFontSize(7);
          doc.text(point.label, xPos, y + height - 5, { align: 'center' });
        }
      });
      
      if (pointsX.length > 1) {
        doc.setDrawColor(...hexToRgb(colors.primary));
        doc.setLineWidth(1.5);
        for (let i = 0; i < pointsX.length - 1; i++) {
          doc.line(pointsX[i], pointsY[i], pointsX[i + 1], pointsY[i + 1]);
        }
      }
      
      data.forEach((point, index) => {
        const xPos = pointsX[index];
        const yPos = pointsY[index];
        doc.setFillColor(...hexToRgb(colors.primary), 0.3);
        doc.circle(xPos, yPos, 3, 'F');
        doc.setFillColor(...hexToRgb(colors.primary));
        doc.circle(xPos, yPos, 1.5, 'F');
      });
      
      if (targetValue !== null && targetValue >= minValue && targetValue <= maxValue) {
        const targetY = y + height - 15 - ((targetValue - minValue) / range * chartHeight);
        doc.setDrawColor(...hexToRgb(colors.stable));
        doc.setLineWidth(0.8);
        doc.setLineDashPattern([3, 2], 0);
        doc.line(x + 10, targetY, x + width - 10, targetY);
        doc.setFillColor(...hexToRgb(colors.stable), 0.2);
        doc.setTextColor(...hexToRgb(colors.stable));
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        
        const targetLabel = "Target: " + targetValue;
        const targetLabelWidth = doc.getStringUnitWidth(targetLabel) * 7 / doc.internal.scaleFactor;
        doc.roundedRect(x + width - targetLabelWidth - 15, targetY - 6, targetLabelWidth + 10, 12, 2, 2, 'F');
        doc.text(targetLabel, x + width - 10, targetY + 1, { align: 'right' });
        doc.setLineDashPattern([], 0);
      }
    };
    
    // Fonction pour créer un graphique à barres amélioré
    const drawBarChart = (
      data: { label: string; value: number; color?: string }[],
      x: number,
      y: number,
      width: number,
      height: number,
      title: string,
      showLabelsOnBars = true
    ) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...hexToRgb(colors.text));
      doc.text(title, x + width / 2, y - 7, { align: 'center' });
      
      doc.setDrawColor(...hexToRgb(colors.darkGray));
      doc.setFillColor(...hexToRgb(colors.lightGray));
      doc.roundedRect(x, y, width, height, 3, 3, 'F');
      
      doc.setFillColor(0, 0, 0, 0.05);
      doc.roundedRect(x+1, y+1, width, height, 3, 3, 'F');
      
      const values = data.map(d => d.value);
      const maxValue = Math.max(...values) * 1.1;
      
      const gridLines = 5;
      doc.setDrawColor(...hexToRgb(colors.mediumGray));
      doc.setLineDashPattern([0.5, 1], 0);
      doc.setLineWidth(0.2);
      
      for (let i = 1; i <= gridLines; i++) {
        const yPos = y + height - 15 - ((i / gridLines) * (height - 25));
        doc.line(x + 10, yPos, x + width - 10, yPos);
      }
      doc.setLineDashPattern([], 0);
      
      doc.setDrawColor(...hexToRgb(colors.darkGray));
      doc.setLineWidth(0.5);
      doc.line(x + 10, y + height - 15, x + width - 10, y + height - 15);
      doc.line(x + 10, y + 10, x + 10, y + height - 15);
      
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...hexToRgb(colors.textLight));
      
      for (let i = 0; i <= gridLines; i++) {
        const value = (maxValue * (i / gridLines));
        const yPos = y + height - 15 - ((i / gridLines) * (height - 25));
        doc.text(Math.round(value).toString(), x + 8, yPos, { align: 'right' });
      }
      
      const barWidth = (width - 30) / data.length;
      const barGap = barWidth * 0.2;
      const actualBarWidth = barWidth - barGap;
      const chartHeight = height - 25;
      
      data.forEach((item, index) => {
        const barHeight = (item.value / maxValue) * chartHeight;
        const xPos = x + 15 + index * barWidth;
        const yPos = y + height - 15 - barHeight;
        
        doc.setFillColor(...hexToRgb(item.color || colors.primary));
        doc.roundedRect(xPos, yPos, actualBarWidth, barHeight, 1, 1, 'F');
        
        doc.setFontSize(7);
        doc.setTextColor(...hexToRgb(colors.text));
        doc.text(item.label, xPos + actualBarWidth / 2, y + height - 5, { align: 'center' });
        
        if (showLabelsOnBars) {
          doc.setFontSize(8);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(...hexToRgb(item.color || colors.primary));
          const valueText = item.value.toString();
          const textWidth = doc.getStringUnitWidth(valueText) * 8 / doc.internal.scaleFactor;
          doc.setFillColor(255, 255, 255, 0.7);
          doc.roundedRect(xPos + (actualBarWidth / 2) - (textWidth / 2) - 2, yPos - 10, textWidth + 4, 10, 2, 2, 'F');
          doc.text(valueText, xPos + actualBarWidth / 2, yPos - 3, { align: 'center' });
        }
      });
    };
    
    // Fonction pour créer un indicateur de jauge amélioré
    const drawGauge = (
      x: number,
      y: number,
      radius: number,
      value: number,
      maxValue: number,
      title: string,
      color?: string
    ) => {
      const startAngle = Math.PI;
      const endAngle = 0;
      const angleRange = Math.abs(endAngle - startAngle);
      const valueAngle = startAngle - (value / maxValue) * angleRange;
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...hexToRgb(colors.text));
      doc.text(title, x, y - radius - 8, { align: 'center' });
      
      // Fond de la jauge
      doc.setFillColor(...hexToRgb(colors.lightGray));
      doc.ellipse(x, y, radius, radius);
      
      // Zones colorées pour les segments
      const segments = 5;
      const segmentAngle = angleRange / segments;
      const segmentColors = [
        colors.critical,
        colors.warning,
        colors.warningLight, 
        colors.stableLight, 
        colors.stable
      ];
      
      for (let i = 0; i < segments; i++) {
        const segStart = startAngle - i * segmentAngle;
        const segEnd = segStart - segmentAngle;
        doc.setFillColor(...hexToRgb(segmentColors[i]), 0.7);
        doc.ellipse(x, y, radius, radius);
        doc.setFillColor(...hexToRgb(colors.lightGray));
        doc.ellipse(x, y, radius * 0.7, radius * 0.7);
      }
      
      // Arc de la valeur
      doc.setFillColor(...hexToRgb(color || colors.primary));
      doc.ellipse(x, y, radius, radius);
      
      // Cercle intérieur effet "donut"
      doc.setFillColor(...hexToRgb(colors.lightGray));
      doc.circle(x, y, radius * 0.7, 'F');
      
      // Marques d'échelle
      doc.setDrawColor(...hexToRgb(colors.darkGray));
      doc.setLineWidth(0.5);
      for (let i = 0; i <= 10; i++) {
        const tickAngle = startAngle - (i / 10) * angleRange;
        const tickLength = i % 5 === 0 ? radius * 0.15 : radius * 0.05;
        const innerX = x + (radius - tickLength) * Math.cos(tickAngle);
        const innerY = y + (radius - tickLength) * Math.sin(tickAngle);
        const outerX = x + radius * Math.cos(tickAngle);
        const outerY = y + radius * Math.sin(tickAngle);
        doc.line(innerX, innerY, outerX, outerY);
        if (i % 5 === 0) {
          const labelValue = (maxValue * i / 10).toString();
          const labelX = x + (radius + 5) * Math.cos(tickAngle);
          const labelY = y + (radius + 5) * Math.sin(tickAngle);
          doc.setFontSize(6);
          doc.setTextColor(...hexToRgb(colors.textLight));
          doc.text(labelValue, labelX, labelY, { align: 'center' });
        }
      }
      
      // Aiguille
      doc.setDrawColor(...hexToRgb(colors.text));
      doc.setLineWidth(1.5);
      const needleLength = radius * 0.9;
      const needleX = x + needleLength * Math.cos(valueAngle);
      const needleY = y + needleLength * Math.sin(valueAngle);
      doc.line(x, y, needleX, needleY);
      
      // Cercle central pour l'aiguille
      doc.setFillColor(...hexToRgb(colors.text));
      doc.circle(x, y, radius * 0.07, 'F');
      doc.setFillColor(255, 255, 255);
      doc.circle(x, y, radius * 0.03, 'F');
      
      // Affichage de la valeur
      const valueText = value.toString();
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...hexToRgb(color || colors.primary));
      const valueWidth = doc.getStringUnitWidth(valueText) * 12 / doc.internal.scaleFactor;
      doc.setFillColor(255, 255, 255, 0.8);
      doc.roundedRect(x - valueWidth / 2 - 5, y + 10, valueWidth + 10, 16, 3, 3, 'F');
      doc.text(valueText, x, y + 20, { align: 'center' });
    };
    
    // --------------------- DÉBUT DE LA PREMIÈRE PAGE ---------------------
    
    // Filigrane discret
    doc.setTextColor(230, 230, 230);
    doc.setFillColor(230, 230, 230, 0.2);
    doc.setFontSize(60);
    doc.setFont('helvetica', 'italic');
    doc.text('DIABETES', pageWidth / 2, pageHeight / 2, { 
      align: 'center',
      angle: 45
    });
    
    // En-tête avec dégradé amélioré
    function drawLinearGradient(
        x: number,
        y: number,
        width: number,
        height: number,
        color1: string,
        color2: string,
        vertical: boolean = false
      ): void {
        const steps = 20; // Nombre d'étapes pour le dégradé
        const stepSize = vertical ? height / steps : width / steps;
        
        for (let i = 0; i < steps; i++) {
          const ratio = i / steps;
          const r = parseInt(color1.slice(1, 3), 16) * (1 - ratio) + parseInt(color2.slice(1, 3), 16) * ratio;
          const g = parseInt(color1.slice(3, 5), 16) * (1 - ratio) + parseInt(color2.slice(3, 5), 16) * ratio;
          const b = parseInt(color1.slice(5, 7), 16) * (1 - ratio) + parseInt(color2.slice(5, 7), 16) * ratio;
          
          const hexColor = `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`;
          
          doc.setFillColor(...hexToRgb(hexColor));
          if (vertical) {
            doc.rect(x, y + i * stepSize, width, stepSize + 0.5, 'F');
          } else {
            doc.rect(x + i * stepSize, y, stepSize + 0.5, height, 'F');
          }
        }
      }
    drawLinearGradient(0, 0, pageWidth, 40, colors.primaryDark, colors.primary, false);
    
    // Logo ou icône avec design amélioré
    doc.setFillColor(255, 255, 255);
    doc.circle(20, 20, 12, 'F');
    doc.setDrawColor(...hexToRgb(colors.primary));
    doc.setLineWidth(0.5);
    doc.setFillColor(...hexToRgb(colors.primaryLight));
    doc.circle(20, 20, 9, 'FD');
    doc.setFillColor(255, 255, 255);
    doc.circle(20, 20, 5, 'F');
    
    // Points décoratifs autour du logo
    const logoPoints = 8;
    for (let i = 0; i < logoPoints; i++) {
      const angle = (i / logoPoints) * Math.PI * 2;
      const dotX = 20 + Math.cos(angle) * 10;
      const dotY = 20 + Math.sin(angle) * 10;
      doc.setFillColor(...hexToRgb(colors.primaryLight));
      doc.circle(dotX, dotY, 1, 'F');
    }
    
    // Ligne décorative sous l'en-tête
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(2);
    doc.line(45, 30, pageWidth - 20, 30);
    doc.setDrawColor(...hexToRgb(colors.primaryLight));
    doc.setLineWidth(1);
    doc.line(45, 32, pageWidth - 20, 32);
    
    // Titre avec ombre subtile
    doc.setTextColor(240, 240, 240);
    doc.setFontSize(26);
    doc.setFont('helvetica', 'bold');
    doc.text('PATIENT HEALTH REPORT', 42, 17);
    doc.setTextColor(255, 255, 255);
    doc.text('PATIENT HEALTH REPORT', 40, 15);
    doc.setFontSize(12);
    doc.text('Generated: ' + format(new Date(), 'MMMM d, yyyy'), 40, 25);
    
    // Informations du patient
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(15, 50, pageWidth - 30, 65, 5, 5, 'F');
    doc.setDrawColor(...hexToRgb(colors.primary));
    doc.setLineWidth(0.8);
    doc.roundedRect(15, 50, pageWidth - 30, 65, 5, 5, 'D');
    
    // Photo du patient (simulée)
    doc.setFillColor(...hexToRgb(colors.lightGray));
    doc.circle(35, 75, 15, 'F');
    doc.setFillColor(200, 200, 200);
    doc.circle(35, 75, 12, 'F');
    doc.setFillColor(150, 150, 150);
    doc.circle(35, 70, 5, 'F');
    doc.setFillColor(170, 170, 170);
    doc.circle(35, 85, 8, 'F');
    
    // Détails du patient
    doc.setTextColor(...hexToRgb(colors.text));
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(patient.name, 60, 60);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`ID: ${patient.id}`, 60, 70);
    
    // Indicateur de statut avec badge coloré
    const statusColor = getStatusColor(patient.status);
    doc.setFillColor(...hexToRgb(statusColor));
    doc.roundedRect(60, 70, 40, 15, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(patient.status.toUpperCase(), 80, 78, { align: 'center' });
    
    // Informations de diabète
    doc.setTextColor(...hexToRgb(colors.text));
    doc.setFontSize(12);
    doc.text(`Type: ${patient.diabetesType}`, 110, 65);
    doc.text(`Diagnosed: ${format(new Date(patient.diagnosisDate), 'MMM dd, yyyy')}`, 110, 75);
    doc.text(`Activity Level: ${patient.physicalActivity}`, 110, 85);
    
    // Dernières mesures
    doc.setFillColor(...hexToRgb(colors.lightGray));
    doc.roundedRect(15, 115, pageWidth - 30, 60, 3, 3, 'F');
    doc.setFillColor(...hexToRgb(colors.primary));
    doc.rect(15, 115, pageWidth - 30, 15, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('KEY METRICS', pageWidth / 2, 125, { align: 'center' });
    
    // Jauges pour les métriques clés
    doc.setTextColor(...hexToRgb(colors.text));
    
    const a1cColor = patient.a1c < 7 ? colors.stable : patient.a1c < 8 ? colors.warning : colors.critical;
    drawGauge(55, 150, 20, patient.a1c, 12, 'A1C (%)', a1cColor);
    const bmiColor = patient.bmi < 25 ? colors.stable : patient.bmi < 30 ? colors.warning : colors.critical;
    drawGauge(pageWidth/2, 150, 20, patient.bmi, 40, 'BMI', bmiColor);
    const complianceColor = patient.compliance >= 90 ? colors.stable : patient.compliance >= 70 ? colors.warning : colors.critical;
    drawGauge(pageWidth - 55, 150, 20, patient.compliance, 100, 'Compliance (%)', complianceColor);
    
    // Section des relevés
    doc.setFillColor(...hexToRgb(colors.lightGray));
    doc.roundedRect(15, 185, pageWidth - 30, 85, 3, 3, 'F');
    doc.setFillColor(...hexToRgb(colors.primary));
    doc.rect(15, 185, pageWidth - 30, 15, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('GLUCOSE MONITORING', pageWidth / 2, 195, { align: 'center' });
    
    const weeklyData = patient.weeklyReadings.map((reading: number, index: number) => ({
      label: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index],
      value: reading
    }));
    
    drawLineChart(weeklyData, 25, 210, pageWidth - 50, 50, 'Weekly Blood Glucose Readings (mg/dL)');
    
    // Section des recommandations
    doc.setFillColor(...hexToRgb(colors.lightGray));
    doc.roundedRect(15, 280, pageWidth - 30, 50, 3, 3, 'F');
    doc.setFillColor(...hexToRgb(statusColor));
    doc.rect(15, 280, pageWidth - 30, 15, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('RECOMMENDATIONS', pageWidth / 2, 290, { align: 'center' });
    
    doc.setTextColor(...hexToRgb(colors.text));
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    if (patient.status === 'critical') {
      doc.text('• Immediate consultation with endocrinologist recommended', 25, 305);
      doc.text('• Consider adjusting insulin dosage under medical supervision', 25, 315);
      doc.text('• Increase blood glucose monitoring frequency to 4 times daily', 25, 325);
    } else if (patient.status === 'warning') {
      doc.text('• Schedule follow-up visit within 2 weeks', 25, 305);
      doc.text('• Review meal plan and carbohydrate counting', 25, 315);
      doc.text('• Maintain regular blood glucose monitoring', 25, 325);
    } else {
      doc.text('• Continue current treatment plan', 25, 305);
      doc.text('• Regular check-up in 3 months', 25, 315);
      doc.text('• Maintain physical activity levels', 25, 325);
    }
    
    // Pied de page
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Page 1/2', pageWidth/2, pageHeight - 10, { align: 'center' });
    doc.text('© Health Monitoring System 2025', 15, pageHeight - 10);
    doc.text('CONFIDENTIAL', pageWidth - 15, pageHeight - 10, { align: 'right' });
    
    // DEUXIÈME PAGE
    doc.addPage();
    doc.setTextColor(230, 230, 230);
    doc.setFontSize(60);
    doc.setFont('helvetica', 'italic');
    doc.text('REPORT', pageWidth / 2, pageHeight / 2, { 
      align: 'center',
      angle: 45
    });
    doc.setFillColor(...hexToRgb(colors.primary));
    doc.rect(0, 0, pageWidth, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`${patient.name} - Detailed Analysis`, pageWidth / 2, 13, { align: 'center' });
    doc.setFillColor(...hexToRgb(colors.lightGray));
    doc.roundedRect(15, 30, pageWidth - 30, 100, 3, 3, 'F');
    doc.setFillColor(...hexToRgb(colors.primary));
    doc.rect(15, 30, pageWidth - 30, 15, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('DETAILED TRENDS', pageWidth / 2, 40, { align: 'center' });
    
    const monthlyData: { label: string; value: number }[] = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const baseValue = patient.status === 'critical' ? 220 : patient.status === 'warning' ? 180 : 140;
    for (let i = 0; i < 6; i++) {
      const variation = Math.floor(Math.random() * 30) - 15;
      monthlyData.push({
        label: months[i],
        value: baseValue + variation
      });
    }
    
    drawLineChart(monthlyData, 25, 55, pageWidth - 50, 65, 'Monthly Average Blood Glucose (mg/dL)');
    
    doc.setFillColor(...hexToRgb(colors.lightGray));
    doc.roundedRect(15, 140, pageWidth - 30, 100, 3, 3, 'F');
    doc.setFillColor(...hexToRgb(colors.primary));
    doc.rect(15, 140, pageWidth - 30, 15, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('CONTRIBUTING FACTORS', pageWidth / 2, 150, { align: 'center' });
    
    const factorsData = [
      { label: 'Diet', value: patient.mealsPerDay * 20, color: colors.primary },
      { label: 'Activity', value: patient.physicalActivity === 'Low' ? 30 : patient.physicalActivity === 'Moderate' ? 60 : 90, color: colors.stable },
      { label: 'Insulin', value: patient.insulinInjections * 25, color: colors.warning }
    ];
    
    drawBarChart(factorsData, 25, 165, pageWidth - 50, 65, 'Contributing Factors Score');
    
    doc.setFillColor(...hexToRgb(colors.lightGray));
    doc.roundedRect(15, 250, pageWidth - 30, 90, 3, 3, 'F');
    doc.setFillColor(...hexToRgb(colors.primary));
    doc.rect(15, 250, pageWidth - 30, 15, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('TREATMENT PLAN', pageWidth / 2, 260, { align: 'center' });
    
    doc.setTextColor(...hexToRgb(colors.text));
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Medication:', 25, 280);
    doc.setFont('helvetica', 'normal');
    doc.text(
      patient.diabetesType === 'Type 1'
        ? 'Insulin therapy: continue with current regimen of ' + patient.insulinInjections + ' injections per day.'
        : 'Oral medication: Metformin 500mg twice daily.',
      35,
      290
    );
    
    doc.setFont('helvetica', 'bold');
    doc.text('Diet:', 25, 305);
    doc.setFont('helvetica', 'normal');
    doc.text('Follow the recommended meal plan with ' + patient.mealsPerDay + ' balanced meals per day.', 35, 315);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Follow-up:', 25, 330);
    doc.setFont('helvetica', 'normal');
    doc.text(
      patient.status === 'critical'
        ? 'Schedule appointment within 1 week.'
        : patient.status === 'warning'
        ? 'Schedule appointment within 3 weeks.'
        : 'Schedule routine appointment in 3 months.',
      35,
      340
    );
    
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Page 2/2', pageWidth/2, pageHeight - 10, { align: 'center' });
    doc.text('© Health Monitoring System 2025', 15, pageHeight - 10);
    doc.text('CONFIDENTIAL', pageWidth - 15, pageHeight - 10, { align: 'right' });
    
    doc.save(`patient-report-${patient.name.toLowerCase().replace(' ', '-')}-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };
  
  

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <img
            className="h-10 w-10 rounded-full"
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(patient.name)}&background=random`}
            alt=""
          />
          <div className="ml-4">
            <div className="font-medium text-gray-900">{patient.name}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          {getStatusIcon(patient.status)}
          <span className="capitalize">{patient.status}</span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.bmi}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.mealsPerDay}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.insulinInjections}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.diabetesType}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {format(new Date(patient.diagnosisDate), 'MMM dd, yyyy')}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.physicalActivity}</td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button onClick={() => downloadPDF()} className="text-primary-600 hover:text-primary-900">
          <Download className="h-5 w-5" />
        </button>
      </td>
    </tr>
  );
};

export function Patients() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);

  const filteredPatients = mockPatients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Patient Overview</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard icon={Activity} title="Total Patients" value={56} trend="+3 this week" />
          <StatCard icon={AlertTriangle} title="Critical Cases" value={3} />
          <StatCard icon={Scale} title="Average BMI" value="24.5" />
          <StatCard icon={Running} title="Active Patients" value="78%" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Patient Status Distribution</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Weekly Activity Trends</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockPatients}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="lastReading" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Search patients..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Filter className="h-5 w-5" />
                <span>Filter</span>
              </button>
            </div>

            {filterOpen && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select className="w-full border border-gray-300 rounded-lg p-2">
                      <option value="">All</option>
                      <option value="critical">Critical</option>
                      <option value="warning">Warning</option>
                      <option value="stable">Stable</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Diabetes Type</label>
                    <select className="w-full border border-gray-300 rounded-lg p-2">
                      <option value="">All</option>
                      <option value="type1">Type 1</option>
                      <option value="type2">Type 2</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Activity Level</label>
                    <select className="w-full border border-gray-300 rounded-lg p-2">
                      <option value="">All</option>
                      <option value="low">Low</option>
                      <option value="moderate">Moderate</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">BMI</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Meals/Day</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Insulin Injections</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diagnosis Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity Level</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPatients.map((patient) => (
                  <PatientRow key={patient.id} patient={patient} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
