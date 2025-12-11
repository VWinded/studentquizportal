import React, { useEffect, useState } from "react";
import { API } from "./api";
import "./live.css";

export default function AdminLiveApprovals({ setPage }) {
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState("pending"); // pending | approved | rejected | all

  const loadData = () => {
    fetch(API + "/live_get_attempts.php")
      .then((res) => res.json())
      .then((rows) => setData(Array.isArray(rows) ? rows.reverse() : []))
      .catch(() => setData([]));
  };

  useEffect(() => {
    loadData();
  }, []);

  const approve = async (email, date) => {
    await fetch(API + "/live_approve.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, date }),
    });
    loadData();
  };

  const reject = async (email, date) => {
    await fetch(API + "/live_reject.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, date }),
    });
    loadData();
  };

  const downloadCSV = () => {
    window.location.href = API + "/live_export_csv.php";
  };

  const uploadCSV = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("csv", file);

    await fetch(API + "/live_import_csv.php", {
      method: "POST",
      body: formData,
    });

    alert("CSV Imported Successfully");
    loadData();
  };

  // Filter rows
  const filteredRows =
    filter === "all"
      ? data
      : data.filter((r) => (r.status || "pending") === filter);

  return (
    <div className="live-approvals-page">
      <button className="back-btn" onClick={() => setPage("dashboard")}>
        ⬅ Back
      </button>

      <h2>📑 Live Quiz Approvals</h2>

      {/* ⭐ FILTER BUTTONS GROUPED WITH BETTER ALIGNMENT */}
      <div className="filter-buttons">
        <button
          className={filter === "pending" ? "active" : ""}
          onClick={() => setFilter("pending")}
        >
          PENDING
        </button>

        <button
          className={filter === "approved" ? "active" : ""}
          onClick={() => setFilter("approved")}
        >
          APPROVED
        </button>

        <button
          className={filter === "rejected" ? "active" : ""}
          onClick={() => setFilter("rejected")}
        >
          REJECTED
        </button>

        <button
          className={filter === "all" ? "active" : ""}
          onClick={() => setFilter("all")}
        >
          ALL
        </button>
      </div>

      {/* ⭐ CSV BUTTONS */}
      <div className="csv-buttons">
        <button className="download-btn" onClick={downloadCSV}>
          ⬇ Download CSV
        </button>

        <label className="import-btn">
          ⬆ Import CSV
          <input
            type="file"
            accept=".csv"
            onChange={uploadCSV}
            style={{ display: "none" }}
          />
        </label>
      </div>

      <table className="approval-table">
        <thead>
          <tr>
            <th>#</th>
            <th>User</th>
            <th>Email</th>
            <th>Platform</th>
            <th>Subject</th> {/* ADDED */}
            <th>Score</th>
            <th>Date</th>
            <th>Status</th>
            <th>Proof</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {filteredRows.length === 0 ? (
            <tr>
              <td colSpan="10" style={{ textAlign: "center" }}>
                No records found
              </td>
            </tr>
          ) : (
            filteredRows.map((r, i) => {
              // safe values
              const score = r.score ?? "-";
              const total = r.total ?? "-";
              const subject = r.subject ?? "-";
              return (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>{r.user}</td>
                  <td>{r.email}</td>
                  <td>{r.platform}</td>
                  <td>{subject}</td>
                  <td>
                    {score} {total !== "-" && <>/ {total}</>}
                  </td>
                  <td>{r.date}</td>
                  <td className={`status ${r.status}`}>{r.status}</td>

                  <td>
                    {r.proof && r.proof !== "Imported via CSV" ? (
                      <a
                        href={`${API}/uploads/live_proofs/${r.proof}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View
                      </a>
                    ) : (
                      r.proof || "-"
                    )}
                  </td>

                  <td>
                    {r.status === "pending" ? (
                      <>
                        <button
                          className="approve-btn"
                          onClick={() => approve(r.email, r.date)}
                        >
                          Approve
                        </button>

                        <button
                          className="reject-btn"
                          onClick={() => reject(r.email, r.date)}
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <span>—</span>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
