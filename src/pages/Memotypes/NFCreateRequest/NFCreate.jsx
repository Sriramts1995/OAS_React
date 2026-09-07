import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getApprovarDetailsById } from "../../../services/userservice";
import { submitrequest } from "../../../services/requestservice";
import InputField from "../../../components/InputField";
import TextAreaField from "../../../components/TextAreaField";
import { validateCreateForm } from "../../../utils/validation";
import { buildSubmitPayload } from "../../../utils/payloadBuilder";
import { MEMO_TYPES, UI_LIMITS } from "../../../utils/constants";
import "./NFCreate.css";

export default function NFCreate() {
  const navigate = useNavigate();
  const memoType = MEMO_TYPES.NON_FINANCIAL;

  // Dynamic Approvers Array State (Max 3)
  const [approvers, setApprovers] = useState([
    { empId: "", empName: "", department: "", email: "", gradeCode: "" },
  ]);

  const [subject, setSubject] = useState("");
  const [details, setDetails] = useState("");
  const [remarks, setRemarks] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add new approver row (up to max 3)
  const addApproverRow = () => {
    if (approvers.length < UI_LIMITS.MAX_APPROVER_ROWS) {
      setApprovers((prev) => [
        ...prev,
        { empId: "", empName: "", department: "", email: "", gradeCode: "" },
      ]);
    }
  };

  // Remove an approver row
  const removeApproverRow = (index) => {
    if (approvers.length > 1) {
      setApprovers((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // Handle input change for a specific approver row
  const handleApproverChange = (index, field, value) => {
    setApprovers((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  // Fetch Approver Details for a specific row index
  const fetchApproverDetails = async (index) => {
    const targetEmpId = approvers[index].empId;
    if (!targetEmpId.trim()) return;

    try {
      const response = await getApprovarDetailsById(targetEmpId);

      if (
        response.data &&
        response.data.records &&
        response.data.records.length > 0
      ) {
        const empRecord = response.data.records[0];
        setApprovers((prev) => {
          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            empName: empRecord.Display_Name || "",
            department: empRecord.Department || "",
            email: empRecord.EMAIL_ADDRESS || "",
            gradeCode: empRecord.Grade_Code || "",
          };
          return updated;
        });
      } else {
        alert("Employee ID not found.");
        setApprovers((prev) => {
          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            empName: "",
            department: "",
            email: "",
            gradeCode: "",
          };
          return updated;
        });
      }
    } catch (error) {
      console.error("Error fetching approver details:", error);
    }
  };

  const handleEmpIdKeyDown = (e, index) => {
    if (e.key === "Enter") {
      e.preventDefault();
      fetchApproverDetails(index);
    }
  };

  // Submit Request Handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form input using common validation utility
    const validation = validateCreateForm({ subject, details, approvers });
    if (!validation.isValid) {
      alert(validation.message);
      return;
    }

    try {
      setIsSubmitting(true);
      const storedUserInfo = JSON.parse(
        localStorage.getItem("userInfo") || "{}"
      );

      // Build dynamic Volt MX request payload via builder utility
      const payload = buildSubmitPayload({
        subject,
        details,
        remarks,
        approvers,
        userInfo: storedUserInfo,
      });

      console.log("Sending Payload:", payload);
      const response = await submitrequest(payload);
      console.log("Submit Response:", response.data);

      alert("Request Submitted Successfully!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error submitting request:", error);
      alert("Failed to submit request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <h2>New Request Form</h2>
        </div>

        <div className="header-actions">
          <button
            type="button"
            className="btn-outline"
            onClick={() => navigate("/dashboard")}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="nf-create-form"
            className="btn-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Request"}
          </button>
        </div>
      </header>

      {/* Main Form Content */}
      <div className="form-workspace">
        <form id="nf-create-form" onSubmit={handleSubmit} className="form-card">
          {/* Header Bar */}
          <div className="form-meta-row">
            <div className="meta-field-group">
              <div className="meta-field">
                <label>Memo Type</label>
                <input type="text" value={memoType} readOnly disabled />
              </div>
            </div>
          </div>

          <hr className="section-divider" />

          {/* Section 1: Approver Line-Up (Dynamic Rows up to 3) */}
          <div className="form-section">
            <div className="section-title-row">
              <h4 className="section-title">
                Approver Line-Up <span className="title-sub">(Max 3)</span>
              </h4>
              {approvers.length < UI_LIMITS.MAX_APPROVER_ROWS && (
                <button
                  type="button"
                  className="btn-add-approver"
                  onClick={addApproverRow}
                >
                  + Add Approver
                </button>
              )}
            </div>

            {approvers.map((app, index) => (
              <div className="approver-row" key={index}>
                <div className="row-number">{index + 1}</div>

                <InputField
                  label="Search by Emp ID"
                  className="flex-1"
                  placeholder="Enter Emp ID & Press Enter"
                  value={app.empId}
                  onChange={(e) =>
                    handleApproverChange(index, "empId", e.target.value)
                  }
                  onKeyDown={(e) => handleEmpIdKeyDown(e, index)}
                  onBlur={() => fetchApproverDetails(index)}
                />

                <InputField
                  label="Emp Name"
                  className="flex-2"
                  placeholder="Employee Name"
                  value={app.empName}
                  readOnly
                />

                <InputField
                  label="Department"
                  className="flex-2"
                  placeholder="Department Name"
                  value={app.department}
                  readOnly
                />

                {approvers.length > 1 && (
                  <button
                    type="button"
                    className="btn-remove-row"
                    onClick={() => removeApproverRow(index)}
                    title="Remove Approver"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>

          <hr className="section-divider" />

          {/* Section 2: Subject Line */}
          <div className="form-section">
            <InputField
              label="Subject Line"
              required
              placeholder="Type your request subject line here..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              maxLength={UI_LIMITS.SUBJECT_MAX_LENGTH}
              hint={`Max ${UI_LIMITS.SUBJECT_MAX_LENGTH} characters.`}
            />
          </div>

          {/* Section 3: Details */}
          <div className="form-section">
            <TextAreaField
              label="Details"
              required
              rows={6}
              placeholder="Type detailed description here..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
            />
          </div>

          {/* Section 4: Initiator Remarks */}
          <div className="form-section">
            <TextAreaField
              label="Initiator Remarks / Recommendations"
              rows={3}
              placeholder="Type initiator remarks or recommendations..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>
        </form>
      </div>
    </div>
  );
}