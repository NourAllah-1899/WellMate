import React from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext.jsx'

export default function Accueil() {
  const { t } = useLanguage()

  return (
    <div className="wm-container space-y-16 py-8 animate-fade-in">
      {/* Hero Section */}
      <section className="relative rounded-[32px] p-8 md:p-16 overflow-hidden text-center flex flex-col items-center justify-center min-h-[500px]"
               style={{ 
                 background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-main) 100%)',
                 border: '1px solid var(--border-main)',
                 boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.04)'
               }}>
        {/* Chic Background Accents */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-400/10 dark:bg-violet-500/5 rounded-full filter blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-400/10 dark:bg-blue-500/5 rounded-full filter blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl space-y-6">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">
            🇹🇳 {t('landing.tag', 'La communauté santé de Tunisie')}
          </span>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight" style={{ color: 'var(--text-heading)' }}>
            {t('landing.title', 'Reprenez le contrôle de votre bien-être avec')} <span className="bg-gradient-to-r from-violet-600 to-blue-500 bg-clip-text text-transparent">WellMate</span>
          </h1>
          <p className="text-base md:text-lg leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {t('landing.subtitle', "Rejoignez la première plateforme tunisienne intelligente dédiée à la santé, la nutrition et le fitness communautaire. Meal plans par l'IA, objectifs de poids personnalisés et événements sportifs collectifs.")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link to="/register" className="wm-btn !mt-0 !w-auto px-8 py-4 text-base shadow-lg shadow-violet-500/20 no-underline">
              {t('landing.getStarted', "Commencer gratuitement")}
            </Link>
            <Link to="/login" className="wm-btn secondary !mt-0 !w-auto px-8 py-4 text-base no-underline">
              {t('landing.signIn', "Se connecter")}
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Grid Section */}
      <section className="space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-3xl font-black" style={{ color: 'var(--text-heading)' }}>
            {t('landing.featuresTitle', "Tout ce dont vous avez besoin au même endroit")}
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {t('landing.featuresSubtitle', "Découvrez les fonctionnalités de pointe développées par des experts pour transformer votre style de vie.")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1: AI Nutrition */}
          <div className="wm-card p-8 flex flex-col gap-5 hover:translate-y-[-4px] transition-transform duration-300">
            <div className="w-14 h-14 rounded-2xl bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400 flex items-center justify-center text-2xl shadow-inner">
              🥗
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold" style={{ color: 'var(--text-heading)' }}>
                {t('landing.feature1Title', "Générateur de repas IA")}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {t('landing.feature1Desc', "Obtenez des plans alimentaires sur-mesure générés par l'IA Gemini. Adaptés à vos objectifs de poids, vos allergies alimentaires, et vos ingrédients disponibles.")}
              </p>
            </div>
          </div>

          {/* Feature 2: Weight Goals */}
          <div className="wm-card p-8 flex flex-col gap-5 hover:translate-y-[-4px] transition-transform duration-300">
            <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 flex items-center justify-center text-2xl shadow-inner">
              🎯
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold" style={{ color: 'var(--text-heading)' }}>
                {t('landing.feature2Title', "Objectifs de poids de précision")}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {t('landing.feature2Desc', "Définissez vos objectifs de perte, gain ou maintien. Suivez vos pesées régulières avec des courbes de progression claires et des conseils d'entraînements.")}
              </p>
            </div>
          </div>

          {/* Feature 3: Community Events */}
          <div className="wm-card p-8 flex flex-col gap-5 hover:translate-y-[-4px] transition-transform duration-300">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 flex items-center justify-center text-2xl shadow-inner">
              📅
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold" style={{ color: 'var(--text-heading)' }}>
                {t('landing.feature3Title', "Événements & Communauté")}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {t('landing.feature3Desc', "Participez à des séances de running, de yoga ou de cyclisme collectives en Tunisie. Rencontrez des passionnés de fitness près de chez vous.")}
              </p>
            </div>
          </div>

          {/* Feature 4: Water Tracking */}
          <div className="wm-card p-8 flex flex-col gap-5 hover:translate-y-[-4px] transition-transform duration-300">
            <div className="w-14 h-14 rounded-2xl bg-sky-100 text-blue-600 dark:bg-sky-950/30 dark:text-sky-400 flex items-center justify-center text-2xl shadow-inner">
              💧
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold" style={{ color: 'var(--text-heading)' }}>
                {t('landing.feature4Title', "Hydratation connectée")}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {t('landing.feature4Desc', "Suivez votre consommation d'eau quotidienne et restez hydraté grâce à notre interface interactive et nos rappels santé personnalisés.")}
              </p>
            </div>
          </div>

          {/* Feature 5: Smoking Cessation */}
          <div className="wm-card p-8 flex flex-col gap-5 hover:translate-y-[-4px] transition-transform duration-300">
            <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 dark:bg-red-950/30 dark:text-red-400 flex items-center justify-center text-2xl shadow-inner">
              🚭
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold" style={{ color: 'var(--text-heading)' }}>
                {t('landing.feature5Title', "Suivi anti-tabac")}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {t('landing.feature5Desc', "Prenez soin de votre système cardio-vasculaire en mesurant votre réduction de cigarettes et en visualisant l'argent économisé au fil du temps.")}
              </p>
            </div>
          </div>

          {/* Feature 6: Gamification Badges */}
          <div className="wm-card p-8 flex flex-col gap-5 hover:translate-y-[-4px] transition-transform duration-300">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400 flex items-center justify-center text-2xl shadow-inner">
              🏆
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold" style={{ color: 'var(--text-heading)' }}>
                {t('landing.feature6Title', "Gamification & Récompenses")}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {t('landing.feature6Desc', "Maintenez une régularité parfaite (streaks) et débloquez des badges exclusifs en complétant vos tâches quotidiennes et vos séances sportives.")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA (Call to Action) Section */}
      <section className="relative rounded-[32px] p-8 md:p-16 overflow-hidden text-center text-white shadow-2xl"
               style={{ 
                 background: 'linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-action) 100%)',
               }}>
        {/* Visual Overlay Design */}
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-white/10 rounded-full filter blur-2xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-white/10 rounded-full filter blur-2xl pointer-events-none" />

        <div className="relative max-w-2xl mx-auto space-y-6">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white m-0">
            {t('landing.ctaTitle', "Prêt à transformer votre santé ?")}
          </h2>
          <p className="text-base md:text-lg leading-relaxed opacity-90 text-white m-0">
            {t('landing.ctaDesc', "Inscrivez-vous dès maintenant pour générer votre premier plan de repas IA et rejoindre les événements fitness de votre région.")}
          </p>
          <div className="pt-4">
            <Link to="/register" className="inline-block px-8 py-4 rounded-xl font-black text-violet-700 bg-white hover:bg-slate-50 transition-colors shadow-lg no-underline text-base">
              {t('landing.ctaButton', "Rejoindre la communauté")}
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
