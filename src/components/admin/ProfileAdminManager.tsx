import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Calendar, 
  Check, 
  AlertCircle, 
  ExternalLink, 
  Sparkles, 
  Save, 
  Loader2, 
  CheckCircle2, 
  Eye, 
  Copy, 
  ShieldCheck
} from 'lucide-react';
import { 
  ProfileConfigService, 
  extractGoogleDriveId, 
  getGoogleDrivePreviewUrl,
  DEFAULT_PROFILE_SETTINGS 
} from '../../services/profileConfigService';
import type { ProfileSettings } from '../../services/profileConfigService';

export const ProfileAdminManager: React.FC = () => {
  const [, setSettings] = useState<ProfileSettings>(DEFAULT_PROFILE_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Form Fields
  const [resumeUrl, setResumeUrl] = useState('');
  const [calendlyUrl, setCalendlyUrl] = useState('');
  const [targetRolesStr, setTargetRolesStr] = useState('');
  const [noticePeriod, setNoticePeriod] = useState('');
  const [locationPreference, setLocationPreference] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);

  // Live preview modal/toggle
  const [showEmbedPreview, setShowEmbedPreview] = useState(false);
  const [sqlCopied, setSqlCopied] = useState(false);

  useEffect(() => {
    ProfileConfigService.getSettings().then((data) => {
      setSettings(data);
      setResumeUrl(data.resumeUrl || '');
      setCalendlyUrl(data.calendlyUrl || '');
      setTargetRolesStr((data.targetRoles || []).join(', '));
      setNoticePeriod(data.noticePeriod || '');
      setLocationPreference(data.locationPreference || '');
      setIsAvailable(data.isAvailable !== false);
      setLoading(false);
    });
  }, []);

  const driveId = extractGoogleDriveId(resumeUrl);
  const previewUrl = driveId ? getGoogleDrivePreviewUrl(resumeUrl) : resumeUrl;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    const roles = targetRolesStr
      .split(',')
      .map((r) => r.trim())
      .filter(Boolean);

    const updates: Partial<ProfileSettings> = {
      resumeUrl: resumeUrl.trim(),
      calendlyUrl: calendlyUrl.trim(),
      targetRoles: roles.length > 0 ? roles : DEFAULT_PROFILE_SETTINGS.targetRoles,
      noticePeriod: noticePeriod.trim() || DEFAULT_PROFILE_SETTINGS.noticePeriod,
      locationPreference: locationPreference.trim() || DEFAULT_PROFILE_SETTINGS.locationPreference,
      isAvailable,
    };

    const result = await ProfileConfigService.saveSettings(updates);
    setSaving(false);

    if (result.success) {
      setSaveSuccess(true);
      setSettings((prev) => ({ ...prev, ...updates }));
      setTimeout(() => setSaveSuccess(false), 3500);
    } else {
      setSaveError(
        result.error 
          ? `Saved to local storage, but Supabase sync reported: ${result.error}. (Run the SQL setup below in Supabase SQL editor to enable cloud sync).`
          : 'Unable to save to Supabase. Settings have been saved locally.'
      );
    }
  };

  const copySql = () => {
    const sql = `-- Supabase Table for Site Settings
CREATE TABLE IF NOT EXISTS public.site_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view site settings" ON public.site_settings;
CREATE POLICY "Public can view site settings" ON public.site_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated users have full write access to site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Only site owner can manage site settings" ON public.site_settings;
CREATE POLICY "Only site owner can manage site settings" ON public.site_settings FOR ALL TO authenticated USING (lower(auth.jwt() ->> 'email') = 'mohitxsharma09@gmail.com') WITH CHECK (lower(auth.jwt() ->> 'email') = 'mohitxsharma09@gmail.com');`;

    navigator.clipboard.writeText(sql);
    setSqlCopied(true);
    setTimeout(() => setSqlCopied(false), 2500);
  };

  if (loading) {
    return (
      <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-xs font-mono text-slate-500">Loading profile configuration...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            <span className="text-xs font-mono font-bold text-blue-600 uppercase">
              Hiring &amp; Recruiter Settings
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950">
            Resume &amp; Interview Booking Links
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
            Update your Google Drive resume link and 15-minute intro meeting URL. The website will automatically embed and render the PDF directly for recruiters and hiring managers.
          </p>
        </div>

        {/* Status Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 self-start md:self-auto text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Live Cloud Sync Ready</span>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <h3 className="text-sm font-mono uppercase tracking-wider font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <span>1. Google Drive Resume Link</span>
          </h3>

          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-700">
              Google Drive Shareable Link (View Permission)
            </label>
            <div className="relative">
              <input
                type="url"
                value={resumeUrl}
                onChange={(e) => setResumeUrl(e.target.value)}
                placeholder="https://drive.google.com/file/d/1A2B3C4D5E.../view?usp=sharing"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50"
              />
            </div>

            {/* Link Detection Badge */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
              {driveId ? (
                <div className="inline-flex items-center gap-1.5 text-emerald-700 font-mono bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Valid Google Drive File ID detected: <strong>{driveId}</strong></span>
                </div>
              ) : resumeUrl ? (
                <div className="inline-flex items-center gap-1.5 text-amber-700 font-mono bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Direct URL configured (non-Drive link)</span>
                </div>
              ) : (
                <span className="text-slate-400 font-mono text-[11px]">
                  Paste any share link from Google Drive.
                </span>
              )}

              {resumeUrl && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowEmbedPreview(!showEmbedPreview)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{showEmbedPreview ? 'Hide Embed Preview' : 'Test Live Embed Preview'}</span>
                  </button>

                  <a
                    href={resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors"
                  >
                    <span>Open Link</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                </div>
              )}
            </div>

            {/* Live Embed Test Frame */}
            {showEmbedPreview && resumeUrl && (
              <div className="mt-4 border border-blue-200 rounded-2xl overflow-hidden bg-slate-100 p-2 shadow-inner">
                <div className="flex items-center justify-between pb-2 px-2 text-xs font-mono text-slate-600">
                  <span>Interactive In-Site Preview:</span>
                  <span className="text-emerald-600 font-bold">Previewing as rendered for recruiters</span>
                </div>
                <div className="w-full h-96 rounded-xl overflow-hidden bg-white border border-slate-200">
                  <iframe
                    src={previewUrl}
                    title="Live Resume Embed Preview"
                    className="w-full h-full border-0"
                    allow="autoplay"
                  />
                </div>
              </div>
            )}

            {/* Google Drive Tip Box */}
            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80 text-xs text-blue-950 space-y-1.5">
              <div className="font-bold flex items-center gap-1.5 text-blue-900">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>Google Drive Sharing Tip</span>
              </div>
              <p className="leading-relaxed text-blue-900/80">
                In Google Drive, right-click your Resume PDF &rarr; click <strong>Share</strong> &rarr; change <em>General access</em> to <strong>"Anyone with the link"</strong> with <strong>Viewer</strong> role. Then click <strong>"Copy link"</strong> and paste it above!
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Meeting Link & Availability */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <h3 className="text-sm font-mono uppercase tracking-wider font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <span>2. 15-Minute Intro Chat Link &amp; Hiring Status</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Calendly / Cal.com URL */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Cal.com or Calendly URL
              </label>
              <input
                type="url"
                value={calendlyUrl}
                onChange={(e) => setCalendlyUrl(e.target.value)}
                placeholder="https://cal.com/mohitsharma or https://calendly.com/..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50"
              />
              <p className="text-[11px] text-slate-500">
                Displayed on the Contact page &amp; Recruiter card so recruiters can book directly.
              </p>
            </div>

            {/* Notice Period */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Notice Period / Availability
              </label>
              <input
                type="text"
                value={noticePeriod}
                onChange={(e) => setNoticePeriod(e.target.value)}
                placeholder="e.g. Immediately Available / 15 Days"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50"
              />
            </div>

            {/* Location Preference */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Location &amp; Work Mode Preference
              </label>
              <input
                type="text"
                value={locationPreference}
                onChange={(e) => setLocationPreference(e.target.value)}
                placeholder="Bhopal, India • Open to Worldwide Remote & Relocation"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50"
              />
            </div>

            {/* Target Roles */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Target Roles (comma-separated)
              </label>
              <input
                type="text"
                value={targetRolesStr}
                onChange={(e) => setTargetRolesStr(e.target.value)}
                placeholder="AI Engineer, Computer Vision Specialist, MLOps Engineer"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50"
              />
            </div>
          </div>

          {/* Availability Toggle */}
          <div className="pt-2 flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-slate-900">
                Actively Open to Work / Interviewing
              </div>
              <div className="text-xs text-slate-500">
                Shows the animated green pulse on the website indicating active availability.
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsAvailable(!isAvailable)}
              className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                isAvailable ? 'bg-emerald-600' : 'bg-slate-300'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  isAvailable ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Notifications & Submit */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex-1">
            {saveSuccess && (
              <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50 px-4 py-2.5 rounded-xl border border-emerald-200 shadow-2xs">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Profile &amp; resume settings saved and synced successfully!</span>
              </div>
            )}
            {saveError && (
              <div className="text-xs text-amber-800 bg-amber-50 p-3 rounded-xl border border-amber-200">
                {saveError}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl transition-all shadow-xs disabled:opacity-50 cursor-pointer"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving to Cloud...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save All Profile Changes</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Supabase SQL Setup Card */}
      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-800">
            <ShieldCheck className="w-4 h-4 text-slate-600" />
            <span>Supabase Cloud Sync Table Setup</span>
          </div>
          <button
            type="button"
            onClick={copySql}
            className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors cursor-pointer"
          >
            {sqlCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{sqlCopied ? 'SQL Copied!' : 'Copy SQL for Supabase'}</span>
          </button>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          To enable automatic multi-device cloud synchronization for your resume and meeting links, run this one-time SQL script in your Supabase SQL Editor.
        </p>
      </div>
    </div>
  );
};
