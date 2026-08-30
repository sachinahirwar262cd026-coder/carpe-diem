import React from 'react';
import { HeartPulse, Baby, UserCheck, ShieldCheck, AlertCircle, PhoneCall } from 'lucide-react';
import { AqiCategory } from '../../types';

interface AsthmaAdvisoryProps {
  aqi: number;
  category: AqiCategory;
}

export const AsthmaAdvisory: React.FC<AsthmaAdvisoryProps> = ({ aqi, category }) => {
  const isHighRisk = aqi > 200;

  const advisories = [
    {
      title: 'Asthmatic Patients (30M+ in India)',
      icon: HeartPulse,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10 border-rose-500/20',
      status: isHighRisk ? 'High Risk - Inhaler Required' : 'Moderate Caution',
      tips: [
        'Keep short-acting rescue inhalers (Salbutamol) immediately accessible.',
        'Avoid morning jogging/walks between 06:00 AM - 09:00 AM when thermal inversion traps particulates.',
        'Keep windows sealed; use HEPA air purifiers in indoor living spaces.',
      ],
    },
    {
      title: 'Children & School Students',
      icon: Baby,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
      status: isHighRisk ? 'Restrict Outdoor Sports' : 'Normal Outdoor Play',
      tips: [
        'Shift high-intensity physical education classes to indoor halls.',
        'Encourage drinking warm water and hydration to soothe respiratory tract.',
        'Wear certified particulate N95/FFP2 masks during outdoor school transit.',
      ],
    },
    {
      title: 'Senior Citizens & Cardiac Patients',
      icon: UserCheck,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10 border-indigo-500/20',
      status: isHighRisk ? 'Stay Indoors' : 'Mild Activity Allowed',
      tips: [
        'Fine PM2.5 can cross into bloodstream causing vascular stress; stay in clean filtered air.',
        'Monitor blood pressure and oxygen saturation (SpO2) twice daily.',
        'Consult pulmonologist if shortness of breath or persistent coughing occurs.',
      ],
    },
    {
      title: 'General Healthy Adults',
      icon: ShieldCheck,
      color: 'text-teal-400',
      bg: 'bg-teal-500/10 border-teal-500/20',
      status: isHighRisk ? 'Reduce Heavy Strenuous Exertion' : 'Good Conditions',
      tips: [
        'Switch from open-air cycling to indoor stationary workouts during peak AQI spikes.',
        'Use public transit or metro to reduce personal vehicle emissions.',
        'Ventilate rooms only during afternoon hours when wind dispersion is highest.',
      ],
    },
  ];

  return (
    <div className="rounded-3xl bg-slate-900/80 border border-slate-800/80 p-6 shadow-xl backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-widest text-teal-400">
              Personalized Health & Medical Guidance
            </span>
          </div>
          <h3 className="text-lg font-extrabold text-white mt-0.5">
            Micro-Pocket Health Advisory
          </h3>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="font-semibold text-slate-400">Status:</span>
          <span className={`font-bold px-2.5 py-1 rounded-lg border ${
            isHighRisk ? 'bg-rose-500/15 text-rose-300 border-rose-500/30' : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
          }`}>
            {category} Risk Level
          </span>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        {advisories.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className={`p-5 rounded-2xl bg-slate-950/60 border ${item.bg} flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className={`p-2 rounded-xl bg-slate-900 border border-slate-700/60 ${item.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <h4 className="text-sm font-bold text-white">{item.title}</h4>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900 text-slate-300 border border-slate-700">
                    {item.status}
                  </span>
                </div>

                <ul className="mt-3.5 space-y-2">
                  {item.tips.map((tip, idx) => (
                    <li key={idx} className="flex items-start space-x-2 text-xs text-slate-300 leading-relaxed">
                      <span className="text-teal-400 font-bold mt-0.5">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-mono">CPCB Medical Health Advisory</span>
                <span className="text-teal-400 font-semibold cursor-pointer hover:underline flex items-center space-x-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>SMS Warning System</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
