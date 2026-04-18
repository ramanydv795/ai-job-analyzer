import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useState } from "react";
import axios from "axios";

export default function App() {
  const [resume, setResume] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  const analyze = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post("https://ai-job-analyzer-backend.onrender.com/api/analyze", {
        resume,
        jobDescription,
      });
      setResult(response.data);
    } catch (err) {
      setError("Analysis failed. Please try again.");
    }
    setLoading(false);
  };

  const exportPDF = async () => {
    const element = document.getElementById("results");
    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, width, height);
    pdf.save("job-analysis-report.pdf");
  };

  const handlePDFUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPdfLoading(true);
    const formData = new FormData();
    formData.append('resume', file);
    const response = await axios.post(
      "https://ai-job-analyzer-backend.onrender.com/api/upload-resume",
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' }}
    );
    setResume(response.data.text);
    setPdfLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">

      {/* Header */}
      <h1 className="text-4xl font-bold text-center mb-2">
        AI Job Analyzer
      </h1>
      <p className="text-center text-gray-400 mb-8">
        Two AI agents — Critic vs Coach — analyze your resume
      </p>

      {/* Input Section */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        
        {/* Resume Side */}
        <div className="flex flex-col">
          <p className="text-gray-400 mb-2 text-sm">Your Resume</p>
          <label className="flex items-center gap-2 bg-gray-700 
            hover:bg-gray-600 px-4 py-2 rounded-lg cursor-pointer 
            text-sm mb-2 w-fit transition">
            📄 {pdfLoading ? "Extracting..." : "Upload PDF Resume"}
            <input
              type="file"
              accept=".pdf"
              onChange={handlePDFUpload}
              className="hidden"
            />
          </label>
          <textarea
            className="bg-gray-800 rounded-xl p-4 flex-1 
            resize-none outline-none w-full text-sm min-h-56"
            placeholder="Or paste your resume here..."
            value={resume}
            onChange={(e) => setResume(e.target.value)}
          />
        </div>

        {/* Job Description Side */}
        <div className="flex flex-col">
          <p className="text-gray-400 mb-2 text-sm">Job Description</p>
          {/* Spacer to match upload button height */}
          <div className="h-9 mb-2"/>
          <textarea
            className="bg-gray-800 rounded-xl p-4 flex-1 
            resize-none outline-none w-full text-sm min-h-56"
            placeholder="Paste job description here..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
        </div>

      </div>

      {/* Analyze Button */}
      <button
        onClick={analyze}
        disabled={loading || !resume || !jobDescription}
        className="w-full bg-blue-600 hover:bg-blue-700 
        disabled:opacity-50 disabled:cursor-not-allowed
        py-3 rounded-xl font-semibold text-lg transition mb-8"
      >
        {loading ? "Two AI Agents Analyzing..." : "Analyze My Application"}
      </button>

      {/* Error */}
      {error && (
        <div className="bg-red-500/20 border border-red-500 
        rounded-xl p-4 mb-4 text-red-400 text-center">
          {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div id="results" className="space-y-4">

          {/* Export Button */}
          <button
            onClick={exportPDF}
            className="w-full bg-purple-600 hover:bg-purple-700 
            py-3 rounded-xl font-semibold text-lg transition mb-4"
          >
            📄 Export PDF Report
          </button>

          {/* Scores Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-800 rounded-xl p-6">
              <p className="text-gray-400 mb-1 text-sm">Match Score</p>
              <p className="text-5xl font-bold text-blue-400">
                {result.matchScore}
                <span className="text-2xl text-gray-400">/100</span>
              </p>
            </div>
            <div className="bg-gray-800 rounded-xl p-6">
              <p className="text-gray-400 mb-1 text-sm">AI Bot Score</p>
              <p className="text-5xl font-bold text-yellow-400">
                {result.aiBotScore}
              </p>
              <p className="text-gray-500 text-xs mt-1">
                How robotic your resume sounds
              </p>
            </div>
          </div>

          {/* Critic vs Coach */}
          <div className="grid grid-cols-2 gap-4">

            {/* Critic */}
            <div className="bg-red-950/30 border border-red-800/50 rounded-xl p-6">
              <h2 className="text-red-400 font-bold text-lg mb-4">
                🔴 The Critic
              </h2>
              <p className="text-gray-400 text-sm mb-2">Missing Skills</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {result.missingSkills?.map((skill, i) => (
                  <span key={i}
                    className="bg-red-500/20 text-red-400 
                    px-3 py-1 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
              <p className="text-gray-400 text-sm mb-2">Rejection Reasons</p>
              <ul className="space-y-2">
                {result.rejectionReasons?.map((reason, i) => (
                  <li key={i} className="text-red-300 text-sm flex gap-2">
                    <span>•</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Coach */}
            <div className="bg-green-950/30 border border-green-800/50 rounded-xl p-6">
              <h2 className="text-green-400 font-bold text-lg mb-4">
                🟢 The Coach
              </h2>
              <p className="text-gray-400 text-sm mb-2">Strengths</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {result.profileStrengths?.map((strength, i) => (
                  <span key={i}
                    className="bg-green-500/20 text-green-400 
                    px-3 py-1 rounded-full text-sm">
                    {strength}
                  </span>
                ))}
              </div>
              <p className="text-gray-400 text-sm mb-2">Recommended Roles</p>
              <div className="flex flex-wrap gap-2">
                {result.recommendedJobTitles?.map((title, i) => (
                  <span key={i}
                    className="bg-blue-500/20 text-blue-400 
                    px-3 py-1 rounded-full text-sm">
                    {title}
                  </span>
                ))}
              </div>
            </div>

          </div>

          {/* Micro Skill Bridge */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h2 className="text-white font-bold text-lg mb-4">
              ⚡ Micro Skill Bridge
            </h2>
            <p className="text-gray-400 text-sm mb-4">
              Bridge your skill gaps with these quick projects
            </p>
            <div className="space-y-3">
              {result.microSkillBridge?.map((item, i) => (
                <div key={i}
                  className="bg-gray-700 rounded-lg p-4 
                  flex justify-between items-center gap-4">
                  <span className="text-yellow-400 font-medium min-w-fit">
                    {item.skill}
                  </span>
                  <span className="text-gray-300 text-sm text-right">
                    {item.project}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Skill Gap Analysis */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h2 className="text-white font-bold text-lg mb-2">
              📊 Skill Gap Analysis
            </h2>
            <p className="text-gray-300 leading-relaxed text-sm">
              {result.skillGapAnalysis}
            </p>
          </div>

          {/* Overall Verdict */}
          <div className="bg-blue-950/30 border border-blue-800/50 rounded-xl p-6">
            <h2 className="text-blue-400 font-bold text-lg mb-2">
              🎯 Overall Verdict
            </h2>
            <p className="text-gray-300">{result.overallVerdict}</p>
          </div>

          {/* Fix it Editor */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h2 className="text-white font-bold text-lg mb-1">
              ✏️ Fix-it Editor
            </h2>
            <p className="text-gray-400 text-sm mb-4">
              Edit your resume and re-analyze to watch your score improve
            </p>
            <textarea
              className="bg-gray-700 rounded-xl p-4 h-48 
              resize-none outline-none w-full text-sm"
              value={resume}
              onChange={(e) => setResume(e.target.value)}
            />
            <button
              onClick={analyze}
              disabled={loading}
              className="mt-3 bg-green-600 hover:bg-green-700 
              disabled:opacity-50 px-6 py-2 rounded-lg 
              font-semibold transition"
            >
              {loading ? "Re-analyzing..." : "Re-analyze"}
            </button>
          </div>

        </div>
      )}
    </div>
  );
}