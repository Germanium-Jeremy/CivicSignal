import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

interface Issue {
    _id: string;
    title: string;
    description?: string;
    category: string;
    priority: 'High' | 'Medium' | 'Low';
    status: 'submitted' | 'acknowledged' | 'pending' | 'resolved';
    submittedAt: string;
    createdAt: string;
     trackingNumber: string;
     photos: { url: string }[];
}

const IssueDetails = () => {
     const { id } = useParams();
     const [issue, setIssue] = useState<Issue | null>(null);
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState('');

     useEffect(() => {
          const fetchIssueDetails = async () => {
               try {
                    const response = await axios.get(`/api/issues/${id}`);
                    setIssue(response.data);
               } catch (err) {
                    setError("Failed to fetch issue details.");
               } finally {
                    setLoading(false);
               }
          };

          fetchIssueDetails();
     }, [id]);

     if (loading) return <div>Loading...</div>;
     if (error) return <div>{error}</div>;

     return (
          <div style={{ padding: "20px" }}>
               <h1>Issue Details</h1>
               {issue && (
                    <div>
                         <h2>{issue.title}</h2>
                         <p>{issue.description}</p>
                         <p>Status: {issue.status}</p>
                         <div>
                              <h3>Media Files</h3>
                              <div style={{ display: "flex", gap: "10px" }}>
                                   {issue.photos && issue.photos.map((photo, index) => (
                                        <img key={index} src={photo.url} alt={`Media ${index + 1}`} style={{ width: "200px", height: "auto", borderRadius: "8px" }} />
                                   ))}
                              </div>
                         </div>
                    </div>
               )}
          </div>
     );
};

export default IssueDetails;
