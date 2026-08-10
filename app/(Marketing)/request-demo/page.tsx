"use client";

import React, { useState } from "react";
import { Navbar } from "../_components/navbar";
import { Footer } from "../_components/footer";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Building2, Users, Shield } from "lucide-react";

export default function RequestDemoPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    companySize: "50-200",
    role: "Engineering Lead",
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <main className="relative min-h-screen bg-white text-black">
      <Navbar />

      <section className="mx-auto max-w-[1120px] px-5 pt-12 pb-20">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-start">
          {/* Left Column - Information & Social Proof */}
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#0078df]">
              Get In Touch
            </span>
            <h1 className="mt-3 text-[36px] font-[850] tracking-tight text-[#050505] sm:text-[48px] leading-[1.15]">
              See how Notion transforms enterprise productivity.
            </h1>
            <p className="mt-4 text-base text-neutral-600 leading-relaxed">
              Schedule a personalized walkthrough with a Notion product expert to learn how to unify docs, projects, and custom AI routines for your organization.
            </p>

            <div className="mt-10 flex flex-col gap-6">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0078df] border border-blue-100">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-neutral-900 text-sm">Custom Enterprise Setup</h3>
                  <p className="text-xs text-neutral-600 mt-0.5">Custom domain, workspace migration assistance, and team space governance.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-neutral-900 text-sm">Security & Compliance Review</h3>
                  <p className="text-xs text-neutral-600 mt-0.5">SAML SSO, SCIM provisioning, audit logs, SOC 2 Type II reports, and DLP.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-neutral-900 text-sm">Dedicated Account Support</h3>
                  <p className="text-xs text-neutral-600 mt-0.5">Dedicated Customer Success Manager and 24/7 priority SLA support.</p>
                </div>
              </div>
            </div>

            <div className="mt-10 rounded-2xl border border-neutral-200 bg-neutral-50 p-6">
              <p className="text-xs italic text-neutral-700 leading-relaxed">
                &quot;Notion has eliminated context switching across our 500+ engineering team. Having docs, tasks, and AI search in one place saved us hundreds of hours.&quot;
              </p>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                  M
                </div>
                <div>
                  <h4 className="text-xs font-bold text-neutral-900">Michael Truell</h4>
                  <p className="text-[11px] text-neutral-500">Co-founder & CEO, Cursor</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Form */}
          <div className="rounded-3xl border border-neutral-200 bg-white p-8 shadow-xl">
            {submitted ? (
              <div className="py-12 text-center">
                <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-500" />
                <h3 className="mt-4 text-2xl font-extrabold text-neutral-900">Demo Request Received!</h3>
                <p className="mt-2 text-sm text-neutral-600 max-w-sm mx-auto">
                  Thank you, <span className="font-bold text-black">{formData.firstName}</span>. A Notion Enterprise specialist will reach out to <span className="font-bold text-black">{formData.email}</span> within 24 hours.
                </p>
                <Button
                  onClick={() => setSubmitted(false)}
                  className="mt-6 rounded-lg bg-neutral-900 px-6 font-bold text-white hover:bg-black"
                >
                  Submit Another Request
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <h3 className="text-xl font-bold text-neutral-900">Request your demo</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-neutral-700">First Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      placeholder="Jane"
                      className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-black outline-none focus:border-[#0078df] focus:ring-1 focus:ring-[#0078df]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-neutral-700">Last Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      placeholder="Doe"
                      className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-black outline-none focus:border-[#0078df] focus:ring-1 focus:ring-[#0078df]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-700">Work Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="jane@company.com"
                    className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-black outline-none focus:border-[#0078df] focus:ring-1 focus:ring-[#0078df]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-neutral-700">Company Size</label>
                    <select
                      value={formData.companySize}
                      onChange={(e) => setFormData({ ...formData, companySize: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-black outline-none focus:border-[#0078df]"
                    >
                      <option value="1-20">1 - 20 employees</option>
                      <option value="20-50">20 - 50 employees</option>
                      <option value="50-200">50 - 200 employees</option>
                      <option value="200-1000">200 - 1,000 employees</option>
                      <option value="1000+">1,000+ employees</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-neutral-700">Your Role</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-black outline-none focus:border-[#0078df]"
                    >
                      <option value="Engineering Lead">Engineering Lead</option>
                      <option value="Product Manager">Product Manager</option>
                      <option value="Executive / Founder">Executive / Founder</option>
                      <option value="Operations">Operations</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-700">How can Notion help your team?</label>
                  <textarea
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Tell us about your team's current setup, goals, or questions..."
                    className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-black outline-none focus:border-[#0078df] focus:ring-1 focus:ring-[#0078df]"
                  />
                </div>

                <Button
                  type="submit"
                  className="mt-2 h-11 w-full rounded-lg bg-[#0078df] text-sm font-bold text-white hover:bg-[#006dcc]"
                >
                  Submit Demo Request
                </Button>
              </form>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
