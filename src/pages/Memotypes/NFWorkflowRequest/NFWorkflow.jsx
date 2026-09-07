import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { approveorrejectRequest } from "../../../services/requestservice";
import InputField from "../../../components/InputField";
import TextAreaField from "../../../components/TextAreaField";
import { buildWorkflowPayload } from "../../../utils/payloadBuilder";
import { REQUEST_STATUS } from "../../../utils/constants";
import "./NFWorkflow.css";

export default function NFWorkflow() {
  const navigate = useNavigate();
  const location = useLocation();

  //const [approverRemarks, setApproverRemarks] = useState("Approved");
  const [approverRemarks, setApproverRemarks] = useState(""); // Default to empty string
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  // Extract response data passed via React Router location state
  const requestData = location.state?.requestData;
  const record = requestData?.records?.[0];
  const activeTab = location.state?.activeTab;

  // Extract second approver (Sequence 1)
  const approverRecord = record?.approvar?.[1] || record?.approvar?.[0] || {};

  // Helper function to decode Base64 'description' field
  const decodeBase64 = (base64Str) => {
    if (!base64Str) return "";
    try {
      return decodeURIComponent(
        atob(base64Str)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join(""),
      );
    } catch {
      try {
        return atob(base64Str);
      } catch {
        return base64Str;
      }
    }
  };

  const rawDescription = record?.requestdetails?.[0]?.description || "";
  const decodedDetails = decodeBase64(rawDescription);

  // Handle Approve Action
  const handleApprove = async () => {
    if (!record) return;

    try {
      setIsApproving(true);

      // Retrieve logged-in user info from localStorage or fallback
      const empNumber = localStorage.getItem("empNumber") || "100205";
      const storedUserInfo = JSON.parse(
        localStorage.getItem("userInfo") || "{}",
      );
      const currentUserName = storedUserInfo.Display_Name || "Suresh Injeti";

      // Construct full approval payload via builder utility
      const payload = buildWorkflowPayload({
        record,
        statusCode: REQUEST_STATUS.APPROVED,
        approverRemarks,
        empNumber,
        currentUserName,
      });

      console.log("Sending Formatted Payload:", payload);
      const response = await approveorrejectRequest(payload);
      console.log("Approve Response:", response.data);

      alert("Request Approved Successfully!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error approving request:", error);
      alert("Failed to approve request. Please try again.");
    } finally {
      setIsApproving(false);
    }
  };

  // Handle Reject Action
  const handleReject = async () => {
    if (!record) return;

    try {
      setIsRejecting(true);

      // Retrieve logged-in user info from localStorage or fallback
      const empNumber = localStorage.getItem("empNumber") || "100205";
      const storedUserInfo = JSON.parse(
        localStorage.getItem("userInfo") || "{}",
      );
      const currentUserName = storedUserInfo.Display_Name || "Suresh Injeti";

      // Construct full rejection payload via builder utility
      const payload = buildWorkflowPayload({
        record,
        statusCode: REQUEST_STATUS.REJECTED,
        approverRemarks,
        empNumber,
        currentUserName,
      });

      console.log("Sending Formatted Payload:", payload);
      const response = await approveorrejectRequest(payload);
      console.log("Approve Response:", response.data);

      alert("Request Rejected Successfully!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error rejecting request:", error);
      alert("Failed to reject request. Please try again.");
    } finally {
      setIsRejecting(false);
    }
  };

  if (!record) {
    return (
      <div className="create-page-container">
        <header className="create-header">
          <button className="btn-back" onClick={() => navigate("/dashboard")}>
            ← Back
          </button>
          <h2>View Request</h2>
        </header>
        <div className="form-workspace">
          <div
            className="form-card"
            style={{ textAlign: "center", padding: "40px" }}
          >
            <p>No request details found. Please navigate from the Dashboard.</p>
            <button
              className="btn-submit"
              onClick={() => navigate("/dashboard")}
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="create-page-container">
      {/* Top Header */}
      <header className="create-header">
        <div className="header-left">
          <button
            type="button"
            className="btn-back"
            onClick={() => navigate("/dashboard")}
          >
            ← Back
          </button>
          <h2>View Request Form</h2>
          <span className="count-pill" style={{ marginLeft: "10px" }}>
            {record.axisrequestid}
          </span>
        </div>

        {activeTab === "pending" && (
          <div className="header-actions">
            <button
              type="button"
              className="btn-outline"
              onClick={() => navigate("/dashboard")}
            >
              Cancel
            </button>

            <button
              type="button"
              className="btn-submit"
              onClick={handleApprove}
              disabled={isApproving || isRejecting}
            >
              {isApproving ? "Approving..." : "Approve"}
            </button>

            <button
              type="button"
              className="btn-submit"
              onClick={handleReject}
              disabled={isApproving || isRejecting}
            >
              {isRejecting ? "Rejecting..." : "Reject"}
            </button>
          </div>
        )}
      </header>

      {/* Main Form Content */}
      <div className="form-workspace">
        <div className="form-card">
          {/* Header Bar */}
          <div className="form-meta-row">
            <div className="meta-field-group">
              <div className="meta-field">
                <label>Memo Type</label>
                <input
                  type="text"
                  value={record.memoname || "Non - Financial"}
                  readOnly
                  disabled
                />
              </div>
            </div>

            {/* Initiator Badge */}
            <div className="initiator-badge">
              <div className="initiator-avatar">
                {record.initiatorname
                  ? record.initiatorname
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .substring(0, 2)
                    .toUpperCase()
                  : "IN"}
              </div>
              <div className="initiator-info">
                <span className="initiator-label">Initiator</span>
                <span className="initiator-name">{record.initiatorname}</span>
                <span className="initiator-sub">
                  Emp ID: {record.initiatorid} | {record.initiatordept}
                </span>
              </div>
            </div>
          </div>

          <hr className="section-divider" />

          {/* Section 1: Approver Line-Up */}
          <div className="form-section">
            <h4 className="section-title">
              Approver Line-Up <span className="title-sub">(Sequence 1)</span>
            </h4>

            <div className="approver-row">
              <div className="row-number">1</div>

              <InputField
                label="Emp ID"
                className="flex-1"
                value={approverRecord.approvarid || ""}
                readOnly
                disabled
              />

              <InputField
                label="Emp Name"
                className="flex-2"
                value={approverRecord.approvarname || ""}
                readOnly
                disabled
              />

              <InputField
                label="Department"
                className="flex-2"
                value={approverRecord.approvardeptname || ""}
                readOnly
                disabled
              />
            </div>
          </div>

          <hr className="section-divider" />

          {/* Section 2: Subject Line */}
          <div className="form-section">
            <InputField
              label="Subject Line"
              value={record.subject || ""}
              readOnly
              disabled
            />
          </div>

          {/* Section 3: Details */}
          <div className="form-section">
            <TextAreaField
              label="Details"
              rows={6}
              value={decodedDetails}
              readOnly
              disabled
            />
          </div>

          {/* Section 4: Initiator Remarks */}
          <div className="form-section">
            <TextAreaField
              label="Initiator Remarks / Recommendations"
              rows={3}
              value={record.initiatorremarks || ""}
              readOnly
              disabled
            />
          </div>

          <hr className="section-divider" />

          {/* Section 5: Approver Action Remarks */}
          {activeTab === "pending" && (
            <TextAreaField
              label="Approver Remarks / Action Comments"
              rows={3}
              placeholder="Enter remarks for approval..."
              value={approverRemarks}
              onChange={(e) => setApproverRemarks(e.target.value)}
            />
          )}
        </div>
      </div>
    </div>
  );
}