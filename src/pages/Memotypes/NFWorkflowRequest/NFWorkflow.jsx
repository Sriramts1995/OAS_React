import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { approveorrejectRequest } from "../../../services/requestservice";
import InputField from "../../../components/InputField";
import TextAreaField from "../../../components/TextAreaField";
import { buildWorkflowPayload, buildResubmitPayload } from "../../../utils/payloadBuilder";
import { REQUEST_STATUS } from "../../../utils/constants";
import "./NFWorkflow.css";

export default function NFWorkflow() {
  const navigate = useNavigate();
  const location = useLocation();

  //const [approverRemarks, setApproverRemarks] = useState("Approved");
  const [approverRemarks, setApproverRemarks] = useState(""); // Default to empty string
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isSendingBack, setIsSendingBack] = useState(false);
  const [isResubmitting, setIsResubmitting] = useState(false);

  // Extract response data passed via React Router location state
  const requestData = location.state?.requestData;
  const record = requestData?.records?.[0];
  const activeTab = location.state?.activeTab;

  // Editable state fields for Initiator Resubmission (Status 3)
  const [editSubject, setEditSubject] = useState("");
  const [editDetails, setEditDetails] = useState("");
  const [editRemarks, setEditRemarks] = useState("");

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

  // Initialize editable state when record is loaded
  useEffect(() => {
    if (record) {
      setEditSubject(record.subject || "");
      setEditDetails(decodedDetails || "");
      setEditRemarks(record.initiatorremarks || "");
    }
  }, [record, decodedDetails]);

  // Check if current user is initiator and request is in Sent Back status (3)
  const storedUserInfo = JSON.parse(
    localStorage.getItem("userInfo") || "{}",
  );
  const loggedInEmpId = storedUserInfo.EMPLOYEE_NUMBER || localStorage.getItem("empNumber");
  const isSentBackToInitiator =
    String(record?.status) === "3" && record?.initiatorid === loggedInEmpId;

  // Extract all dynamic approvers (Sequence 1, 2, 3...)
  const displayApprovers =
    record?.approvar?.filter((app) => app.sequence > 0) || [];

  // Format existing history comments into "From: "id", "name" and Comments: """
  const existingApproverComments = (record?.history || [])
    .filter((h) => h.fromstatus !== 0 && h.fromstatus !== 20 && h.remarks) // Exclude initial tracking entries
    .map((h) => `From: "${h.fromid}", "${h.fromname}" and Comments: "${h.remarks}"`)
    .join("\n");

  // Handle Approve Action
  const handleApprove = async () => {
    if (!record) return;

    try {
      setIsApproving(true);

      // Retrieve logged-in user info from localStorage or fallback
      const empNumber = storedUserInfo.EMPLOYEE_NUMBER || localStorage.getItem("empNumber");
      const currentUserName = storedUserInfo.Display_Name || "User";

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
      const empNumber = storedUserInfo.EMPLOYEE_NUMBER || localStorage.getItem("empNumber");
      const currentUserName = storedUserInfo.Display_Name || "User";

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

  // Handle Send Back Action (Status 3)
  const handleSendBack = async () => {
    if (!record) return;

    try {
      setIsSendingBack(true);

      const empNumber = storedUserInfo.EMPLOYEE_NUMBER || localStorage.getItem("empNumber");
      const currentUserName = storedUserInfo.Display_Name || "User";

      const payload = buildWorkflowPayload({
        record,
        statusCode: REQUEST_STATUS.SEND_BACK,
        approverRemarks,
        empNumber,
        currentUserName,
      });

      console.log("Sending Send Back Payload:", payload);
      const response = await approveorrejectRequest(payload);
      console.log("Send Back Response:", response.data);

      alert("Request Sent Back to Initiator Successfully!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error sending back request:", error);
      alert("Failed to send back request. Please try again.");
    } finally {
      setIsSendingBack(false);
    }
  };

  // Handle Resubmit / Update Action by Initiator (Status 3 -> Status 1)
  const handleResubmit = async () => {
    if (!record) return;

    if (!editSubject.trim() || !editDetails.trim()) {
      alert("Subject Line and Details cannot be empty.");
      return;
    }

    try {
      setIsResubmitting(true);

      const empNumber = storedUserInfo.EMPLOYEE_NUMBER || localStorage.getItem("empNumber");
      const currentUserName = storedUserInfo.Display_Name || "User";

      const payload = buildResubmitPayload({
        record,
        subject: editSubject,
        details: editDetails,
        remarks: editRemarks,
        empNumber,
        currentUserName,
      });

      console.log("Sending Resubmit Payload:", payload);
      const response = await approveorrejectRequest(payload);
      console.log("Resubmit Response:", response.data);

      alert("Request Resubmitted Successfully!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error resubmitting request:", error);
      alert("Failed to resubmit request. Please try again.");
    } finally {
      setIsResubmitting(false);
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

  // Condition to check if overall request status allows showing tickmarks (Status 1 or 4)
  const isOverallStatusEligibleForTickmark =
    record.status === 1 || record.status === 4 || record.status === REQUEST_STATUS.PENDING || record.status === REQUEST_STATUS.APPROVED;

  const isBusy = isApproving || isRejecting || isSendingBack || isResubmitting;

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

        {/* Action Header Buttons */}
        <div className="header-actions">
          <button
            type="button"
            className="btn-outline"
            onClick={() => navigate("/dashboard")}
          >
            Cancel
          </button>

          {/* INITIATOR RESUBMIT ACTION (Status 3) */}
          {isSentBackToInitiator ? (
            <button
              type="button"
              className="btn-submit"
              onClick={handleResubmit}
              disabled={isBusy}
            >
              {isResubmitting ? "Resubmitting..." : "Resubmit Request"}
            </button>
          ) : (
            /* APPROVER PENDING ACTIONS (Status 1) */
            activeTab === "pending" && (
              <>
                <button
                  type="button"
                  className="btn-submit"
                  onClick={handleApprove}
                  disabled={isBusy}
                >
                  {isApproving ? "Approving..." : "Approve"}
                </button>

                <button
                  type="button"
                  className="btn-submit"
                  onClick={handleReject}
                  disabled={isBusy}
                >
                  {isRejecting ? "Rejecting..." : "Reject"}
                </button>

                <button
                  type="button"
                  className="btn-submit"
                  onClick={handleSendBack}
                  disabled={isBusy}
                >
                  {isSendingBack ? "Sending Back..." : "Send Back"}
                </button>
              </>
            )
          )}
        </div>
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

          {/* Section 1: Approver Line-Up (Renders all dynamic approvers) */}
          <div className="form-section">
            <h4 className="section-title">
              Approver Line-Up{" "}
              <span className="title-sub">
                ({displayApprovers.length} Approver{displayApprovers.length !== 1 ? "s" : ""})
              </span>
            </h4>

            {displayApprovers.map((app, index) => {
              // Show tickmark only if overall request status is 1 or 4 AND this individual approver's status is 4 (Approved)
              const isApproverApproved = app.status === 4 || app.status === REQUEST_STATUS.APPROVED;
              const showApprovedTickmark = isOverallStatusEligibleForTickmark && isApproverApproved;

              return (
                <div
                  className="approver-row"
                  key={app.Id || index}
                  style={{ marginBottom: "12px", display: "flex", alignItems: "center" }}
                >
                  <div className="row-number">{index + 1}</div>

                  <InputField
                    label="Emp ID"
                    className="flex-1"
                    value={app.approvarid || ""}
                    readOnly
                    disabled
                  />

                  <InputField
                    label="Emp Name"
                    className="flex-2"
                    value={app.approvarname || ""}
                    readOnly
                    disabled
                  />

                  <InputField
                    label="Department"
                    className="flex-2"
                    value={app.approvardeptname || ""}
                    readOnly
                    disabled
                  />

                  {/* Approved Red Tickmark */}
                  {showApprovedTickmark && (
                    <span
                      style={{
                        color: "#861f41",
                        fontSize: "24px",
                        fontWeight: "bold",
                        marginLeft: "12px",
                        lineHeight: "1",
                        userSelect: "none",
                      }}
                      title="Approved"
                    >
                      ✓
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <hr className="section-divider" />

          {/* Section 2: Subject Line */}
          <div className="form-section">
            <InputField
              label="Subject Line"
              value={isSentBackToInitiator ? editSubject : record.subject || ""}
              onChange={
                isSentBackToInitiator
                  ? (e) => setEditSubject(e.target.value)
                  : undefined
              }
              readOnly={!isSentBackToInitiator}
              disabled={!isSentBackToInitiator}
            />
          </div>

          {/* Section 3: Details */}
          <div className="form-section">
            <TextAreaField
              label="Details"
              rows={6}
              value={isSentBackToInitiator ? editDetails : decodedDetails}
              onChange={
                isSentBackToInitiator
                  ? (e) => setEditDetails(e.target.value)
                  : undefined
              }
              readOnly={!isSentBackToInitiator}
              disabled={!isSentBackToInitiator}
            />
          </div>

          {/* Section 4: Initiator Remarks */}
          <div className="form-section">
            <TextAreaField
              label="Initiator Remarks / Recommendations"
              rows={3}
              value={isSentBackToInitiator ? editRemarks : record.initiatorremarks || ""}
              onChange={
                isSentBackToInitiator
                  ? (e) => setEditRemarks(e.target.value)
                  : undefined
              }
              readOnly={!isSentBackToInitiator}
              disabled={!isSentBackToInitiator}
            />
          </div>

          <hr className="section-divider" />

          {/* Section 5: Approver Action Remarks (Always Visible) */}
          <div className="form-section">
            {/* Display formatted historical approver remarks if present */}
            {existingApproverComments && (
              <div style={{ marginBottom: "12px" }}>
                <TextAreaField
                  label="Previous Approver Remarks"
                  rows={3}
                  value={existingApproverComments}
                  readOnly
                  disabled
                />
              </div>
            )}

            {/* Editable field for acting approver in Pending view, or disabled view for others */}
            {activeTab === "pending" ? (
              <TextAreaField
                label="Approver Remarks / Action Comments"
                rows={3}
                placeholder="Enter remarks for approval or send back..."
                value={approverRemarks}
                onChange={(e) => setApproverRemarks(e.target.value)}
              />
            ) : (
              !existingApproverComments && (
                <TextAreaField
                  label="Approver Remarks / Action Comments"
                  rows={3}
                  value="No approver remarks provided."
                  readOnly
                  disabled
                />
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}