import React, { useState } from "react";
import { uploadCSV } from "../api/api";
import { supabase } from "../api/supabaseClient";

export default function UploadCSV() {
  const [file, setFile] = useState(null);
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a CSV file first!");
      return;
    }

    setLoading(true);
    try {
      // Get the current user from Supabase auth
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert("Please log in to upload files!");
        return;
      }

      const result = await uploadCSV(file);
      setResponse(result);
    } catch (err) {
      console.error("Upload failed:", err);
      setResponse({
        status: "error",
        message: err.response?.data?.detail || err.message || "Upload failed"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2>📂 Upload Transactions CSV</h2>
      <input type="file" accept=".csv" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={loading}>
        {loading ? "Uploading..." : "Upload"}
      </button>

      {response && (
        <div style={{
          ...styles.responseBox,
          backgroundColor: response.status === "error" ? "#ffebee" : response.status === "warning" ? "#fff3cd" : "#e8f5e8",
          borderColor: response.status === "error" ? "#f44336" : response.status === "warning" ? "#ffc107" : "#4caf50"
        }}>
          <strong>Status:</strong> {response.status} <br />
          <strong>Message:</strong> {response.message || "No message"} <br />
          {response.count !== undefined && <><strong>Imported:</strong> {response.count}<br /></>}
          {response.duplicates !== undefined && <><strong>Duplicates Skipped:</strong> {response.duplicates}<br /></>}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    marginTop: "2rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "1rem",
  },
  responseBox: {
    marginTop: "1rem",
    padding: "1rem",
    border: "1px solid #ccc",
    borderRadius: "8px",
    background: "#f8f8f8",
    width: "320px",
    textAlign: "left",
  },
};
