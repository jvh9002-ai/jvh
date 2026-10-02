import { useNavigate } from 'react-router-dom';
import { Sparkles, Heart, Brain, Dumbbell, Target, TrendingUp, ArrowRight, Users, Award, Bot } from 'lucide-react';

export function WelcomeScreen() {
  const navigate = useNavigate();

  const features = [
    { icon: Brain, title: 'Learning', desc: 'Track study habits and skill-building' },
    { icon: Heart, title: 'Health', desc: 'Build healthy daily routines' },
    { icon: Dumbbell, title: 'Discipline', desc: 'Develop consistency and focus' },
    { icon: Target, title: 'Goals', desc: 'Set and achieve family goals' },
  ];

  const personas = [
    { emoji: '👨‍👩‍👧‍👦', title: 'Parents', desc: 'Premium dashboard to guide your family', color: 'bg-teal-50 text-teal-700' },
    { emoji: '🧒', title: 'Children 5-12', desc: 'Fun, colorful missions and rewards', color: 'bg-pink-50 text-pink-700' },
    { emoji: '📱', title: 'Teens 13-17', desc: 'Modern, motivational growth tracking', color: 'bg-indigo-50 text-indigo-700' },
    { emoji: '🎓', title: 'College 18-24', desc: 'Professional career and skill planning', color: 'bg-blue-50 text-blue-700' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-cyan-50">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-600 via-emerald-600 to-cyan-700 opacity-95" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-300/15 rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-28">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center">
              <Sparkles className="text-white" size={24} />
            </div>
            <span className="text-xl font-bold text-white">Life Pilot AI</span>
          </div>

          <div className="max-w-2xl">
            <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight">
              The AI-powered<br />Family Growth OS
            </h1>
            <p className="text-teal-50 text-lg mt-6 leading-relaxed">
              Help your family grow in learning, health, discipline, skills, and confidence.
              One platform for every age — from young children to college students.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <button
                onClick={() => navigate('/auth')}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white text-teal-700 px-6 py-3.5 text-base font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
              >
                Get Started Free
                <ArrowRight size={18} />
              </button>
              <button
                onClick={() => navigate('/auth')}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 backdrop-blur text-white border border-white/20 px-6 py-3.5 text-base font-semibold hover:bg-white/20 transition-all"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Personas */}
      <div className="max-w-6xl mx-auto px-6 -mt-16 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {personas.map((p) => (
            <div key={p.title} className="bg-white rounded-2xl shadow-lg p-5 border border-gray-50">
              <div className="text-3xl mb-3">{p.emoji}</div>
              <h3 className="font-bold text-gray-900">{p.title}</h3>
              <p className="text-sm text-gray-500 mt-1">{p.desc}</p>
              <span className={`inline-block mt-3 rounded-full px-3 py-1 text-xs font-semibold ${p.color}`}>Tailored experience</span>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-gray-900 text-center">Everything your family needs to grow</h2>
        <p className="text-gray-500 text-center mt-3 max-w-xl mx-auto">
          Not a habit tracker. Not a school portal. A complete growth operating system powered by AI.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-12">
          {features.map((f) => (
            <div key={f.title} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center mb-4">
                <f.icon className="text-teal-600" size={24} />
              </div>
              <h3 className="font-bold text-gray-900">{f.title}</h3>
              <p className="text-sm text-gray-500 mt-1">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Unique features */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-16">
          <div className="bg-gradient-to-br from-teal-600 to-emerald-700 rounded-2xl p-7 text-white">
            <TrendingUp size={28} />
            <h3 className="text-xl font-bold mt-4">Family Growth Score</h3>
            <p className="text-teal-50 text-sm mt-2">
              Real-time tracking across learning, health, discipline, skills, and confidence for every family member.
            </p>
          </div>
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-7 text-white">
            <Bot size={28} />
            <h3 className="text-xl font-bold mt-4">AI Family Coach</h3>
            <p className="text-amber-50 text-sm mt-2">
              Personalized suggestions based on each member's progress, goals, and growth patterns.
            </p>
          </div>
          <div className="bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl p-7 text-white">
            <Award size={28} />
            <h3 className="text-xl font-bold mt-4">Rewards & Gamification</h3>
            <p className="text-indigo-50 text-sm mt-2">
              Children earn points, unlock badges, and level up from Beginner to Champion.
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-4xl mx-auto px-6 pb-20">
        <div className="bg-gradient-to-r from-slate-900 to-gray-800 rounded-3xl p-10 lg:p-14 text-center">
          <Users className="text-teal-400 mx-auto" size={40} />
          <h2 className="text-2xl lg:text-3xl font-bold text-white mt-5">
            Ready to help your family grow?
          </h2>
          <p className="text-gray-400 mt-3 max-w-lg mx-auto">
            Set up your family in minutes. Add members, create tasks, and start your growth journey today.
          </p>
          <button
            onClick={() => navigate('/auth')}
            className="inline-flex items-center gap-2 rounded-xl bg-teal-500 text-white px-7 py-3.5 text-base font-bold mt-7 hover:bg-teal-400 transition-all shadow-lg"
          >
            Start Your Family Journey
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
