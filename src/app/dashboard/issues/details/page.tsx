"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";

interface User {
     fullName: string;
     email: string;
     profileImage?: string;
}

interface Issue {
     _id: string;
     title: string;
     description?: string;
     category: string;
     priority: "High" | "Medium" | "Low";
     status: "submitted" | "acknowledged" | "pending" | "resolved";
     submittedAt: string;
     createdAt: string;
     trackingNumber: string;
     photos: { url: string }[];
     reportedBy: string; // User ID
}

const IssueDetailsPage = () => {
     const searchParams = useSearchParams();
     const issueId = searchParams.get("issue_id");
     const [issue, setIssue] = useState<Issue | null>(null);
     const [reporter, setReporter] = useState<User | null>(null);
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState("");

     useEffect(() => {
          const fetchIssueDetails = async () => {
               if (!issueId) {
                    setError("Issue ID is missing.");
                    setLoading(false);
                    return;
               }

               try {
                    const response = await axios.get(`/api/issues/${issueId}`);
                    const fetchedIssue = response.data.data.issue;
                    setIssue(fetchedIssue);

                    // Fetch user details if reportedBy is a user ID
                    if (fetchedIssue.reportedBy) {
                         const userResponse = await axios.get(
                              `/api/user/profile?userId=${fetchedIssue.reportedBy}`, 
                              { headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` } }
                         );
                         setReporter(userResponse.data.user);
                    }
               } catch (err) {
                    setError("Failed to fetch issue details.");
               } finally {
                    setLoading(false);
               }
          };

          fetchIssueDetails();
     }, [issueId]);

     if (loading) return <div className="text-center py-10">Loading...</div>;
     if (error) return <div className="text-center py-10 text-red-500">{error}</div>;

     return (
          <div className="p-6 bg-gray-50 min-h-screen">
               <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6">
                    <h1 className="text-2xl font-bold mb-4">Issue Details</h1>
                    {issue && (
                         <div>
                              <h2 className="text-xl font-semibold mb-2">{issue.title}</h2>
                              <p className="text-gray-700 mb-4">{issue.description || "No description provided."}</p>
                              <div className="grid grid-cols-2 gap-4 mb-4">
                                   <div>
                                        <p className="text-sm text-gray-500">Status:</p>
                                        <p className="text-sm font-medium capitalize">{issue.status}</p>
                                   </div>
                                   <div>
                                        <p className="text-sm text-gray-500">Priority:</p>
                                        <p className="text-sm font-medium capitalize">{issue.priority}</p>
                                   </div>
                                   <div>
                                        <p className="text-sm text-gray-500">Category:</p>
                                        <p className="text-sm font-medium">{issue.category}</p>
                                   </div>
                                   <div>
                                        <p className="text-sm text-gray-500">Submitted At:</p>
                                        <p className="text-sm font-medium">{new Date(issue.submittedAt).toLocaleString()}</p>
                                   </div>
                              </div>
            
                              <div className="mb-4">
                                   <h3 className="text-lg font-semibold mb-2">Reported By</h3>
                                   {reporter ? (
                                        <div className="flex items-center gap-4">
                                             {reporter.profileImage && (
                                                  <img src={reporter.profileImage} alt="Reporter Profile" className="w-16 h-16 rounded-full object-cover border" />
                                             )}
                                             <div>
                                                  <p className="text-sm font-medium">{reporter.fullName}</p>
                                                  <p className="text-sm text-gray-500">{reporter.email}</p>
                                             </div>
                                        </div>
                                   ) : (
                                        <p className="text-sm text-gray-500">Reporter details not available.</p>
                                   )}
                              </div>
                              
                              <div>
                                   <h3 className="text-lg font-semibold mb-2">Media Files</h3>
                                   <div className="grid grid-cols-3 gap-4">
                                        {issue.photos && issue.photos.map((photo, index) => (
                                             <img key={index} src={photo.url} alt={`Media ${index + 1}`} className="w-full h-auto rounded-lg shadow-md" />
                                        ))}
                                   </div>
                              </div>
                         </div>
                    )}
               </div>
          </div>
     );
};

export default IssueDetailsPage;
