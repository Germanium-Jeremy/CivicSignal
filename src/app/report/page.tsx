"use client";

import React from "react";
import DynamicIssueForm from "@/components/dashboard/DynamicIssueForm";
import Header from "@/app/landing/header";
import FooterMain from "@/app/landing/footerMain";

export default function ReportPage() {
  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <Header />
      
      <main className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
              Report a <span className="text-blue-600">Civic Issue</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Help us improve our community by reporting issues directly to the concerned agencies. 
              Our enterprise system ensures your reports are routed efficiently based on category and priority.
            </p>
          </div>

          <DynamicIssueForm />
        </div>
      </main>

      <FooterMain />
    </div>
  );
}
